import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ChatWidget from "../components/chat/ChatWidget";

const MainLayout = () => {
    return (
        <>
            <Navbar />

            <main>
                <Outlet />
            </main>

            <Footer />

            <ToastContainer
                position="top-left"
                autoClose={1000}
                theme="colored"
            />
            <ChatWidget />
        </>
    );
};

export default MainLayout;