import React, {useState, useEffect} from 'react';
import {Plus, Edit2, Trash2, X, Image, Eye, EyeOff} from 'lucide-react';
import {
    getAllBanners,
    createBannerWithFile,
    updateBanner,
    deleteBanner
} from '../../api/banner-api-service';

export default function BannerManagement() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        imageFile: null,
        imagePreview: null,
        active: true,
        orderIndex: 0,
        linkUrl: '',
        role: 'USER'
    });

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        setLoading(true);
        try {
            const data = await getAllBanners();
            console.log('Banners loaded:', data);
            // Sort by orderIndex
            const sortedData = data.sort((a, b) => a.orderIndex - b.orderIndex);
            setBanners(sortedData);
        } catch (error) {
            console.error('Error loading banners:', error);
            alert('Failed to load banners: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBanner = async () => {
        if (!formData.title.trim()) {
            alert('Title is required');
            return;
        }
        if (!formData.imageFile) {
            alert('Please select an image');
            return;
        }

        try {
            const form = new FormData();
            form.append("title", formData.title.trim());
            form.append("imageFile", formData.imageFile);
            form.append("linkUrl", formData.linkUrl.trim() || '');
            form.append("active", formData.active);
            form.append("orderIndex", formData.orderIndex);
            form.append("role", formData.role);

            console.log('Creating banner...');
            console.log('Title:', formData.title);
            console.log('File:', formData.imageFile.name);

            await createBannerWithFile(form);
            await loadBanners();
            setShowModal(false);
            resetForm();
            alert('Banner created successfully!');
        } catch (error) {
            console.error('Error creating banner:', error);
            console.error('Error response:', error.response);
            alert('Failed to create banner: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateBanner = async () => {
        if (!formData.title.trim()) {
            alert('Title is required');
            return;
        }

        try {
            const bannerData = {
                ...selectedBanner,
                title: formData.title.trim(),
                linkUrl: formData.linkUrl.trim() || '',
                active: formData.active,
                orderIndex: parseInt(formData.orderIndex) || 0,
                role: formData.role
            };

            console.log('Updating banner:', bannerData);
            await updateBanner(selectedBanner.id, bannerData);
            await loadBanners();
            setShowModal(false);
            setEditMode(false);
            resetForm();
            alert('Banner updated successfully');
        } catch (error) {
            console.error('Error updating banner:', error);
            alert('Failed to update banner: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteBanner = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await deleteBanner(id);
                await loadBanners();
                alert('Banner deleted successfully');
            } catch (error) {
                console.error('Error deleting banner:', error);
                alert('Failed to delete banner');
            }
        }
    };

    const toggleBannerStatus = async (banner) => {
        try {
            const updatedBanner = {
                ...banner,
                active: !banner.active
            };
            await updateBanner(banner.id, updatedBanner);
            await loadBanners();
        } catch (error) {
            console.error('Error toggling banner status:', error);
            alert('Failed to toggle banner status');
        }
    };

    const openEditModal = (banner) => {
        setSelectedBanner(banner);
        setFormData({
            title: banner.title,
            imageFile: null,
            imagePreview: banner.imageData ? `data:image/jpeg;base64,${banner.imageData}` : null,
            linkUrl: banner.linkUrl || '',
            active: banner.active,
            orderIndex: banner.orderIndex,
            role: banner.role
        });
        setEditMode(true);
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                imageFile: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            imageFile: null,
            imagePreview: null,
            active: true,
            orderIndex: banners.length,
            linkUrl: '',
            role: 'USER'
        });
        setSelectedBanner(null);
        setEditMode(false);
    };

    // Convert byte array to base64 for display
    const getImageSrc = (imageData) => {
        if (!imageData) return null;
        return `data:image/jpeg;base64,${imageData}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Banner Management</h1>
                        <p className="text-gray-500 mt-1">Manage your website banners and promotional images</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5"/>
                        Add Banner
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {/* Banners Grid */}
                        {banners.map((banner) => (
                            <div key={banner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    {/* Banner Image Preview */}
                                    <div className="md:w-1/3 bg-gray-100 relative">
                                        {banner.imageData ? (
                                            <img
                                                src={getImageSrc(banner.imageData)}
                                                alt={banner.title}
                                                className="w-full h-48 md:h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/400x200?text=Image+Error';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-48 md:h-full flex items-center justify-center">
                                                <Image className="w-16 h-16 text-gray-400"/>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                banner.active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {banner.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>

                                        {/* Order Badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                Order: {banner.orderIndex}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Banner Details */}
                                    <div className="md:w-2/3 p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                                    {banner.title}
                                                </h3>

                                                {banner.linkUrl && (
                                                    <a
                                                        href={banner.linkUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline"
                                                    >
                                                        {banner.linkUrl}
                                                    </a>
                                                )}

                                                <div className="mt-3 flex gap-3">
                                                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                                        Role: {banner.role}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                                        ID: {banner.id}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleBannerStatus(banner)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        banner.active
                                                            ? 'text-green-600 hover:bg-green-50'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                    title={banner.active ? 'Deactivate' : 'Activate'}
                                                >
                                                    {banner.active ? <Eye className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
                                                </button>

                                                <button
                                                    onClick={() => openEditModal(banner)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 className="w-5 h-5"/>
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteBanner(banner.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty State */}
                        {banners.length === 0 && !loading && (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">No banners yet</h3>
                                <p className="text-gray-500">Start by creating your first banner</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Banner Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editMode ? 'Edit Banner' : 'Add New Banner'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Summer Sale Banner"
                                    />
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Banner Image {!editMode && '*'}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {formData.imagePreview && (
                                        <div className="mt-3">
                                            <img
                                                src={formData.imagePreview}
                                                alt="Preview"
                                                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            {formData.imageFile && (
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Selected: {formData.imageFile.name}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Link URL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkUrl}
                                        onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com/sale"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Order Index */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Order Index
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.orderIndex}
                                            onChange={(e) => setFormData({...formData, orderIndex: parseInt(e.target.value) || 0})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            min="0"
                                        />
                                    </div>

                                    {/* Role */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Target Role
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.active}
                                        onChange={(e) => setFormData({...formData, active: e.target.checked})}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="active" className="ml-2 text-sm font-medium text-gray-700">
                                        Active (Show on website)
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={editMode ? handleUpdateBanner : handleCreateBanner}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {editMode ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}