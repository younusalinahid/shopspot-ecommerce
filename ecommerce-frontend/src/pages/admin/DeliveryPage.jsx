import {useEffect, useState} from 'react';
import axios from 'axios';
import {toast} from 'react-toastify';
import {Truck, Save, MapPin, Gift} from 'lucide-react';
import {ADMIN_URL} from '../../api/config';
import {siteContentApi} from '../../api/siteContentApi';

const authConfig = () => ({headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}});
const inputCls = 'w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none';
const isAmount = (v) => /^\d{1,6}$/.test(String(v)) && Number(v) <= 100000;

/** Admin -> Delivery: charge inside Dhaka, outside Dhaka and the free-delivery amount. */
export default function DeliveryPage() {
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios.get(`${ADMIN_URL}/delivery`, authConfig())
            .then(res => setForm(res.data))
            .catch(err => toast.error(err.response?.data?.message || 'Failed to load delivery settings'));
    }, []);

    const set = (key) => (e) => setForm(prev => ({...prev, [key]: e.target.value}));

    const save = async (e) => {
        e.preventDefault();
        if (!['insideDhaka', 'outsideDhaka', 'freeDeliveryMin'].every(k => isAmount(form[k]))) {
            toast.error('Please enter whole numbers between 0 and 100000');
            return;
        }
        setSaving(true);
        try {
            const res = await axios.put(`${ADMIN_URL}/delivery`, {
                insideDhaka: Number(form.insideDhaka),
                outsideDhaka: Number(form.outsideDhaka),
                freeDeliveryMin: Number(form.freeDeliveryMin),
            }, authConfig());
            setForm(res.data);
            siteContentApi.clearCache();
            window.dispatchEvent(new Event('site-content-updated'));
            toast.success('Delivery charges saved');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (!form) {
        return (
            <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"/>
            </div>
        );
    }

    const dhaka = Number(form.insideDhaka) || 0;
    const outside = Number(form.outsideDhaka) || 0;
    const freeMin = Number(form.freeDeliveryMin) || 0;

    const amountField = (key, label, help, Icon) => (
        <label className="block">
            <span className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-1.5">
                <Icon className="w-4 h-4 text-cyan-600"/> {label}
            </span>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">৳</span>
                <input type="number" min="0" max="100000" step="1" value={form[key]} onChange={set(key)}
                       className={`${inputCls} ${isAmount(form[key]) ? '' : 'border-red-400'}`}/>
            </div>
            <span className="block text-xs text-gray-500 mt-1">{help}</span>
        </label>
    );

    return (
        <div className="space-y-6 min-w-0 max-w-3xl">
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                    <Truck className="w-6 h-6 text-cyan-600"/> Delivery
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Delivery charges for the cart, checkout and the order total. Changes apply to new orders only.
                </p>
            </div>

            <form onSubmit={save} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                    {amountField('insideDhaka', 'Inside Dhaka', 'When the city or district is Dhaka. 0 = free.', MapPin)}
                    {amountField('outsideDhaka', 'Outside Dhaka', 'All other districts. 0 = free.', MapPin)}
                </div>
                {amountField('freeDeliveryMin', 'Free delivery when the order is above',
                    '0 = never free (always charge delivery).', Gift)}

                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 space-y-1">
                    <p className="font-semibold text-gray-800 mb-1">Customers will see</p>
                    <p>• Inside Dhaka: <b>{dhaka === 0 ? 'Free' : `৳${dhaka}`}</b></p>
                    <p>• Outside Dhaka: <b>{outside === 0 ? 'Free' : `৳${outside}`}</b></p>
                    {freeMin > 0 && <p>• Free delivery everywhere when the order is above <b>৳{freeMin}</b></p>}
                    <p className="text-xs text-gray-500 pt-1">
                        Example: a ৳1,500 order costs {freeMin > 0 && 1500 > freeMin ? 'free delivery' : `৳${dhaka} in Dhaka and ৳${outside} outside`}.
                    </p>
                </div>

                <p className="text-xs text-gray-500">
                    Tip: update the top bar message and the “Shipping &amp; Charges” page in Site Content if they mention amounts.
                </p>

                <div className="flex justify-end">
                    <button type="submit" disabled={saving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-60">
                        <Save className="w-4 h-4"/> {saving ? 'Saving...' : 'Save delivery charges'}
                    </button>
                </div>
            </form>
        </div>
    );
}
