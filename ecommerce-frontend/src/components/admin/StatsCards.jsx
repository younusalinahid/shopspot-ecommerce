import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function StatsCards({ stats }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <div key={idx} className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-green-500 text-sm font-semibold flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                );
            })}
        </div>
    );
}