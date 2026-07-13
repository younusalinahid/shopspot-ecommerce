import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import { toast } from "react-toastify";

const OAuth2CallbackPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        const error = searchParams.get("error");
        const isRestricted = searchParams.get("isRestricted") === "true";

        if (error === "deactivated") {
            toast.error("Your account has been deactivated. Please contact support.");
            navigate("/");
            return;
        }

        if (!token) {
            navigate("/");
            return;
        }

        localStorage.setItem("token", token);

        axiosInstance.get("/api/user/profile")
            .then(res => {
                const normalizedUser = {
                    id:       res.data.id,
                    fullName: res.data.fullName,
                    email:    res.data.email,
                    role:     res.data.role,
                    active:   res.data.active,
                    phone:    res.data.phone || null,
                };
                localStorage.setItem("user", JSON.stringify(normalizedUser));
                window.dispatchEvent(new Event("userLoggedIn"));
                window.dispatchEvent(new StorageEvent("storage"));

                if (!res.data.active || isRestricted) {
                    toast.warning("Your account is restricted. Please appeal for reactivation.", { autoClose: 2000 });
                    navigate("/");
                } else {
                    navigate("/");
                }
            })
            .catch((err) => {
                console.error("Profile fetch error in OAuth callback:", err);
                const apiDeactivated = err.response?.status === 401 || err.response?.status === 403 || isRestricted;

                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));

                    const fallbackUser = {
                        id:       payload.id || null,
                        fullName: payload.name || payload.fullName || (payload.sub ? payload.sub.split('@')[0] : "OAuth User"),
                        email:    payload.sub || payload.email || "OAuth Account",
                        role:     payload.roles?.[0]?.replace('ROLE_', '') || "CUSTOMER",
                        active:   !apiDeactivated,
                        phone:    payload.phone || null,
                    };

                    localStorage.setItem("user", JSON.stringify(fallbackUser));
                } catch (e) {
                    localStorage.setItem("user", JSON.stringify({
                        fullName: "Social User", email: "Restricted Account", role: "CUSTOMER", active: false
                    }));
                }

                window.dispatchEvent(new Event("userLoggedIn"));
                window.dispatchEvent(new StorageEvent("storage"));

                if (apiDeactivated) {
                    toast.error("Access Restricted: Account is currently deactivated.", { autoClose: 6000 });
                    navigate("/");
                } else {
                    navigate("/");
                }
            });
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Signing you in...</p>
        </div>
    );
};

export default OAuth2CallbackPage;