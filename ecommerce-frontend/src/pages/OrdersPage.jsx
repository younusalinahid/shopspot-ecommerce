import { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, Search, Filter, ChevronRight, Eye, Download } from 'lucide-react';

const MyOrders = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Sample orders data
    const orders = [
        {
            id: 'ORD-2024-001',
            date: '2024-11-15',
            status: 'delivered',
            total: 4500,
            items: 3,
            products: [
                { name: 'Wireless Headphones', quantity: 1, price: 2500, image: '🎧' },
                { name: 'Phone Case', quantity: 2, price: 1000, image: '📱' }
            ]
        },
        {
            id: 'ORD-2024-002',
            date: '2024-11-14',
            status: 'shipped',
            total: 8900,
            items: 2,
            estimatedDelivery: '2024-11-18',
            products: [
                { name: 'Smart Watch', quantity: 1, price: 7500, image: '⌚' },
                { name: 'Screen Protector', quantity: 1, price: 1400, image: '🛡️' }
            ]
        },
        {
            id: 'ORD-2024-003',
            date: '2024-11-13',
            status: 'processing',
            total: 12500,
            items: 4,
            products: [
                { name: 'Bluetooth Speaker', quantity: 2, price: 6000, image: '🔊' },
                { name: 'USB Cable', quantity: 2, price: 500, image: '🔌' }
            ]
        },
        {
            id: 'ORD-2024-004',
            date: '2024-11-10',
            status: 'cancelled',
            total: 3200,
            items: 1,
            products: [
                { name: 'Power Bank', quantity: 1, price: 3200, image: '🔋' }
            ]
        }
    ];

    const getStatusConfig = (status) => {
        const configs = {
            delivered: {
                icon: CheckCircle,
                color: 'text-green-600 dark:text-green-400',
                bg: 'bg-green-100 dark:bg-green-900/30',
                label: 'Delivered'
            },
            shipped: {
                icon: Truck,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-100 dark:bg-blue-900/30',
                label: 'Shipped'
            },
            processing: {
                icon: Clock,
                color: 'text-yellow-600 dark:text-yellow-400',
                bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                label: 'Processing'
            },
            cancelled: {
                icon: XCircle,
                color: 'text-red-600 dark:text-red-400',
                bg: 'bg-red-100 dark:bg-red-900/30',
                label: 'Cancelled'
            }
        };
        return configs[status] || configs.processing;
    };

    const filteredOrders = orders.filter(order => {
        const matchesTab = activeTab === 'all' || order.status === activeTab;
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.products.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    const tabs = [
        { id: 'all', label: 'All Orders', count: orders.length },
        { id: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
        { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
        { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track and manage your orders</p>
                </div>

                {/* Search and Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 transition-colors duration-300">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by order ID or product name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                            />
                        </div>
                        <button className="flex items-center space-x-2 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                            <Filter className="w-5 h-5" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 transition-colors duration-300 overflow-x-auto">
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <span>{tab.label}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    activeTab === tab.id
                                        ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center transition-colors duration-300">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders found</h3>
                            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or search query</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const statusConfig = getStatusConfig(order.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                                >
                                    {/* Order Header */}
                                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                                                    <Package className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {order.id}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Placed on {new Date(order.date).toLocaleDateString('en-GB')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`flex items-center space-x-2 px-4 py-2 rounded-full ${statusConfig.bg}`}>
                                                    <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                                                    <span className={`font-medium ${statusConfig.color}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Products */}
                                    <div className="p-6 space-y-4">
                                        {order.products.map((product, index) => (
                                            <div key={index} className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-3xl">
                                                    {product.image}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Quantity: {product.quantity}
                                                    </p>
                                                </div>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    ৳{product.price}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Footer */}
                                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-center space-x-6">
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">৳{order.total}</p>
                                            </div>
                                            {order.estimatedDelivery && (
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Delivery</p>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {new Date(order.estimatedDelivery).toLocaleDateString('en-GB')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
                                                <Eye className="w-4 h-4" />
                                                <span>View Details</span>
                                            </button>
                                            {order.status === 'delivered' && (
                                                <button className="flex items-center space-x-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-300">
                                                    <Download className="w-4 h-4" />
                                                    <span>Invoice</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Order Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {orders.filter(o => o.status === 'processing').length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {orders.filter(o => o.status === 'delivered').length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">💰</span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ৳{orders.reduce((sum, o) => sum + o.total, 0)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyOrders;