import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderApi } from '../api/order-api';
import { toast } from 'react-toastify';
import {
    Package, ChevronDown, ChevronUp, MapPin,
    Loader2, ShoppingBag, X, Clock, CheckCircle2,
    Truck, XCircle, CreditCard, RefreshCw,
    Calendar, Receipt, Download, Eye, Star,
    TrendingUp, Gift, Sparkles, Heart, User,
    Phone, Mail, Home, Navigation, AlertCircle,
    DollarSign, Shield, Award, Target
} from 'lucide-react';
import Footer from '../components/Footer';

const STATUS = {
    PENDING:    { label: 'Pending',    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: Clock, gradient: 'from-amber-500 to-orange-500' },
    PAID:       { label: 'Paid',       color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: CreditCard, gradient: 'from-blue-500 to-indigo-500' },
    PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: RefreshCw, gradient: 'from-purple-500 to-pink-500' },
    SHIPPED:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', icon: Truck, gradient: 'from-indigo-500 to-blue-500' },
    DELIVERED:  { label: 'Delivered',  color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', icon: CheckCircle2, gradient: 'from-emerald-500 to-green-500' },
    CANCELLED:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle, gradient: 'from-red-500 to-rose-500' },
};

const FILTERS = ['ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [expandedId, setExpandedId] = useState(null);
    const [cancelling, setCancelling] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        fetchOrders();
    }, [navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderApi.getUserOrders();
            setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            if (data.length > 0 && !selectedOrder) {
                setSelectedOrder(data[0]);
            }
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (e, orderId) => {
        e.stopPropagation();
        if (!window.confirm('⚠️ Cancel this order?\n\nThis action cannot be undone.')) return;
        setCancelling(orderId);
        try {
            const updated = await orderApi.cancelOrder(orderId);
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
            if (selectedOrder?.id === orderId) setSelectedOrder(updated);
            toast.success('Order cancelled successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cancel failed');
        } finally {
            setCancelling(null);
        }
    };

    const filtered = orders.filter(order => {
        const matchesFilter = filter === 'ALL' || order.status === filter;
        const matchesSearch = !searchTerm ||
            order.id.toString().includes(searchTerm) ||
            order.items?.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: orders.length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
        pending: orders.filter(o => o.status === 'PENDING').length,
        processing: orders.filter(o => o.status === 'PROCESSING').length,
        totalSpent: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    if (loading) return <SkeletonLoader />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-7xl">

                    {/* Hero Section */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-purple-600 via-purple-600 to-pink-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                                        <Receipt className="w-7 h-7" />
                                        My Orders
                                    </h1>
                                    <p className="text-purple-100 mt-1">Track and manage your purchases</p>
                                </div>
                                <button
                                    onClick={fetchOrders}
                                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all"
                                >
                                    <RefreshCw className="w-4 h-4" /> Sync Orders
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                <StatCard label="Total Orders" value={stats.total} icon={ShoppingBag} />
                                <StatCard label="Delivered" value={stats.delivered} icon={CheckCircle2} />
                                <StatCard label="In Progress" value={stats.processing + stats.pending} icon={Clock} />
                                <StatCard label="Total Spent" value={`৳${stats.totalSpent.toLocaleString()}`} icon={TrendingUp} />
                            </div>
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search by order ID or product name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            {searchTerm && (
                                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                            {FILTERS.map(f => {
                                const count = f === 'ALL' ? orders.length : orders.filter(o => o.status === f).length;
                                const isActive = filter === f;
                                return (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
                                            ${isActive
                                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md'
                                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}
                                    >
                                        {f === 'ALL' ? 'All Orders' : STATUS[f]?.label}
                                        {count > 0 && (
                                            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full
                                                ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content with Sidebar */}
                    <div className="flex gap-6">
                        {/* Left Sidebar - Order Details */}
                        <div className="hidden lg:block w-96 flex-shrink-0">
                            {selectedOrder && (
                                <OrderDetailsSidebar
                                    order={selectedOrder}
                                    onClose={() => setSelectedOrder(null)}
                                />
                            )}
                        </div>

                        {/* Right Side - Order List */}
                        <div className="flex-1">
                            {filtered.length === 0 ? (
                                <EmptyState filter={filter} onClearFilter={() => setFilter('ALL')} onClearSearch={() => setSearchTerm('')} />
                            ) : (
                                <div className="space-y-4">
                                    {filtered.map((order, index) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            expanded={expandedId === order.id}
                                            onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                            onCancel={handleCancel}
                                            cancelling={cancelling === order.id}
                                            index={index}
                                            onViewDetails={() => setSelectedOrder(order)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

// Order Details Sidebar Component
function OrderDetailsSidebar({ order, onClose }) {
    const addr = order.shippingAddress;
    const s = STATUS[order.status] || STATUS.PENDING;
    const Icon = s.icon;

    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-BD', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const getTrackingNumber = () => {
        // Random tracking number for demo
        return `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    };

    const getDeliveryPartner = () => {
        const partners = ['Pathao', 'RedX', 'Paperfly', 'Sundarban Courier', 'SA Paribahan'];
        return partners[order.id % partners.length];
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg sticky top-24 overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${s.gradient} p-4 text-white`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg">Order Details</h3>
                        <p className="text-sm opacity-90">#{order.id}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-5 space-y-5 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
                {/* Order Status */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Order Status</span>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
                            <Icon className="w-3 h-3" /> {s.label}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Placed on: </span>
                        <span className="text-gray-900 dark:text-white font-medium">{formattedDate}</span>
                    </div>
                </div>

                {/* Shipping Address */}
                {addr && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            Shipping Address
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{addr.fullName}</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Receiver Name</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-900 dark:text-white">{addr.phone}</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Phone Number</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Home className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-900 dark:text-white">{addr.addressLine}</p>
                                    {addr.area && <p className="text-gray-600 dark:text-gray-400 text-sm">{addr.area}</p>}
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {addr.city}, {addr.district}
                                        {addr.postalCode && ` - ${addr.postalCode}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delivery Info */}
                {order.status !== 'CANCELLED' && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-purple-600" />
                            Delivery Information
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Partner</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{getDeliveryPartner()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Tracking Number</span>
                                <span className="text-sm font-mono font-medium text-purple-600 dark:text-purple-400">{getTrackingNumber()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Delivery</span>
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    {new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 5)).toLocaleDateString()}
                                </span>
                            </div>
                            {order.status === 'SHIPPED' && (
                                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                        <Navigation className="w-3 h-3" />
                                        <span>Your package is on the way!</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Payment Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        Payment Information
                    </h4>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Credit Card (Stripe)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Payment Status</span>
                            <span className={`text-sm font-medium ${order.status === 'PAID' || order.status === 'PROCESSING' || order.status === 'SHIPPED' || order.status === 'DELIVERED'
                                ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {order.status === 'PENDING' ? 'Pending' : 'Paid'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Amount</span>
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                ৳{order.totalAmount?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-600" />
                        Order Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                            <span className="text-gray-900 dark:text-white">৳{order.totalAmount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                            <span className="text-emerald-600">{order.totalAmount > 2000 ? 'FREE' : '৳120'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Tax (7%)</span>
                            <span className="text-gray-900 dark:text-white">৳{Math.round(order.totalAmount * 0.07).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600 font-bold">
                            <span className="text-gray-900 dark:text-white">Total</span>
                            <span className="text-purple-600">৳{order.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-purple-600" />
                        Items ({order.items?.length})
                    </h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                        {order.items?.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.productImage ? (
                                        <img src={`data:image/jpeg;base64,${item.productImage}`} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-5 h-5 text-gray-400 m-3" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    ৳{(item.priceAtPurchase * item.quantity).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Actions */}
                <div className="flex gap-2 pt-2">
                    <button className="flex-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300
                        px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all">
                        Need Help?
                    </button>
                    <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300
                        px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
                        Download Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ label, value, icon: Icon }) {
    return (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all">
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-purple-200" />
                <span className="text-xs text-purple-100">{label}</span>
            </div>
            <p className="text-xl font-bold">{value}</p>
        </div>
    );
}

// Updated OrderCard with View Details button
function OrderCard({ order, expanded, onToggle, onCancel, cancelling, index, onViewDetails }) {
    const s = STATUS[order.status] || STATUS.PENDING;
    const Icon = s.icon;

    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-BD', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    const previewItems = order.items?.slice(0, 3) || [];
    const extraCount = (order.items?.length || 0) - 3;

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden 
                transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700
                ${expanded ? 'ring-2 ring-purple-500/20' : ''}`}
        >
            <div className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors" onClick={onToggle}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                            <span className="font-mono font-bold text-gray-900 dark:text-white">#{order.id}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Calendar className="w-3 h-3" />
                                {formattedDate}
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${s.color}`}>
                                <Icon className="w-3 h-3" /> {s.label}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            {previewItems.map(item => (
                                <div key={item.id} className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                                    {item.productImage ? (
                                        <img src={`data:image/jpeg;base64,${item.productImage}`} alt={item.productName} className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="w-6 h-6 text-gray-400 m-4" />
                                    )}
                                </div>
                            ))}
                            {extraCount > 0 && (
                                <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                                    <span className="text-sm font-bold text-gray-500">+{extraCount}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <p className="font-bold text-xl text-gray-900 dark:text-white">৳{order.totalAmount?.toLocaleString()}</p>
                            <span className="text-sm text-gray-500">{order.items?.length} item{order.items?.length !== 1 && 's'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewDetails();
                            }}
                            className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700
                                border border-purple-200 hover:border-purple-300 px-4 py-2 rounded-xl
                                transition-all bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20
                                dark:border-purple-800 text-sm font-medium"
                        >
                            <Eye className="w-4 h-4" /> Details
                        </button>
                        {order.status === 'PENDING' && (
                            <button
                                onClick={(e) => onCancel(e, order.id)}
                                disabled={cancelling}
                                className="flex items-center gap-1.5 text-red-600 hover:text-red-700
                                    border border-red-200 hover:border-red-300 px-4 py-2 rounded-xl
                                    transition-all disabled:opacity-50 bg-red-50 hover:bg-red-100
                                    dark:bg-red-900/20 dark:border-red-800 text-sm font-medium"
                            >
                                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                Cancel
                            </button>
                        )}
                        <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            {expanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        </button>
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50">
                    {/* Quick stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <QuickStat icon={MapPin} label="Shipping" value={order.shippingAddress?.city || 'N/A'} />
                        <QuickStat icon={Truck} label="Delivery" value={order.status === 'DELIVERED' ? 'Delivered' : 'In Transit'} />
                        <QuickStat icon={CreditCard} label="Payment" value={order.status === 'PENDING' ? 'Pending' : 'Completed'} />
                        <QuickStat icon={Calendar} label="Order Date" value={formattedDate} />
                    </div>
                    <button
                        onClick={onViewDetails}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-medium transition-colors"
                    >
                        View Full Details →
                    </button>
                </div>
            )}
        </div>
    );
}

// Quick Stat Component for expanded view
function QuickStat({ icon: Icon, label, value }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
            <Icon className="w-4 h-4 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
        </div>
    );
}

// Empty State, Skeleton Loader components remain same...
function EmptyState({ filter, onClearFilter, onClearSearch }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30
                rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {filter !== 'ALL' ? `No ${STATUS[filter]?.label} Orders` : 'No Orders Yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                {filter !== 'ALL'
                    ? `You don't have any ${STATUS[filter]?.label?.toLowerCase()} orders. Try a different filter.`
                    : "Looks like you haven't placed any orders yet. Start shopping to see your orders here!"}
            </p>
            <div className="flex gap-3 justify-center">
                {filter !== 'ALL' && (
                    <button onClick={onClearFilter} className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl
                        text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                        Clear Filter
                    </button>
                )}
                <Link to="/" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700
                    text-white px-8 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Start Shopping
                </Link>
            </div>
        </div>
    );
}

function SkeletonLoader() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-400 animate-pulse" />
                    </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your orders...</p>
            </div>
        </div>
    );
}