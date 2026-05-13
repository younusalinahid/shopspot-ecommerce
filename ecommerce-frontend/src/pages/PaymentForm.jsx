import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { orderApi } from "../api/order-api";
import { useNavigate } from "react-router-dom";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ order, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setPaying(true);
        setError(null);

        const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required",
        });

        if (stripeError) {
            setError(stripeError.message);
            setPaying(false);
            return;
        }

        if (paymentIntent.status === "succeeded") {
            await orderApi.confirmPayment(order.id, paymentIntent.id);
            onSuccess(order.id);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
                type="submit"
                disabled={!stripe || paying}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-colors"
            >
                {paying ? "Processing..." : `Pay $${(order.totalAmount / 100).toFixed(2)}`}
            </button>
        </form>
    );
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        fullName: "", phone: "", addressLine: "",
        city: "", district: "", postalCode: ""
    });

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const createdOrder = await orderApi.createOrder(form);
            setOrder(createdOrder);
            setStep(2);
        } catch (err) {
            setError("Failed to create order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (orderId) => {
        navigate(`/order-confirmation/${orderId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
            <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>

                <div className="flex items-center mb-8 gap-4">
                    {["Shipping", "Payment"].map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                                ${step > i + 1 ? "bg-green-500 text-white" :
                                step === i + 1 ? "bg-cyan-500 text-white" :
                                    "bg-gray-200 dark:bg-gray-700 text-gray-500"}`}>
                                {step > i + 1 ? "✓" : i + 1}
                            </div>
                            <span className={`text-sm font-medium ${step === i + 1 ? "text-cyan-500" : "text-gray-400"}`}>
                                {label}
                            </span>
                            {i < 1 && <div className="w-12 h-0.5 bg-gray-300 dark:bg-gray-600" />}
                        </div>
                    ))}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                    {step === 1 && (
                        <form onSubmit={handleAddressSubmit} className="space-y-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Shipping Address
                            </h2>
                            {[
                                { name: "fullName", label: "Full Name", placeholder: "John Doe" },
                                { name: "phone", label: "Phone", placeholder: "01XXXXXXXXX" },
                                { name: "addressLine", label: "Address", placeholder: "House, Road, Area" },
                                { name: "city", label: "City", placeholder: "Dhaka" },
                                { name: "district", label: "District", placeholder: "Dhaka" },
                                { name: "postalCode", label: "Postal Code", placeholder: "1200" },
                            ].map(field => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        name={field.name}
                                        value={form[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            ))}
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-colors"
                            >
                                {loading ? "Processing..." : "Continue to Payment"}
                            </button>
                        </form>
                    )}

                    {step === 2 && order && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                Payment
                            </h2>
                            <Elements
                                stripe={stripePromise}
                                options={{ clientSecret: order.stripeClientSecret }}
                            >
                                <PaymentForm order={order} onSuccess={handlePaymentSuccess} />
                            </Elements>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;