import React, {useState, useEffect, useRef} from 'react';
import {Facebook, Instagram, Youtube, MapPin, Mail, Phone, MessageCircle, Send, X, X as CloseIcon, Music2} from 'lucide-react';
import {useSiteContent} from '../../hooks/useSiteContent';

const SOCIALS = [
    {key: 'facebookUrl', label: 'Facebook', Icon: Facebook, hover: 'hover:bg-[#1877F2]'},
    {key: 'twitterUrl', label: 'X (Twitter)', Icon: X, hover: 'hover:bg-black'},
    {key: 'instagramUrl', label: 'Instagram', Icon: Instagram, hover: 'hover:bg-[#E4405F]'},
    {key: 'youtubeUrl', label: 'YouTube', Icon: Youtube, hover: 'hover:bg-[#FF0000]'},
    {key: 'tiktokUrl', label: 'TikTok', Icon: Music2, hover: 'hover:bg-[#111111]'},
    {key: 'whatsappUrl', label: 'WhatsApp', Icon: MessageCircle, hover: 'hover:bg-[#25D366]'},
    {key: 'telegramUrl', label: 'Telegram', Icon: Send, hover: 'hover:bg-[#0088CC]'},
];

// Extra safety on top of the backend check: only real web links become hrefs
const safeUrl = (url) => (typeof url === 'string' && /^https?:\/\//i.test(url.trim()) ? url.trim() : null);

const Footer = () => {
    const {settings: s, pages: allPages} = useSiteContent();
    const [openPage, setOpenPage] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setOpenPage(null);
            }
        };
        const handleEsc = (e) => e.key === 'Escape' && setOpenPage(null);
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    const pagesIn = (section) => allPages
        .filter(p => p.section === section && p.visible !== false)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const phoneHref = s.contactPhone ? `tel:${s.contactPhone.replace(/[^+0-9]/g, '')}` : null;

    const renderSection = (heading, section) => {
        const pages = pagesIn(section);
        if (pages.length === 0) return null;
        return (
            <div>
                <h4 className="font-bold mb-5 uppercase tracking-wider">{heading}</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                    {pages.map(page => (
                        <li key={page.slug}>
                            <button onClick={() => setOpenPage(page)} className="hover:text-white transition text-left">
                                {page.title}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <footer
            className="w-full bg-[#0b1322] text-white py-14 border-t border-gray-800 mt-16 px-6 md:px-12 lg:px-20 box-border">
            <div className="w-full flex flex-wrap justify-between gap-10">
                <div className="w-full md:w-[280px]">
                    <h3 className="text-2xl font-bold mb-4">{s.storeName || 'ShopSpot Online'}</h3>
                    {s.tagline && <p className="text-gray-400 text-sm mb-6 leading-relaxed">{s.tagline}</p>}
                    <div className="flex flex-wrap gap-2">
                        {SOCIALS.map(({key, label, Icon, hover}) => {
                            const href = safeUrl(s[key]);
                            if (!href) return null;
                            return (
                                <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                                   className={`relative group p-2.5 bg-slate-800 ${hover} rounded-md transition duration-300`}>
                                    <Icon size={20}/>
                                    <span
                                        className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">{label}</span>
                                </a>
                            );
                        })}
                    </div>
                </div>

                {renderSection('Shopping', 'SHOPPING')}
                {renderSection('Services', 'SERVICES')}

                <div>
                    <h4 className="font-bold mb-5 uppercase tracking-wider">Contact Us</h4>
                    <ul className="space-y-4 text-sm text-gray-400">
                        {s.contactAddress && (
                            <li className="flex items-center gap-2">
                                <MapPin size={16} className="text-blue-400 flex-shrink-0"/> {s.contactAddress}
                            </li>
                        )}
                        {s.contactEmail && (
                            <li>
                                <a href={`mailto:${s.contactEmail}`} className="flex items-center gap-2 hover:text-white transition break-all">
                                    <Mail size={16} className="text-blue-400 flex-shrink-0"/> {s.contactEmail}
                                </a>
                            </li>
                        )}
                        {phoneHref && (
                            <li>
                                <a href={phoneHref} className="flex items-center gap-2 hover:text-white transition">
                                    <Phone size={16} className="text-blue-400 flex-shrink-0"/> {s.contactPhone}
                                </a>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-800 mt-12 pt-6 text-center text-gray-500 text-sm">
                {s.copyrightText || `\u00a9 ${new Date().getFullYear()} ShopSpot. All rights reserved.`}
            </div>

            {openPage && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div ref={modalRef} role="dialog" aria-modal="true" aria-label={openPage.title}
                         className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#111a2e] border border-slate-700 p-6 sm:p-8 rounded-2xl shadow-2xl">
                        <button onClick={() => setOpenPage(null)} aria-label="Close"
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"><CloseIcon size={20}/>
                        </button>
                        <h3 className="text-2xl font-bold mb-4 pr-6 text-blue-400">{openPage.title}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{openPage.content}</p>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;
