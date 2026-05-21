import { useState, useEffect } from 'react';
import {
    Search, ChevronDown, ChevronUp, RefreshCw,
    Package, MapPin, Loader2, Clock, CreditCard,
    CheckCircle2, Truck, XCircle, ShoppingBag
} from 'lucide-react';
import { orderApi } from '../../api/order-api';
import { toast } from 'react-toastify';

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    PENDING:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800', icon: Clock        },
    PAID:       { label: 'Paid',       color: 'bg-blue-100   text-blue-800',   icon: CreditCard   },
    PROCESSING: { label: 'Processing', color: 'bg-purple-100 text-purple-800', icon: RefreshCw    },
    SHIPPED:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-800', icon: Truck        },
    DELIVERED:  { label: 'Delivered',  color: 'bg-green-100  text-green-800',  icon: CheckCircle2 },
    CANCELLED:  { label: 'Cancelled',  color: 'bg-red-100    text-red-800',    icon: XCircle      },
};

const STATUS_TRANSITIONS = {
    PENDING:    ['PROCESSING', 'CANCELLED'],
    PAID:       ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED',    'CANCELLED'],
    SHIPPED:    ['DELIVERED'],
    DELIVERED:  [],
    CANCELLED:  [],
};

const FILTERS = ['ALL', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderManagement() {
    const [orders,     setOrders]     = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [filter,     setFilter]     = useState('ALL');
    const [search,     setSearch]     = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [updating,   setUpdating]   = useState(null);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderApi.getAllOrders();
            setOrders(data.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            ));
        } catch {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            const updated = await orderApi.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
            toast.success(`Order #${orderId} → ${STATUS_CONFIG[newStatus].label}`);
        } catch {
            toast.error('Status update failed');
        } finally {
            setUpdating(null);
        }
    };

    // Filter + Search
    const filtered = orders
        .filter(o => filter === 'ALL' || o.status === filter)
        .filter(o => {
            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                String(o.id).includes(q) ||
                o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
                o.shippingAddress?.phone?.includes(q)
            );
        });

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Order Management</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {orders.length} total orders
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-4 py-2 rounded-lg"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by order ID, customer name or phone..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                        bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {FILTERS.map(f => {
                    const count = f === 'ALL'
                        ? orders.length
                        : orders.filter(o => o.status === f).length;
                    return (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                                ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                        >
                            {f === 'ALL' ? 'All' : STATUS_CONFIG[f]?.label}
                            {count > 0 && (
                                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                                    ${filter === f
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 text-gray-500'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Empty state */}
            {filtered.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No orders found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(order => (
                        <OrderRow
                            key={order.id}
                            order={order}
                            expanded={expandedId === order.id}
                            onToggle={() => setExpandedId(
                                expandedId === order.id ? null : order.id
                            )}
                            onStatusUpdate={handleStatusUpdate}
                            updating={updating === order.id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function OrderRow({ order, expanded, onToggle, onStatusUpdate, updating }) {
    const s    = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
    const Icon = s.icon;
    const addr = order.shippingAddress;
    const next = STATUS_TRANSITIONS[order.status] || [];

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Row header */}
            <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4 flex-wrap">

                    {/* Order ID + date */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">#{order.id}</span>
                            <span className="text-xs text-gray-400">
                                {new Date(order.createdAt).toLocaleDateString('en-BD', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>

                        {/* Customer */}
                        {addr && (
                            <p className="text-sm text-gray-600 mt-0.5">
                                {addr.fullName} · {addr.phone}
                            </p>
                        )}
                    </div>

                    {/* Items count + total */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-sm text-gray-500">
                            {order.items?.length} item{order.items?.length !== 1 && 's'}
                        </p>
                        <p className="font-bold text-gray-900">
                            ৳{order.totalAmount?.toFixed(2)}
                        </p>
                    </div>

                    {/* Status badge */}
                    <span className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5
                        rounded-full flex-shrink-0 ${s.color}`}>
                        <Icon className="w-3 h-3" /> {s.label}
                    </span>

                    {/* Status update dropdown */}
                    {next.length > 0 && (
                        <div onClick={e => e.stopPropagation()} className="flex-shrink-0">
                            <select
                                defaultValue=""
                                disabled={updating}
                                onChange={e => {
                                    if (e.target.value) onStatusUpdate(order.id, e.target.value);
                                    e.target.value = '';
                                }}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5
                                    bg-white text-gray-700 focus:outline-none focus:ring-2
                                    focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                            >
                                <option value="" disabled>Update status</option>
                                {next.map(s => (
                                    <option key={s} value={s}>
                                        → {STATUS_CONFIG[s]?.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {updating && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                    )}

                    {expanded
                        ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    }
                </div>
            </div>

            {/* Expanded detail */}
            {expanded && (
                <div className="border-t border-gray-100 p-4 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Items */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-600" /> Items
                        </h4>
                        <div className="space-y-2">
                            {order.items?.map(item => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {item.productImage
                                            ? <img
                                                src={`data:image/jpeg;base64,${item.productImage}`}
                                                alt={item.productName}
                                                className="w-full h-full object-cover"
                                            />
                                            : <Package className="w-5 h-5 text-gray-400" />
                                        }
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {item.productName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Qty: {item.quantity}
                                            {item.size  && ` · ${item.size}`}
                                            {item.color && ` · ${item.color}`}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                                        ৳{(item.priceAtPurchase * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between font-bold text-gray-900 pt-3 mt-3
                            border-t border-gray-100">
                            <span>Total</span>
                            <span>৳{order.totalAmount?.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Shipping */}
                    {addr && (
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" /> Shipping Address
                            </h4>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                                <p className="font-medium text-gray-900">{addr.fullName}</p>
                                <p className="text-gray-600">{addr.phone}</p>
                                <p className="text-gray-600">{addr.addressLine}</p>
                                <p className="text-gray-600">
                                    {addr.city}
                                    {addr.district  && `, ${addr.district}`}
                                    {addr.postalCode && ` - ${addr.postalCode}`}
                                </p>
                            </div>

                            {/* Order meta */}
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Order ID</span>
                                    <span className="font-medium">#{order.id}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Payment</span>
                                    <span className={`font-medium px-2 py-0.5 rounded text-xs
                                        ${STATUS_CONFIG[order.status]?.color}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Date</span>
                                    <span className="font-medium">
                                        {new Date(order.createdAt).toLocaleDateString('en-BD', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}