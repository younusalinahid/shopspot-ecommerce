import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {userApi} from "../../api/userApi";
import { Search, Trash2, ToggleLeft, ToggleRight, Users } from "lucide-react";

const CustomerManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userApi.getAllUsers();
            const customers = data.filter(u => u.role !== "ADMIN");
            setUsers(customers);
            setFiltered(customers);
        } catch {
            toast.error("Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(users.filter(u =>
            u.fullName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.phone?.toLowerCase().includes(q)
        ));
    }, [search, users]);

    const handleToggleStatus = async (user) => {
        try {
            await userApi.toggleStatus(user.id);
            toast.success(`${user.fullName} ${user.active ? "deactivated" : "activated"}`);
            fetchUsers();
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Delete ${user.fullName}? This cannot be undone.`)) return;
        try {
            await userApi.deleteUser(user.id);
            toast.success("Customer deleted");
            fetchUsers();
        } catch {
            toast.error("Failed to delete customer");
        }
    };

    const formatDate = (instant) => {
        if (!instant) return "—";
        return new Date(instant).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric"
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Customer Management</h2>
                        <p className="text-sm text-gray-500">{filtered.length} customers</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                    <p className="text-sm text-blue-500">Total Customers</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">
                        {users.filter(u => u.active).length}
                    </p>
                    <p className="text-sm text-green-500">Active</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">
                        {users.filter(u => !u.active).length}
                    </p>
                    <p className="text-sm text-red-500">Inactive</p>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading customers...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    {search ? "No customers match your search." : "No customers found."}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 border-b text-left">#</th>
                            <th className="p-3 border-b text-left">Customer</th>
                            <th className="p-3 border-b text-left">Phone</th>
                            <th className="p-3 border-b text-left">Joined</th>
                            <th className="p-3 border-b text-center">Status</th>
                            <th className="p-3 border-b text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((user, index) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 border-b text-gray-400">{index + 1}</td>

                                {/* Customer Info */}
                                <td className="p-3 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                            {user.fullName?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{user.fullName}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-3 border-b text-gray-600">
                                    {user.phone || <span className="text-gray-300">—</span>}
                                </td>

                                <td className="p-3 border-b text-gray-500">
                                    {formatDate(user.createdAt)}
                                </td>

                                {/* Status */}
                                <td className="p-3 border-b text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            user.active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-600"
                                        }`}>
                                            {user.active ? "Active" : "Inactive"}
                                        </span>
                                </td>

                                {/* Actions */}
                                <td className="p-3 border-b text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            title={user.active ? "Deactivate" : "Activate"}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                user.active
                                                    ? "text-green-600 hover:bg-green-50"
                                                    : "text-gray-400 hover:bg-gray-100"
                                            }`}
                                        >
                                            {user.active
                                                ? <ToggleRight className="w-5 h-5" />
                                                : <ToggleLeft className="w-5 h-5" />
                                            }
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user)}
                                            title="Delete"
                                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CustomerManagementPage;