// Shared helpers for the admin dashboard, analytics and order pages,
// so every page formats money and order statuses the same way.

export const taka = (n) => `৳${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

// Short form for chart axes: ৳950, ৳12.5k, ৳3.2L, ৳1.1Cr
export const shortTaka = (n) => {
    const v = Number(n) || 0;
    if (v >= 10000000) return `৳${(v / 10000000).toFixed(1)}Cr`;
    if (v >= 100000) return `৳${(v / 100000).toFixed(1)}L`;
    if (v >= 1000) return `৳${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return `৳${v}`;
};

export const ORDER_STATUS = {
    PENDING: {
        label: 'Pending', hex: '#eab308',
        hint: 'Checkout not finished: card not paid or COD not confirmed. Not counted in revenue.',
        tile: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100', badge: 'bg-yellow-100 text-yellow-700',
    },
    CONFIRMED: {
        label: 'Confirmed', hex: '#14b8a6',
        hint: 'Cash on delivery order confirmed by the customer. Ready to process.',
        tile: 'bg-teal-50 text-teal-700 hover:bg-teal-100', badge: 'bg-teal-100 text-teal-700',
    },
    PAID: {
        label: 'Paid', hex: '#0ea5e9',
        hint: 'Card payment received. Ready to process.',
        tile: 'bg-sky-50 text-sky-700 hover:bg-sky-100', badge: 'bg-sky-100 text-sky-700',
    },
    PROCESSING: {
        label: 'Processing', hex: '#8b5cf6',
        hint: 'Being packed.',
        tile: 'bg-violet-50 text-violet-700 hover:bg-violet-100', badge: 'bg-violet-100 text-violet-700',
    },
    SHIPPED: {
        label: 'Shipped', hex: '#6366f1',
        hint: 'Handed to the delivery person.',
        tile: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100', badge: 'bg-indigo-100 text-indigo-700',
    },
    DELIVERED: {
        label: 'Delivered', hex: '#22c55e',
        hint: 'Customer received the order.',
        tile: 'bg-green-50 text-green-700 hover:bg-green-100', badge: 'bg-green-100 text-green-700',
    },
    CANCELLED: {
        label: 'Cancelled', hex: '#ef4444',
        hint: 'Cancelled. Not counted in revenue; stock was returned.',
        tile: 'bg-red-50 text-red-700 hover:bg-red-100', badge: 'bg-red-100 text-red-700',
    },
};

export const REVENUE_STATUSES = ['CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

// Quick filters used by the "Needs attention" cards and the order page
export const QUICK_FILTERS = {
    TO_PROCESS: {label: 'To process', match: (o) => o.status === 'CONFIRMED' || o.status === 'PAID'},
    IN_TRANSIT: {label: 'In delivery', match: (o) => o.status === 'PROCESSING' || o.status === 'SHIPPED'},
    COD_DUE: {
        label: 'COD cash due',
        match: (o) => o.paymentMethod === 'COD' && REVENUE_STATUSES.includes(o.status) && !o.codCollected,
    },
};

// Items / delivery / old-tax split of an order total (shared with the customer pages)
export {orderBreakdown} from '../../utils/orderTotals';

// Same numbers as the backend SalesSummaryDTO, computed from the order list
export const summarizeOrders = (orders) => {
    const due = orders.filter(QUICK_FILTERS.COD_DUE.match);
    return {
        ordersToProcess: orders.filter(QUICK_FILTERS.TO_PROCESS.match).length,
        ordersInTransit: orders.filter(QUICK_FILTERS.IN_TRANSIT.match).length,
        codPendingOrders: due.length,
        codPendingAmount: due.reduce((s, o) => s + (o.totalAmount || 0), 0),
        unpaidCheckouts: orders.filter(o => o.status === 'PENDING').length,
    };
};
