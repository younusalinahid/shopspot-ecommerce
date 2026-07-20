import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import {ADMIN_URL} from "../../api/config";

const InventoryAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchAIAlerts = async () => {
            try {
                const res = await axios.get(`${ADMIN_URL}/inventory/forecast-alerts`, {
                    headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
                });

                let incomingData = res.data;

                if (incomingData && typeof incomingData === 'object' && !Array.isArray(incomingData) && typeof incomingData.data === 'string') {
                    incomingData = incomingData.data;
                }

                if (typeof incomingData === 'string') {
                    let cleanedString = incomingData.trim();

                    if (cleanedString.includes("```json")) {
                        cleanedString = cleanedString.split("```json")[1].split("```")[0].trim();
                    } else if (cleanedString.includes("```")) {
                        cleanedString = cleanedString.split("```")[1].split("```")[0].trim();
                    }

                    const firstBracket = cleanedString.indexOf('[');
                    const lastBracket = cleanedString.lastIndexOf(']');

                    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
                        cleanedString = cleanedString.substring(firstBracket, lastBracket + 1);
                    }

                    try {
                        incomingData = JSON.parse(cleanedString);
                    } catch (e) {
                        throw new Error(`Invalid JSON format. Couldn't parse the model response.`);
                    }
                }

                if (incomingData && !Array.isArray(incomingData) && typeof incomingData === 'object') {
                    if (Array.isArray(incomingData.alerts)) {
                        incomingData = incomingData.alerts;
                    } else if (Array.isArray(incomingData.data)) {
                        incomingData = incomingData.data;
                    } else if (Array.isArray(incomingData.choices)) {
                        incomingData = incomingData.choices;
                    } else {
                        incomingData = [incomingData];
                    }
                }

                if (Array.isArray(incomingData)) {
                    setAlerts(incomingData);
                } else {
                    setAlerts([]);
                    throw new Error("Received data format is not a valid array.");
                }

                setLoading(false);
            } catch (err) {
                const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch AI predictions';
                setError(errorMsg);
                setLoading(false);
            }
        };

        fetchAIAlerts();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-sm md:text-base text-indigo-600 font-medium px-4">
                    ShopSpot AI is analyzing sales trends from the past 3 months... Please wait...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="p-4 max-w-md mx-auto my-8 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm text-center text-sm md:text-base">
                <span className="block text-xl mb-1">⚠️</span>
                <strong className="font-semibold">Error:</strong> {error}
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
            {/* Header Section */}
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 border-b border-slate-200 pb-4">
                <div className="flex items-center space-x-2.5">
                    <span className="text-2xl md:text-3xl">🪄</span>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">AI Stock Forecast &
                            Alerts</h2>
                        <p className="text-xs text-slate-500 mt-0.5">ShopSpot Merchant AI Assistant Dashboard</p>
                    </div>
                </div>
                <span
                    className="self-start sm:self-center text-[10px] uppercase font-bold tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    Admin Only
                </span>
            </div>

            {/* Main Content Area */}
            {alerts.length === 0 ? (
                <div
                    className="p-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-start space-x-3 shadow-sm max-w-2xl text-sm md:text-base">
                    <span className="text-lg">🎉</span>
                    <p className="font-medium">All products have sufficient stock levels. No stockout risks detected for
                        the upcoming month.</p>
                </div>
            ) : (
                /* Mobile-first Responsive Grid Layout */
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                    {alerts.map((alert, index) => {
                        const productId = alert.productId || alert.product_id || index;
                        const productName = alert.productName || alert.product_name || "Unknown Product";
                        const demandStatus = (alert.predictedDemandStatus || alert.predicted_demand_status || "MEDIUM").toUpperCase();
                        const recommendedStock = alert.recommendedStockToOrder || alert.recommended_stock_to_order || 0;
                        const reason = alert.reason || "No detailed analysis provided.";

                        const isHighDemand = demandStatus === 'HIGH';

                        return (
                            <div
                                key={productId}
                                className={`flex flex-col justify-between p-4 md:p-5 rounded-2xl bg-white shadow-sm border border-slate-100 border-l-4 transition-all hover:shadow-md ${
                                    isHighDemand ? 'border-l-rose-500' : 'border-l-amber-500'
                                }`}
                            >
                                {/* Upper Section */}
                                <div>
                                    <div className="flex justify-between items-start gap-2 mb-2.5">
                                        <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug">
                                            {productName}
                                        </h3>
                                        <span
                                            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-wide uppercase ${
                                                isHighDemand ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                            }`}>
                                            🔥 {demandStatus} DEMAND
                                        </span>
                                    </div>

                                    <p className="text-slate-600 text-xs md:text-sm mb-4 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200">
                                        <strong className="text-slate-700 font-semibold block mb-1">AI
                                            Analysis:</strong>
                                        {reason}
                                    </p>
                                </div>

                                {/* Lower Action/Info Box */}
                                <div
                                    className="bg-slate-50 p-3 rounded-xl flex justify-between items-center mt-auto border border-slate-100">
                                    <span
                                        className="text-slate-500 text-xs md:text-sm font-medium">Recommended Restock:</span>
                                    <span
                                        className={`font-bold text-sm md:text-base px-2.5 py-0.5 rounded bg-white shadow-sm border ${
                                            isHighDemand ? 'text-rose-600 border-rose-200' : 'text-amber-600 border-amber-200'
                                        }`}>
                                        📦 {recommendedStock} {recommendedStock > 1 ? 'units' : 'unit'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default InventoryAlerts;