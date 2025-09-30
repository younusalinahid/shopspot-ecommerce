import Sidebar from "./components/AdminSidebar";
import {useState} from "react";
import {salesData, categoryData, recentOrders, menuItems, stats} from './dashboardData';
import Header from "./components/AdminHeader";
import StatsCards from "./components/StatsCards";
import SalesChart from "./components/SalesChart";
import CategoryChart from "./components/CategoryChart";
import RecentOrdersTable from "./components/RecentOrdersTable";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar
                menuItems={menuItems}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSidebarOpen={isSidebarOpen}
            />

            <div className="flex-1 overflow-auto">
                <Header
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                />

                <main className="p-6">
                    <StatsCards stats={stats} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <SalesChart data={salesData} />
                        <CategoryChart data={categoryData} />
                    </div>

                    <RecentOrdersTable orders={recentOrders} />
                </main>
            </div>
        </div>
    )
}