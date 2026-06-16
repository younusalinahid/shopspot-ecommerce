import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { productService } from "../../api/productApi";
import { categoryApi } from "../../api/categoryApi";


const ProductManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterOption, setFilterOption] = useState("all");


    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);


    const EMPTY_FORM = {
        name: "", description: "", price: "",
        stockQuantity: 0, discountPercent: 0, images: [],
    };


    const [formData, setFormData] = useState(EMPTY_FORM);


    const filteredProducts = React.useMemo(() => {
        let result = [...products];


        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            result = result.filter(product =>
                product.name?.toLowerCase().includes(term) ||
                product.categoryName?.toLowerCase().includes(term) ||
                product.subCategoryName?.toLowerCase().includes(term)
            );
        }


        if (filterOption === "active") {
            result = result.filter(p => p.active === true);
        } else if (filterOption === "inactive") {
            result = result.filter(p => p.active === false);
        } else if (filterOption === "price-asc") {
            result.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (filterOption === "price-desc") {
            result.sort((a, b) => (b.price || 0) - (a.price || 0));
        }


        return result;
    }, [products, searchTerm, filterOption]);


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
        if (!categoryId) {
            setSubCategories([]);
            return;
        }
        try {
            const data = await categoryApi.getCategoryById(categoryId);
            const subs = data.subCategories || [];
            setSubCategories(subs);
            if (preSelectSubCategoryId) setSelectedSubCategory(String(preSelectSubCategoryId));
        } catch {
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
            if (!editingProduct) setSelectedSubCategory("");
        } else {
            setSubCategories([]);
            setSelectedSubCategory("");
        }
    }, [selectedCategory, editingProduct]);


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
                name: product.name || "",
                description: product.description || "",
                price: product.originalPrice > 0 ? product.originalPrice : product.price || "",
                stockQuantity: product.stock || 0,
                discountPercent: product.discountPercent || 0,
                images: [],
            });


            if (product.categoryId) {
                setSelectedCategory(String(product.categoryId));
                fetchSubCategories(product.categoryId, product.subCategoryId);
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
            fd.append("name", formData.name.trim());
            fd.append("description", formData.description.trim());
            fd.append("price", formData.price);
            fd.append("subCategoryId", selectedSubCategory);
            fd.append("stockQuantity", formData.stockQuantity);
            fd.append("discountPercent", formData.discountPercent);


            if (formData.images?.[0]) fd.append("imageFile", formData.images[0]);


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
            toast.error(err.response?.data?.message || "Failed to save product");
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
                        <p className="text-sm text-gray-500">
                            {filteredProducts.length} of {products.length} products
                        </p>
                    </div>


                    {/* Bigger but not too big Search Box */}
                    <div className="relative w-full sm:w-96">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-full py-3 px-5 pl-12 text-sm
                                      focus:outline-none focus:border-gray-400 shadow-sm focus:shadow-md transition-all"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xl"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>


                {/* Right Side */}
                <div className="flex items-center gap-3">
                    <select
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                        className="border border-gray-300 rounded-full px-5 py-3 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
                    >
                        <option value="all">All Products</option>
                        <option value="active">Active Products</option>
                        <option value="inactive">Inactive Products</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>


                    <button
                        onClick={() => handleOpenModal()}
                        disabled={loading}
                        className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap font-medium"
                    >
                        + Add Product
                    </button>
                </div>
            </div>


            {/* Table & Modal same as before */}
            {loading && products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No matching products found.</div>
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
                        {filteredProducts.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 border-b">
                                <td className="p-3 font-medium">{p.name}</td>
                                <td className="p-3">
                                    <span className="font-semibold">৳{p.price}</span>
                                    {p.originalPrice > 0 && p.originalPrice !== p.price && (
                                        <span className="text-gray-400 line-through text-xs ml-1">৳{p.originalPrice}</span>
                                    )}
                                </td>
                                <td className="p-3">
                                    {p.stock === 0 ? (
                                        <span className="text-green-600 text-xs font-medium">Unlimited</span>
                                    ) : (
                                        <span className={p.stock < 5 ? "text-red-600 font-semibold" : "text-gray-700"}>
                                               {p.stock}
                                           </span>
                                    )}
                                </td>
                                <td className="p-3">
                                    {p.discountPercent > 0 ? (
                                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                                               {p.discountPercent}% OFF
                                           </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">—</span>
                                    )}
                                </td>
                                <td className="p-3 text-gray-600">
                                    {p.categoryName || "—"} / {p.subCategoryName || "—"}
                                </td>
                                <td className="p-3">
                                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                           {p.active ? "Active" : "Inactive"}
                                       </span>
                                </td>
                                <td className="p-3 text-center space-x-2">
                                    <button onClick={() => handleOpenModal(p)} disabled={loading}
                                            className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-white rounded text-xs disabled:opacity-50">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} disabled={loading}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs disabled:opacity-50">
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
                        <button onClick={handleCloseModal} className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold">×</button>
                        <h3 className="text-lg font-bold mb-5">{editingProduct ? "Edit Product" : "Add Product"}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field label="Product Name" required>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required disabled={loading} className={INPUT_CLS} placeholder="e.g. Blue Denim Jacket" />
                            </Field>


                            <Field label="Description">
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} disabled={loading} className={INPUT_CLS} placeholder="Product description..." />
                            </Field>


                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Price (৳)" required>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} min="0" required disabled={loading} className={INPUT_CLS} placeholder="1200" />
                                </Field>
                                <Field label="Discount (%)">
                                    <input type="number" name="discountPercent" value={formData.discountPercent} onChange={handleInputChange} min="0" max="100" disabled={loading} className={INPUT_CLS} placeholder="0" />
                                    {discountedPreview && <p className="text-xs text-green-600 mt-1">Sale price: ৳{discountedPreview}</p>}
                                </Field>
                            </div>


                            <Field label="Stock Quantity">
                                <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleInputChange} min="0" disabled={loading} className={INPUT_CLS} placeholder="0" />
                                <p className="text-xs text-gray-400 mt-1">0 = unlimited stock</p>
                            </Field>


                            <Field label="Category" required>
                                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} required disabled={loading} className={INPUT_CLS}>
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </Field>


                            <Field label="SubCategory" required>
                                <select value={selectedSubCategory} onChange={e => setSelectedSubCategory(e.target.value)} required disabled={!selectedCategory || loading} className={INPUT_CLS}>
                                    <option value="">{selectedCategory ? "Select SubCategory" : "Select Category First"}</option>
                                    {subCategories.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                </select>
                            </Field>


                            <Field label={`Product Image${editingProduct ? " (optional — leave empty to keep current)" : ""}`}>
                                <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading}
                                       className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                {formData.images?.[0] && <p className="text-xs text-gray-500 mt-1">Selected: {formData.images[0].name}</p>}
                            </Field>


                            <div className="flex gap-3 pt-4">
                                <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
                                    {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                                </button>
                                <button type="button" onClick={handleCloseModal} disabled={loading} className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">
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