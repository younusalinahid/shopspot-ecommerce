import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { productService } from "../../api/product-api";
import { categoryApi } from "../../api/category-api-service";

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        images: [],
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProductsWithCategoryAndSubCategory();
            setProducts(data);
        } catch (err) {
            let errorMsg = "Failed to fetch products";
            if (err.response) {
                errorMsg = `Error ${err.response.status}: ${err.response.data?.message || err.response.statusText}`;
            } else {
                errorMsg = err.message;
            }

            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryApi.getAllCategories();
            setCategories(data);
        } catch (err) {
            toast.error("Failed to fetch categories");
        }
    };

    const fetchSubCategories = async (categoryId) => {
        if (!categoryId) {
            setSubCategories([]);
            return;
        }

        try {
            const data = await categoryApi.getCategoryById(categoryId);
            setSubCategories(data.subCategories || []);
        } catch (err) {
            toast.error("Failed to fetch subcategories");
            setSubCategories([]);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchSubCategories(selectedCategory);
            setSelectedSubCategory("");
        } else {
            setSubCategories([]);
            setSelectedSubCategory("");
        }
    }, [selectedCategory]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData((prev) => ({ ...prev, images: files }));
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || "",
                description: product.description || "",
                price: product.price || "",
                images: [],
            });
            setSelectedCategory(product.category?.id || "");
            setSelectedSubCategory(product.subCategory?.id || "");
        } else {
            setEditingProduct(null);
            setFormData({
                name: "",
                description: "",
                price: "",
                images: []
            });
            setSelectedCategory("");
            setSelectedSubCategory("");
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({ name: "", description: "", price: "", images: [] });
        setSelectedCategory("");
        setSelectedSubCategory("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: formData.price,
                subCategoryId: selectedSubCategory,
                images: formData.images
            };

            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, payload);
                toast.success("Product updated successfully");
            } else {
                await productService.createProduct(payload);
                toast.success("Product created successfully");
            }

            await fetchProducts();
            handleCloseModal();
        } catch (err) {
            let errorMsg = "Failed to save product";
            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.response?.status === 401) {
                errorMsg = "Unauthorized. Please login again.";
            } else if (err.response?.status === 403) {
                errorMsg = "Access denied. Admin privileges required.";
            }

            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) {
            return;
        }

        try {
            setLoading(true);
            await productService.deleteProduct(productId);
            toast.success("Product deleted successfully");
            await fetchProducts();
        } catch (err) {

            let errorMsg = "Failed to delete product";
            if (err.response?.data?.message) {
                errorMsg = err.response.data.message;
            } else if (err.response?.status === 401) {
                errorMsg = "Unauthorized. Please login again.";
            } else if (err.response?.status === 403) {
                errorMsg = "Access denied. Admin privileges required.";
            }

            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Product Management</h2>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    + Add Product
                </button>
            </div>

            {/* Products Table */}
            {loading && products.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">Loading products...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No products found. Create your first product!</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border-b text-left">Name</th>
                            <th className="p-2 border-b text-left">Price</th>
                            <th className="p-2 border-b text-left">Category</th>
                            <th className="p-2 border-b text-left">SubCategory</th>
                            <th className="p-2 border-b text-left">Status</th>
                            <th className="p-2 border-b text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="p-2 border-b">{p.name}</td>
                                <td className="p-2 border-b">৳{p.price}</td>
                                <td className="p-2 border-b">{p.subCategoryName || "-"}</td>
                                <td className="p-2 border-b">{p.categoryName || "-"}</td>

                                <td className="p-2 border-b">
                                    <span className={`px-2 py-1 rounded text-xs ${p.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {p.active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="p-2 border-b text-center space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(p)}
                                        disabled={loading}
                                        className="px-2 py-1 bg-yellow-400 rounded hover:bg-yellow-500 text-white text-sm disabled:bg-gray-300"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        disabled={loading}
                                        className="px-2 py-1 bg-red-500 rounded hover:bg-red-600 text-white text-sm disabled:bg-gray-300"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-2xl font-bold"
                            onClick={handleCloseModal}
                            disabled={loading}
                        >
                            ×
                        </button>
                        <h3 className="text-lg font-bold mb-4">
                            {editingProduct ? "Edit Product" : "Add Product"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Product Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Price (৳) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    step="0.01"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    SubCategory <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedSubCategory}
                                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={!selectedCategory || loading}
                                >
                                    <option value="">
                                        {selectedCategory ? "Select SubCategory" : "Select Category First"}
                                    </option>
                                    {subCategories.map((sc) => (
                                        <option key={sc.id} value={sc.id}>
                                            {sc.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Product Image {editingProduct ? "(Optional)" : ""}
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full"
                                    disabled={loading}
                                />
                                {formData.images.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Selected: {formData.images[0].name}
                                    </p>
                                )}
                            </div>

                            <div className="flex space-x-2 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    disabled={loading}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;