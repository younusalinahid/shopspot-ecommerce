import {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {TicketPercent, Plus, Pencil, Trash2, X, Save} from 'lucide-react';
import {couponApi} from '../../api/couponApi';
import {confirmDialog} from '../../utils/confirmDialog';
import {taka} from '../../components/admin/adminFormat';

const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none';

const EMPTY_FORM = {
    code: '', description: '', type: 'PERCENT', discountValue: '', minOrderAmount: '', maxDiscount: '',
    startsAt: '', expiresAt: '', maxUses: '', maxUsesPerCustomer: '1', active: true,
};

// <input type="datetime-local"> works in the browser's local time; the API uses UTC instants
const toLocalInput = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const toIso = (local) => (local ? new Date(local).toISOString() : null);
const toNumber = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const text = (v) => (v === null || v === undefined ? '' : String(v));

const toForm = (c) => ({
    code: c.code,
    description: text(c.description),
    type: c.type,
    discountValue: text(c.discountValue),
    minOrderAmount: c.minOrderAmount ? String(c.minOrderAmount) : '',
    maxDiscount: text(c.maxDiscount),
    startsAt: toLocalInput(c.startsAt),
    expiresAt: toLocalInput(c.expiresAt),
    maxUses: text(c.maxUses),
    maxUsesPerCustomer: text(c.maxUsesPerCustomer),
    active: c.active,
});

const discountLabel = (c) => {
    if (c.type !== 'PERCENT') return `${taka(c.discountValue)} off`;
    return c.maxDiscount ? `${c.discountValue}% off, up to ${taka(c.maxDiscount)}` : `${c.discountValue}% off`;
};

const formatDate = (iso) => new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const couponStatus = (c) => {
    const now = Date.now();
    if (!c.active) return {label: 'Off', cls: 'bg-gray-100 text-gray-600'};
    if (c.expiresAt && new Date(c.expiresAt).getTime() <= now) return {label: 'Expired', cls: 'bg-red-100 text-red-700'};
    if (c.maxUses !== null && c.usedCount >= c.maxUses) return {label: 'Used up', cls: 'bg-red-100 text-red-700'};
    if (c.startsAt && new Date(c.startsAt).getTime() > now) return {label: 'Scheduled', cls: 'bg-indigo-100 text-indigo-700'};
    return {label: 'Live', cls: 'bg-green-100 text-green-700'};
};

function Field({label, help, children}) {
    return (
        <label className="block">
            <span className="block text-sm font-semibold text-gray-800 mb-1.5">{label}</span>
            {children}
            {help && <span className="block text-xs text-gray-500 mt-1">{help}</span>}
        </label>
    );
}

/** Admin -> Coupons: create, edit, switch off and delete discount codes. */
export default function CouponManagementPage() {
    const [coupons, setCoupons] = useState(null);
    const [editing, setEditing] = useState(null); // null = closed, 'new' or a coupon
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        couponApi.getAll()
            .then(setCoupons)
            .catch(err => {
                setCoupons([]);
                toast.error(err.response?.data?.message || 'Failed to load coupons');
            });
    }, []);

    const set = (key) => (e) => setForm(prev => ({...prev, [key]: e.target.value}));

    const openNew = () => {
        setForm(EMPTY_FORM);
        setEditing('new');
    };

    const openEdit = (coupon) => {
        setForm(toForm(coupon));
        setEditing(coupon);
    };

    const toPayload = (f) => ({
        code: f.code,
        description: f.description,
        type: f.type,
        discountValue: toNumber(f.discountValue),
        minOrderAmount: toNumber(f.minOrderAmount) ?? 0,
        maxDiscount: toNumber(f.maxDiscount),
        startsAt: toIso(f.startsAt),
        expiresAt: toIso(f.expiresAt),
        maxUses: toNumber(f.maxUses),
        maxUsesPerCustomer: toNumber(f.maxUsesPerCustomer),
        active: f.active,
    });

    const replaceInList = (saved) =>
        setCoupons(prev => prev.map(c => (c.id === saved.id ? saved : c)));

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing === 'new') {
                const created = await couponApi.create(toPayload(form));
                setCoupons(prev => [created, ...prev]);
            } else {
                replaceInList(await couponApi.update(editing.id, toPayload(form)));
            }
            setEditing(null);
            toast.success('Coupon saved');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save coupon');
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (coupon) => {
        try {
            replaceInList(await couponApi.update(coupon.id, {...coupon, active: !coupon.active}));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update coupon');
        }
    };

    const remove = async (coupon) => {
        if (!(await confirmDialog(`Customers will no longer be able to use ${coupon.code}.`, {title: 'Delete this coupon?', confirmText: 'Delete'}))) {
            return;
        }
        try {
            await couponApi.remove(coupon.id);
            setCoupons(prev => prev.filter(c => c.id !== coupon.id));
            toast.success('Coupon deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete coupon');
        }
    };

    if (!coupons) {
        return (
            <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"/>
            </div>
        );
    }

    const codeLocked = editing && editing !== 'new' && editing.usedCount > 0;

    return (
        <div className="space-y-6 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                        <TicketPercent className="w-6 h-6 text-cyan-600"/> Coupons
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Codes customers enter at checkout. The discount applies to items, not the delivery charge.
                    </p>
                </div>
                <button onClick={openNew}
                        className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                    <Plus className="w-4 h-4"/> New coupon
                </button>
            </div>

            {coupons.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10 text-center">
                    <TicketPercent className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
                    <p className="font-semibold text-gray-800">No coupons yet</p>
                    <p className="text-sm text-gray-500 mt-1">Create your first code to offer customers a discount.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 text-left">
                        <tr>
                            <th className="p-3 font-semibold">Code</th>
                            <th className="p-3 font-semibold">Discount</th>
                            <th className="p-3 font-semibold">Minimum order</th>
                            <th className="p-3 font-semibold">Ends</th>
                            <th className="p-3 font-semibold">Used</th>
                            <th className="p-3 font-semibold">Status</th>
                            <th className="p-3 font-semibold text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {coupons.map(c => {
                            const status = couponStatus(c);
                            return (
                                <tr key={c.id}>
                                    <td className="p-3">
                                        <span className="font-mono font-semibold text-gray-900">{c.code}</span>
                                        {c.description && <span className="block text-xs text-gray-500 mt-0.5">{c.description}</span>}
                                    </td>
                                    <td className="p-3 whitespace-nowrap text-gray-700">{discountLabel(c)}</td>
                                    <td className="p-3 whitespace-nowrap text-gray-700">{c.minOrderAmount > 0 ? taka(c.minOrderAmount) : 'None'}</td>
                                    <td className="p-3 whitespace-nowrap text-gray-700">{c.expiresAt ? formatDate(c.expiresAt) : 'Never'}</td>
                                    <td className="p-3 whitespace-nowrap text-gray-700">{c.usedCount}{c.maxUses !== null ? ` / ${c.maxUses}` : ''}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status.cls}`}>{status.label}</span>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => toggleActive(c)}
                                                    className="px-2.5 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50 rounded-lg whitespace-nowrap">
                                                {c.active ? 'Turn off' : 'Turn on'}
                                            </button>
                                            <button onClick={() => openEdit(c)} aria-label={`Edit ${c.code}`} title="Edit"
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                                                <Pencil className="w-4 h-4"/>
                                            </button>
                                            {c.usedCount === 0 && (
                                                <button onClick={() => remove(c)} aria-label={`Delete ${c.code}`} title="Delete"
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4"/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
                    <form onSubmit={save} className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-4">
                        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800">{editing === 'new' ? 'New coupon' : `Edit ${editing.code}`}</h2>
                            <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        <div className="p-4 sm:p-5 grid gap-5 md:grid-cols-2">
                            <Field label="Code" help={codeLocked ? 'Already used on orders, so it cannot change.' : 'Letters, numbers, - or _'}>
                                <input required value={form.code} onChange={set('code')} disabled={codeLocked} maxLength={30} placeholder="EID20"
                                       className={`${inputCls} uppercase font-mono disabled:bg-gray-100 disabled:text-gray-500`}/>
                            </Field>
                            <Field label="Description (optional)" help="For your own reference.">
                                <input value={form.description} onChange={set('description')} maxLength={255} placeholder="Eid campaign" className={inputCls}/>
                            </Field>
                            <Field label="Discount type">
                                <select value={form.type} onChange={set('type')} className={`${inputCls} bg-white`}>
                                    <option value="PERCENT">Percentage (%)</option>
                                    <option value="FIXED">Fixed amount (৳)</option>
                                </select>
                            </Field>
                            <Field label={form.type === 'PERCENT' ? 'Percentage off' : 'Amount off (৳)'}>
                                <input required type="number" min="1" max={form.type === 'PERCENT' ? 100 : undefined} step="1"
                                       value={form.discountValue} onChange={set('discountValue')} className={inputCls}/>
                            </Field>
                            <Field label="Minimum order (৳)" help="Empty = no minimum. Judged before the discount.">
                                <input type="number" min="0" step="1" value={form.minOrderAmount} onChange={set('minOrderAmount')} className={inputCls}/>
                            </Field>
                            {form.type === 'PERCENT' && (
                                <Field label="Maximum discount (৳)" help="Empty = no cap.">
                                    <input type="number" min="1" step="1" value={form.maxDiscount} onChange={set('maxDiscount')} className={inputCls}/>
                                </Field>
                            )}
                            <Field label="Starts" help="Empty = right away.">
                                <input type="datetime-local" value={form.startsAt} onChange={set('startsAt')} className={inputCls}/>
                            </Field>
                            <Field label="Ends" help="Empty = never.">
                                <input type="datetime-local" value={form.expiresAt} onChange={set('expiresAt')} className={inputCls}/>
                            </Field>
                            <Field label="Total uses" help="Across all customers. Empty = unlimited.">
                                <input type="number" min="1" step="1" value={form.maxUses} onChange={set('maxUses')} className={inputCls}/>
                            </Field>
                            <Field label="Uses per customer" help="Empty = unlimited.">
                                <input type="number" min="1" step="1" value={form.maxUsesPerCustomer} onChange={set('maxUsesPerCustomer')} className={inputCls}/>
                            </Field>
                            <label className="md:col-span-2 flex items-center gap-2 text-sm font-medium text-gray-800 cursor-pointer select-none">
                                <input type="checkbox" checked={form.active}
                                       onChange={(e) => setForm(prev => ({...prev, active: e.target.checked}))}
                                       className="w-4 h-4 rounded text-cyan-600 border-gray-300 focus:ring-cyan-500"/>
                                Customers can use this coupon
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 p-4 sm:p-5 border-t border-gray-200">
                            <button type="button" onClick={() => setEditing(null)} className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="submit" disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-60">
                                <Save className="w-4 h-4"/> {saving ? 'Saving...' : 'Save coupon'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
