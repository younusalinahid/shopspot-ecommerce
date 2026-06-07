import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data }) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Sales — Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, "Sales"]} />
                    <Line type="monotone" dataKey="sales"
                          stroke="#3b82f6" strokeWidth={2}
                          dot={{ fill: "#3b82f6", r: 3 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}