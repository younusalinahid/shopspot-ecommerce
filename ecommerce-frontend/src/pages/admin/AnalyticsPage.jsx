import React, {useEffect, useState} from "react";
import {analyticsApi} from "../../api/analyticsApi";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
    TrendingUp, ShoppingBag, Package, Users,
    DollarSign, UserPlus, BarChart3, ChevronLeft, ChevronRight
} from "lucide-react";

const COLORS = ["#06b6d4", "#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const StatCard = ({title, value, subtitle, icon: Icon, color}) => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">{title}</p>
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-4 h-4 text-white"/>
            </div>
        </div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
);

const AnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [salesView, setSalesView] = useState("weekly"); // weekly / monthly / custom
    const [monthlyDetail, setMonthlyDetail] = useState([]);
    const [monthlyLoading, setMonthlyLoading] = useState(false);

    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12

    useEffect(() => {
        analyticsApi.getAnalytics()
            .then(setData)
            .catch(() => {
            })
            .finally(() => setLoading(false));
    }, []);

    // Custom month fetch
    useEffect(() => {
        if (salesView !== "custom") return;
        setMonthlyLoading(true);
        analyticsApi.getMonthlyDetail(selectedYear, selectedMonth)
            .then(setMonthlyDetail)
            .catch(() => setMonthlyDetail([]))
            .finally(() => setMonthlyLoading(false));
    }, [salesView, selectedYear, selectedMonth]);

    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(y => y - 1);
        } else {
            setSelectedMonth(m => m - 1);
        }
    };

    const handleNextMonth = () => {
        const isCurrentMonth = selectedYear === now.getFullYear() &&
            selectedMonth === now.getMonth() + 1;
        if (isCurrentMonth) return;
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(y => y + 1);
        } else {
            setSelectedMonth(m => m + 1);
        }
    };

    const isCurrentMonth = selectedYear === now.getFullYear() &&
        selectedMonth === now.getMonth() + 1;

    // Custom month summary
    const customRevenue = monthlyDetail.reduce((sum, d) => sum + (d.sales || 0), 0);
    const customOrders = monthlyDetail.reduce((sum, d) => sum + (d.orders || 0), 0);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"/>
        </div>
    );

    if (!data) return (
        <div className="text-center py-24 text-gray-400">Failed to load analytics.</div>
    );

    const pieData = Object.entries(data.orderStatusBreakdown).map(([name, value]) => ({
        name, value
    }));

    const chartData = salesView === "weekly"
        ? data.dailySales
        : salesView === "monthly"
            ? data.monthlySales
            : monthlyDetail;

    const xKey = salesView === "weekly" ? "date" : salesView === "monthly" ? "month" : "date";

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Analytics</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue"
                          value={`৳${(data.totalRevenue ?? 0).toLocaleString()}`}
                          subtitle={`৳${(data.revenueThisMonth ?? 0).toLocaleString()} this month`}
                          icon={DollarSign} color="bg-cyan-500"/>
                <StatCard title="Total Orders"
                          value={data.totalOrders ?? 0}
                          subtitle={`${data.ordersThisMonth ?? 0} this month`}
                          icon={ShoppingBag} color="bg-blue-500"/>
                <StatCard title="Total Products"
                          value={data.totalProducts ?? 0}
                          icon={Package} color="bg-purple-500"/>
                <StatCard title="Total Customers"
                          value={data.totalCustomers ?? 0}
                          subtitle={`+${data.newCustomersThisMonth ?? 0} this month`}
                          icon={Users} color="bg-orange-500"/>
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-cyan-500"/> Sales Overview
                    </h3>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* View toggle buttons */}
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            {[
                                {key: "weekly", label: "7 Days"},
                                {key: "monthly", label: "6 Months"},
                                {key: "custom", label: "By Month"},
                            ].map(btn => (
                                <button
                                    key={btn.key}
                                    onClick={() => setSalesView(btn.key)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                                        salesView === btn.key
                                            ? "bg-cyan-500 text-white shadow-sm"
                                            : "text-gray-600 hover:text-gray-800"
                                    }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>

                        {/* Month/Year picker — only for custom */}
                        {salesView === "custom" && (
                            <div
                                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                                <button onClick={handlePrevMonth}
                                        className="text-gray-500 hover:text-gray-800 transition">
                                    <ChevronLeft className="w-4 h-4"/>
                                </button>
                                <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                                    {MONTHS[selectedMonth - 1]} {selectedYear}
                                </span>
                                <button onClick={handleNextMonth}
                                        disabled={isCurrentMonth}
                                        className="text-gray-500 hover:text-gray-800 disabled:opacity-30 transition">
                                    <ChevronRight className="w-4 h-4"/>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Custom month summary */}
                {salesView === "custom" && (
                    <div className="flex gap-4 mb-4">
                        <div className="bg-cyan-50 rounded-lg px-4 py-2">
                            <p className="text-xs text-cyan-600">Revenue</p>
                            <p className="font-bold text-cyan-700">৳{customRevenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg px-4 py-2">
                            <p className="text-xs text-blue-600">Orders</p>
                            <p className="font-bold text-blue-700">{customOrders}</p>
                        </div>
                    </div>
                )}

                {monthlyLoading ? (
                    <div className="flex items-center justify-center h-[280px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"/>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                            <XAxis dataKey={xKey} tick={{fontSize: 11}}/>
                            <YAxis tick={{fontSize: 11}}/>
                            <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, "Sales"]}/>
                            <Line type="monotone" dataKey="sales" stroke="#06b6d4"
                                  strokeWidth={2} dot={{fill: "#06b6d4", r: 3}}/>
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Order Status + Best Selling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500"/> Order Status
                    </h3>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                                 dataKey="value" label={({name, value}) => `${name}: ${value}`}
                                 labelLine={false}>
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, name]}/>
                            <Legend
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                formatter={(value, entry) => (
                                    <span style={{fontSize: 12, color: "#374151"}}>
                        {value}: {entry.payload.value}
                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-purple-500"/> Best Selling Products
                    </h3>
                    {data.bestSellingProducts.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No sales data yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={data.bestSellingProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                <XAxis type="number" tick={{fontSize: 12}}/>
                                <YAxis dataKey="name" type="category" width={100}
                                       tick={{fontSize: 11}}/>
                                <Tooltip/>
                                <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]}/>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Customer Growth */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-orange-500"/> Customer Growth
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.customerGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                        <XAxis dataKey="month" tick={{fontSize: 12}}/>
                        <YAxis tick={{fontSize: 12}} allowDecimals={false}/>
                        <Tooltip/>
                        <Bar dataKey="customers" fill="#f97316" radius={[4, 4, 0, 0]}/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AnalyticsPage;