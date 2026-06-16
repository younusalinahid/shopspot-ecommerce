import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

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
        </>
    );
};

export default MainLayout;