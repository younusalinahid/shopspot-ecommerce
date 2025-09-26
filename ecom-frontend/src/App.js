import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from "./pages/Home";
import CategorySidebar from "./pages/CategorySidebar";
import AuthPage from "./pages/auth/AuthPage";

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/" element={
                        <>
                            <div className="flex w-full px-6 py-10 gap-6">
                                {/* Sidebar fixed width */}
                                {/*<div className="w-64">*/}
                                {/*    <CategorySidebar />*/}
                                {/*</div>*/}

                                {/* Hero auto width */}
                                <div className="flex-1">
                                    <Home />
                                </div>
                            </div>
                        </>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
