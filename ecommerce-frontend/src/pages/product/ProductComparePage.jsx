import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductComparePage = () => {
    const navigate = useNavigate();
    const [compareList, setCompareList] = useState(() => {
        const savedList = localStorage.getItem('productCompareList');
        return savedList ? JSON.parse(savedList) : [];
    });

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const removeFromCompare = (productId) => {
        const updatedList = compareList.filter(item => (item.id || item._id) !== productId);
        setCompareList(updatedList);
        localStorage.setItem('productCompareList', JSON.stringify(updatedList));
        toast.info("Removed from comparison list.");
    };

    const clearAllCompare = () => {
        setCompareList([]);
        localStorage.removeItem('productCompareList');
        toast.info("Cleared all items.");
    };

    if (compareList.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                <div className="text-center bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl max-w-sm w-full border border-slate-100 dark:border-slate-800">
                    <div className="text-6xl mb-6">🔄</div>
                    <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">No Products to Compare</h2>
                    <p className="text-slate-500 mb-8">Add products to see the side-by-side comparison!</p>
                    <button onClick={() => navigate('/')}
                            className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-2xl font-bold shadow-lg transition-all">
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => navigate(-1)}
                            className="bg-white dark:bg-slate-800 p-3 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white"/>
                    </button>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Product Comparison</h1>
                    <button onClick={clearAllCompare}
                            className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-all border border-rose-100 dark:border-rose-900/50">
                        <Trash2 className="w-4 h-4"/> Clear All
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <th className="p-6 text-slate-900 dark:text-slate-200 uppercase tracking-widest text-xs font-black w-1/5">Features</th>
                                {compareList.map((item) => (
                                    <th key={item.id || item._id} className="p-6 border-l border-slate-200 dark:border-slate-700 text-center relative">
                                        <button onClick={() => removeFromCompare(item.id || item._id)}
                                                className="absolute top-4 right-4 text-slate-300 hover:text-rose-500">
                                            <Trash2 className="w-4 h-4"/></button>
                                        <img src={item.imageData ? (item.imageData.startsWith('data:') ? item.imageData : `data:image/jpeg;base64,${item.imageData}`) : ''}
                                             alt={item.name}
                                             className="w-28 h-28 object-cover rounded-2xl mx-auto shadow-md"/>
                                        <p className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{item.name}</p>
                                    </th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {/* Price */}
                            <tr>
                                <td className="p-6 font-black text-slate-600 dark:text-slate-400 text-sm">Price</td>
                                {compareList.map(item => <td key={item.id} className="p-6 text-center border-l border-slate-100 dark:border-slate-800 font-bold text-sky-600">৳{Math.round(item.price)}</td>)}
                            </tr>
                            {/* Category */}
                            <tr>
                                <td className="p-6 font-black text-slate-600 dark:text-slate-400 text-sm">Category</td>
                                {compareList.map(item => <td key={item.id} className="p-6 text-center border-l border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">{item.displayCategoryName || item.subCategory?.name || item.category?.name || "Standard Item"}</td>)}
                            </tr>
                            {/* Fabric */}
                            <tr>
                                <td className="p-6 font-black text-slate-600 dark:text-slate-400 text-sm">Fabric</td>
                                {compareList.map(item => {
                                    const nameLower = item.name?.toLowerCase() || '';
                                    const price = parseFloat(item.price) || 0;
                                    let detectedFabric = item.fabric || item.material;
                                    if (!detectedFabric) {
                                        if (price >= 20000) detectedFabric = nameLower.includes('silk') ? 'Premium Silk' : 'Premium Jamdani';
                                        else if (price >= 5000) detectedFabric = nameLower.includes('cotton') ? 'Soft Cotton' : 'Fine Georgette';
                                        else detectedFabric = 'Standard Cotton';
                                    }
                                    return <td key={item.id} className="p-6 text-center border-l border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">{detectedFabric}</td>
                                })}
                            </tr>
                            {/* Quality */}
                            <tr>
                                <td className="p-6 font-black text-slate-600 dark:text-slate-400 text-sm">Quality</td>
                                {compareList.map(item => <td key={item.id} className="p-6 text-center border-l border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300">{item.quality || (parseFloat(item.price) >= 20000 ? 'Premium Quality ✨' : 'Standard Quality 👍')}</td>)}
                            </tr>
                            {/* Stock */}
                            <tr>
                                <td className="p-6 font-black text-slate-600 dark:text-slate-400 text-sm">Stock Status</td>
                                {compareList.map(item => {
                                    const sCount = parseInt(item.stock);
                                    const isUnlim = isNaN(sCount) || sCount === 0;
                                    return <td key={item.id} className="p-6 text-center border-l border-slate-100 dark:border-slate-800 text-sm font-bold">
                                            <span className={isUnlim || sCount > 0 ? "text-emerald-600" : "text-rose-600"}>
                                                {isUnlim ? "In Stock" : sCount > 0 ? `${sCount} left` : "Out of Stock"}
                                            </span>
                                    </td>
                                })}
                            </tr>
                            {/* Action Button - Black Style */}
                            <tr>
                                <td className="p-6 font-black text-slate-600 dark:text-slate-400 text-sm">Action</td>
                                {compareList.map(item => (
                                    <td key={item.id} className="p-6 text-center border-l border-slate-100 dark:border-slate-800">
                                        <button onClick={() => navigate(`/product/${item.id || item._id}`)}
                                                className="bg-black dark:bg-white text-white dark:text-black px-8 py-2 rounded-xl text-xs font-bold hover:opacity-90 shadow-md transition-all">
                                            View
                                        </button>
                                    </td>
                                ))}
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductComparePage;