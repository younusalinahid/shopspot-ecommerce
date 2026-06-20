import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GitCompare } from 'lucide-react';

const CompareFloatingButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [compareCount, setCompareCount] = useState(0);

    const updateCompareCount = () => {
        const savedList = localStorage.getItem('productCompareList');
        if (savedList) {
            const list = JSON.parse(savedList);
            setCompareCount(list.length);
        } else {
            setCompareCount(0);
        }
    };

    useEffect(() => {
        updateCompareCount();
        window.addEventListener('storage', updateCompareCount);
        const interval = setInterval(updateCompareCount, 1000);

        return () => {
            window.removeEventListener('storage', updateCompareCount);
            clearInterval(interval);
        };
    }, []);

    if (location.pathname === '/compare') return null;

    return (
        <div className="fixed bottom-24 right-6 z-50">
            <div className="relative flex items-center group">

                <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 whitespace-nowrap pointer-events-none select-none">
                    Open Comparison ⚖️
                </span>

                <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-75"
                      style={{ animation: "chatPing 2.5s cubic-bezier(0, 0, 0.2, 1) infinite" }} />
                <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-50"
                      style={{ animation: "chatPing 2.5s cubic-bezier(0, 0, 0.2, 1) infinite", animationDelay: "1.25s" }} />

                {/* Main Button */}
                <button
                    onClick={() => navigate('/compare')}
                    className="bg-[#00b0ff] hover:bg-[#0091ea] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center relative transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white dark:border-gray-800 z-10"
                >
                    <GitCompare className="w-6 h-6 animate-pulse" />

                    {compareCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md border border-white z-20">
                            {compareCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CompareFloatingButton;