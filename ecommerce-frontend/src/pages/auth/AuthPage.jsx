import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthPage = ({ isLoginOpen = true, onClose }) => {
    const [isLogin, setIsLogin] = useState(isLoginOpen);
    const openLogin = () => setIsLogin(true);
    const openRegister = () => setIsLogin(false);

    return (
        <>
            {isLogin ? (
                <Login
                    isOpen={true}
                    onClose={onClose}
                    onSwitchToRegister={openRegister}
                />
            ) : (
                <Register
                    isOpen={true}
                    onClose={onClose}
                    onSwitchToLogin={openLogin}
                />
            )}
        </>
    );
};

export default AuthPage;
