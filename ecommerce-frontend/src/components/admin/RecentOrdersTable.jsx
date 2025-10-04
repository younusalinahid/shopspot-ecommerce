import React from 'react';
import { getStatusColor } from '../../pages/admin/dashboardData'

export default function RecentOrdersTable({ orders }) {
    return (
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
                    {orders.map((order, idx) => (
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
    );
}