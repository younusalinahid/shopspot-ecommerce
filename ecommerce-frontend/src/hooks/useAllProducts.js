import { useEffect, useState } from "react";
import { productService } from '../api/productApi';

export const useAllProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                setLoading(true);
                const productData = await productService.getAllProducts();
                setProducts(productData);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching all products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllProducts();
    }, []);

    return { products, loading, error };
};