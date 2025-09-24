import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from "./pages/Hero"
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
                                <div className="w-64">
                                    <CategorySidebar />
                                </div>

                                {/* Hero auto width */}
                                <div className="flex-1">
                                    <Hero />
                                </div>
                            </div>

                            <main className="max-w-7xl mx-auto px-4 py-10">
                                <h1 className="text-4xl font-bold text-center text-blue-600">
                                    Welcome to ShopSpot Online
                                </h1>
                                <p className="mt-4 text-center text-gray-700 text-lg">
                                    Your one-stop online shopping platform!
                                </p>
                            </main>
                        </>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
