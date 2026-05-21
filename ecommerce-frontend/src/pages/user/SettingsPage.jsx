import { useState } from 'react';
import { Lock, Bell, Globe, Moon, Sun, Shield, CreditCard, MapPin, Trash2, Eye, EyeOff, Save } from 'lucide-react';

const SettingsPage = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [activeSection, setActiveSection] = useState('account');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const [accountSettings, setAccountSettings] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notificationSettings, setNotificationSettings] = useState({
        orderUpdates: true,
        promotions: true,
        newsletter: false,
        sms: true,
        email: true
    });

    const [privacySettings, setPrivacySettings] = useState({
        profileVisibility: 'public',
        showOrderHistory: false,
        dataSharing: false
    });

    const sections = [
        { id: 'account', label: 'Account Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'preferences', label: 'Preferences', icon: Globe },
        { id: 'payment', label: 'Payment Methods', icon: CreditCard },
        { id: 'addresses', label: 'Saved Addresses', icon: MapPin }
    ];

    const handlePasswordChange = () => {
        // Implement password change logic
        alert('Password change functionality will be implemented');
    };

    const toggleNotification = (key) => {
        setNotificationSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center space-x-3 px-6 py-4 text-left transition-all duration-300 ${
                                            activeSection === section.id
                                                ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-l-4 border-cyan-600 dark:border-cyan-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{section.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
                            {/* Account Security */}
                            {activeSection === 'account' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Security</h2>
                                        <p className="text-gray-600 dark:text-gray-400">Manage your password and security settings</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={accountSettings.currentPassword}
                                                    onChange={(e) => setAccountSettings({...accountSettings, currentPassword: e.target.value})}
                                                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                                    placeholder="Enter current password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={accountSettings.newPassword}
                                                    onChange={(e) => setAccountSettings({...accountSettings, newPassword: e.target.value})}
                                                    className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                                >
                                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={accountSettings.confirmPassword}
                                                onChange={(e) => setAccountSettings({...accountSettings, confirmPassword: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                                placeholder="Confirm new password"
                                            />
                                        </div>

                                        <button
                                            onClick={handlePasswordChange}
                                            className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>Update Password</span>
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Enable 2FA</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                                            </div>
                                            <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors duration-300">
                                                Enable
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications */}
                            {activeSection === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Notification Preferences</h2>
                                        <p className="text-gray-600 dark:text-gray-400">Choose what notifications you want to receive</p>
                                    </div>

                                    <div className="space-y-4">
                                        {Object.entries(notificationSettings).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {key === 'orderUpdates' && 'Get updates about your orders'}
                                                        {key === 'promotions' && 'Receive special offers and deals'}
                                                        {key === 'newsletter' && 'Weekly newsletter with latest products'}
                                                        {key === 'sms' && 'Receive SMS notifications'}
                                                        {key === 'email' && 'Receive email notifications'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => toggleNotification(key)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                                                        value ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                                            value ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Privacy */}
                            {activeSection === 'privacy' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Privacy Settings</h2>
                                        <p className="text-gray-600 dark:text-gray-400">Control your privacy and data sharing preferences</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                Profile Visibility
                                            </label>
                                            <select
                                                value={privacySettings.profileVisibility}
                                                onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                                            >
                                                <option value="public">Public</option>
                                                <option value="friends">Friends Only</option>
                                                <option value="private">Private</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Show Order History</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Allow others to see your purchase history</p>
                                            </div>
                                            <button
                                                onClick={() => setPrivacySettings({...privacySettings, showOrderHistory: !privacySettings.showOrderHistory})}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    privacySettings.showOrderHistory ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    privacySettings.showOrderHistory ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">Data Sharing</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Share analytics data to improve service</p>
                                            </div>
                                            <button
                                                onClick={() => setPrivacySettings({...privacySettings, dataSharing: !privacySettings.dataSharing})}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    privacySettings.dataSharing ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    privacySettings.dataSharing ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Delete Account</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Permanently delete your account and all data</p>
                                                </div>
                                                <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300">
                                                    <Trash2 className="w-4 h-4" />
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Preferences */}
                            {activeSection === 'preferences' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Preferences</h2>
                                        <p className="text-gray-600 dark:text-gray-400">Customize your experience</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                Language
                                            </label>
                                            <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500">
                                                <option>English</option>
                                                <option>বাংলা (Bangla)</option>
                                                <option>हिन्दी (Hindi)</option>
                                            </select>
                                        </div>

                                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                                Currency
                                            </label>
                                            <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500">
                                                <option>BDT (৳)</option>
                                                <option>USD ($)</option>
                                                <option>EUR (€)</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                {isDarkMode ? <Moon className="w-5 h-5 text-gray-900 dark:text-white" /> : <Sun className="w-5 h-5 text-gray-900 dark:text-white" />}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark theme</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsDarkMode(!isDarkMode)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    isDarkMode ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-gray-600'
                                                }`}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Methods */}
                            {activeSection === 'payment' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Methods</h2>
                                            <p className="text-gray-600 dark:text-gray-400">Manage your saved payment methods</p>
                                        </div>
                                        <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors duration-300">
                                            Add New
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 border-2 border-cyan-500 dark:border-cyan-400 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                        💳
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">**** **** **** 4242</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
                                                    </div>
                                                </div>
                                                <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium">Default</span>
                                            </div>
                                        </div>

                                        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                        💳
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">**** **** **** 8888</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Expires 08/26</p>
                                                    </div>
                                                </div>
                                                <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Saved Addresses */}
                            {activeSection === 'addresses' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Saved Addresses</h2>
                                            <p className="text-gray-600 dark:text-gray-400">Manage your delivery addresses</p>
                                        </div>
                                        <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors duration-300">
                                            Add Address
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 border-2 border-cyan-500 dark:border-cyan-400 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="bg-cyan-500 text-white px-3 py-1 rounded-full text-sm font-medium">Home</span>
                                                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">Default</span>
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white mb-1">John Doe</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">123 Main Street, Dhaka 1212</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">+880 1712-345678</p>
                                            <div className="flex space-x-2">
                                                <button className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm">Edit</button>
                                                <button className="text-red-600 dark:text-red-400 hover:underline text-sm">Delete</button>
                                            </div>
                                        </div>

                                        <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-cyan-500 dark:hover:border-cyan-400 transition-colors duration-300">
                                            <div className="flex items-start justify-between mb-3">
                                                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">Office</span>
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white mb-1">John Doe</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">456 Business Ave, Dhaka 1213</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">+880 1712-345678</p>
                                            <div className="flex space-x-2">
                                                <button className="text-cyan-600 dark:text-cyan-400 hover:underline text-sm">Edit</button>
                                                <button className="text-red-600 dark:text-red-400 hover:underline text-sm">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;