import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../api/order-api';
import { CheckCircle2, Package, MapPin, Loader2, ShoppingBag } from 'lucide-react';
import Footer from '../components/Footer';

const STATUS_STYLE = {
    PENDING:    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    PAID:       'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',
    PROCESSING: 'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-300',
    SHIPPED:    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    DELIVERED:  'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-300',
    CANCELLED:  'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-300',
};

export default function OrderConfirmationPage() {
    const { orderId } = useParams();
    const navigate    = useNavigate();
    const [order,   setOrder]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        orderApi.getOrderById(orderId)
            .then(setOrder)
            .catch(() => setError('Order not found'))
            .finally(() => setLoading(false));
    }, [orderId, navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Link to="/" className="text-blue-600 underline">Go home</Link>
            </div>
        </div>
    );

    const addr = order.shippingAddress;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="flex-grow py-10">
                <div className="container mx-auto px-4 max-w-3xl">

                    {/* Success header */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center mb-6">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-9 h-9 text-green-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            Order Confirmed!
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Order #{order.id} · {new Date(order.createdAt).toLocaleDateString('en-BD', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        })}
                        </p>
                        <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[order.status]}`}>
                            {order.status}
                        </span>
                    </div>

                    {/* Items */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Package className="w-5 h-5 text-blue-600" /> Items Ordered
                        </h2>
                        <div className="space-y-3">
                            {order.items?.map(item => (
                                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        {item.productImage
                                            ? <img src={`data:image/jpeg;base64,${item.productImage}`} alt={item.productName} className="w-full h-full object-cover" />
                                            : <Package className="w-6 h-6 text-gray-400" />
                                        }
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium text-gray-900 dark:text-white">{item.productName}</p>
                                        <p className="text-sm text-gray-500">
                                            Qty: {item.quantity}
                                            {item.size  && ` · Size: ${item.size}`}
                                            {item.color && ` · Color: ${item.color}`}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        ৳{(item.priceAtPurchase * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                            <span>Total Paid</span>
                            <span>৳{order.totalAmount?.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Shipping address */}
                    {addr && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" /> Shipping To
                            </h2>
                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                <p className="font-medium text-gray-900 dark:text-white">{addr.fullName}</p>
                                <p>{addr.phone}</p>
                                <p>{addr.addressLine}</p>
                                <p>{addr.city}, {addr.district}{addr.postalCode ? ` - ${addr.postalCode}` : ''}</p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/orders"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg
                                font-semibold text-center transition-colors"
                        >
                            View All Orders
                        </Link>
                        <Link
                            to="/"
                            className="flex-1 border border-gray-300 dark:border-gray-600
                                text-gray-700 dark:text-gray-300 hover:bg-gray-50
                                dark:hover:bg-gray-700 py-3 rounded-lg font-semibold
                                text-center transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" /> Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}