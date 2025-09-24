import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

const AuthPage = () => {
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [isRegisterOpen, setRegisterOpen] = useState(false);

    return (
        <>
            {/* Login Modal */}
            <Login
                isOpen={isLoginOpen}
                onClose={() => setLoginOpen(false)}
                onSwitchToRegister={() => {
                    setLoginOpen(false);
                    setRegisterOpen(true);
                }}
            />

            {/* Register Modal */}
            <Register
                isOpen={isRegisterOpen}
                onClose={() => setRegisterOpen(false)}
                onSwitchToLogin={() => {
                    setRegisterOpen(false);
                    setLoginOpen(true);
                }}
            />
        </>
    );
};

export default AuthPage;