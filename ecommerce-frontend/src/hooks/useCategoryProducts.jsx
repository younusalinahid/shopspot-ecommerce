import { useState, useEffect } from 'react';

export const useCategoryProducts = (productsPerCategory = 4) => {
    const [categoryProducts, setCategoryProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:8080/api/categories/with-products?productsPerCategory=${productsPerCategory}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch category products');
                }

                const data = await response.json();
                setCategoryProducts(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching category products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryProducts();
    }, [productsPerCategory]);

    return { categoryProducts, loading, error };
};