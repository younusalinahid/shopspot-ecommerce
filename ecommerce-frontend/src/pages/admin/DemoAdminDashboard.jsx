import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, BarChart3, TrendingUp, DollarSign, ShoppingCart, Menu, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const salesData = [
        { month: 'Jan', sales: 4200 },
        { month: 'Feb', sales: 3800 },
        { month: 'Mar', sales: 5100 },
        { month: 'Apr', sales: 4600 },
        { month: 'May', sales: 6200 },
        { month: 'Jun', sales: 7100 }
    ];

    const categoryData = [
        { name: 'T-Shirts', value: 450 },
        { name: 'Jeans', value: 320 },
        { name: 'Dresses', value: 280 },
        { name: 'Shoes', value: 390 }
    ];

    const recentOrders = [
        { id: '#ORD-001', customer: 'Rahim Ahmed', items: 3, amount: '৳2,450', status: 'Delivered' },
        { id: '#ORD-002', customer: 'Fatima Khan', items: 1, amount: '৳890', status: 'Processing' },
        { id: '#ORD-003', customer: 'Karim Hasan', items: 2, amount: '৳1,650', status: 'Shipped' },
        { id: '#ORD-004', customer: 'Nadia Islam', items: 4, amount: '৳3,200', status: 'Pending' },
        { id: '#ORD-005', customer: 'Shabab Ali', items: 2, amount: '৳1,450', status: 'Delivered' }
    ];

    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'products', icon: Package, label: 'Products' },
        { id: 'orders', icon: ShoppingBag, label: 'Orders' },
        { id: 'customers', icon: Users, label: 'Customers' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    const stats = [
        { title: 'Total Sales', value: '৳42,580', change: '+12.5%', icon: DollarSign, color: 'bg-blue-500' },
        { title: 'Orders', value: '156', change: '+8.2%', icon: ShoppingCart, color: 'bg-green-500' },
        { title: 'Products', value: '1,234', change: '+3.1%', icon: Package, color: 'bg-purple-500' },
        { title: 'Customers', value: '892', change: '+15.3%', icon: Users, color: 'bg-orange-500' }
    ];

    const getStatusColor = (status) => {
        switch(status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            case 'Pending': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden`}>
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Fashion Store</h1>
                    <p className="text-gray-400 text-sm">Admin Panel</p>
                </div>
                <nav className="mt-6">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                                    activeTab === item.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800'
                                }`}
                            >
                                <Icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-white shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {stats.map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div key={idx} className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`${stat.color} p-3 rounded-lg`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-green-500 text-sm font-semibold flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                                            {stat.change}
                    </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Sales Chart */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Category Chart */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold mb-4">Category Sales</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#8b5cf6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Orders Table */}
                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-semibold">Recent Orders</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {recentOrders.map((order, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{order.customer}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{order.items}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.amount}</td>
                                        <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}