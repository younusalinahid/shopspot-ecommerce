// src/pages/Home.jsx
import React from "react";

export default function Home() {
    return (
        <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500">

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-32 md:py-40 flex flex-col items-center text-center">

                {/* Tagline */}
                <h1 className="text-white text-4xl md:text-6xl font-bold mb-6">
                    Find Your Medicines <br /> Easily & Quickly
                </h1>

                {/* Description */}
                <p className="text-white text-lg md:text-2xl mb-8">
                    Trusted online pharmacy at your fingertips
                </p>

                {/* CTA Button */}
                <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-xl font-semibold transition-colors">
                    Search Medicines
                </button>

                {/* Optional: Hero search bar */}
                <div className="mt-10 w-full max-w-2xl">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search for products..."
                            className="w-full px-6 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-white text-gray-700 text-lg"
                        />
                        <button className="absolute right-0 top-0 bottom-0 bg-green-500 hover:bg-green-600 px-6 rounded-r-full flex items-center justify-center transition-colors">
                            🔍
                        </button>
                    </div>
                </div>

            </div>

        </div>
    );
}
