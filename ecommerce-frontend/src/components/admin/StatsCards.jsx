import React from 'react';

export default function StatsCards({ stats }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <div key={idx} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800 break-words">{stat.value}</p>
                        {stat.change && (
                            <p className="text-xs text-gray-400 mt-1 mb-3">{stat.change}</p>
                        )}
                        {stat.showButton && stat.onClick && (
                            <button
                                onClick={stat.onClick}
                                className="mt-auto pt-0 text-xs font-medium text-cyan-600 hover:text-cyan-700
                                         bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg
                                         transition-colors duration-200 w-full"
                            >
                                {stat.buttonText || 'View Details'}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}