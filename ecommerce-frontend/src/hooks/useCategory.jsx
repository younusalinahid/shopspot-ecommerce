import { useState, useEffect } from 'react';
import { categoryApi } from '../api/category-api-service';

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        categoryApi.getAllCategories()
            .then(data => {
                const mapped = data.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    icon: cat.icon,
                    color: "bg-blue-100 text-blue-600",
                    subCategories: cat.subCategories.map(sub => ({
                        id: sub.id,
                        name: sub.name,
                        color: "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }))
                }));
                setCategories(mapped);
            })
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    }, []);

    return { categories, loading, error };
};
