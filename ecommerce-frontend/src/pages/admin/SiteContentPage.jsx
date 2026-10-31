import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {Save, Globe, FileText, ChevronDown, ChevronRight, Eye, EyeOff, ImagePlus, Trash2, Palette, Truck} from 'lucide-react';
import {siteContentApi} from '../../api/siteContentApi';
import {BASE_URL} from '../../api/config';
import defaultLogo from '../../assets/logo/logo-mark.png';
import SITE_CONTENT_DEFAULTS from '../../components/common/siteContentDefaults';

const STORE_FIELDS = [
    {key: 'storeName', label: 'Store name', required: true},
    {key: 'tagline', label: 'Footer tagline', textarea: true},
    {key: 'contactAddress', label: 'Address'},
    {key: 'contactEmail', label: 'Contact email', type: 'email'},
    {key: 'contactPhone', label: 'Contact phone', placeholder: '+880 1XXX-XXXXXX'},
    {key: 'copyrightText', label: 'Copyright text'},
];

const SOCIAL_FIELDS = [
    {key: 'facebookUrl', label: 'Facebook', placeholder: 'https://facebook.com/yourpage'},
    {key: 'instagramUrl', label: 'Instagram', placeholder: 'https://instagram.com/yourpage'},
    {key: 'twitterUrl', label: 'X (Twitter)', placeholder: 'https://x.com/yourpage'},
    {key: 'youtubeUrl', label: 'YouTube', placeholder: 'https://youtube.com/@yourchannel'},
    {key: 'tiktokUrl', label: 'TikTok', placeholder: 'https://tiktok.com/@yourpage'},
    {key: 'whatsappUrl', label: 'WhatsApp', placeholder: 'https://wa.me/8801XXXXXXXXX'},
    {key: 'telegramUrl', label: 'Telegram', placeholder: 'https://t.me/yourname'},
];

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none';
const isValidUrl = (v) => !v || /^https?:\/\/\S+$/i.test(v.trim());
const isValidLink = (v) => !v || /^\/(?!\/)\S*$/.test(v.trim()) || isValidUrl(v);
const isHex = (v) => /^#[0-9a-fA-F]{6}$/.test(v || '');

// Header fields that older saved settings may not have yet
const HEADER_KEYS = ['brandColor', 'logoBgColor', 'topBarColor', 'announcementText', 'announcementLinkText', 'announcementLinkUrl'];
const withHeaderDefaults = (s) => {
    const out = {...s};
    HEADER_KEYS.forEach(k => { if (out[k] == null) out[k] = SITE_CONTENT_DEFAULTS.settings[k]; });
    if (out.showTopBar == null) out.showTopBar = true;
    if (out.deliveryFee == null) out.deliveryFee = SITE_CONTENT_DEFAULTS.settings.deliveryFee;
    if (out.freeDeliveryMin == null) out.freeDeliveryMin = SITE_CONTENT_DEFAULTS.settings.freeDeliveryMin;
    return out;
};

const COLOR_FIELDS = [
    {key: 'brandColor', label: 'Store name colour'},
    {key: 'logoBgColor', label: 'Logo background'},
    {key: 'topBarColor', label: 'Top bar colour'},
];

export default function SiteContentPage() {
    const [settings, setSettings] = useState(null);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingPage, setSavingPage] = useState(null);
    const [openSlug, setOpenSlug] = useState(null);
    const [logoBusy, setLogoBusy] = useState(false);

    useEffect(() => {
        siteContentApi.getAdminContent()
            .then(data => {
                setSettings(withHeaderDefaults(data.settings || {}));
                setPages(data.pages || []);
            })
            .catch(err => toast.error(err.response?.data?.message || 'Failed to load site content'))
            .finally(() => setLoading(false));
    }, []);

    const setField = (key, value) => setSettings(prev => ({...prev, [key]: value}));
    const setPageField = (slug, key, value) =>
        setPages(prev => prev.map(p => (p.slug === slug ? {...p, [key]: value} : p)));

    const saveSettings = async (e) => {
        e.preventDefault();
        const bad = SOCIAL_FIELDS.find(f => !isValidUrl(settings[f.key]));
        if (bad) {
            toast.error(`${bad.label} link must start with https://`);
            return;
        }
        const fee = Number(settings.deliveryFee);
        const freeMin = Number(settings.freeDeliveryMin);
        if (!Number.isInteger(fee) || fee < 0 || fee > 100000 || !Number.isInteger(freeMin) || freeMin < 0 || freeMin > 100000) {
            toast.error('Delivery amounts must be whole numbers between 0 and 100000');
            return;
        }
        const badColor = COLOR_FIELDS.find(f => settings[f.key] && !isHex(settings[f.key]));
        if (badColor) {
            toast.error(`${badColor.label} must look like #1a2b3c`);
            return;
        }
        if (!isValidLink(settings.announcementLinkUrl)) {
            toast.error('Top bar link must be a page like /shop or a full https:// link');
            return;
        }
        setSavingSettings(true);
        try {
            const saved = await siteContentApi.updateSettings({
                ...settings,
                deliveryFee: Number(settings.deliveryFee),
                freeDeliveryMin: Number(settings.freeDeliveryMin),
            });
            setSettings(withHeaderDefaults(saved));
            toast.success('Store info, header & social links saved');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSavingSettings(false);
        }
    };

    const uploadLogo = async (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please choose an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Logo must be smaller than 2 MB');
            return;
        }
        setLogoBusy(true);
        try {
            const saved = await siteContentApi.uploadLogo(file);
            setSettings(prev => ({...prev, logoUrl: saved.logoUrl}));
            toast.success('Logo updated');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload logo');
        } finally {
            setLogoBusy(false);
        }
    };

    const removeLogo = async () => {
        if (!window.confirm('Remove the uploaded logo and use the default one?')) return;
        setLogoBusy(true);
        try {
            await siteContentApi.removeLogo();
            setSettings(prev => ({...prev, logoUrl: null}));
            toast.success('Logo removed — default logo restored');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove logo');
        } finally {
            setLogoBusy(false);
        }
    };

    const savePage = async (page) => {
        setSavingPage(page.slug);
        try {
            const saved = await siteContentApi.updatePage(page.slug, page);
            setPages(prev => prev.map(p => (p.slug === saved.slug ? saved : p)));
            toast.success(`"${saved.title}" saved`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save page');
        } finally {
            setSavingPage(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"/>
            </div>
        );
    }
    if (!settings) {
        return <div className="p-6 text-red-500">Could not load site content.</div>;
    }

    return (
        <div className="space-y-6 min-w-0">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Site Content</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Edit the store info, social media links and footer pages shown on the website.
                </p>
            </div>

            <form onSubmit={saveSettings} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-6">
                <div>
                    <h2 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
                        <Globe className="w-5 h-5 text-cyan-600"/> Store info
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
                        {/* Same look as the website header */}
                        <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-white border border-gray-200 min-w-0">
                            <span className="rounded-xl p-1.5 flex-shrink-0" style={{backgroundColor: isHex(settings.logoBgColor) ? settings.logoBgColor : '#064e3b'}}>
                                <img src={settings.logoUrl ? `${BASE_URL}${settings.logoUrl}` : defaultLogo}
                                     alt="Logo preview" className="h-10 w-auto max-w-[110px] object-contain"/>
                            </span>
                            <span className="font-extrabold text-lg truncate" style={{color: isHex(settings.brandColor) ? settings.brandColor : '#064e3b'}}>
                                {settings.storeName || 'ShopSpot Online'}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-cyan-600 text-cyan-700 hover:bg-cyan-50 cursor-pointer ${logoBusy ? 'opacity-60 pointer-events-none' : ''}`}>
                                <ImagePlus className="w-4 h-4"/> {logoBusy ? 'Uploading...' : 'Upload logo'}
                                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
                                       onChange={e => { uploadLogo(e.target.files?.[0]); e.target.value = ''; }}/>
                            </label>
                            {settings.logoUrl && (
                                <button type="button" onClick={removeLogo} disabled={logoBusy}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4"/> Use default logo
                                </button>
                            )}
                            <span className="text-xs text-gray-500 w-full">PNG with transparent background works best. Max 2 MB.</span>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {STORE_FIELDS.map(f => (
                            <label key={f.key} className={`block ${f.textarea ? 'md:col-span-2' : ''}`}>
                                <span className="block text-sm font-medium text-gray-700 mb-1">
                                    {f.label}{f.required && <span className="text-red-500"> *</span>}
                                </span>
                                {f.textarea ? (
                                    <textarea rows={2} maxLength={500} className={inputCls}
                                              value={settings[f.key] || ''}
                                              onChange={e => setField(f.key, e.target.value)}/>
                                ) : (
                                    <input type={f.type || 'text'} required={f.required} className={inputCls}
                                           placeholder={f.placeholder} maxLength={f.key === 'copyrightText' ? 200 : 120}
                                           value={settings[f.key] || ''}
                                           onChange={e => setField(f.key, e.target.value)}/>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
                        <Truck className="w-5 h-5 text-cyan-600"/> Delivery charge
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Used in the cart, checkout and the order total. Changes apply to new orders only.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Delivery charge per order (৳)</span>
                            <input type="number" min="0" max="100000" step="1" className={inputCls}
                                   value={settings.deliveryFee ?? ''}
                                   onChange={e => setField('deliveryFee', e.target.value)}/>
                            <span className="text-xs text-gray-400">0 = free delivery on every order</span>
                        </label>
                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Free delivery when subtotal is above (৳)</span>
                            <input type="number" min="0" max="100000" step="1" className={inputCls}
                                   value={settings.freeDeliveryMin ?? ''}
                                   onChange={e => setField('freeDeliveryMin', e.target.value)}/>
                            <span className="text-xs text-gray-400">0 = never free (always charge delivery)</span>
                        </label>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                        Customers will see: {Number(settings.deliveryFee) === 0
                            ? <b>Free delivery on every order</b>
                            : <>Delivery <b>৳{Number(settings.deliveryFee) || 0}</b>{Number(settings.freeDeliveryMin) > 0 && <>, free when the order is above <b>৳{Number(settings.freeDeliveryMin)}</b></>}</>}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">Remember to update the top bar message and the “Shipping &amp; Charges” page text if they mention the amounts.</p>
                </div>

                <div>
                    <h2 className="flex items-center gap-2 font-semibold text-gray-800 mb-1">
                        <Palette className="w-5 h-5 text-cyan-600"/> Header &amp; top bar
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Colours of the store name and logo box, and the message bar above the header
                        (it also shows the contact phone and email from Store info).
                    </p>

                    {/* Live preview */}
                    <div className="rounded-xl overflow-hidden border border-gray-200 mb-5">
                        {settings.showTopBar !== false && (
                            <div className="text-white/90 text-xs px-4 py-2 flex flex-wrap justify-between gap-2"
                                 style={{backgroundColor: isHex(settings.topBarColor) ? settings.topBarColor : undefined}}>
                                <span>{settings.contactPhone}</span>
                                <span>
                                    {settings.announcementText}
                                    {settings.announcementLinkText && <> <span className="opacity-50 mx-1">|</span> <b className="text-white">{settings.announcementLinkText}</b></>}
                                </span>
                                <span>Dark mode</span>
                            </div>
                        )}
                        <div className="bg-white px-4 py-3 flex items-center gap-2.5">
                            <span className="rounded-xl p-1.5" style={{backgroundColor: isHex(settings.logoBgColor) ? settings.logoBgColor : undefined}}>
                                <img src={settings.logoUrl ? `${BASE_URL}${settings.logoUrl}` : defaultLogo} alt="" className="h-9 w-auto"/>
                            </span>
                            <span className="font-extrabold text-xl" style={{color: isHex(settings.brandColor) ? settings.brandColor : undefined}}>
                                {settings.storeName || 'ShopSpot Online'}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3 mb-4">
                        {COLOR_FIELDS.map(f => (
                            <label key={f.key} className="block">
                                <span className="block text-sm font-medium text-gray-700 mb-1">{f.label}</span>
                                <div className="flex items-center gap-2">
                                    <input type="color" value={isHex(settings[f.key]) ? settings[f.key] : '#064e3b'}
                                           onChange={e => setField(f.key, e.target.value)}
                                           className="h-10 w-12 rounded border border-gray-300 cursor-pointer p-0.5"/>
                                    <input className={`${inputCls} ${settings[f.key] && !isHex(settings[f.key]) ? 'border-red-400' : ''}`}
                                           value={settings[f.key] || ''} maxLength={7} placeholder="#064e3b"
                                           onChange={e => setField(f.key, e.target.value.trim())}/>
                                </div>
                            </label>
                        ))}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                        <input type="checkbox" checked={settings.showTopBar !== false}
                               onChange={e => setField('showTopBar', e.target.checked)}/>
                        Show the top bar above the header
                    </label>

                    <div className="grid gap-4 md:grid-cols-3">
                        <label className="block md:col-span-3">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Top bar message</span>
                            <input className={inputCls} maxLength={200} value={settings.announcementText || ''}
                                   placeholder="Free delivery on orders over ৳2000"
                                   onChange={e => setField('announcementText', e.target.value)}/>
                        </label>
                        <label className="block">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Link text</span>
                            <input className={inputCls} maxLength={40} value={settings.announcementLinkText || ''}
                                   placeholder="Shop Deals"
                                   onChange={e => setField('announcementLinkText', e.target.value)}/>
                        </label>
                        <label className="block md:col-span-2">
                            <span className="block text-sm font-medium text-gray-700 mb-1">Link goes to</span>
                            <input className={`${inputCls} ${!isValidLink(settings.announcementLinkUrl) ? 'border-red-400' : ''}`}
                                   maxLength={500} value={settings.announcementLinkUrl || ''}
                                   placeholder="/shop?sale=1  or  https://..."
                                   onChange={e => setField('announcementLinkUrl', e.target.value)}/>
                            <span className="text-xs text-gray-400">A page on this site (e.g. /shop?sale=1) or a full https:// link. Leave empty to hide the link.</span>
                        </label>
                    </div>
                </div>

                <div>
                    <h2 className="font-semibold text-gray-800 mb-1">Social media links</h2>
                    <p className="text-xs text-gray-500 mb-4">Leave a link empty to hide that icon from the footer.</p>
                    <div className="grid gap-4 md:grid-cols-2">
                        {SOCIAL_FIELDS.map(f => {
                            const invalid = !isValidUrl(settings[f.key]);
                            return (
                                <label key={f.key} className="block">
                                    <span className="block text-sm font-medium text-gray-700 mb-1">{f.label}</span>
                                    <input type="url" className={`${inputCls} ${invalid ? 'border-red-400' : ''}`}
                                           placeholder={f.placeholder} maxLength={500}
                                           value={settings[f.key] || ''}
                                           onChange={e => setField(f.key, e.target.value)}/>
                                    {invalid && <span className="text-xs text-red-500">Must start with https://</span>}
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={savingSettings}
                            className="flex items-center gap-2 px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-60">
                        <Save className="w-4 h-4"/> {savingSettings ? 'Saving...' : 'Save store info'}
                    </button>
                </div>
            </form>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <h2 className="flex items-center gap-2 font-semibold text-gray-800 p-4 sm:p-6 pb-2 sm:pb-2">
                    <FileText className="w-5 h-5 text-cyan-600"/> Footer pages
                </h2>
                <p className="text-xs text-gray-500 px-4 sm:px-6 mb-3">
                    These open when a customer clicks a link in the footer (Shipping, Returns, Privacy...).
                </p>
                <ul className="divide-y divide-gray-100">
                    {pages.map(page => {
                        const open = openSlug === page.slug;
                        return (
                            <li key={page.slug}>
                                <button type="button" onClick={() => setOpenSlug(open ? null : page.slug)}
                                        className="w-full flex items-center gap-3 px-4 sm:px-6 py-3 text-left hover:bg-gray-50">
                                    {open ? <ChevronDown className="w-4 h-4 text-gray-500"/> :
                                        <ChevronRight className="w-4 h-4 text-gray-500"/>}
                                    <span className="flex-1 min-w-0 font-medium text-gray-800 truncate">{page.title}</span>
                                    <span className="hidden sm:inline text-xs text-gray-400 uppercase">{page.section}</span>
                                    {page.visible === false
                                        ? <EyeOff className="w-4 h-4 text-gray-400" aria-label="Hidden"/>
                                        : <Eye className="w-4 h-4 text-green-500" aria-label="Visible"/>}
                                </button>
                                {open && (
                                    <div className="px-4 sm:px-6 pb-5 space-y-3">
                                        <label className="block">
                                            <span className="block text-sm font-medium text-gray-700 mb-1">Title</span>
                                            <input className={inputCls} maxLength={100} value={page.title || ''}
                                                   onChange={e => setPageField(page.slug, 'title', e.target.value)}/>
                                        </label>
                                        <label className="block">
                                            <span className="block text-sm font-medium text-gray-700 mb-1">Content</span>
                                            <textarea rows={8} maxLength={10000} className={inputCls}
                                                      value={page.content || ''}
                                                      onChange={e => setPageField(page.slug, 'content', e.target.value)}/>
                                            <span className="text-xs text-gray-400">{(page.content || '').length} / 10000</span>
                                        </label>
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                                <input type="checkbox" checked={page.visible !== false}
                                                       onChange={e => setPageField(page.slug, 'visible', e.target.checked)}/>
                                                Show in footer
                                            </label>
                                            <button type="button" onClick={() => savePage(page)}
                                                    disabled={savingPage === page.slug}
                                                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 disabled:opacity-60">
                                                <Save className="w-4 h-4"/> {savingPage === page.slug ? 'Saving...' : 'Save page'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
