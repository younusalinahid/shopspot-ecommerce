import {useEffect, useState} from "react";
import { productService } from '../api/product-api';

export const useProducts = (limit = 8) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const productData = await productService.getRecentProducts(limit);
                setProducts(productData);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [limit]);

    return { products, loading, error };
}