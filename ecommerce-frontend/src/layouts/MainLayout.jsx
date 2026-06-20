import React from "react";
import {Outlet} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import Chatbot from "../components/chat/Chatbot";
import CompareFloatingButton from "../pages/product/CompareFloatingButton";

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

            <Navbar/>
            <main className="flex-grow">
                <Outlet/>
            </main>
            <CompareFloatingButton/>
            <Chatbot/>
            <Footer/>
            <ToastContainer
                position="top-left"
                autoClose={1000}
                theme="colored"
            />
        </div>
    );
};

export default MainLayout;