import React, { useState } from 'react';

import { Facebook, Instagram, Linkedin, MapPin, Mail, Phone, MessageCircle, Send, X, X as CloseIcon } from 'lucide-react';

const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', details: '' });

    const linksData = {
        about: {
            title: "About Our Brand",
            details: "Founded with a passion for heritage textiles, our company blends traditional craftsmanship with modern fashion trends. We work closely with authentic weavers to bring you pristine quality sarees and fabrics that tell a story of elegance."
        },
        services: {
            title: "Our Specialized Services",
            details: "We offer top-notch customer services including worldwide secure shipping, custom fabric tailoring, personal styling consultations, and a hassle-free 7-day return policy to ensure your absolute satisfaction."
        },
        portfolio: {
            title: "Our Portfolio & Showcase",
            details: "Take a look at our curated collections, fashion runway features, and exclusive lookbooks. From royal Banarasi weaves to elegant Chanderi silk, our portfolio showcases the finest moments of traditional and contemporary attire."
        },
        contact: {
            title: "Get In Touch",
            details: "Need help with your order? Our support team is available 24/7. You can instantly reach out to us via WhatsApp, Telegram, or call us directly. We are always happy to assist you with your queries."
        },
        privacy: {
            title: "Privacy Policy",
            details: "Your privacy is important to us. We collect your personal information (name, phone, address, email) solely to process your orders and improve your shopping experience. We never share or sell your data to any third-party services. Secure encryption (SSL) is used to protect all payment information."
        },
        terms: {
            title: "Terms of Service",
            details: "By using our website, you agree to comply with our terms. All product descriptions and pricing are subject to change without notice. Orders are processed based on product availability. Any fraudulent activity or misuse of our content/images will result in immediate termination of user access."
        },
        cookie: {
            title: "Cookie Policy",
            details: "Our website uses cookies to enhance your browsing experience, remember your shopping cart items, and analyze site traffic. Cookies are small text files stored on your device. You can choose to disable cookies through your browser settings, though some features of the site may not function properly."
        }
    };

    const openFloatingBar = (key) => {
        setModalContent(linksData[key]);
        setIsModalOpen(true);
    };

    return (
        <footer className="w-full bg-[#0b1322] text-white py-14 border-t border-gray-800 mt-16 px-6 md:px-10 lg:px-12 box-border">
            <div className="w-full">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 lg:gap-24">

                    <div className="w-full text-left">
                        <h2 className="text-2xl font-bold mb-4 tracking-wide text-white">ShopSpot Online</h2>
                        <p className="text-gray-400 leading-relaxed text-sm">
                            Discover the finest collection of traditional fabrics, premium sarees, and modern clothing.
                            We blend heritage craftsmanship with modern trends to offer you the finest quality and an exceptional shopping experience.
                        </p>

                        <div className="flex flex-wrap gap-3 mt-6">
                            <a href="https://facebook.com/YOUR_PAGE_LINK" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800/80 hover:bg-blue-600 rounded-md transition duration-300 text-gray-300 hover:text-white" aria-label="Facebook">
                                <Facebook size={18} />
                            </a>
                            <a href="https://x.com/YOUR_X_USERNAME" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800/80 hover:bg-black rounded-md transition duration-300 text-gray-300 hover:text-white border border-transparent hover:border-slate-700" aria-label="X">
                                <X size={18} />
                            </a>
                            <a href="https://instagram.com/YOUR_USERNAME" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800/80 hover:bg-pink-600 rounded-md transition duration-300 text-gray-300 hover:text-white" aria-label="Instagram">
                                <Instagram size={18} />
                            </a>
                            <a href="https://linkedin.com/in/YOUR_USERNAME" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800/80 hover:bg-blue-700 rounded-md transition duration-300 text-gray-300 hover:text-white" aria-label="LinkedIn">
                                <Linkedin size={18} />
                            </a>
                            <a href="https://wa.me/8801784377301" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800/80 hover:bg-emerald-600 rounded-md transition duration-300 text-gray-300 hover:text-white" aria-label="WhatsApp">
                                <MessageCircle size={18} />
                            </a>
                            <a href="https://t.me/8801784377301" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-slate-800/80 hover:bg-sky-500 rounded-md transition duration-300 text-gray-300 hover:text-white" aria-label="Telegram">
                                <Send size={18} />
                            </a>
                        </div>
                    </div>

                    <div className="w-full flex flex-col items-center text-center">
                        <div>
                            <h2 className="text-lg font-semibold mb-4 text-white tracking-wide">Quick Links</h2>

                            <div className="flex flex-wrap justify-center gap-2.5 max-w-[260px]">
                                <a href="/" className="px-3.5 py-1.5 text-xs font-medium text-gray-300 border border-slate-700 rounded-full bg-slate-900/50 hover:text-cyan-400 hover:border-cyan-500 hover:bg-cyan-500/10 transition duration-300 cursor-pointer">
                                    Home
                                </a>
                                <button onClick={() => openFloatingBar('about')} className="px-3.5 py-1.5 text-xs font-medium text-gray-300 border border-slate-700 rounded-full bg-slate-900/50 hover:text-purple-400 hover:border-purple-500 hover:bg-purple-500/10 transition duration-300 cursor-pointer">
                                    About
                                </button>
                                <button onClick={() => openFloatingBar('services')} className="px-3.5 py-1.5 text-xs font-medium text-gray-300 border border-slate-700 rounded-full bg-slate-900/50 hover:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/10 transition duration-300 cursor-pointer">
                                    Services
                                </button>
                                <button onClick={() => openFloatingBar('portfolio')} className="px-3.5 py-1.5 text-xs font-medium text-gray-300 border border-slate-700 rounded-full bg-slate-900/50 hover:text-amber-400 hover:border-amber-500 hover:bg-amber-500/10 transition duration-300 cursor-pointer">
                                    Portfolio
                                </button>
                                <button onClick={() => openFloatingBar('contact')} className="px-3.5 py-1.5 text-xs font-medium text-gray-300 border border-slate-700 rounded-full bg-slate-900/50 hover:text-pink-400 hover:border-pink-500 hover:bg-pink-500/10 transition duration-300 cursor-pointer">
                                    Contact
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex flex-col md:items-end text-left md:text-right">
                        <div className="w-full max-w-[280px]">
                            <h2 className="text-lg font-semibold mb-4 text-white tracking-wide">Contact Us</h2>
                            <ul className="space-y-4 text-gray-400 text-sm w-full">
                                <li className="flex items-start md:flex-row-reverse md:space-x-reverse space-x-3 group">
                                    <MapPin size={18} className="text-blue-400 mt-0.5 shrink-0 group-hover:scale-110 transition duration-300" />
                                    <span className="hover:text-white transition duration-300 leading-relaxed">
                                        23 Street, Gulshan, Dhaka
                                    </span>
                                </li>
                                <li className="flex items-center md:flex-row-reverse md:space-x-reverse space-x-3 group">
                                    <Mail size={18} className="text-blue-400 shrink-0 group-hover:scale-110 transition duration-300" />
                                    <a href="mailto:shopspot-online@gmail.com" className="hover:text-blue-400 transition duration-300 break-all">
                                        shopspot-online@gmail.com
                                    </a>
                                </li>
                                <li className="flex items-center md:flex-row-reverse md:space-x-reverse space-x-3 group">
                                    <Phone size={18} className="text-blue-400 shrink-0 group-hover:scale-110 transition duration-300" />
                                    <a href="tel:+8801784377301" className="hover:text-blue-400 transition duration-300">
                                        +880 1234-567890
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

                <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} ShopSpot. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <button onClick={() => openFloatingBar('privacy')} className="text-gray-500 hover:text-white text-sm transition duration-300 cursor-pointer">
                            Privacy Policy
                        </button>
                        <button onClick={() => openFloatingBar('terms')} className="text-gray-500 hover:text-white text-sm transition duration-300 cursor-pointer">
                            Terms of Service
                        </button>
                        <button onClick={() => openFloatingBar('cookie')} className="text-gray-500 hover:text-white text-sm transition duration-300 cursor-pointer">
                            Cookie Policy
                        </button>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="relative w-full max-w-lg bg-[#111a2e] border border-slate-700 text-white p-8 rounded-2xl shadow-2xl mx-4">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-gray-400 hover:text-white hover:bg-red-500/20 transition duration-200 cursor-pointer"
                        >
                            <CloseIcon size={20} />
                        </button>
                        <h3 className="text-2xl font-bold mb-4 text-blue-400 border-b border-slate-800 pb-2">
                            {modalContent.title}
                        </h3>
                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                            {modalContent.details}
                        </p>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition duration-200 shadow-lg cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;