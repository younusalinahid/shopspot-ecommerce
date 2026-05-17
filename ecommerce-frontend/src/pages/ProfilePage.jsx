import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../api/user-api";
import { wishlistApi } from "../api/wishlist-api-service";
import { orderApi } from "../api/order-api";
import {
    Camera, Edit2, X, Check, Lock, User, Mail,
    Phone, MapPin, Heart, ShoppingBag, ChevronRight,
    Shield, Calendar, Package
} from "lucide-react";
import { toast } from "react-toastify";

const TABS = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "security", label: "Security", icon: Shield },
];

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-purple-100 text-purple-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({ fullName: "", phone: "", address: "" });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "", newPassword: "", confirmPassword: ""
    });

    useEffect(() => {
        Promise.all([
            userApi.getProfile(),
            orderApi.getUserOrders(),
            wishlistApi.getWishlist(),
        ]).then(([profileData, ordersData, wishlistData]) => {
            setProfile(profileData);
            setForm({
                fullName: profileData.fullName || "",
                phone: profileData.phone || "",
                address: profileData.address || "",
            });
            setOrders(ordersData);
            setWishlist(wishlistData);
        }).catch(() => toast.error("Failed to load profile"))
            .finally(() => setLoading(false));
    }, []);

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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">

                    {/* ── Left Sidebar ── */}
                    <div className="lg:w-72 flex-shrink-0 space-y-4">

                        {/* Avatar Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
                            <div className="relative inline-block mb-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center mx-auto">
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
                                    className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 text-white p-1.5 rounded-full shadow-lg transition-colors"
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                </button>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </div>

                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{profile?.fullName}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{profile?.email}</p>
                            <span className="inline-block px-3 py-0.5 bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 text-xs font-semibold rounded-full uppercase">
                                {profile?.role}
                            </span>

                            <div className="mt-4 pt-4 border-t dark:border-gray-700 flex items-center justify-center gap-1 text-xs text-gray-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Joined {new Date(profile?.createdAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 grid grid-cols-3 gap-2 text-center">
                            {[
                                { label: "Orders", value: orders.length, icon: ShoppingBag },
                                { label: "Wishlist", value: wishlist.length, icon: Heart },
                                { label: "Delivered", value: orders.filter(o => o.status === "DELIVERED").length, icon: Package },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="p-2">
                                    <Icon className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                                    <p className="text-xs text-gray-400">{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Nav Tabs */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-l-4 ${
                                        activeTab === id
                                            ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400"
                                            : "border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${activeTab === id ? "rotate-90" : ""}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Right Content ── */}
                    <div className="flex-1 min-w-0">

                        {/* Profile Info Tab */}
                        {activeTab === "profile" && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
                                    {!editMode ? (
                                        <button onClick={() => setEditMode(true)}
                                                className="flex items-center gap-1.5 text-cyan-500 hover:text-cyan-600 text-sm font-medium">
                                            <Edit2 className="w-4 h-4" /> Edit
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditMode(false)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button onClick={handleSaveProfile} disabled={saving}
                                                    className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
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
                                            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                                                <Icon className="w-3.5 h-3.5" /> {label}
                                            </label>
                                            {editMode ? (
                                                <input
                                                    type="text"
                                                    value={form[field]}
                                                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                />
                                            ) : (
                                                <p className="text-gray-900 dark:text-white font-medium px-1">
                                                    {value || <span className="text-gray-400 italic font-normal text-sm">Not set</span>}
                                                </p>
                                            )}
                                        </div>
                                    ))}

                                    <div>
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                                            <Mail className="w-3.5 h-3.5" /> Email
                                        </label>
                                        <p className="text-gray-900 dark:text-white font-medium px-1">{profile?.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === "orders" && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h3>

                                {orders.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">No orders yet</p>
                                        <Link to="/" className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
                                            Start Shopping
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {orders.map(order => (
                                            <Link key={order.id} to={`/order-confirmation/${order.id}`}
                                                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-all">
                                                <div className="flex -space-x-2">
                                                    {order.items?.slice(0, 2).map(item => (
                                                        item.productImage && (
                                                            <img key={item.id}
                                                                 src={`data:image/jpeg;base64,${item.productImage}`}
                                                                 alt={item.productName}
                                                                 className="w-12 h-12 rounded-lg object-cover border-2 border-white dark:border-gray-800"
                                                            />
                                                        )
                                                    ))}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">Order #{order.id}</p>
                                                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1 ${statusColors[order.status]}`}>
                                                        {order.status}
                                                    </span>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">${order.totalAmount}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Wishlist Tab */}
                        {activeTab === "wishlist" && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">My Wishlist</h3>

                                {wishlist.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400 mb-4">Your wishlist is empty</p>
                                        <Link to="/" className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
                                            Explore Products
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {wishlist.map(item => (
                                            <div key={item.id} className="flex gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all group">
                                                <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                                                    {item.productImage ? (
                                                        <img
                                                            src={`data:image/jpeg;base64,${item.productImage}`}
                                                            alt={item.productName}
                                                            className="w-16 h-16 object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <Link to={`/product/${item.productId}`}>
                                                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate hover:text-cyan-500 transition-colors">
                                                            {item.productName}
                                                        </p>
                                                    </Link>
                                                    <p className="text-cyan-500 font-bold text-sm mt-0.5">৳{item.productPrice}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveWishlist(item.productId)}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security Settings</h3>

                                {!showPasswordForm ? (
                                    <div className="flex items-center justify-between p-5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center">
                                                <Lock className="w-6 h-6 text-cyan-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">Password</p>
                                                <p className="text-sm text-gray-400">Last changed: Unknown</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowPasswordForm(true)}
                                            className="text-sm text-cyan-500 hover:text-cyan-600 font-medium"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                                        {[
                                            { name: "currentPassword", label: "Current Password" },
                                            { name: "newPassword", label: "New Password" },
                                            { name: "confirmPassword", label: "Confirm New Password" },
                                        ].map(({ name, label }) => (
                                            <div key={name}>
                                                <label className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                                                    {label}
                                                </label>
                                                <input
                                                    type="password"
                                                    value={passwordForm[name]}
                                                    onChange={e => setPasswordForm(prev => ({ ...prev, [name]: e.target.value }))}
                                                    required
                                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                                />
                                            </div>
                                        ))}
                                        <div className="flex gap-3 pt-2">
                                            <button type="button"
                                                    onClick={() => { setShowPasswordForm(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                                                    className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                Cancel
                                            </button>
                                            <button type="submit" disabled={saving}
                                                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                                                {saving ? "Saving..." : "Update Password"}
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