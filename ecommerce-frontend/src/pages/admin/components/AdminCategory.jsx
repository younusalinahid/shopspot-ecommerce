import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';

export default function AdminCategory() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [subCategoryForm, setSubCategoryForm] = useState({
        name: '',
        description: '',
        categoryId: null
    });

    const API_BASE_URL = 'http://localhost:8080/api';

    // Fetch all categories
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create Category
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchCategories();
                setShowModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    // Update Category
    const handleUpdateCategory = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/categories/${selectedCategory.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await fetchCategories();
                setShowModal(false);
                setEditMode(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    // Delete Category
    const handleDeleteCategory = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    await fetchCategories();
                }
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    // Create SubCategory
    const handleCreateSubCategory = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/categories/${subCategoryForm.categoryId}/subcategories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name: subCategoryForm.name,
                    description: subCategoryForm.description
                })
            });

            if (response.ok) {
                await fetchCategories();
                setShowSubCategoryModal(false);
                setSubCategoryForm({ name: '', description: '', categoryId: null });
            }
        } catch (error) {
            console.error('Error creating subcategory:', error);
        }
    };

    // Open edit modal
    const openEditModal = (category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setEditMode(true);
        setShowModal(true);
    };

    // Open subcategory modal
    const openSubCategoryModal = (categoryId) => {
        setSubCategoryForm({ ...subCategoryForm, categoryId });
        setShowSubCategoryModal(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({ name: '', description: '' });
        setSelectedCategory(null);
        setEditMode(false);
    };

    // Toggle category expansion
    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
                        <p className="text-gray-500 mt-1">Manage your product categories and subcategories</p>
                    </div>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Category
                    </button>
                </div>

                {/* Categories List */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {categories.map((category) => (
                            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                {/* Category Header */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <button
                                                onClick={() => toggleCategory(category.id)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                {expandedCategories[category.id] ? (
                                                    <ChevronDown className="w-5 h-5" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5" />
                                                )}
                                            </button>
                                            <FolderOpen className="w-8 h-8 text-blue-600" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                                                <p className="text-sm text-gray-500">{category.description}</p>
                                                <span className="text-xs text-gray-400 mt-1 inline-block">
                                                    {category.subCategories?.length || 0} subcategories
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
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
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(category.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Subcategories */}
                                {expandedCategories[category.id] && category.subCategories?.length > 0 && (
                                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {category.subCategories.map((sub) => (
                                                <div key={sub.id} className="bg-white p-4 rounded-lg border border-gray-200">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-medium text-gray-800">{sub.name}</h4>
                                                            <p className="text-sm text-gray-500 mt-1">{sub.description}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => alert('SubCategory delete functionality')}
                                                            className="text-red-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {categories.length === 0 && !loading && (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
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
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={editMode ? handleUpdateCategory : handleCreateCategory}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter category name"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="Enter category description"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {editMode ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
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
                                        setSubCategoryForm({ name: '', description: '', categoryId: null });
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubCategory}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subcategory Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={subCategoryForm.name}
                                        onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter subcategory name"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={subCategoryForm.description}
                                        onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="Enter subcategory description"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSubCategoryModal(false);
                                            setSubCategoryForm({ name: '', description: '', categoryId: null });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Add Subcategory
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}