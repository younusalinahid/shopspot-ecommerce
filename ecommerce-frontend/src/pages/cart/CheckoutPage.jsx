import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../../context/CartContext';
import { orderApi } from '../../api/orderApi';
import { addressApi } from '../../api/addressApi';
import { toast } from 'react-toastify';
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
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${active ? 'bg-blue-600 text-white' : done ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                {done ? '✓' : n}
            </span>
            <span className="text-sm font-medium">{label}</span>
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
    const { cart, loading: cartLoading, clearCart } = useCart();
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
        const { name, value, type, checked } = e.target;
        setNewAddrForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (formErrors[name]) setFormErrors(p => ({ ...p, [name]: '' }));
    };

    const validateNewAddr = () => {
        const e = {};
        if (!newAddrForm.fullName.trim()) e.fullName = 'Full name is required';
        if (!newAddrForm.phone.trim()) e.phone = 'Phone number is required';
        else if (!/^01[3-9]\d{8}$/.test(newAddrForm.phone))
            e.phone = 'Invalid BD phone number';
        if (!newAddrForm.addressLine.trim()) e.addressLine = 'Street address is required';
        if (!newAddrForm.city.trim()) e.city = 'City is required';
        return e;
    };

    const handleAddressSubmit = async () => {
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
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                createdOrder.stripeClientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: { name: newAddrForm.fullName || '' },
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
            <div className="flex-grow py-8">
                <div className="container mx-auto px-4 max-w-6xl">

                    {/* Progress Step Header */}
                    <div className="flex items-center gap-3 mb-8 bg-white dark:bg-gray-800 px-6 py-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <StepBadge n={1} label="Shipping Details" active={step === 1} done={step > 1}/>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"/>
                        <StepBadge n={2} label="Secure Payment" active={step === 2} done={false}/>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Left Column: Form / Steps */}
                        <div className="lg:col-span-2 space-y-6">
                            {step === 1 ? (
                                <div className="space-y-6">
                                    {/* Saved Addresses List */}
                                    {addresses.length > 0 && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
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
                                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                                            ${selectedAddr === addr.id && !showNewForm
                                                            ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/10'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'}`}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1.5">
                                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                                        {addr.fullName}
                                                                    </p>
                                                                    {addr.isDefault && (
                                                                        <span className="flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-0.5 rounded-full font-medium">
                                                                            <Star className="w-3 h-3 fill-current"/> Default
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                                    📞 {addr.phone}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                                                    {addr.addressLine}, {addr.area && `${addr.area}, `}{addr.city}
                                                                    {addr.district && `, ${addr.district}`}
                                                                    {addr.postalCode && ` - ${addr.postalCode}`}
                                                                </p>
                                                            </div>
                                                            {selectedAddr === addr.id && !showNewForm && (
                                                                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5 fill-blue-100 dark:fill-transparent"/>
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
                                                className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold transition-colors"
                                            >
                                                <Plus className="w-4 h-4"/>
                                                {showNewForm ? 'Use Saved Address' : 'Add a New Shipping Address'}
                                            </button>
                                        </div>
                                    )}

                                    {/* New Address Form */}
                                    {showNewForm && (
                                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-all">
                                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                                <MapPin className="w-5 h-5 text-blue-600"/>
                                                {addresses.length === 0 ? 'Shipping Address' : 'New Address Details'}
                                            </h2>

                                            <div className="space-y-4">
                                                <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                                                    Please enter your checkout details accurately.
                                                </p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Full Name */}
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">Full Name *</label>
                                                        <input
                                                            type="text"
                                                            name="fullName"
                                                            placeholder="e.g. Younus Ali"
                                                            value={newAddrForm.fullName}
                                                            onChange={handleNewAddrChange}
                                                            className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none focus:ring-2
                                                                ${formErrors.fullName
                                                                ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30'
                                                                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/20'}`}
                                                        />
                                                        {formErrors.fullName && <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">⚠️ {formErrors.fullName}</p>}
                                                    </div>

                                                    {/* Phone Number */}
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">Phone Number *</label>
                                                        <input
                                                            type="text"
                                                            name="phone"
                                                            placeholder="e.g. 01XXXXXXXXX"
                                                            value={newAddrForm.phone}
                                                            onChange={handleNewAddrChange}
                                                            className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none focus:ring-2
                                                                ${formErrors.phone
                                                                ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30'
                                                                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/20'}`}
                                                        />
                                                        {formErrors.phone && <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">⚠️ {formErrors.phone}</p>}
                                                    </div>

                                                    {/* Address Line */}
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">Street Address / House / Road *</label>
                                                        <input
                                                            type="text"
                                                            name="addressLine"
                                                            placeholder="House# 12, Road# 5"
                                                            value={newAddrForm.addressLine}
                                                            onChange={handleNewAddrChange}
                                                            className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none focus:ring-2
                                                                ${formErrors.addressLine
                                                                ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30'
                                                                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/20'}`}
                                                        />
                                                        {formErrors.addressLine && <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">⚠️ {formErrors.addressLine}</p>}
                                                    </div>

                                                    {/* Area */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">Area / Thana</label>
                                                        <input
                                                            type="text"
                                                            name="area"
                                                            placeholder="e.g. Mirpur"
                                                            value={newAddrForm.area || ''}
                                                            onChange={handleNewAddrChange}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                                                        />
                                                    </div>

                                                    {/* City */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">City *</label>
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            placeholder="e.g. Dhaka"
                                                            value={newAddrForm.city}
                                                            onChange={handleNewAddrChange}
                                                            className={`w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none focus:ring-2
                                                                ${formErrors.city
                                                                ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30'
                                                                : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/20'}`}
                                                        />
                                                        {formErrors.city && <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">⚠️ {formErrors.city}</p>}
                                                    </div>

                                                    {/* District */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">District</label>
                                                        <input
                                                            type="text"
                                                            name="district"
                                                            placeholder="e.g. Dhaka"
                                                            value={newAddrForm.district || ''}
                                                            onChange={handleNewAddrChange}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                                                        />
                                                    </div>

                                                    {/* Postal Code */}
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 uppercase">Postal Code</label>
                                                        <input
                                                            type="text"
                                                            name="postalCode"
                                                            placeholder="e.g. 1216"
                                                            value={newAddrForm.postalCode || ''}
                                                            onChange={handleNewAddrChange}
                                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Save Address Checkbox */}
                                                <div className="flex items-center gap-2 pt-2">
                                                    <input
                                                        type="checkbox"
                                                        id="saveAddress"
                                                        name="saveAddress"
                                                        checked={newAddrForm.saveAddress || false}
                                                        onChange={handleNewAddrChange}
                                                        className="w-4 h-4 rounded text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:bg-gray-700"
                                                    />
                                                    <label htmlFor="saveAddress" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                                        Save this address for future purchases
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <button
                                        onClick={handleAddressSubmit}
                                        disabled={submitting || (!selectedAddr && !showNewForm)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 active:scale-[0.99]
                                            text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 dark:shadow-none transition-all
                                            flex items-center justify-center gap-2 text-base"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Continue to Payment'}
                                    </button>
                                </div>
                            ) : (
                                /* Payment Card Box */
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 space-y-5 transition-all">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                                        <CreditCard className="w-5 h-5 text-blue-600"/> Credit or Debit Card
                                    </h2>
                                    <div className="p-4 border rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 transition-all">
                                        <CardElement
                                            options={{
                                                style: {
                                                    base: {
                                                        fontSize: '16px',
                                                        color: '#1f2937',
                                                        '::placeholder': { color: '#9ca3af' }
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                    {cardError && <p className="text-red-500 text-sm font-semibold flex items-center gap-1">⚠️ {cardError}</p>}
                                    <button
                                        onClick={handlePaymentSubmit}
                                        disabled={submitting || !stripe}
                                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 active:scale-[0.99] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-500/10 dark:shadow-none transition-all flex items-center justify-center gap-2 text-base"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : `Authorize Payment • ৳${total.toFixed(2)}`}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Order Summary Right Panel */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 sticky top-4 space-y-5">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-600" /> Order Summary
                                </h2>
                                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-4">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">৳{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping Delivery</span>
                                        <span className={`font-semibold ${shipping === 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                            {shipping === 0 ? 'FREE' : `৳${shipping.toFixed(2)}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax Estimated (7%)</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">৳{tax.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between text-lg font-extrabold text-gray-900 dark:text-white">
                                    <span>Total Payable</span>
                                    <span className="text-blue-600 dark:text-blue-400">৳{total.toFixed(2)}</span>
                                </div>

                                {/* Additional Trust Badges */}
                                <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-gray-400 font-medium">
                                    <div className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-green-500" /> SSL Secured</div>
                                    <div className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-blue-500" /> Fast Delivery</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}