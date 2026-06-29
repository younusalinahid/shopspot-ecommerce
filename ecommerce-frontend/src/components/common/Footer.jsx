import React, {useState, useEffect, useRef} from 'react';
import {Facebook, Instagram, MapPin, Mail, Phone, MessageCircle, Send, X, X as CloseIcon} from 'lucide-react';

const Footer = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({title: '', details: ''});
    const modalRef = useRef(null);

    const linksData = {
        privacy: {
            title: "Privacy Policy",
            details: "At ShopSpot, we are committed to protecting your privacy with the highest standards of data security. We collect minimal personal information—such as your name, shipping address, contact number, and email—exclusively to fulfill your orders and enhance your shopping journey. We guarantee that your information is never sold, traded, or rented to third-party marketing agencies. Our website employs robust SSL (Secure Sockets Layer) encryption technology to ensure that every transaction and piece of sensitive data you share is shielded from unauthorized access. We also use cookies strictly to improve site performance and remember your cart items, ensuring a seamless browsing experience. By continuing to use our platform, you acknowledge our data handling practices, which are designed to keep your digital identity safe at all times."
        },
        size: {
            title: "Size Guide",
            details: "Choosing the right fit is essential for the perfect look, and our comprehensive Size Guide is here to assist. We categorize our traditional fabrics and modern attire according to international and local measurement standards. On every product page, you will find a dedicated 'Size Chart' link. We recommend measuring your bust, waist, and hips while wearing light clothing to ensure accuracy. If you are between two sizes, we generally suggest opting for the larger size for better comfort, especially in traditional woven textiles. If you have specific queries regarding garment length, sleeve fitting, or customized sizing, our styling experts are available to provide precise measurements. Feel confident in your purchase by following our detailed guidelines to avoid any sizing discrepancies upon delivery."
        },
        shop: {
            title: "How To Shop",
            details: "Shopping at ShopSpot is designed to be an intuitive and hassle-free experience. First, explore our extensive collection and select your preferred items. Once you've made your choices, click 'Add to Cart' and review your selections in the shopping bag. When you are ready, proceed to our secure checkout page. We request you to provide accurate delivery information to ensure timely arrival. You can choose from a variety of payment methods, including Cash on Delivery (COD) for your convenience, or secure online payments via our trusted gateway partners. After you confirm your order, you will receive an automated email/SMS confirmation. From there, you can easily track your order status in your account dashboard until it reaches your doorstep."
        },
        return: {
            title: "Return & Exchange",
            details: "Customer satisfaction is our top priority, and we strive to provide the best quality in every stitch. We offer a transparent 7-day Return and Exchange policy. If you receive a product that is damaged, defective, or incorrectly shipped, please contact our support team within 7 days of receiving your package. To be eligible for a return, the item must be unused, in its original packaging, and with all tags intact. Once our quality control team inspects the returned product, we will facilitate an exchange or provide a refund as per your preference. Please note that for hygienic reasons or customized items, specific conditions may apply. We are dedicated to resolving your concerns promptly to maintain your trust in our brand."
        },
        shipping: {
            title: "Shipping & Charges",
            details: "We are proud to offer fast and reliable shipping across Bangladesh, ensuring your favorite outfits reach you in pristine condition. Our delivery timeline usually ranges between 3 to 5 business days, depending on your location. Shipping charges are calculated based on your delivery address and the size of your parcel. During the checkout process, the exact shipping fee will be displayed before you confirm your payment. We partner with reputable courier services to ensure safe handling of your products. For urgent deliveries or special dispatch requests, please reach out to our customer support team immediately after placing your order. We keep you updated at every stage of the shipment process through notifications so you always know when to expect your delivery."
        },
        support: {
            title: "Customer Service",
            details: "Our dedicated Customer Service team is the heartbeat of ShopSpot, and we are available 24/7 to assist you with any inquiries or feedback. Whether you need help tracking an order, understanding a product description, or resolving a payment issue, our support professionals are just a message away. You can reach out to us instantly via our official WhatsApp support line, Telegram, or through email at shopspot-online@gmail.com. We believe in building long-term relationships with our customers, which is why we value your feedback immensely. Our goal is not just to sell a product, but to provide a complete, supportive, and delightful shopping experience. Do not hesitate to contact us; we are always happy to go the extra mile to assist you."
        },
        terms: {
            title: "Terms & Conditions",
            details: "By accessing and using the ShopSpot website, you automatically agree to be bound by our Terms and Conditions. These terms govern your use of our platform, including product pricing, availability, and promotional offers. Please be aware that product images and descriptions are for illustrative purposes; while we try our best to represent colors and textures accurately, slight variations may occur due to screen resolution. ShopSpot reserves the right to update or modify these terms at any time without prior notice. Any fraudulent activities, misuse of content, or unauthorized attempts to access our site infrastructure will be dealt with strictly. Your continued use of our services constitutes your acceptance of our evolving terms and policies."
        },
        locator: {
            title: "Store Locator",
            details: "Experience the elegance of ShopSpot in person by visiting our flagship showroom located at 23 Street, Gulshan, Dhaka. Our store is designed to provide you with a tactile experience where you can touch, feel, and try on our exquisite collection of heritage textiles and modern attire. Our friendly staff at the store are trained to offer personalized styling advice and help you navigate our latest arrivals. Whether you are looking for a special occasion saree or a contemporary fabric for daily wear, our showroom is the perfect place to discover your next favorite outfit. We are open from 10:00 AM to 8:00 PM throughout the week. Use our store locator feature to find the most convenient route to our location—we look forward to welcoming you soon!"
        }
    };

    const openFloatingBar = (key) => {
        setModalContent(linksData[key]);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setIsModalOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <footer
            className="w-full bg-[#0b1322] text-white py-14 border-t border-gray-800 mt-16 px-6 md:px-12 lg:px-20 box-border">
            <div className="w-full flex flex-wrap justify-between gap-10">
                <div className="w-full md:w-[280px]">
                    <h3 className="text-2xl font-bold mb-4">ShopSpot Online</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">Discover the finest collection of
                        traditional fabrics, premium sarees, and modern clothing.</p>
                    <div className="flex flex-wrap gap-2">
                        <a href="https://www.facebook.com/share/1BgaZ2xLbF/" target="_blank" rel="noopener noreferrer"
                           className="relative group p-2.5 bg-slate-800 hover:bg-[#1877F2] rounded-md transition duration-300"><Facebook
                            size={20}/><span
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Facebook</span></a>
                        <a href="https://x.com/ShopSpot__Onlin" target="_blank" rel="noopener noreferrer"
                           className="relative group p-2.5 bg-slate-800 hover:bg-[#000000] rounded-md transition duration-300"><X
                            size={20}/><span
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Twitter</span></a>
                        <a href="https://www.instagram.com/shopspot__online?igsh=MTU5ZmN5dTBxZXlreA==" target="_blank"
                           rel="noopener noreferrer"
                           className="relative group p-2.5 bg-slate-800 hover:bg-[#E4405F] rounded-md transition duration-300"><Instagram
                            size={20}/><span
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Instagram</span></a>
                        <a href="https://wa.me/+8801786277713" target="_blank" rel="noopener noreferrer"
                           className="relative group p-2.5 bg-slate-800 hover:bg-[#25D366] rounded-md transition duration-300"><MessageCircle
                            size={20}/><span
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">WhatsApp</span></a>
                        <a href="https://t.me/+8801786277713" target="_blank" rel="noopener noreferrer"
                           className="relative group p-2.5 bg-slate-800 hover:bg-[#0088CC] rounded-md transition duration-300"><Send
                            size={20}/><span
                            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Telegram</span></a>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold mb-5 uppercase tracking-wider">SHOPPING</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li>
                            <button onClick={() => openFloatingBar('privacy')}
                                    className="hover:text-white transition">Privacy Policy
                            </button>
                        </li>
                        <li>
                            <button onClick={() => openFloatingBar('size')} className="hover:text-white transition">Size
                                Guide
                            </button>
                        </li>
                        <li>
                            <button onClick={() => openFloatingBar('shop')} className="hover:text-white transition">How
                                To Shop
                            </button>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-5 uppercase tracking-wider">SERVICES</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li>
                            <button onClick={() => openFloatingBar('return')}
                                    className="hover:text-white transition">Return & Exchange
                            </button>
                        </li>
                        <li>
                            <button onClick={() => openFloatingBar('shipping')}
                                    className="hover:text-white transition">Shipping & Charges
                            </button>
                        </li>
                        <li>
                            <button onClick={() => openFloatingBar('support')}
                                    className="hover:text-white transition">Customer Service
                            </button>
                        </li>
                        <li>
                            <button onClick={() => openFloatingBar('terms')}
                                    className="hover:text-white transition">Terms & Conditions
                            </button>
                        </li>
                        <li>
                            <button onClick={() => openFloatingBar('locator')}
                                    className="hover:text-white transition">Store Locator
                            </button>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-5 uppercase tracking-wider">CONTACT US</h4>
                    <ul className="space-y-4 text-sm text-gray-400">
                        <li className="flex items-center gap-2"><MapPin size={16} className="text-blue-400"/> 23 Street,
                            Gulshan, Dhaka
                        </li>
                        <li><a href="mailto:shopspot-online@gmail.com"
                               className="flex items-center gap-2 hover:text-white transition"><Mail size={16}
                                                                                                     className="text-blue-400"/> shopspot-online@gmail.com</a>
                        </li>
                        <li><a href="tel:+8801786277713"
                               className="flex items-center gap-2 hover:text-white transition"><Phone size={16}
                                                                                                      className="text-blue-400"/> +880
                            1784-377301</a></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-800 mt-12 pt-6 text-center text-gray-500 text-sm">
                &copy; 2026 ShopSpot. All rights reserved.
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div ref={modalRef}
                         className="relative w-full max-w-lg bg-[#111a2e] border border-slate-700 p-8 rounded-2xl shadow-2xl">
                        <button onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"><CloseIcon size={20}/>
                        </button>
                        <h3 className="text-2xl font-bold mb-4 text-blue-400">{modalContent.title}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{modalContent.details}</p>
                    </div>
                </div>
            )}
        </footer>
    );
};

export default Footer;