import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosClient";

const OAuth2CallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) {
            navigate("/login");
            return;
        }

        localStorage.setItem("token", token);

        axiosInstance.get("/api/user/me")
            .then(res => {
                localStorage.setItem("user", JSON.stringify(res.data));
                window.dispatchEvent(new Event("userLoggedIn"));
                navigate("/");
            })
            .catch(() => {
                window.dispatchEvent(new Event("userLoggedIn"));
                navigate("/");
            });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-gray-500 text-sm">Signing you in...</p>
        </div>
    );
};

export default OAuth2CallbackPage;