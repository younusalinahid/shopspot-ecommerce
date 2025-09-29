const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-8 w-full">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold mb-4">Your Company</h3>
                        <p className="text-gray-300 mb-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                        <div className="flex space-x-4">
                            {/* Social icons */}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition duration-300">Home</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition duration-300">About</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition duration-300">Services</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition duration-300">Portfolio</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition duration-300">Contact</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li>123 Street, City, Country</li>
                            <li>info@company.com</li>
                            <li>+1 234 567 890</li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} Your Company. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-white text-sm transition duration-300">Privacy Policy</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm transition duration-300">Terms of Service</a>
                        <a href="#" className="text-gray-400 hover:text-white text-sm transition duration-300">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
