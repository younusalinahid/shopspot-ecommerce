import React from 'react';
import {Home, Menu, X} from 'lucide-react';
import {useNavigate} from "react-router-dom";

export default function Header({isSidebarOpen, setIsSidebarOpen}) {
    const navigate = useNavigate();

    return (
        <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        {isSidebarOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div
                        className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        A
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        <Home className="w-4 h-4"/>
                        Home
                    </button>
                </div>
            </div>
        </header>
    );
}