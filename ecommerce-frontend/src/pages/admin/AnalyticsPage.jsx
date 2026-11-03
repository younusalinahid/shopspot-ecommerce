import React, {useEffect, useState} from "react";
import {analyticsApi} from "../../api/analyticsApi";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
    TrendingUp, ShoppingBag, Users, DollarSign, UserPlus, BarChart3,
    ChevronLeft, ChevronRight, Receipt, Layers, Trophy, RefreshCw, Banknote
} from "lucide-react";
import {taka, shortTaka, ORDER_STATUS} from "../../components/admin/adminFormat";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const CATEGORY_COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#64748b"];

const Card = ({children, className = ""}) => (
    <div className={`bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-100 ${className}`}>{children}</div>
);

const CardTitle = ({icon: Icon, color, children, right}) => (
    <div className="flex items-center justify-between gap-3 mb-5">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color}`}/> {children}
        </h3>
        {right}
    </div>
);

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

// 0.4% instead of a misleading 0%
const sharePct = (part, whole) => {
    if (!whole || !part) return '0%';
    const pct = (part / whole) * 100;
    return pct < 1 ? `${pct.toFixed(1)}%` : `${Math.round(pct)}%`;
};

// This month vs the whole of last month (this month is still running)
const MonthCompare = ({thisMonth, lastMonth}) => {
    if (!lastMonth) return <span>{taka(thisMonth)} this month</span>;
    const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    return (
        <span>
            {taka(thisMonth)} this month so far{" "}
            <span className={pct >= 0 ? "text-green-600" : "text-red-500"}>
                ({pct >= 0 ? "+" : ""}{pct}% vs last month)
            </span>
        </span>
    );
};

const AnalyticsPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [salesView, setSalesView] = useState("weekly"); // weekly / monthly / custom
    const [monthlyDetail, setMonthlyDetail] = useState([]);
    const [monthlyLoading, setMonthlyLoading] = useState(false);

    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12

    const load = () => {
        setRefreshing(true);
        return analyticsApi.getAnalytics()
            .then(setData)
            .catch(() => {
            })
            .finally(() => {
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        load();
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

    const isCurrentMonth = selectedYear === now.getFullYear() &&
        selectedMonth === now.getMonth() + 1;

    const handlePrevMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(y => y - 1);
        } else {
            setSelectedMonth(m => m - 1);
        }
    };

    const handleNextMonth = () => {
        if (isCurrentMonth) return;
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(y => y + 1);
        } else {
            setSelectedMonth(m => m + 1);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"/>
        </div>
    );

    if (!data) return (
        <div className="text-center py-24 text-gray-400">Failed to load analytics.</div>
    );

    const s = data.summary || {};

    const chartData = salesView === "weekly"
        ? data.dailySales
        : salesView === "monthly"
            ? data.monthlySales
            : monthlyDetail;
    const xKey = salesView === "monthly" ? "month" : "date";
    const periodRevenue = (chartData || []).reduce((sum, d) => sum + (d.sales || 0), 0);
    const customOrders = monthlyDetail.reduce((sum, d) => sum + (d.orders || 0), 0);

    // Only statuses that have orders, each in its own fixed color
    const pieData = Object.entries(data.orderStatusBreakdown || {})
        .filter(([, value]) => value > 0)
        .map(([status, value]) => ({
            status, value,
            name: ORDER_STATUS[status]?.label || status,
            fill: ORDER_STATUS[status]?.hex || "#94a3b8",
        }));
    const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0);

    const categories = data.categoryWiseSales || [];
    const categoryTotal = categories.reduce((sum, c) => sum + (c.sales || 0), 0);
    const best = data.bestSellingProducts || [];
    const bestMax = Math.max(1, ...best.map(p => p.quantity || 0));

    // Revenue split into what it is made of
    const breakdown = [
        {label: s.couponDiscounts > 0 ? `Product sales (after ${taka(s.couponDiscounts)} coupons)` : "Product sales", value: s.productSales, color: "bg-cyan-500"},
        {label: "Delivery charges", value: s.deliveryCharges, color: "bg-indigo-500"},
        ...(s.otherCharges > 0 ? [{label: "Tax (old orders)", value: s.otherCharges, color: "bg-gray-400"}] : []),
    ];
    const revenue = s.revenue || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Analytics</h2>
                    <p className="text-sm text-gray-500">
                        Revenue counts Confirmed, Paid, Processing, Shipped and Delivered orders.
                    </p>
                </div>
                <button onClick={load} disabled={refreshing}
                        className="flex items-center gap-2 text-sm text-cyan-700 font-medium bg-cyan-50 hover:bg-cyan-100 px-4 py-2 rounded-lg disabled:opacity-60">
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}/> Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue"
                          value={taka(data.totalRevenue)}
                          subtitle={<MonthCompare thisMonth={s.revenueThisMonth || 0} lastMonth={s.revenueLastMonth || 0}/>}
                          icon={DollarSign} color="bg-cyan-500"/>
                <StatCard title="Total Orders"
                          value={data.totalOrders ?? 0}
                          subtitle={`${data.ordersThisMonth ?? 0} this month · ${s.cancelledOrders ?? 0} cancelled`}
                          icon={ShoppingBag} color="bg-blue-500"/>
                <StatCard title="Average Order Value"
                          value={taka(s.averageOrderValue)}
                          subtitle={`From ${s.salesOrders ?? 0} completed sales`}
                          icon={Receipt} color="bg-purple-500"/>
                <StatCard title="Total Customers"
                          value={data.totalCustomers ?? 0}
                          subtitle={`+${data.newCustomersThisMonth ?? 0} this month`}
                          icon={Users} color="bg-orange-500"/>
            </div>

            {/* Revenue breakdown */}
            <Card>
                <CardTitle icon={Layers} color="text-cyan-500"
                           right={<span className="text-sm font-semibold text-gray-700">{taka(revenue)}</span>}>
                    Where the revenue comes from
                </CardTitle>
                <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden flex">
                    {revenue > 0 && breakdown.map(b => (
                        <div key={b.label} className={b.color} style={{width: `${(b.value / revenue) * 100}%`}}/>
                    ))}
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {breakdown.map(b => (
                        <div key={b.label}>
                            <p className="flex items-center gap-2 text-xs text-gray-500">
                                <span className={`w-2.5 h-2.5 rounded-full ${b.color}`}/> {b.label}
                            </p>
                            <p className="mt-1 text-lg font-bold text-gray-800">{taka(b.value)}</p>
                            <p className="text-xs text-gray-400">
                                {sharePct(b.value, revenue)} of revenue
                            </p>
                        </div>
                    ))}
                    <div>
                        <p className="flex items-center gap-2 text-xs text-gray-500">
                            <Banknote className="w-3.5 h-3.5 text-amber-500"/> COD cash not collected
                        </p>
                        <p className="mt-1 text-lg font-bold text-amber-600">{taka(s.codPendingAmount)}</p>
                        <p className="text-xs text-gray-400">{s.codPendingOrders ?? 0} orders (included in revenue)</p>
                    </div>
                </div>
            </Card>

            {/* Sales Chart */}
            <Card>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-cyan-500"/> Sales Overview
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {taka(periodRevenue)}
                            {salesView === "custom" && ` · ${customOrders} orders`}
                            {" "}in this period
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
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

                        {salesView === "custom" && (
                            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                                <button onClick={handlePrevMonth} aria-label="Previous month"
                                        className="text-gray-500 hover:text-gray-800 transition">
                                    <ChevronLeft className="w-4 h-4"/>
                                </button>
                                <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                                    {MONTHS[selectedMonth - 1]} {selectedYear}
                                </span>
                                <button onClick={handleNextMonth} disabled={isCurrentMonth} aria-label="Next month"
                                        className="text-gray-500 hover:text-gray-800 disabled:opacity-30 transition">
                                    <ChevronRight className="w-4 h-4"/>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {monthlyLoading ? (
                    <div className="flex items-center justify-center h-[280px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"/>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                            <XAxis dataKey={xKey} tick={{fontSize: 11}}/>
                            <YAxis tick={{fontSize: 11}} tickFormatter={shortTaka} width={56}/>
                            <Tooltip formatter={(v, key, item) => [
                                taka(v),
                                item?.payload?.orders !== undefined ? `Sales (${item.payload.orders} orders)` : "Sales"
                            ]}/>
                            <Line type="monotone" dataKey="sales" stroke="#06b6d4"
                                  strokeWidth={2} dot={{fill: "#06b6d4", r: 3}}/>
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card>

            {/* Order Status + Best Selling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardTitle icon={BarChart3} color="text-blue-500"
                               right={<span className="text-xs text-gray-400">{pieTotal} orders</span>}>
                        Order Status
                    </CardTitle>
                    {pieTotal === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No orders yet.</p>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="w-full sm:w-1/2 h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name"
                                             innerRadius={50} outerRadius={85} paddingAngle={2}>
                                            {pieData.map(d => <Cell key={d.status} fill={d.fill}/>)}
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [`${value} orders`, name]}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <ul className="w-full sm:w-1/2 space-y-2">
                                {pieData.map(d => (
                                    <li key={d.status} title={ORDER_STATUS[d.status]?.hint}
                                        className="flex items-center gap-2 text-sm">
                                        <span className="w-3 h-3 rounded-full shrink-0" style={{background: d.fill}}/>
                                        <span className="text-gray-700">{d.name}</span>
                                        <span className="ml-auto font-semibold text-gray-900">{d.value}</span>
                                        <span className="w-10 text-right text-xs text-gray-400">
                                            {Math.round((d.value / pieTotal) * 100)}%
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </Card>

                <Card>
                    <CardTitle icon={Trophy} color="text-purple-500">Best Selling Products</CardTitle>
                    {best.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No sales data yet.</p>
                    ) : (
                        <ol className="space-y-3">
                            {best.map((p, i) => (
                                <li key={p.id}>
                                    <div className="flex items-baseline gap-2 text-sm">
                                        <span className="w-5 text-gray-400 font-semibold">{i + 1}.</span>
                                        <span className="font-medium text-gray-800 truncate" title={p.name}>{p.name}</span>
                                        <span className="ml-auto shrink-0 text-gray-500">{p.quantity} sold</span>
                                        <span className="shrink-0 w-24 text-right font-semibold text-gray-900">{taka(p.revenue)}</span>
                                    </div>
                                    <div className="ml-7 mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                        <div className="h-full bg-purple-500 rounded-full"
                                             style={{width: `${(p.quantity / bestMax) * 100}%`}}/>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>
            </div>

            {/* Category sales + Customer Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardTitle icon={Layers} color="text-cyan-500"
                               right={<span className="text-xs text-gray-400">Product sales only</span>}>
                        Sales by Category
                    </CardTitle>
                    {categories.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No sales data yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {categories.map((c, i) => {
                                const pct = categoryTotal ? (c.sales / categoryTotal) * 100 : 0;
                                const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                                return (
                                    <li key={c.category}>
                                        <div className="flex items-baseline gap-2 text-sm">
                                            <span className="font-medium text-gray-800 truncate" title={c.category}>{c.category}</span>
                                            <span className="ml-auto shrink-0 font-semibold text-gray-900">{taka(c.sales)}</span>
                                            <span className="shrink-0 w-10 text-right text-xs text-gray-400">{Math.round(pct)}%</span>
                                        </div>
                                        <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                            <div className="h-full rounded-full" style={{width: `${pct}%`, background: color}}/>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Card>

                <Card>
                    <CardTitle icon={UserPlus} color="text-orange-500"
                               right={<span className="text-xs text-gray-400">New customers per month</span>}>
                        Customer Growth
                    </CardTitle>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={data.customerGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                            <XAxis dataKey="month" tick={{fontSize: 11}}/>
                            <YAxis tick={{fontSize: 12}} allowDecimals={false}/>
                            <Tooltip formatter={(v) => [v, "New customers"]}/>
                            <Bar dataKey="customers" fill="#f97316" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsPage;
