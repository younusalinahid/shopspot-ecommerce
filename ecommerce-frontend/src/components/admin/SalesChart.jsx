import React from 'react';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import {taka, shortTaka} from './adminFormat';

export default function SalesChart({data}) {
    const total = (data || []).reduce((s, d) => s + (d.sales || 0), 0);
    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-baseline justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold">Sales — Last 7 Days</h3>
                <span className="text-sm font-semibold text-gray-700">{taka(total)}</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                    <XAxis dataKey="date" tick={{fontSize: 11}}/>
                    <YAxis tick={{fontSize: 11}} tickFormatter={shortTaka} width={56}/>
                    <Tooltip formatter={(v) => [taka(v), 'Sales']}/>
                    <Line type="monotone" dataKey="sales"
                          stroke="#3b82f6" strokeWidth={2}
                          dot={{fill: '#3b82f6', r: 3}}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
