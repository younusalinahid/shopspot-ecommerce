import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../api/order-api";

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-blue-100 text-blue-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    SHIPPED: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
};

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderApi.getUserOrders()
            .then(setOrders)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-xl mb-4">No orders yet</p>
                        <Link to="/" className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <Link key={order.id} to={`/order-confirmation/${order.id}`}
                                  className="block bg-white dark:bg-gray-800 rounded-2xl shadow p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">Order #{order.id}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {order.items?.slice(0, 3).map(item => (
                                            item.productImage && (
                                                <img
                                                    key={item.id}
                                                    src={`data:image/jpeg;base64,${item.productImage}`}
                                                    alt={item.productName}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800"
                                                />
                                            )
                                        ))}
                                        {order.items?.length > 3 && (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                                                +{order.items.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <p className="font-bold text-gray-900 dark:text-white">${order.totalAmount}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistoryPage;