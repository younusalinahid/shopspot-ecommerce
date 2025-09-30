import React from 'react';

export default function Sidebar({ menuItems, activeTab, setActiveTab, isSidebarOpen }) {
    return (
        <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden`}>
            <div className="p-6">
                <h1 className="text-2xl font-bold">ShopSport Online</h1>
                <p className="text-gray-400 text-sm">Admin Panel</p>
            </div>
            <nav className="mt-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                                activeTab === item.id
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}