import React from 'react';
import Navbar from './components/Navbar';

function App() {
    return (
        <div className="App">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-10">
                <h1 className="text-4xl font-bold text-center text-blue-600">
                    Welcome to ShopSpot Online
                </h1>
                <p className="mt-4 text-center text-gray-700 text-lg">
                    Your one-stop online shopping platform!
                </p>
            </main>
        </div>
    );
}

export default App;
