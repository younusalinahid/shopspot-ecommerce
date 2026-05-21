import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { productService } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";

const ProductManagementPage = () => {
    const [products,            setProducts]            = useState([]);
    const [categories,          setCategories]          = useState([]);
    const [subCategories,       setSubCategories]       = useState([]);
    const [selectedCategory,    setSelectedCategory]    = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [loading,             setLoading]             = useState(false);
    const [showModal,           setShowModal]           = useState(false);
    const [editingProduct,      setEditingProduct]      = useState(null);

    const EMPTY_FORM = {
        name: "", description: "", price: "",
        stockQuantity: 0, discountPercent: 0, images: [],
    };

    const [formData, setFormData] = useState(EMPTY_FORM);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProductsWithCategoryAndSubCategory();
            setProducts(data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await categoryApi.getAllCategories();
            setCategories(data);
        } catch {
            toast.error("Failed to fetch categories");
        }
    };

    const fetchSubCategories = async (categoryId, preSelectSubCategoryId = null) => {
        if (!categoryId) { setSubCategories([]); return; }
        try {
            const data = await categoryApi.getCategoryById(categoryId);
            const subs = data.subCategories || [];
            setSubCategories(subs);

            if (preSelectSubCategoryId) {
                setSelectedSubCategory(String(preSelectSubCategoryId));
            }
        } catch {
            setSubCategories([]);
        }
    };

    useEffect(() => { fetchProducts(); fetchCategories(); }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchSubCategories(selectedCategory);
            if (!editingProduct) {
                setSelectedSubCategory("");
            }
        } else {
            setSubCategories([]);
            setSelectedSubCategory("");
        }
    }, [selectedCategory]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setFormData(prev => ({ ...prev, images: Array.from(e.target.files) }));
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name:            product.name          || "",
                description:     product.description   || "",
                price:           product.originalPrice > 0
                    ? product.originalPrice
                    : product.price || "",
                stockQuantity:   product.stock         || 0,
                discountPercent: product.discountPercent || 0,
                images: [],
            });

            if (product.categoryId) {
                setSelectedCategory(String(product.categoryId));
                fetchSubCategories(product.categoryId, product.subCategoryId);
            }
            if (product.subCategoryId) {
                setSelectedSubCategory(String(product.subCategoryId));
            }
        } else {
            setEditingProduct(null);
            setFormData(EMPTY_FORM);
            setSelectedCategory("");
            setSelectedSubCategory("");
            setSubCategories([]);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData(EMPTY_FORM);
        setSelectedCategory("");
        setSelectedSubCategory("");
        setSubCategories([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedSubCategory) {
            toast.error("Please select a subcategory");
            return;
        }

        try {
            setLoading(true);

            const fd = new FormData();
            fd.append("name",            formData.name.trim());
            fd.append("description",     formData.description.trim());
            fd.append("price",           formData.price);
            fd.append("subCategoryId",   selectedSubCategory);
            fd.append("stockQuantity",   formData.stockQuantity);
            fd.append("discountPercent", formData.discountPercent);
            if (formData.images[0]) {
                fd.append("imageFile", formData.images[0]);
            }

            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, fd);
                toast.success("Product updated successfully");
            } else {
                await productService.createProduct(fd);
                toast.success("Product created successfully");
            }

            await fetchProducts();
            handleCloseModal();
        } catch (err) {
            const msg = err.response?.data?.message
                || (err.response?.status === 403 ? "Access denied. Admin required." : "Failed to save product");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            setLoading(true);
            await productService.deleteProduct(productId);
            toast.success("Product deleted successfully");
            await fetchProducts();
        } catch {
            toast.error("Failed to delete product");
        } finally {
            setLoading(false);
        }
    };

    const discountedPreview = formData.price > 0 && formData.discountPercent > 0
        ? Math.round(formData.price - (formData.price * formData.discountPercent / 100))
        : null;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Product Management</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{products.length} products</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                    + Add Product
                </button>
            </div>

            {/* Table */}
            {loading && products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Loading products...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No products found. Create your first product!
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 border-b text-left">Name</th>
                            <th className="p-3 border-b text-left">Price</th>
                            <th className="p-3 border-b text-left">Stock</th>
                            <th className="p-3 border-b text-left">Discount</th>
                            <th className="p-3 border-b text-left">Category</th>
                            <th className="p-3 border-b text-left">Status</th>
                            <th className="p-3 border-b text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="p-3 border-b font-medium">{p.name}</td>

                                {/* Price — original + discounted */}
                                <td className="p-3 border-b">
                                    <span className="font-semibold">৳{p.price}</span>
                                    {p.originalPrice > 0 && p.originalPrice !== p.price && (
                                        <span className="text-gray-400 line-through text-xs ml-1">
                                                ৳{p.originalPrice}
                                            </span>
                                    )}
                                </td>

                                {/* Stock */}
                                <td className="p-3 border-b">
                                    {p.stock === 0 ? (
                                        <span className="text-green-600 text-xs font-medium">Unlimited</span>
                                    ) : (
                                        <span className={p.stock < 5
                                            ? "text-red-600 font-semibold"
                                            : "text-gray-700"}>
                                                {p.stock}
                                            </span>
                                    )}
                                </td>

                                {/* Discount */}
                                <td className="p-3 border-b">
                                    {p.discountPercent > 0 ? (
                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                {p.discountPercent}% OFF
                                            </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">—</span>
                                    )}
                                </td>

                                <td className="p-3 border-b text-gray-600">
                                    {p.categoryName || "—"} / {p.subCategoryName || "—"}
                                </td>

                                <td className="p-3 border-b">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                            ${p.active
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"}`}>
                                            {p.active ? "Active" : "Inactive"}
                                        </span>
                                </td>

                                <td className="p-3 border-b text-center space-x-2">
                                    <button
                                        onClick={() => handleOpenModal(p)}
                                        disabled={loading}
                                        className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded text-xs disabled:opacity-50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        disabled={loading}
                                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs disabled:opacity-50"
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
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
                        >×</button>

                        <h3 className="text-lg font-bold mb-5">
                            {editingProduct ? "Edit Product" : "Add Product"}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Name */}
                            <Field label="Product Name" required>
                                <input type="text" name="name" value={formData.name}
                                       onChange={handleInputChange} required disabled={loading}
                                       className={INPUT_CLS} placeholder="e.g. Blue Denim Jacket" />
                            </Field>

                            {/* Description */}
                            <Field label="Description">
                                <textarea name="description" value={formData.description}
                                          onChange={handleInputChange} rows={3} disabled={loading}
                                          className={INPUT_CLS} placeholder="Product description..." />
                            </Field>

                            {/* Price + Discount side by side */}
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Price (৳)" required>
                                    <input type="number" name="price" value={formData.price}
                                           onChange={handleInputChange} min="0" required disabled={loading}
                                           className={INPUT_CLS} placeholder="1200" />
                                </Field>

                                <Field label="Discount (%)">
                                    <input type="number" name="discountPercent"
                                           value={formData.discountPercent}
                                           onChange={handleInputChange}
                                           min="0" max="100" disabled={loading}
                                           className={INPUT_CLS} placeholder="0" />
                                    {discountedPreview && (
                                        <p className="text-xs text-green-600 mt-1">
                                            Sale price: ৳{discountedPreview}
                                        </p>
                                    )}
                                </Field>
                            </div>

                            {/* Stock */}
                            <Field label="Stock Quantity">
                                <input type="number" name="stockQuantity"
                                       value={formData.stockQuantity}
                                       onChange={handleInputChange}
                                       min="0" disabled={loading}
                                       className={INPUT_CLS} placeholder="0" />
                                <p className="text-xs text-gray-400 mt-1">0 = unlimited stock</p>
                            </Field>

                            {/* Category */}
                            <Field label="Category" required>
                                <select value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        required disabled={loading} className={INPUT_CLS}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </Field>

                            {/* SubCategory */}
                            <Field label="SubCategory" required>
                                <select value={selectedSubCategory}
                                        onChange={e => setSelectedSubCategory(e.target.value)}
                                        required disabled={!selectedCategory || loading}
                                        className={INPUT_CLS}>
                                    <option value="">
                                        {selectedCategory ? "Select SubCategory" : "Select Category First"}
                                    </option>
                                    {subCategories.map(sc => (
                                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                                    ))}
                                </select>
                            </Field>

                            {/* Image */}
                            <Field label={`Product Image${editingProduct ? " (optional — leave empty to keep current)" : ""}`}>
                                <input type="file" accept="image/*"
                                       onChange={handleImageChange} disabled={loading}
                                       className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3
                                        file:rounded file:border-0 file:bg-blue-50 file:text-blue-700
                                        hover:file:bg-blue-100" />
                                {formData.images[0] && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Selected: {formData.images[0].name}
                                    </p>
                                )}
                            </Field>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={loading}
                                        className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50">
                                    {loading ? "Saving..." : editingProduct ? "Update" : "Add Product"}
                                </button>
                                <button type="button" onClick={handleCloseModal} disabled={loading}
                                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">
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

const INPUT_CLS = "w-full border border-gray-300 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function Field({ label, required, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

export default ProductManagementPage;