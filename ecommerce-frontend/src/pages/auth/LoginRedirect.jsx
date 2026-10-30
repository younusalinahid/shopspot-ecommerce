import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../api/authApi";

/**
 * "/login" route. Login is a modal in the Navbar, so this page opens that modal
 * on the home page instead of showing a blank screen.
 */
export default function LoginRedirect() {
    const navigate = useNavigate();

    useEffect(() => {
        const target = sessionStorage.getItem('intendedPath');
        if (isAuthenticated()) {
            sessionStorage.removeItem('intendedPath');
            navigate(target || '/', { replace: true });
            return;
        }
        navigate('/', { replace: true });
        // Let the Navbar mount before asking it to open the login modal
        setTimeout(() => window.dispatchEvent(new Event('openLogin')), 0);
    }, [navigate]);

    return null;
}
