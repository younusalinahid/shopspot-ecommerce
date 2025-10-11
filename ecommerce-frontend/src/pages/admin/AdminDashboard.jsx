import React, { useState } from 'react';
import Sidebar from '../../components/admin/AdminSidebar';
import Header from '../../components/admin/AdminHeader';
import StatsCards from '../../components/admin/StatsCards';
import SalesChart from '../../components/admin/SalesChart';
import CategoryChart from '../../components/admin/CategoryChart';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import CategoryManagement from '../../components/admin/CategoryManagement';
import BannerManagement from '../../components/admin/BannerManagement';
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, BarChart3, FolderTree, ImageIcon, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Menu items
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'banners', icon: ImageIcon, label: 'Banners' },
        { id: 'categories', icon: FolderTree, label: 'Categories' },
        { id: 'products', icon: Package, label: 'Products' },
        { id: 'orders', icon: ShoppingBag, label: 'Orders' },
        { id: 'customers', icon: Users, label: 'Customers' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings' }
    ];

    // Dummy data for dashboard
    const stats = [
        { title: 'Total Sales', value: '৳42,580', change: '+12.5%', icon: DollarSign, color: 'bg-blue-500' },
        { title: 'Orders', value: '156', change: '+8.2%', icon: ShoppingBag, color: 'bg-green-500' },
        { title: 'Products', value: '1,234', change: '+3.1%', icon: Package, color: 'bg-purple-500' },
        { title: 'Customers', value: '892', change: '+15.3%', icon: Users, color: 'bg-orange-500' }
    ];

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
        { id: '#ORD-003', customer: 'Karim Hasan', items: 2, amount: '৳1,650', status: 'Shipped' }
    ];

    // Render content based on active tab
    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return (
                    <div>
                        <StatsCards stats={stats} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <SalesChart data={salesData} />
                            <CategoryChart data={categoryData} />
                        </div>
                        <RecentOrdersTable orders={recentOrders} />
                    </div>
                );

            case 'banners':
                return <BannerManagement />;

            case 'categories':
                return <CategoryManagement />;

            case 'products':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Products Management</h2>
                        <p className="text-gray-500">Add, edit, and manage your products inventory.</p>
                        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                            <p className="text-purple-700">Products section coming soon...</p>
                        </div>
                    </div>
                );

            case 'orders':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Orders Management</h2>
                        <p className="text-gray-500">View and manage customer orders and their status.</p>
                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                            <p className="text-green-700">Orders section coming soon...</p>
                        </div>
                    </div>
                );

            case 'customers':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Customers Management</h2>
                        <p className="text-gray-500">View customer information and purchase history.</p>
                        <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                            <p className="text-orange-700">Customers section coming soon...</p>
                        </div>
                    </div>
                );

            case 'analytics':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics Dashboard</h2>
                        <p className="text-gray-500">View detailed analytics and reports.</p>
                        <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                            <p className="text-indigo-700">Analytics section coming soon...</p>
                        </div>
                    </div>
                );

            case 'settings':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings</h2>
                        <p className="text-gray-500">Configure your store settings and preferences.</p>
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">Settings section coming soon...</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-gray-800">Welcome to Admin Dashboard</h2>
                        <p className="text-gray-500 mt-2">Select a menu item from the sidebar to get started.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                menuItems={menuItems}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSidebarOpen={isSidebarOpen}
            />

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                <main className="p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}