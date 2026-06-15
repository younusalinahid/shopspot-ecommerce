import React, {useState, useEffect, useRef} from 'react';
import Sidebar from '../../components/admin/AdminSidebar';
import Header from '../../components/admin/AdminHeader';
import StatsCards from '../../components/admin/StatsCards';
import SalesChart from '../../components/admin/SalesChart';
import CategoryManagement from '../../pages/admin/CategoryManagementPage';
import BannerManagement from '../../pages/admin/BannerManagementPage';
import OrderManagement from '../../pages/admin/OrderManagementPage';
import ProductManagement from "../../pages/admin/ProductManagementPage";
import CustomerManagementPage from "../../pages/admin/CustomerManagementPage";
import AnalyticsPage from "../../pages/admin/AnalyticsPage";
import {dashboardApi} from "../../api/dashboardApi";
import {useNavigate, useLocation} from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, Users, BarChart3, FolderTree, ImageIcon, DollarSign
} from 'lucide-react';

export default function AdminDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    const getTabFromPath = () => {
        const path = location.pathname.replace('/admin/', '').replace('/admin', '');
        return path && path !== '' ? path : 'dashboard';
    };

    const [activeTab, setActiveTab] = useState(() => getTabFromPath());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        setActiveTab(getTabFromPath());
    }, [location.pathname]);

    useEffect(() => {
        dashboardApi.getDashboard()
            .then(setDashboardData)
            .catch(() => {
            })
            .finally(() => setLoading(false));
    }, []);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/admin/${tabId}`);
    };

    const lowStockRef = useRef(null);

    const scrollToLowStock = () => {
        lowStockRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        setIsHighlighted(true);

        setTimeout(() => {
            setIsHighlighted(false);
        }, 2000);
    };

    const menuItems = [
        {id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'},
        {id: 'banners', icon: ImageIcon, label: 'Banners'},
        {id: 'categories', icon: FolderTree, label: 'Categories'},
        {id: 'products', icon: Package, label: 'Products'},
        {id: 'orders', icon: ShoppingBag, label: 'Orders'},
        {id: 'customers', icon: Users, label: 'Customers'},
        {id: 'analytics', icon: BarChart3, label: 'Analytics'}
    ];

    const stats = dashboardData ? [
        {
            title: 'Total Revenue',
            value: `৳${(dashboardData.totalRevenue ?? 0).toLocaleString()}`,
            change: `৳${(dashboardData.revenueThisMonth ?? 0).toLocaleString()} this month`,
            icon: DollarSign, color: 'bg-blue-500'
        },
        {
            title: 'Total Orders',
            value: dashboardData.totalOrders ?? 0,
            change: `${dashboardData.ordersThisMonth ?? 0} this month`,
            icon: ShoppingBag, color: 'bg-green-500',
            showButton: true,
            buttonText: "View Low Stock",
            onClick: scrollToLowStock
        },
        {
            title: 'Total Products',
            value: dashboardData.totalProducts ?? 0,
            change: 'Active products',
            icon: Package, color: 'bg-purple-500',
            showButton: true,
            buttonText: "View Low Stock",
            onClick: scrollToLowStock
        },
        {
            title: 'Total Customers',
            value: dashboardData.totalCustomers ?? 0,
            change: `+${dashboardData.newCustomersThisMonth ?? 0} this month`,
            icon: Users, color: 'bg-orange-500'
        },
    ] : [];

    const STATUS_COLORS = {
        PENDING: "bg-yellow-50 text-yellow-700",
        PROCESSING: "bg-blue-50 text-blue-700",
        SHIPPED: "bg-purple-50 text-purple-700",
        DELIVERED: "bg-green-50 text-green-700",
        CANCELLED: "bg-red-50 text-red-700",
    };

    const STATUS_BADGE_COLORS = {
        PENDING: "bg-yellow-100 text-yellow-700",
        PROCESSING: "bg-blue-100 text-blue-700",
        SHIPPED: "bg-purple-100 text-purple-700",
        DELIVERED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    const renderDashboard = () => {
        if (loading) return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"/>
            </div>
        );

        const hasLowStock = dashboardData?.lowStockProducts?.length > 0;

        return (
            <div className="space-y-6">

                {/* Stats Cards */}
                <StatsCards stats={stats}/>

                {/* Sales Chart + Order Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SalesChart data={dashboardData?.dailySales || []}/>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {dashboardData?.orderStatusBreakdown &&
                                Object.entries(dashboardData.orderStatusBreakdown).map(([status, count]) => (
                                    <div key={status}
                                         className={`rounded-xl p-4 text-center ${STATUS_COLORS[status] || "bg-gray-50 text-gray-700"}`}>
                                        <p className="text-2xl font-bold">{count}</p>
                                        <p className="text-xs mt-1 font-medium">{status}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>

                {/* Recent Orders + Low Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
                        {!dashboardData?.recentOrders?.length ? (
                            <p className="text-gray-400 text-sm text-center py-8">No orders yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {dashboardData.recentOrders.map(order => (
                                    <div key={order.id}
                                         className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div>
                                            <p className="font-medium text-sm text-gray-800">
                                                {order.customerName}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {order.createdAt}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-sm text-gray-800">
                                                ৳{order.totalAmount?.toLocaleString()}
                                            </p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block
                                                ${STATUS_BADGE_COLORS[order.status] || "bg-gray-100 text-gray-600"}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Low Stock Alert with Highlight Effect */}
                    <div
                        ref={lowStockRef}
                        className={`bg-white rounded-lg shadow-sm p-6 transition-all duration-300 ${
                            isHighlighted
                                ? 'ring-4 ring-yellow-400 ring-opacity-75 shadow-lg scale-[1.02] bg-yellow-50'
                                : ''
                        }`}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            ⚠️ Low Stock Alert
                        </h3>
                        {!dashboardData?.lowStockProducts?.length ? (
                            <p className="text-gray-400 text-sm text-center py-8">
                                ✅ All products have sufficient stock.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {dashboardData.lowStockProducts.map(product => (
                                    <div key={product.id}
                                         className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-800">
                                            {product.name}
                                        </p>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full
                                            ${product.stock <= 3
                                            ? "bg-red-200 text-red-700"
                                            : "bg-orange-100 text-orange-700"}`}>
                                            {product.stock} left
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboard();
            case 'banners':
                return <BannerManagement/>;
            case 'categories':
                return <CategoryManagement/>;
            case 'products':
                return <ProductManagement/>;
            case 'orders':
                return <OrderManagement/>;
            case 'customers':
                return <CustomerManagementPage/>;
            case 'analytics':
                return <AnalyticsPage/>;
                return (
                    <div className="bg-white rounded-lg shadow-sm p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings</h2>
                        <p className="text-gray-500">Configure your store settings.</p>
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">Settings section coming soon...</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                menuItems={menuItems}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                isSidebarOpen={isSidebarOpen}
            />
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