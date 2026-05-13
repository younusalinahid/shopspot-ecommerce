import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { orderApi } from '../api/order-api';
import { toast } from 'react-toastify';
import {
    MapPin, Phone, User, Loader2,
    Package, CreditCard, CheckCircle2, Truck, Shield
} from 'lucide-react';
import Footer from '../components/Footer';

const stripePromise = loadStripe(
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);
console.log(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const EMPTY_FORM = {
    fullName:    '',
    phone:       '',
    addressLine: '',
    city:        '',
    district:    '',
    postalCode:  '',
};

export default function CheckoutPage() {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutContent />
        </Elements>
    );
}

function CheckoutContent() {
    const navigate             = useNavigate();
    const { cart, loading: cartLoading, clearCart } = useCart();
    const stripe               = useStripe();
    const elements             = useElements();

    const [step,          setStep]          = useState(1);
    const [form,          setForm]          = useState(EMPTY_FORM);
    const [errors,        setErrors]        = useState({});
    const [createdOrder,  setCreatedOrder]  = useState(null); // backend থেকে আসা order
    const [submitting,    setSubmitting]    = useState(false);
    const [cardError,     setCardError]     = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            sessionStorage.setItem('intendedPath', '/checkout');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (cartLoading) return;
        if (!cart?.items?.length) {
            toast.error('Your cart is empty');
            navigate('/');
        }
    }, [cart, cartLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateShipping = () => {
        const e = {};
        if (!form.fullName.trim())    e.fullName    = 'Name is required';
        if (!form.phone.trim())       e.phone       = 'Phone is required';
        else if (!/^01[3-9]\d{8}$/.test(form.phone))
            e.phone       = 'Invalid BD phone (01XXXXXXXXX)';
        if (!form.addressLine.trim()) e.addressLine = 'Address is required';
        if (!form.city.trim())        e.city        = 'City is required';
        if (!form.district.trim())    e.district    = 'District is required';
        return e;
    };

    const handleShippingSubmit = async () => {
        const validationErrors = validateShipping();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            toast.error('Please fix the errors');
            return;
        }

        setSubmitting(true);
        try {
            const order = await orderApi.createOrder(form);
            setCreatedOrder(order);
            setStep(2); // payment step-এ যাও
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initialize order');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentSubmit = async () => {
        if (!stripe || !elements) return;

        setCardError('');
        setSubmitting(true);

        try {
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                createdOrder.stripeClientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: { name: form.fullName },
                    },
                }
            );

            if (error) {
                setCardError(error.message);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                await orderApi.confirmPayment(createdOrder.id, paymentIntent.id);
                await clearCart();
                toast.success('Order placed successfully! 🎉');
                navigate(`/order-confirmation/${createdOrder.id}`);
            }

        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (cartLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    const subtotal = cart?.totalPrice || 0;
    const shipping = subtotal > 2000 ? 0 : 120;
    const tax      = Math.round(subtotal * 0.07);
    const total    = subtotal + shipping + tax;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="flex-grow py-8">
                <div className="container mx-auto px-4 max-w-6xl">

                    {/* ── Step indicator ──────────────────────────────── */}
                    <div className="flex items-center gap-3 mb-8">
                        <StepBadge n={1} label="Shipping" active={step === 1} done={step > 1} />
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <StepBadge n={2} label="Payment"  active={step === 2} done={false} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ── Left: form ──────────────────────────────── */}
                        <div className="lg:col-span-2">
                            {step === 1
                                ? <ShippingForm
                                    form={form}
                                    errors={errors}
                                    submitting={submitting}
                                    onChange={handleChange}
                                    onSubmit={handleShippingSubmit}
                                />
                                : <PaymentForm
                                    order={createdOrder}
                                    cardError={cardError}
                                    submitting={submitting}
                                    onCardChange={() => setCardError('')}
                                    onSubmit={handlePaymentSubmit}
                                    onBack={() => setStep(1)}
                                />
                            }
                        </div>

                        {/* ── Right: order summary ─────────────────────── */}
                        <div className="lg:col-span-1">
                            <OrderSummary
                                cart={cart}
                                subtotal={subtotal}
                                shipping={shipping}
                                tax={tax}
                                total={total}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

// ─── Shipping Form component ──────────────────────────────────────────────────
function ShippingForm({ form, errors, submitting, onChange, onSubmit }) {
    const fields = [
        { name: 'fullName',    label: 'Full Name',    placeholder: 'Your full name',       icon: User,  half: true  },
        { name: 'phone',       label: 'Phone',        placeholder: '01XXXXXXXXX',          icon: Phone, half: true  },
        { name: 'addressLine', label: 'Street Address', placeholder: 'House, Road, Area', icon: MapPin,half: false },
        { name: 'city',        label: 'City',         placeholder: 'Dhaka',                icon: null,  half: true  },
        { name: 'district',    label: 'District',     placeholder: 'Dhaka',                icon: null,  half: true  },
        { name: 'postalCode',  label: 'Postal Code',  placeholder: '1207 (optional)',      icon: null,  half: true, optional: true },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> Shipping Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(f => (
                    <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {f.label}
                            {!f.optional && <span className="text-red-500 ml-0.5">*</span>}
                        </label>
                        <div className="relative">
                            {f.icon && (
                                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            )}
                            <input
                                name={f.name}
                                value={form[f.name]}
                                onChange={onChange}
                                placeholder={f.placeholder}
                                className={`w-full ${f.icon ? 'pl-9' : 'pl-4'} pr-4 py-2.5 border rounded-lg
                                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                                    ${errors[f.name]
                                    ? 'border-red-500'
                                    : 'border-gray-300 dark:border-gray-600'}`}
                            />
                        </div>
                        {errors[f.name] && (
                            <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={onSubmit}
                disabled={submitting}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                    text-white py-3 rounded-lg font-semibold transition-colors
                    flex items-center justify-center gap-2"
            >
                {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                    : 'Continue to Payment →'
                }
            </button>
        </div>
    );
}

function PaymentForm({ order, cardError, submitting, onCardChange, onSubmit, onBack }) {
    const CARD_STYLE = {
        style: {
            base: {
                fontSize: '16px',
                color: '#1f2937',
                '::placeholder': { color: '#9ca3af' },
                fontFamily: 'system-ui, sans-serif',
            },
            invalid: { color: '#ef4444' },
        },
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" /> Payment
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                Secured by Stripe. Your card details are never stored.
            </p>

            {/* Stripe Card Element */}
            <div className={`border rounded-lg p-4 bg-white dark:bg-gray-700
                ${cardError
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'}`}
            >
                <CardElement options={CARD_STYLE} onChange={onCardChange} />
            </div>

            {cardError && (
                <p className="text-red-500 text-sm mt-2">{cardError}</p>
            )}

            {/* Test card hint */}
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Test card:</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                    4242 4242 4242 4242 · Any future date · Any CVC
                </p>
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={onBack}
                    disabled={submitting}
                    className="flex-1 border border-gray-300 dark:border-gray-600
                        text-gray-700 dark:text-gray-300 hover:bg-gray-50
                        dark:hover:bg-gray-700 py-3 rounded-lg font-medium
                        transition-colors disabled:opacity-50"
                >
                    ← Back
                </button>
                <button
                    onClick={onSubmit}
                    disabled={submitting}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                        text-white py-3 rounded-lg font-semibold transition-colors
                        flex items-center justify-center gap-2"
                >
                    {submitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Paying...</>
                        : <>Pay ৳{order?.totalAmount?.toFixed(2)} </>
                    }
                </button>
            </div>
        </div>
    );
}

function OrderSummary({ cart, subtotal, shipping, tax, total }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
                {cart?.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {item.product?.imageData
                                ? <img src={item.product.imageData} alt="" className="w-full h-full object-cover" />
                                : <Package className="w-5 h-5 text-gray-400" />
                            }
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product?.name}</p>
                            <p className="text-xs text-gray-500">×{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                            ৳{((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal</span><span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                        {shipping === 0 ? 'FREE' : `৳${shipping.toFixed(2)}`}
                    </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Tax (7%)</span><span>৳{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span><span>৳{total.toFixed(2)}</span>
                </div>
            </div>

            {/* Trust badges */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Shield className="w-3.5 h-3.5 text-blue-500" /> SSL secured checkout
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Powered by Stripe
                </div>
            </div>
        </div>
    );
}

function StepBadge({ n, label, active, done }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${done   ? 'bg-green-500 text-white'
                : active ? 'bg-blue-600 text-white'
                    :          'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : n}
            </div>
            <span className={`text-sm font-medium
                ${active ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                {label}
            </span>
        </div>
    );
}