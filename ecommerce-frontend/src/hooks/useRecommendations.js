import { useState, useEffect } from "react";
import { recommendationApi } from "../api/recommendationApi";
import { isAuthenticated } from "../api/authApi";

export const useRecommendations = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) return;
        setLoading(true);
        recommendationApi.getRecommendations()
            .then(setRecommendations)
            .catch(() => setRecommendations([]))
            .finally(() => setLoading(false));
    }, []);

    return { recommendations, loading };
};