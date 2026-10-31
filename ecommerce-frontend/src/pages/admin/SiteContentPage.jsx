import React, {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {Save, Globe, FileText, ChevronDown, ChevronRight, Eye, EyeOff} from 'lucide-react';
import {siteContentApi} from '../../api/siteContentApi';

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

export default function SiteContentPage() {
    const [settings, setSettings] = useState(null);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [savingPage, setSavingPage] = useState(null);
    const [openSlug, setOpenSlug] = useState(null);

    useEffect(() => {
        siteContentApi.getAdminContent()
            .then(data => {
                setSettings(data.settings || {});
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
        setSavingSettings(true);
        try {
            const saved = await siteContentApi.updateSettings(settings);
            setSettings(saved);
            toast.success('Store info & social links saved');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSavingSettings(false);
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
