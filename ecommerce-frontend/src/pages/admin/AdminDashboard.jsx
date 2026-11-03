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
import {ToastContainer} from 'react-toastify';
import {
    LayoutDashboard, Package, ShoppingBag, Users, BarChart3, FolderTree, ImageIcon, DollarSign, Sparkles, Globe, Truck, TicketPercent
} from 'lucide-react';
import SiteContentPage from './SiteContentPage';
import DeliveryPage from './DeliveryPage';
import CouponManagementPage from './CouponManagementPage';
import InventoryAlerts from "./InventoryAlerts";
import ActionCards from '../../components/admin/ActionCards';
import {taka, ORDER_STATUS} from '../../components/admin/adminFormat';

export default function AdminDashboard() {
    const location = useLocation();
    const navigate = useNavigate();

    const getTabFromPath = () => {
        const path = location.pathname.replace('/admin/', '').replace('/admin', '');
        return path && path !== '' ? path : 'dashboard';
    };

    const [activeTab, setActiveTab] = useState(() => getTabFromPath());
    // Sidebar starts closed on phones/tablets so the content gets the full width
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        setActiveTab(getTabFromPath());
    }, [location.pathname]);

    const [loadError, setLoadError] = useState(false);

    // Reload every time the dashboard is opened, so numbers reflect order changes made on other tabs
    useEffect(() => {
        if (activeTab !== 'dashboard') return;
        setLoadError(false);
        dashboardApi.getDashboard()
            .then(setDashboardData)
            .catch(() => setLoadError(true))
            .finally(() => setLoading(false));
    }, [activeTab]);

    const openOrders = (params = '') => {
        setActiveTab('orders');
        navigate(`/admin/orders${params ? `?${params}` : ''}`);
    };

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
        {id: 'analytics', icon: BarChart3, label: 'Analytics'},
        {id: 'inventory-alerts', icon: Sparkles, label: 'AI Stock Alerts'},
        {id: 'delivery', icon: Truck, label: 'Delivery'},
        {id: 'coupons', icon: TicketPercent, label: 'Coupons'},
        {id: 'site-content', icon: Globe, label: 'Site Content'}
    ];

    const summary = dashboardData?.summary;

    const stats = dashboardData ? [
        {
            title: 'Total Revenue',
            value: taka(dashboardData.totalRevenue),
            change: `${taka(summary?.revenueThisMonth)} this month · ${taka(summary?.revenueLastMonth)} last month`,
            icon: DollarSign, color: 'bg-blue-500',
            showButton: true,
            buttonText: 'View Analytics',
            onClick: () => handleTabChange('analytics')
        },
        {
            title: 'Total Orders',
            value: dashboardData.totalOrders ?? 0,
            change: `${dashboardData.ordersThisMonth ?? 0} this month · avg ${taka(summary?.averageOrderValue)}`,
            icon: ShoppingBag, color: 'bg-green-500',
            showButton: true,
            buttonText: "View Orders",
            onClick: () => openOrders()
        },
        {
            title: 'Total Products',
            value: dashboardData.totalProducts ?? 0,
            change: `${dashboardData.activeProducts ?? 0} active · ${dashboardData.outOfStockProducts ?? 0} out of stock`,
            icon: Package, color: 'bg-purple-500',
            showButton: true,
            buttonText: "View Low Stock",
            onClick: scrollToLowStock
        },
        {
            title: 'Total Customers',
            value: dashboardData.totalCustomers ?? 0,
            change: `+${dashboardData.newCustomersThisMonth ?? 0} this month`,
            icon: Users, color: 'bg-orange-500',
            showButton: true,
            buttonText: 'View Customers',
            onClick: () => handleTabChange('customers')
        },
    ] : [];

    const renderDashboard = () => {
        if (loading) return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"/>
            </div>
        );

        if (loadError) return (
            <div className="bg-red-50 text-red-700 rounded-lg p-6 text-center">
                Could not load dashboard data. Please check that the backend is running and refresh.
            </div>
        );

        const statusEntries = Object.entries(dashboardData?.orderStatusBreakdown || {});
        const allOrders = statusEntries.reduce((sum, [, count]) => sum + count, 0);

        return (
            <div className="space-y-6">

                {/* Stats Cards */}
                <StatsCards stats={stats}/>

                {/* What needs action now */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Needs attention</h3>
                    <ActionCards summary={summary}
                                 onSelect={(key) => openOrders(key === 'PENDING' ? 'status=PENDING' : `filter=${key}`)}/>
                </div>

                {/* Sales Chart + Order Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SalesChart data={dashboardData?.dailySales || []}/>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-baseline justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Order Status</h3>
                            <span className="text-xs text-gray-400">{allOrders} orders · click to open</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {statusEntries.map(([status, count]) => {
                                const meta = ORDER_STATUS[status];
                                return (
                                    <button key={status} type="button" title={meta?.hint}
                                            onClick={() => openOrders(`status=${status}`)}
                                            className={`rounded-xl p-4 text-center transition-colors ${meta?.tile || "bg-gray-50 text-gray-700"}`}>
                                        <p className="text-2xl font-bold">{count}</p>
                                        <p className="text-xs mt-1 font-medium">{meta?.label || status}</p>
                                    </button>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-xs text-gray-400">
                            Revenue counts Confirmed, Paid, Processing, Shipped and Delivered orders.
                            Pending and Cancelled orders are not counted.
                        </p>
                    </div>
                </div>

                {/* Recent Orders + Low Stock */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Recent Orders */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                            <button onClick={() => openOrders()} className="text-sm font-medium text-cyan-600 hover:underline">
                                View all
                            </button>
                        </div>
                        {!dashboardData?.recentOrders?.length ? (
                            <p className="text-gray-400 text-sm text-center py-8">No orders yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {dashboardData.recentOrders.map(order => (
                                    <button key={order.id} type="button"
                                            onClick={() => openOrders(`order=${order.id}`)}
                                            className="w-full text-left flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm text-gray-800 truncate">
                                                <span className="text-gray-400">#{order.id}</span> {order.customerName}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {order.createdAt}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-semibold text-sm text-gray-800">
                                                {taka(order.totalAmount)}
                                            </p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block
                                                ${ORDER_STATUS[order.status]?.badge || "bg-gray-100 text-gray-600"}`}>
                                                {ORDER_STATUS[order.status]?.label || order.status}
                                            </span>
                                        </div>
                                    </button>
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
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                ⚠️ Low Stock Alert
                            </h3>
                            <button onClick={() => handleTabChange('products')} className="text-sm font-medium text-cyan-600 hover:underline">
                                Manage products
                            </button>
                        </div>
                        {!dashboardData?.lowStockProducts?.length ? (
                            <p className="text-gray-400 text-sm text-center py-8">
                                ✅ All products have sufficient stock.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {dashboardData.lowStockProducts.map(product => (
                                    <button key={product.id} type="button" onClick={() => handleTabChange('products')}
                                            className="w-full text-left flex items-center justify-between gap-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {product.name}
                                        </p>
                                        <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full
                                            ${product.stock <= 3
                                            ? "bg-red-200 text-red-700"
                                            : "bg-orange-100 text-orange-700"}`}>
                                            {product.stock <= 0 ? 'Out of stock' : `${product.stock} left`}
                                        </span>
                                    </button>
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
            case 'inventory-alerts':
                return <InventoryAlerts/>;
            case 'delivery':
                return <DeliveryPage/>;
            case 'coupons':
                return <CouponManagementPage/>;
            case 'site-content':
                return <SiteContentPage/>;
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
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className="flex-1 min-w-0 overflow-auto">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    title={menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
                />
                <main className="p-3 sm:p-6">
                    {renderContent()}
                </main>
            </div>
            {/* Admin pages live outside MainLayout, so they need their own toast container */}
            <ToastContainer position="top-right" autoClose={2500} theme="colored" newestOnTop/>
        </div>
    );
}