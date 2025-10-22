import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

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
                <Login
                    isOpen={true}
                    onClose={onClose}
                    onSwitchToRegister={openRegister}
                    onLoginSuccess={handleLoginSuccess}
                />
            ) : (
                <Register
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