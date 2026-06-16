import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { userApi as profileApi, userApi } from "../../api/userApi";
import { wishlistApi } from "../../api/wishlistApi";
import { orderApi } from "../../api/orderApi";
import {
    Camera, Edit2, X, Check, Lock, User, Mail,
    Phone, MapPin, Heart, ShoppingBag, ChevronRight,
    Shield, Calendar, Package, AlertTriangle, Send
} from "lucide-react";
import { toast } from "react-toastify";

const TABS = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "security", label: "Security", icon: Shield },
];

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    PAID: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    PROCESSING: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    SHIPPED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const ProfilePage = () => {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);
    const [reportMessage, setReportMessage] = useState('');
    const [reportSending, setReportSending] = useState(false);
    const [reportSent, setReportSent] = useState(false);
    const [isDeactivated, setIsDeactivated] = useState(false);

    const [form, setForm] = useState({ fullName: "", phone: "", address: "" });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "", newPassword: "", confirmPassword: ""
    });

    useEffect(() => {
        setLoading(true);

        profileApi.getProfile()
            .then(data => {
                setProfile(data);
                setIsDeactivated(!data?.active);
                setForm({
                    fullName: data?.fullName || "",
                    phone: data?.phone || "",
                    address: data?.address || ""
                });
                setLoading(false);
            })
            .catch(err => {
                console.error("API error, checking status or localStorage fallback...", err);

                setIsDeactivated(true);

                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const backupUser = JSON.parse(storedUser);
                    setProfile(backupUser);
                    setForm({
                        fullName: backupUser?.fullName || "Social User",
                        phone: backupUser?.phone || "",
                        address: backupUser?.address || ""
                    });
                } else {
                    if (searchParams.get("status") === "deactivated") {
                        const dummyUser = { fullName: "Social Account User", email: "Restricted", active: false };
                        setProfile(dummyUser);
                        setForm({ fullName: dummyUser.fullName, phone: "", address: "" });
                    } else {
                        toast.error('Failed to load profile data');
                    }
                }
                setLoading(false);
            });
    }, [searchParams]);

    useEffect(() => {
        if (!profile || !profile.active) return;

        orderApi.getMyOrders?.()
            .then(data => setOrders(data || []))
            .catch(e => console.log("Orders fetch restricted or omitted."));

        wishlistApi.getWishlist?.()
            .then(data => setWishlist(data || []))
            .catch(e => console.log("Wishlist fetch restricted or omitted."));
    }, [profile]);


    const handleSendReport = async () => {
        if (!reportMessage.trim()) {
            toast.error('Please write your request message');
            return;
        }
        setReportSending(true);
        try {
            await userApi.sendReport({
                message: reportMessage,
                email: profile?.email,
                name: profile?.fullName
            });

            setReportSent(true);
            setReportMessage('');
            toast.success('Reactivation request sent to admin! 🎉');
        } catch (err) {
            console.error("Report error Details: ", err);
            toast.error(err.response?.data?.message || 'Failed to send request.');
        } finally {
            setReportSending(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updated = await userApi.updateProfile(form);
            setProfile(updated);
            setEditMode(false);
            toast.success("Profile updated");
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const updated = await userApi.updateProfileImage(file);
            setProfile(updated);
            toast.success("Profile image updated");
        } catch {
            toast.error("Failed to update image");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setSaving(true);
        try {
            await userApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            toast.success("Password changed successfully");
            setShowPasswordForm(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch {
            toast.error("Current password is incorrect");
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveWishlist = async (productId) => {
        try {
            await wishlistApi.toggleWishlist(productId);
            setWishlist(prev => prev.filter(w => w.productId !== productId));
            toast.success("Removed from wishlist");
        } catch {
            toast.error("Failed to remove");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-300">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── Left Sidebar ── */}
                    <div className="lg:w-72 flex-shrink-0 space-y-4">
                        {/* Avatar Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 text-center">
                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-cyan-50 dark:bg-cyan-950 flex items-center justify-center mx-auto ring-4 ring-cyan-500/10">
                                    {profile?.profileImage ? (
                                        <img
                                            src={`data:image/jpeg;base64,${profile.profileImage}`}
                                            alt={profile.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-cyan-500" />
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full shadow-md transition-colors"
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>

                            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{profile?.fullName || "User Profile"}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 truncate">{profile?.email}</p>

                            <div className="flex justify-center gap-2 mb-2">
                                <span className="inline-block px-3 py-0.5 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 text-xs font-semibold rounded-full uppercase">
                                    {profile?.role || "CUSTOMER"}
                                </span>
                                {isDeactivated && (
                                    <span className="inline-block px-3 py-0.5 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-full uppercase animate-pulse">
                                        Restricted
                                    </span>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-center gap-1 text-xs text-gray-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Recently"}</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4 grid grid-cols-3 gap-2 text-center">
                            {[
                                { label: "Orders", value: orders.length, icon: ShoppingBag },
                                { label: "Wishlist", value: wishlist.length, icon: Heart },
                                { label: "Delivered", value: orders.filter(o => o.status === "DELIVERED").length, icon: Package },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="p-1">
                                    <Icon className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                                    <p className="text-[11px] text-gray-400 font-medium">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Nav Tabs */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-l-4 ${
                                        activeTab === id
                                            ? "border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 font-semibold"
                                            : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeTab === id ? "rotate-90" : ""}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Right Content Panel ── */}
                    <div className="flex-1 min-w-0 space-y-6">

                        {/* Profile Info Tab Content */}
                        {activeTab === "profile" && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
                                    {!editMode ? (
                                        <button onClick={() => setEditMode(true)}
                                                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1.5 rounded-xl text-cyan-500 text-sm font-semibold transition-all">
                                            <Edit2 className="w-4 h-4" /> Edit Profile
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditMode(false)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button onClick={handleSaveProfile} disabled={saving}
                                                    className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors shadow-sm">
                                                <Check className="w-4 h-4" />
                                                {saving ? "Saving..." : "Save"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { icon: User, label: "Full Name", field: "fullName", value: profile?.fullName },
                                        { icon: Phone, label: "Phone", field: "phone", value: profile?.phone },
                                        { icon: MapPin, label: "Address", field: "address", value: profile?.address },
                                    ].map(({ icon: Icon, label, field, value }) => (
                                        <div key={field} className={field === "address" ? "md:col-span-2" : ""}>
                                            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                                                <Icon className="w-3.5 h-3.5 text-cyan-500/80" /> {label}
                                            </label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={form[field]}
                                                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-gray-200 font-medium px-1 py-1">
                                                    {value || <span className="text-gray-400 italic font-normal text-sm">Not configured</span>}
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                                            <Mail className="w-3.5 h-3.5 text-cyan-500/80" /> Email Address
                                        </label>
                                        <p className="text-gray-900 dark:text-gray-200 font-medium px-1 py-1">{profile?.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── 💡 BEAUTIFUL ACCOUNT DEACTIVATED WARNING CARD ── */}
                        {activeTab === "profile" && isDeactivated && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 pointer-events-none">
                                    <AlertTriangle className="w-40 h-40 text-amber-900 dark:text-white" />
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-5">
                                    <div className="w-12 h-12 bg-amber-500 dark:bg-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md text-white">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <h3 className="font-bold text-amber-900 dark:text-amber-400 text-xl mb-1.5 flex items-center gap-2">
                                            Account Access Restricted
                                        </h3>
                                        <p className="text-amber-800 dark:text-amber-300/90 text-sm leading-relaxed mb-4">
                                            Your account status has been set to <strong>Read-Only</strong> by the administration. You can browse our catalogs, manage your wishlist, and update personal details. However, shopping privileges like <strong>adding items to cart, checkout, and new order placement</strong> are temporarily restricted.
                                        </p>

                                        {/* Activation Form View */}
                                        <div className="bg-white/80 dark:bg-gray-900/60 border border-amber-200/60 dark:border-amber-950/80 p-4 rounded-xl shadow-inner">
                                            {!reportSent ? (
                                                <div className="space-y-3">
                                                    <label className="block text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                                                        📬 Appeal for Account Reactivation
                                                    </label>
                                                    <textarea
                                                        value={reportMessage}
                                                        onChange={e => setReportMessage(e.target.value)}
                                                        placeholder="State your reason or message to the administrator for review..."
                                                        rows={3}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                                                            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                                            placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2
                                                            focus:ring-amber-500 transition-all resize-none"
                                                    />
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={handleSendReport}
                                                            disabled={reportSending || !reportMessage.trim()}
                                                            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white
                                                                px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                                                        >
                                                            {reportSending ? "Sending Request..." : (
                                                                <>
                                                                    <Send size={15}/> Send Reactivation Request
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 p-2">
                                                    <div className="p-1 bg-emerald-100 dark:bg-emerald-950/50 rounded-full">
                                                        <Check className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">Appeal Submitted Successfully</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">The platform operations team will verify your account activity shortly.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Orders Tab Content */}
                        {activeTab === "orders" && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h3>
                                {orders.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">No historical orders tracked yet.</p>
                                        <Link to="/" className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.map(order => (
                                            <Link key={order.id} to={`/order-confirmation/${order.id}`}
                                                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-cyan-200 dark:hover:border-cyan-800/80 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/10 transition-all">
                                                <div className="flex -space-x-2">
                                                    {order.items?.slice(0, 2).map(item => (
                                                        item.productImage && (
                                                            <img key={item.id}
                                                                 src={`data:image/jpeg;base64,${item.productImage}`}
                                                                 alt={item.productName}
                                                                 className="w-12 h-12 rounded-lg object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                                                            />
                                                        )
                                                    ))}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Order #{order.id}</p>
                                                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-GB")}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1 ${statusColors[order.status]}`}>
                                                        {order.status}
                                                    </span>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">৳{order.totalAmount}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wishlist Tab Content */}
                        {activeTab === "wishlist" && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist</h3>
                                {wishlist.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">Your wishlist is empty</p>
                                        <Link to="/" className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
                                            Explore Products
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {wishlist.map(item => (
                                            <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all group relative bg-gray-50/30 dark:bg-gray-950/10">
                                                <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                                                    {item.productImage ? (
                                                        <img
                                                            src={`data:image/jpeg;base64,${item.productImage}`}
                                                            alt={item.productName}
                                                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </Link>
                                                <div className="flex-1 min-w-0 pr-6">
                                                    <Link to={`/product/${item.productId}`}>
                                                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate hover:text-cyan-500 transition-colors">
                                                            {item.productName}
                                                        </p>
                                                    </Link>
                                                    <p className="text-cyan-500 font-bold text-sm mt-1">৳{item.productPrice}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveWishlist(item.productId)}
                                                    className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Security Tab Content */}
                        {activeTab === "security" && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Account Security</h3>
                                <button
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                                >
                                    <Lock size={16} /> Update Account Password
                                </button>

                                {showPasswordForm && (
                                    <form onSubmit={handleChangePassword} className="mt-6 space-y-4 max-w-md bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordForm.currentPassword}
                                                onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordForm.newPassword}
                                                onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordForm.confirmPassword}
                                                onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end pt-2">
                                            <button type="button" onClick={() => setShowPasswordForm(false)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
                                            <button type="submit" disabled={saving} className="bg-cyan-500 hover:bg-cyan-600 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50">
                                                {saving ? "Updating..." : "Change Password"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;