import React, { useState } from "react";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

const AuthPage = ({ isLoginOpen = true, onClose, onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(isLoginOpen);
    const openLogin = () => setIsLogin(true);
    const openRegister = () => setIsLogin(false);

    const handleLoginSuccess = () => {
        if (onLoginSuccess) {
            onLoginSuccess();
        }
        onClose();
    };

    return (
        <>
            {isLogin ? (
                <LoginPage
                    isOpen={true}
                    onClose={onClose}
                    onSwitchToRegister={openRegister}
                    onLoginSuccess={handleLoginSuccess}
                />
            ) : (
                <RegisterPage
                    isOpen={true}
                    onClose={onClose}
                    onSwitchToLogin={openLogin}
                    onRegisterSuccess={handleLoginSuccess}
                />
            )}
        </>
    );
};

export default AuthPage;