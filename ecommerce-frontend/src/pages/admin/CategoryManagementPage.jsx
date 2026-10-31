import React, {useState, useEffect} from 'react';
import {toast} from "react-toastify";
import {Plus, Edit2, Trash2, X, FolderOpen, ChevronDown, ChevronRight, ImagePlus} from 'lucide-react';
import { categoryApi } from '../../api/categoryApi'
import { BASE_URL } from '../../api/config';

export default function CategoryManagementPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        icon: ''
    });
    const [subCategoryForm, setSubCategoryForm] = useState({
        name: '',
        categoryId: null
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await categoryApi.getAllCategories();
            console.log('Categories loaded:', data);
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast('Failed to load categories: ' + (error.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!formData.name.trim()) {
            toast('Category name is required');
            return;
        }

        try {
            const categoryData = {
                name: formData.name,
                icon: formData.icon || '📦'
            };

            console.log('Creating category:', categoryData);
            await categoryApi.createCategory(categoryData);
            await loadCategories();
            setShowModal(false);
            resetForm();
            toast.success('Category created successfully');
        } catch (error) {
            console.error('Error creating category:', error);
            toast('Failed to create category: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateCategory = async () => {
        if (!formData.name.trim()) {
            toast('Category name is required');
            return;
        }

        try {
            const categoryData = {
                name: formData.name,
                icon: formData.icon || '📦'
            };

            console.log('Updating category:', categoryData);
            await categoryApi.updateCategory(selectedCategory.id, categoryData);
            await loadCategories();
            setShowModal(false);
            setEditMode(false);
            resetForm();
            toast.success('Category updated successfully');
        } catch (error) {
            console.error('Error updating category:', error);
            toast('Failed to update category: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await categoryApi.deleteCategory(id);
                await loadCategories();
                toast.success('Category deleted successfully');
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error(error.response?.data?.message || 'Failed to delete category');
            }
        }
    };

    const [uploadingId, setUploadingId] = useState(null);

    const handleCategoryImage = async (category, file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please choose an image file');
            return;
        }
        if (file.size > 3 * 1024 * 1024) {
            toast.error('Image must be smaller than 3 MB');
            return;
        }
        setUploadingId(category.id);
        try {
            await categoryApi.uploadCategoryImage(category.id, file);
            await loadCategories();
            toast.success('Category image updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploadingId(null);
        }
    };

    const handleRemoveCategoryImage = async (category) => {
        if (!window.confirm(`Remove the image of "${category.name}"? The emoji icon will be shown instead.`)) return;
        try {
            await categoryApi.removeCategoryImage(category.id);
            await loadCategories();
            toast.success('Category image removed');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove image');
        }
    };

    const handleDeleteSubCategory = async (sub) => {
        if (!window.confirm(`Delete subcategory "${sub.name}"?`)) return;
        try {
            await categoryApi.deleteSubCategory(sub.id);
            await loadCategories();
            toast.success('Subcategory deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete subcategory');
        }
    };

    const handleCreateSubCategory = async () => {
        if (!subCategoryForm.name.trim()) {
            toast('Subcategory name is required');
            return;
        }

        try {
            const subCategoryData = {
                name: subCategoryForm.name
            };

            console.log('Creating subcategory:', subCategoryData);
            await categoryApi.createSubCategory(subCategoryForm.categoryId, subCategoryData);
            await loadCategories();
            setShowSubCategoryModal(false);
            setSubCategoryForm({name: '', categoryId: null});
            toast('Subcategory created successfully');
        } catch (error) {
            console.error('Error creating subcategory:', error);
            toast('Failed to create subcategory: ' + (error.response?.data?.message || error.message));
        }
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            icon: category.icon || ''
        });
        setEditMode(true);
        setShowModal(true);
    };

    const openSubCategoryModal = (categoryId) => {
        setSubCategoryForm({name: '', categoryId});
        setShowSubCategoryModal(true);
    };

    const resetForm = () => {
        setFormData({name: '', icon: ''});
        setSelectedCategory(null);
        setEditMode(false);
    };

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-0 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Category Management</h1>
                        <p className="text-gray-500 mt-1">Manage your product categories and subcategories</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5"/>
                        Add Category
                    </button>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {/* Categories List */}
                        {categories.map((category) => (
                            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                {/* Category Header */}
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                            <button
                                                onClick={() => toggleCategory(category.id)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                {expandedCategories[category.id] ? (
                                                    <ChevronDown className="w-5 h-5"/>
                                                ) : (
                                                    <ChevronRight className="w-5 h-5"/>
                                                )}
                                            </button>

                                            {/* Image (shown on the home-page slider); click to upload */}
                                            <label
                                                className="relative flex-shrink-0 w-14 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer group"
                                                title="Upload category image"
                                            >
                                                {category.imageUrl ? (
                                                    <img
                                                        src={`${BASE_URL}${category.imageUrl}`}
                                                        alt={category.name}
                                                        className="w-full h-full object-cover object-top"
                                                    />
                                                ) : (
                                                    <span className="text-3xl">{category.icon || '📦'}</span>
                                                )}
                                                <span className="absolute inset-0 bg-black/45 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <ImagePlus className="w-5 h-5"/>
                                                </span>
                                                {uploadingId === category.id && (
                                                    <span className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                                        <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-600"/>
                                                    </span>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        handleCategoryImage(category, e.target.files?.[0]);
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>

                                            <div className="min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-800 truncate">{category.name}</h3>
                                                <span className="text-xs text-gray-400 mt-1 inline-block">
                                                    {category.subCategories?.length || 0} subcategories
                                                </span>
                                                <div className="text-xs mt-1">
                                                    {category.imageUrl ? (
                                                        <button
                                                            onClick={() => handleRemoveCategoryImage(category)}
                                                            className="text-red-500 hover:underline"
                                                        >
                                                            Remove image
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400">No image — click the box to upload</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            <button
                                                onClick={() => openSubCategoryModal(category.id)}
                                                className="px-4 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                            >
                                                Add Subcategory
                                            </button>
                                            <button
                                                onClick={() => openEditModal(category)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-5 h-5"/>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5"/>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Subcategories */}
                                {expandedCategories[category.id] && category.subCategories?.length > 0 && (
                                    <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {category.subCategories.map((sub) => (
                                                <div key={sub.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-800">{sub.name}</h4>
                                                            <span className="text-xs text-gray-400">ID: {sub.id}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteSubCategory(sub)}
                                                            aria-label={`Delete ${sub.name}`}
                                                            className="text-red-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4"/>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Empty State */}
                        {categories.length === 0 && !loading && (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">No categories yet</h3>
                                <p className="text-gray-500">Start by creating your first category</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Category Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editMode ? 'Edit Category' : 'Add New Category'}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g. Women's Wear, Men's Wear"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Icon (Emoji)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g. 👗, 👔, 👟 (optional)"
                                        maxLength="2"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Use emoji as icon (e.g. 👗 👔 👟 👜 💄)
                                    </p>
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
                                        onClick={editMode ? handleUpdateCategory : handleCreateCategory}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {editMode ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SubCategory Modal */}
                {showSubCategoryModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Add New Subcategory</h2>
                                <button
                                    onClick={() => {
                                        setShowSubCategoryModal(false);
                                        setSubCategoryForm({name: '', categoryId: null});
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6"/>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subcategory Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={subCategoryForm.name}
                                        onChange={(e) => setSubCategoryForm({...subCategoryForm, name: e.target.value})}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g. T-Shirts, Jeans, Dresses"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowSubCategoryModal(false);
                                            setSubCategoryForm({name: '', categoryId: null});
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateSubCategory}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Add Subcategory
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