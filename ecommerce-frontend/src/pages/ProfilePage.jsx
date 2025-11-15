import { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Package, ShoppingBag, DollarSign } from 'lucide-react';

const ProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+880 1712-345678',
        address: '123 Main Street, Dhaka',
        city: 'Dhaka',
        postalCode: '1212',
        dateOfBirth: '1990-01-15',
        gender: 'Male',
        bio: 'Tech enthusiast and online shopping lover'
    });

    const [tempData, setTempData] = useState(profileData);

    const handleEdit = () => {
        setIsEditing(true);
        setTempData(profileData);
    };

    const handleSave = () => {
        setProfileData(tempData);
        setIsEditing(false);
        // Here you would make API call to update profile
    };

    const handleCancel = () => {
        setTempData(profileData);
        setIsEditing(false);
    };

    const handleChange = (field, value) => {
        setTempData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your personal information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-300 mb-8">
                    {/* Cover Image */}
                    <div className="h-32 sm:h-40 bg-gradient-to-r from-cyan-500 to-blue-500 relative">
                        <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
                            <div className="relative">
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                                    {profileData.name.charAt(0)}
                                </div>
                                <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110">
                                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="pt-16 sm:pt-20 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
                        {/* Action Buttons */}
                        <div className="flex justify-end mb-6 space-x-3">
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>Edit Profile</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                                    >
                                        <X className="w-4 h-4" />
                                        <span className="hidden sm:inline">Cancel</span>
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Save</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Profile Information */}
                        <div className="space-y-8">
                            {/* Personal Information */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-cyan-500" />
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={tempData.name}
                                                onChange={(e) => handleChange('name', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                            />
                                        ) : (
                                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                                                {profileData.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Gender
                                        </label>
                                        {isEditing ? (
                                            <select
                                                value={tempData.gender}
                                                onChange={(e) => handleChange('gender', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        ) : (
                                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                                                {profileData.gender}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Date of Birth
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                value={tempData.dateOfBirth}
                                                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                            />
                                        ) : (
                                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                                {new Date(profileData.dateOfBirth).toLocaleDateString('en-GB')}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Bio
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                value={tempData.bio}
                                                onChange={(e) => handleChange('bio', e.target.value)}
                                                rows="3"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                            />
                                        ) : (
                                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                                                {profileData.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <Mail className="w-5 h-5 mr-2 text-cyan-500" />
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={tempData.email}
                                                onChange={(e) => handleChange('email', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                            />
                                        ) : (
                                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white flex items-center break-all">
                                                <Mail className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                                                {profileData.email}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={tempData.phone}
                                                onChange={(e) => handleChange('phone', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                            />
                                        ) : (
                                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white flex items-center">
                                                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                                {profileData.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-cyan-500" />
                                    Address Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Street Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={tempData.address}
                                                onChange={(e) => handleChange('address', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                            />
                                        ) : (
                                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                                                {profileData.address}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            City
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={tempData.city}
                                                onChange={(e) => handleChange('city', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                            />
                                        ) : (
                                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                                                {profileData.city}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Postal Code
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={tempData.postalCode}
                                                onChange={(e) => handleChange('postalCode', e.target.value)}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 transition-colors duration-300"
                                            />
                                        ) : (
                                            <p className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                                                {profileData.postalCode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Account Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-xl text-center transition-colors duration-300 hover:shadow-lg">
                        <Package className="w-12 h-12 text-cyan-600 dark:text-cyan-400 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">24</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Total Orders</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl text-center transition-colors duration-300 hover:shadow-lg">
                        <ShoppingBag className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">18</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Completed</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl text-center transition-colors duration-300 hover:shadow-lg sm:col-span-2 lg:col-span-1">
                        <DollarSign className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">৳45,320</p>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Total Spent</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;