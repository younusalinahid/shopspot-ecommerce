import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {MapPin, Plus, Edit2, Trash2, Star, X, Check, Loader2, Phone, User} from 'lucide-react';
import {addressApi} from '../../api/addressApi';
import {confirmDialog} from '../../utils/confirmDialog';
import {isDhaka} from '../../utils/isDhaka';

const EMPTY = {
    fullName: '', phone: '', addressLine: '', area: '',
    city: '', district: '', postalCode: '', isDefault: false,
};

const FIELDS = [
    {name: 'fullName', label: 'Full name', required: true, placeholder: 'Recipient name'},
    {name: 'phone', label: 'Phone', required: true, placeholder: '01XXXXXXXXX', inputMode: 'numeric'},
    {name: 'addressLine', label: 'Street address', required: true, placeholder: 'House, road, block', wide: true},
    {name: 'area', label: 'Area', required: true, placeholder: 'e.g. Dhanmondi'},
    {name: 'city', label: 'City', required: true, placeholder: 'e.g. Dhaka'},
    {name: 'district', label: 'District', placeholder: 'e.g. Dhaka'},
    {name: 'postalCode', label: 'Postal code', placeholder: 'e.g. 1209'},
];

const errorMessage = (err, fallback) => err?.response?.data?.message || err?.message || fallback;

const validate = (form) => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) e.phone = 'Invalid BD phone number';
    if (!form.addressLine.trim()) e.addressLine = 'Street address is required';
    if (!form.area.trim()) e.area = 'Area is required';
    if (!form.city.trim()) e.city = 'City is required';
    return e;
};

export default function AddressBook() {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null); // null = closed, 'new' = add form, id = edit
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [busyId, setBusyId] = useState(null);

    const load = async () => {
        try {
            const data = await addressApi.getAll();
            setAddresses(Array.isArray(data) ? data : (data?.data || []));
        } catch (err) {
            toast.error(errorMessage(err, 'Could not load addresses'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openNew = () => {
        setForm({...EMPTY, isDefault: addresses.length === 0});
        setErrors({});
        setEditingId('new');
    };

    const openEdit = (addr) => {
        const next = {...EMPTY};
        Object.keys(EMPTY).forEach(k => {
            next[k] = addr[k] ?? EMPTY[k];
        });
        next.isDefault = !!addr.isDefault;
        setForm(next);
        setErrors({});
        setEditingId(addr.id);
    };

    const closeForm = () => {
        setEditingId(null);
        setErrors({});
    };

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        setForm(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
        if (errors[name]) setErrors(prev => ({...prev, [name]: ''}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(form);
        if (Object.keys(errs).length) {
            setErrors(errs);
            return;
        }
        const payload = Object.fromEntries(
            Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
        );
        setSaving(true);
        try {
            if (editingId === 'new') {
                await addressApi.add(payload);
                toast.success('Address saved');
            } else {
                await addressApi.update(editingId, payload);
                toast.success('Address updated');
            }
            closeForm();
            await load();
        } catch (err) {
            toast.error(errorMessage(err, 'Could not save address'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (addr) => {
        if (!(await confirmDialog(`${addr.addressLine}, ${addr.city}`, {title: 'Delete this address?', confirmText: 'Delete'}))) return;
        setBusyId(addr.id);
        try {
            await addressApi.remove(addr.id);
            toast.success('Address deleted');
            if (editingId === addr.id) closeForm();
            await load();
        } catch (err) {
            toast.error(errorMessage(err, 'Could not delete address'));
        } finally {
            setBusyId(null);
        }
    };

    const handleDefault = async (addr) => {
        setBusyId(addr.id);
        try {
            await addressApi.setDefault(addr.id);
            toast.success('Default address updated');
            await load();
        } catch (err) {
            toast.error(errorMessage(err, 'Could not update default address'));
        } finally {
            setBusyId(null);
        }
    };

    const inputClass = (name) =>
        `w-full px-3 py-2.5 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm outline-none transition-colors focus:ring-2 focus:ring-cyan-500/30 ${
            errors[name] ? 'border-red-400 focus:border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-cyan-500'
        }`;

    const renderForm = () => (
        <form onSubmit={handleSubmit}
              className="rounded-2xl border-2 border-cyan-200 dark:border-cyan-800 bg-cyan-50/40 dark:bg-cyan-950/20 p-5">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900 dark:text-white">
                    {editingId === 'new' ? 'Add new address' : 'Edit address'}
                </h4>
                <button type="button" onClick={closeForm}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700">
                    <X className="w-4 h-4"/>
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIELDS.map(f => (
                    <div key={f.name} className={f.wide ? 'sm:col-span-2' : ''}>
                        <label htmlFor={`addr-${f.name}`} className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                            {f.label}{f.required && <span className="text-red-500"> *</span>}
                        </label>
                        <input id={`addr-${f.name}`} name={f.name} value={form[f.name]} onChange={handleChange}
                               placeholder={f.placeholder} inputMode={f.inputMode} className={inputClass(f.name)}/>
                        {errors[f.name] && <p className="mt-1 text-xs text-red-500">{errors[f.name]}</p>}
                    </div>
                ))}
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange}
                       className="w-4 h-4 rounded accent-cyan-600"/>
                Use as default delivery address
            </label>
            <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={closeForm}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700">
                    Cancel
                </button>
                <button type="submit" disabled={saving}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 shadow-sm">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Check className="w-4 h-4"/>}
                    {saving ? 'Saving...' : 'Save address'}
                </button>
            </div>
        </form>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Saved Addresses</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pick one of these at checkout instead of typing it again.</p>
                </div>
                {editingId !== 'new' && (
                    <button onClick={openNew}
                            className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">
                        <Plus className="w-4 h-4"/> Add address
                    </button>
                )}
            </div>

            {editingId === 'new' && <div className="mb-6">{renderForm()}</div>}

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-500"/>
                </div>
            ) : addresses.length === 0 && editingId !== 'new' ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                    <MapPin className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3"/>
                    <p className="font-semibold text-gray-700 dark:text-gray-200">No saved addresses yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add one here, or tick "Save this address" at checkout.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(addr => editingId === addr.id ? (
                        <div key={addr.id} className="md:col-span-2">{renderForm()}</div>
                    ) : (
                        <div key={addr.id}
                             className={`relative rounded-2xl border p-4 transition-colors ${
                                 addr.isDefault
                                     ? 'border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/20'
                                     : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700'
                             }`}>
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                    isDhaka(addr.city, addr.district, addr.area)
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                }`}>
                                    {isDhaka(addr.city, addr.district, addr.area) ? 'Inside Dhaka' : 'Outside Dhaka'}
                                </span>
                                {addr.isDefault && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500 text-white">
                                        <Star className="w-3 h-3 fill-current"/> Default
                                    </span>
                                )}
                            </div>
                            <p className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                                <User className="w-4 h-4 text-gray-400"/> {addr.fullName}
                            </p>
                            <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                <Phone className="w-4 h-4 text-gray-400"/> {addr.phone}
                            </p>
                            <p className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0"/>
                                <span>
                                    {[addr.addressLine, addr.area, addr.city, addr.district, addr.postalCode]
                                        .filter(Boolean).join(', ')}
                                </span>
                            </p>
                            <div className="flex flex-wrap items-center gap-1 mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <button onClick={() => openEdit(addr)} disabled={busyId === addr.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40">
                                    <Edit2 className="w-3.5 h-3.5"/> Edit
                                </button>
                                {!addr.isDefault && (
                                    <button onClick={() => handleDefault(addr)} disabled={busyId === addr.id}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <Star className="w-3.5 h-3.5"/> Set default
                                    </button>
                                )}
                                <button onClick={() => handleDelete(addr)} disabled={busyId === addr.id}
                                        className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40">
                                    {busyId === addr.id ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <Trash2 className="w-3.5 h-3.5"/>} Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
