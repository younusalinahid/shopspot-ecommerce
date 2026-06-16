import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, CardElement, useStripe, useElements} from '@stripe/react-stripe-js';
import {useCart} from '../../context/CartContext';
import {orderApi} from '../../api/orderApi';
import {addressApi} from '../../api/addressApi';
import {toast} from 'react-toastify';
import {
    MapPin, Plus, CheckCircle2, Loader2,
    Package, CreditCard, Truck, Shield, Star
} from 'lucide-react';

const stripePromise = loadStripe(
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);

const EMPTY_ADDR = {
    fullName: '', phone: '', addressLine: '',
    area: '', city: '', district: '', postalCode: '',
    saveAddress: false,
};

function StepBadge({ n, label, active, done }) {
    return (
        <div className={`flex items-center gap-2 ${active ? 'text-blue-600 font-bold' : done ? 'text-green-600' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${active ? 'bg-blue-600 text-white' : done ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {done ? '✓' : n}
            </span>
            <span className="text-sm">{label}</span>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutContent/>
        </Elements>
    );
}

function CheckoutContent() {
    const navigate = useNavigate();
    const {cart, loading: cartLoading, clearCart} = useCart();
    const stripe = useStripe();
    const elements = useElements();

    const [step, setStep] = useState(1);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddr, setSelectedAddr] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newAddrForm, setNewAddrForm] = useState(EMPTY_ADDR);
    const [formErrors, setFormErrors] = useState({});
    const [createdOrder, setCreatedOrder] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [cardError, setCardError] = useState('');
    const [addrLoading, setAddrLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user && user.active === false) {
                toast.error("Access Denied! Your account is deactivated.", {
                    position: "top-right"
                });
                navigate('/');
            }
        }
    }, [navigate]);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            sessionStorage.setItem('intendedPath', '/checkout');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (cartLoading) return;
        if (!cart?.items?.length) {
            navigate('/');
            return;
        }
    }, [cart, cartLoading, navigate]);

    useEffect(() => {
        addressApi.getAll()
            .then(data => {
                setAddresses(data);
                const def = data.find(a => a.isDefault);
                if (def) setSelectedAddr(def.id);
                else if (data.length === 0) setShowNewForm(true);
            })
            .catch(() => setShowNewForm(true))
            .finally(() => setAddrLoading(false));
    }, []);

    const handleNewAddrChange = (e) => {
        const {name, value, type, checked} = e.target;
        setNewAddrForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (formErrors[name]) setFormErrors(p => ({...p, [name]: ''}));
    };

    const validateNewAddr = () => {
        const e = {};
        if (!newAddrForm.fullName.trim()) e.fullName = 'Required';
        if (!newAddrForm.phone.trim()) e.phone = 'Required';
        else if (!/^01[3-9]\d{8}$/.test(newAddrForm.phone))
            e.phone = 'Invalid BD phone';
        if (!newAddrForm.addressLine.trim()) e.addressLine = 'Required';
        if (!newAddrForm.city.trim()) e.city = 'Required';
        return e;
    };

    const handleAddressSubmit = async () => {
        if (selectedAddr && !showNewForm) {
            setSubmitting(true);
            try {
                const order = await orderApi.createOrder({addressId: selectedAddr});
                setCreatedOrder(order);
                setStep(2);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to create order');
            } finally {
                setSubmitting(false);
            }
            return;
        }

        const errs = validateNewAddr();
        if (Object.keys(errs).length) {
            setFormErrors(errs);
            return;
        }

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

    const handlePaymentSubmit = async () => {
        if (!stripe || !elements) return;
        setCardError('');
        setSubmitting(true);
        try {
            const {error, paymentIntent} = await stripe.confirmCardPayment(
                createdOrder.stripeClientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {name: newAddrForm.fullName || ''},
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

                setTimeout(() => {
                    toast.info(
                        '📧 A confirmation email has been sent to your email address.',
                        { autoClose: 5000 }
                    );
                }, 1500);

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
            <Loader2 className="w-10 h-10 animate-spin text-blue-600"/>
        </div>
    );

    const subtotal = cart?.totalPrice || 0;
    const shipping = subtotal > 2000 ? 0 : 120;
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal + shipping + tax;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="flex-grow py-8">
                <div className="container mx-auto px-4 max-w-6xl">

                    <div className="flex items-center gap-3 mb-8">
                        <StepBadge n={1} label="Shipping" active={step === 1} done={step > 1}/>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"/>
                        <StepBadge n={2} label="Payment" active={step === 2} done={false}/>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {step === 1 ? (
                                <div className="space-y-4">
                                    {addresses.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-blue-600"/>
                                                Saved Addresses
                                            </h2>
                                            <div className="space-y-3">
                                                {addresses.map(addr => (
                                                    <div
                                                        key={addr.id}
                                                        onClick={() => {
                                                            setSelectedAddr(addr.id);
                                                            setShowNewForm(false);
                                                        }}
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
                                                                        <span
                                                                            className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                                                            <Star className="w-3 h-3"/> Default
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
                                                                <CheckCircle2
                                                                    className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1"/>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setShowNewForm(!showNewForm);
                                                    setSelectedAddr(null);
                                                }}
                                                className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                <Plus className="w-4 h-4"/>
                                                {showNewForm ? 'Use saved address' : 'Add new address'}
                                            </button>
                                        </div>
                                    )}

                                    {showNewForm && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                {addresses.length === 0 ? 'Shipping Address' : 'New Address'}
                                            </h2>
                                            {/* Dummy Placeholder View for NewAddressForm */}
                                            <div className="space-y-3 text-sm text-gray-500">
                                                <p>Please enter your checkout details accurately.</p>
                                                <input type="text" name="fullName" placeholder="Full Name" value={newAddrForm.fullName} onChange={handleNewAddrChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                                {formErrors.fullName && <span className="text-red-500 text-xs">{formErrors.fullName}</span>}
                                                <input type="text" name="phone" placeholder="Phone Number" value={newAddrForm.phone} onChange={handleNewAddrChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                                {formErrors.phone && <span className="text-red-500 text-xs">{formErrors.phone}</span>}
                                                <input type="text" name="addressLine" placeholder="Address Line" value={newAddrForm.addressLine} onChange={handleNewAddrChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                                {formErrors.addressLine && <span className="text-red-500 text-xs">{formErrors.addressLine}</span>}
                                                <input type="text" name="city" placeholder="City" value={newAddrForm.city} onChange={handleNewAddrChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                                {formErrors.city && <span className="text-red-500 text-xs">{formErrors.city}</span>}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAddressSubmit}
                                        disabled={submitting || (!selectedAddr && !showNewForm)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                                            text-white py-3 rounded-lg font-semibold transition-colors
                                            flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Continue to Payment'}
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-blue-600"/> Payment Details
                                    </h2>
                                    <div className="p-4 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                                        <CardElement options={{style: {base: {fontSize: '16px', color: '#424770', '::placeholder': {color: '#aab7c4'}}}}} />
                                    </div>
                                    {cardError && <p className="text-red-500 text-sm font-medium">{cardError}</p>}
                                    <button
                                        onClick={handlePaymentSubmit}
                                        disabled={submitting || !stripe}
                                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : `Pay ৳${total.toFixed(2)}`}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Order Summary Right Panel */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
                                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-gray-900 dark:text-white">৳{subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Shipping</span><span className="font-medium text-gray-900 dark:text-white">{shipping === 0 ? 'FREE' : `৳${shipping.toFixed(2)}`}</span></div>
                                    <div className="flex justify-between"><span>Tax (7%)</span><span className="font-medium text-gray-900 dark:text-white">৳{tax.toFixed(2)}</span></div>
                                    <div className="border-t pt-3 flex justify-between text-base font-bold text-gray-900 dark:text-white"><span>Total</span><span>৳{total.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}