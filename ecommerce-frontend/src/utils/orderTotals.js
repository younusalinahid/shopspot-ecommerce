import {isDhaka} from './isDhaka';

// Splits an order total into items / delivery / old tax.
// Older orders stored no delivery charge and still include the 7% tax that was removed later.
export const orderBreakdown = (order) => {
    const items = (order?.items || []).reduce(
        (sum, i) => sum + (i.priceAtPurchase || 0) * (i.quantity || 0), 0);
    const total = order?.totalAmount || 0;
    const delivery = order?.shippingFee ?? Math.max(0, total - items - Math.round(items * 0.07));
    const tax = Math.max(0, total - items - delivery);
    return {items, delivery, tax, total};
};

// Orders that count as a real purchase (not unfinished, not cancelled)
export const PURCHASED_STATUSES = ['CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

// Customers may cancel an unfinished checkout or a confirmed cash-on-delivery order (same rule as the backend)
export const canCustomerCancel = (order) =>
    order?.status === 'PENDING' || (order?.status === 'CONFIRMED' && order?.paymentMethod === 'COD');

// Rough delivery window by zone
export const deliveryEstimate = (order) => {
    const addr = order?.shippingAddress;
    const inside = isDhaka(addr?.city, addr?.district, addr?.area);
    const [minDays, maxDays] = inside ? [1, 2] : [3, 5];
    const from = new Date(order?.createdAt || Date.now());
    const fmt = (d) => d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'});
    const a = new Date(from);
    a.setDate(a.getDate() + minDays);
    const b = new Date(from);
    b.setDate(b.getDate() + maxDays);
    return {inside, label: `${fmt(a)} – ${fmt(b)}`, days: `${minDays}-${maxDays} days`};
};

export const formatAddress = (addr) =>
    [addr?.addressLine, addr?.area, addr?.city, addr?.district, addr?.postalCode]
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .join(', ');
