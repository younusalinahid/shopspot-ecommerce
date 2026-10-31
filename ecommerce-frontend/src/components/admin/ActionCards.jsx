import React from 'react';
import {PackageCheck, Truck, Banknote, Clock} from 'lucide-react';
import {taka} from './adminFormat';

// "Needs attention" row: what the admin should act on now. Each card opens the matching order filter.
export default function ActionCards({summary, onSelect, active}) {
    if (!summary) return null;
    const cards = [
        {
            key: 'TO_PROCESS', icon: PackageCheck, title: 'To process',
            value: summary.ordersToProcess ?? 0, note: 'Confirmed or paid, ready to pack',
            color: 'text-teal-600 bg-teal-50', ring: 'ring-teal-400',
        },
        {
            key: 'IN_TRANSIT', icon: Truck, title: 'In delivery',
            value: summary.ordersInTransit ?? 0, note: 'Processing or shipped',
            color: 'text-indigo-600 bg-indigo-50', ring: 'ring-indigo-400',
        },
        {
            key: 'COD_DUE', icon: Banknote, title: 'COD cash due',
            value: taka(summary.codPendingAmount), note: `${summary.codPendingOrders ?? 0} orders not collected yet`,
            color: 'text-amber-600 bg-amber-50', ring: 'ring-amber-400',
        },
        {
            key: 'PENDING', icon: Clock, title: 'Unfinished checkouts',
            value: summary.unpaidCheckouts ?? 0, note: 'Not paid / not confirmed',
            color: 'text-gray-600 bg-gray-100', ring: 'ring-gray-400',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {cards.map(({key, icon: Icon, title, value, note, color, ring}) => (
                <button key={key} type="button" onClick={() => onSelect?.(key)}
                        className={`text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all ${active === key ? `ring-2 ${ring}` : ''}`}>
                    <div className="flex items-center gap-2">
                        <span className={`p-2 rounded-lg ${color}`}><Icon className="w-4 h-4"/></span>
                        <span className="text-sm font-medium text-gray-600">{title}</span>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{note}</p>
                </button>
            ))}
        </div>
    );
}
