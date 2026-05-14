import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import { orderApi } from '../api/order-api'
import { addressApi } from '../api/address-api-service';
import { toast } from 'react-toastify';
import {
    MapPin, Plus, CheckCircle2, Loader2,
    Package, CreditCard, Truck, Shield, Star
} from 'lucide-react';
import Footer from '../components/Footer';

const stripePromise = loadStripe(
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);

const EMPTY_ADDR = {
    fullName: '', phone: '', addressLine: '',
    area: '', city: '', district: '', postalCode: '',
    saveAddress: false,
};

export default function CheckoutPage() {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutContent />
        </Elements>
    );
}

function CheckoutContent() {
    const navigate  = useNavigate();
    const { cart, loading: cartLoading, clearCart } = useCart();
    const stripe    = useStripe();
    const elements  = useElements();

    const [step,         setStep]         = useState(1);
    const [addresses,    setAddresses]    = useState([]);
    const [selectedAddr, setSelectedAddr] = useState(null); // saved address id
    const [showNewForm,  setShowNewForm]  = useState(false);
    const [newAddrForm,  setNewAddrForm]  = useState(EMPTY_ADDR);
    const [formErrors,   setFormErrors]   = useState({});
    const [createdOrder, setCreatedOrder] = useState(null);
    const [submitting,   setSubmitting]   = useState(false);
    const [cardError,    setCardError]    = useState('');
    const [addrLoading,  setAddrLoading]  = useState(true);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            sessionStorage.setItem('intendedPath', '/checkout');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (cartLoading) return;
        if (!cart?.items?.length) { navigate('/'); return; }
    }, [cart, cartLoading, navigate]);

    // Saved addresses load
    useEffect(() => {
        addressApi.getAll()
            .then(data => {
                setAddresses(data);
                // Default address auto-select
                const def = data.find(a => a.isDefault);
                if (def) setSelectedAddr(def.id);
                else if (data.length === 0) setShowNewForm(true);
            })
            .catch(() => setShowNewForm(true))
            .finally(() => setAddrLoading(false));
    }, []);

    const handleNewAddrChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddrForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (formErrors[name]) setFormErrors(p => ({ ...p, [name]: '' }));
    };

    const validateNewAddr = () => {
        const e = {};
        if (!newAddrForm.fullName.trim())    e.fullName    = 'Required';
        if (!newAddrForm.phone.trim())        e.phone       = 'Required';
        else if (!/^01[3-9]\d{8}$/.test(newAddrForm.phone))
            e.phone       = 'Invalid BD phone';
        if (!newAddrForm.addressLine.trim())  e.addressLine = 'Required';
        if (!newAddrForm.city.trim())         e.city        = 'Required';
        return e;
    };

    // Step 1 submit
    const handleAddressSubmit = async () => {
        // Saved address selected
        if (selectedAddr && !showNewForm) {
            setSubmitting(true);
            try {
                const order = await orderApi.createOrder({ addressId: selectedAddr });
                setCreatedOrder(order);
                setStep(2);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to create order');
            } finally {
                setSubmitting(false);
            }
            return;
        }

        // New address form
        const errs = validateNewAddr();
        if (Object.keys(errs).length) { setFormErrors(errs); return; }

        setSubmitting(true);
        try {
            const order = await orderApi.createOrder(newAddrForm);
            setCreatedOrder(order);
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create order');
        } finally {
            setSubmitting(false);
        }
    };

    // Step 2 payment
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
                        billing_details: { name: newAddrForm.fullName || '' },
                    },
                }
            );
            if (error) { setCardError(error.message); return; }
            if (paymentIntent.status === 'succeeded') {
                await orderApi.confirmPayment(createdOrder.id, paymentIntent.id);
                await clearCart();
                toast.success('Order placed! 🎉');
                navigate(`/order-confirmation/${createdOrder.id}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (cartLoading || addrLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    const subtotal = cart?.totalPrice || 0;
    const shipping = subtotal > 2000 ? 0 : 120;
    const tax      = Math.round(subtotal * 0.07);
    const total    = subtotal + shipping + tax;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="flex-grow py-8">
                <div className="container mx-auto px-4 max-w-6xl">

                    {/* Step indicator */}
                    <div className="flex items-center gap-3 mb-8">
                        <StepBadge n={1} label="Shipping" active={step === 1} done={step > 1} />
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <StepBadge n={2} label="Payment"  active={step === 2} done={false} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {step === 1 ? (
                                <div className="space-y-4">
                                    {/* Saved addresses */}
                                    {addresses.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-blue-600" />
                                                Saved Addresses
                                            </h2>
                                            <div className="space-y-3">
                                                {addresses.map(addr => (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => { setSelectedAddr(addr.id); setShowNewForm(false); }}
                                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all
                                                            ${selectedAddr === addr.id && !showNewForm
                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                                        {addr.fullName}
                                                                    </p>
                                                                    {addr.isDefault && (
                                                                        <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                                                            <Star className="w-3 h-3" /> Default
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {addr.phone}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                                                                    {addr.addressLine}, {addr.area && `${addr.area}, `}{addr.city}
                                                                    {addr.district && `, ${addr.district}`}
                                                                    {addr.postalCode && ` - ${addr.postalCode}`}
                                                                </p>
                                                            </div>
                                                            {selectedAddr === addr.id && !showNewForm && (
                                                                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add new toggle */}
                                            <button
                                                onClick={() => { setShowNewForm(!showNewForm); setSelectedAddr(null); }}
                                                className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                <Plus className="w-4 h-4" />
                                                {showNewForm ? 'Use saved address' : 'Add new address'}
                                            </button>
                                        </div>
                                    )}

                                    {/* New address form */}
                                    {showNewForm && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                {addresses.length === 0 ? 'Shipping Address' : 'New Address'}
                                            </h2>
                                            <NewAddressForm
                                                form={newAddrForm}
                                                errors={formErrors}
                                                onChange={handleNewAddrChange}
                                            />
                                        </div>
                                    )}

                                    {/* Continue button */}
                                    <button
                                        onClick={handleAddressSubmit}
                                        disabled={submitting || (!selectedAddr && !showNewForm)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                                            text-white py-3 rounded-lg font-semibold transition-colors
                                            flex items-center justify-center gap-2"
                                    >
                                        {submitting
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                            : 'Continue to Payment →'
                                        }
                                    </button>
                                </div>
                            ) : (
                                // Payment step
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-blue-600" /> Payment
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                                        Secured by Stripe
                                    </p>
                                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                                        <CardElement
                                            options={{ style: { base: { fontSize: '16px', color: '#1f2937', '::placeholder': { color: '#9ca3af' } }, invalid: { color: '#ef4444' } } }}
                                            onChange={() => setCardError('')}
                                        />
                                    </div>
                                    {cardError && <p className="text-red-500 text-sm mt-2">{cardError}</p>}

                                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Test card:</p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                                            4242 4242 4242 4242 · 12/26 · 123 · 12345
                                        </p>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button onClick={() => setStep(1)} disabled={submitting}
                                                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors">
                                            ← Back
                                        </button>
                                        <button onClick={handlePaymentSubmit} disabled={submitting}
                                                className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                            {submitting
                                                ? <><Loader2 className="w-4 h-4 animate-spin" /> Paying...</>
                                                : `Pay ৳${total.toFixed(2)}`
                                            }
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                                    {cart?.items?.map(item => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                                                {item.product?.imageData
                                                    ? <img src={item.product.imageData} alt="" className="w-full h-full object-cover" />
                                                    : <Package className="w-5 h-5 text-gray-400" />
                                                }
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.product?.name}</p>
                                                <p className="text-xs text-gray-500">×{item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                ৳{((item.product?.price || 0) * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
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
                                <div className="mt-4 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <Shield className="w-3.5 h-3.5 text-blue-500" /> SSL secured checkout
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Powered by Stripe
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

function Field({ name, label, placeholder, half = false, form, errors, onChange }) {
    return (
        <div className={half ? '' : 'sm:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label}
                {name !== 'postalCode' && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <input
                name={name}
                value={form[name]}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 border rounded-lg bg-white dark:bg-gray-700
                    text-gray-900 dark:text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${errors[name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
        </div>
    );
}

function NewAddressForm({ form, errors, onChange }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field name="fullName"    label="Full Name"      placeholder="Your full name"    half form={form} errors={errors} onChange={onChange} />
            <Field name="phone"       label="Phone"          placeholder="01XXXXXXXXX"       half form={form} errors={errors} onChange={onChange} />
            <Field name="addressLine" label="Street Address" placeholder="House, Road, Area"      form={form} errors={errors} onChange={onChange} />
            <Field name="area"        label="Area"           placeholder="Mirpur, Gulshan…"  half form={form} errors={errors} onChange={onChange} />
            <Field name="city"        label="City"           placeholder="Dhaka"             half form={form} errors={errors} onChange={onChange} />
            <Field name="district"    label="District"       placeholder="Dhaka"             half form={form} errors={errors} onChange={onChange} />
            <Field name="postalCode"  label="Postal Code"    placeholder="1207 (optional)"   half form={form} errors={errors} onChange={onChange} />

            <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="saveAddress"
                        checked={form.saveAddress}
                        onChange={onChange}
                        className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Save this address for future orders
                    </span>
                </label>
            </div>
        </div>
    );
}

function StepBadge({ n, label, active, done }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : n}
            </div>
            <span className={`text-sm font-medium ${active ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                {label}
            </span>
        </div>
    );
}