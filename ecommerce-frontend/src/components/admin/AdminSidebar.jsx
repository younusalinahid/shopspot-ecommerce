import React from 'react';
import {useSiteContent} from '../../hooks/useSiteContent';

export default function Sidebar({ menuItems, activeTab, setActiveTab, isSidebarOpen, onClose }) {
    const {storeName} = useSiteContent();
    const handleSelect = (id) => {
        setActiveTab(id);
        // On phones/tablets the sidebar is an overlay, so close it after choosing a page
        if (window.innerWidth < 1024 && onClose) onClose();
    };

    return (
        <>
            {/* Backdrop for the mobile overlay */}
            {isSidebarOpen && onClose && (
                <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={onClose}/>
            )}

            <div
                className={`${isSidebarOpen ? 'w-64' : 'w-0'} fixed lg:static inset-y-0 left-0 z-40 flex-shrink-0
                    bg-gray-900 text-white transition-all duration-300 overflow-hidden overflow-y-auto`}
            >
                <div className="p-6 w-64">
                    <h1 className="text-2xl font-bold truncate">{storeName}</h1>
                    <p className="text-gray-400 text-sm">Admin Panel</p>
                </div>
                <nav className="mt-6 w-64">
                    {menuItems?.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSelect(item.id)}
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
        </>
    );
}
