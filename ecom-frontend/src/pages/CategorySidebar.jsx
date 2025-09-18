import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

export const categories = [
    {
        icon: "👕",
        name: "Men’s Wear",
        color: "bg-blue-100 text-blue-600",
        subCategories: [
            { name: "Kurta & Panjabi", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
            { name: "Sherwani", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
            { name: "Pajama & Salwar", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
            { name: "Waistcoat / Jacket", color: "bg-teal-50 text-teal-700 hover:bg-teal-100" },
            { name: "Footwear", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
            { name: "Accessories (Topi, Shawl)", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
        ],
    },
    {
        icon: "👗",
        name: "Women’s Wear",
        color: "bg-pink-100 text-pink-600",
        subCategories: [
            { name: "Saree", color: "bg-red-50 text-red-700 hover:bg-red-100" },
            { name: "Salwar Kameez", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
            { name: "Lehenga / Gown", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
            { name: "Kurti", color: "bg-teal-50 text-teal-700 hover:bg-teal-100" },
            { name: "Dupatta & Shawl", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
            { name: "Jewelry", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
        ],
    },
    {
        icon: "👶",
        name: "Kids’ Wear",
        color: "bg-yellow-100 text-yellow-600",
        subCategories: [
            { name: "Boys (Panjabi, Pajama)", color: "bg-green-50 text-green-700 hover:bg-green-100" },
            { name: "Girls (Mini Saree, Salwar Kameez, Frock)", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
        ],
    },
    {
        icon: "🎉",
        name: "Festival & Wedding",
        color: "bg-purple-100 text-purple-600",
        subCategories: [
            { name: "Wedding Collection", color: "bg-red-50 text-red-700 hover:bg-red-100" },
            { name: "Eid Special", color: "bg-green-50 text-green-700 hover:bg-green-100" },
            { name: "Puja Special", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
            { name: "Party Wear", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
        ],
    },
    {
        icon: "🔀",
        name: "Fusion & Modern",
        color: "bg-teal-100 text-teal-600",
        subCategories: [
            { name: "Indo-Western Gown", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
            { name: "Kurti with Jeans", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
            { name: "Saree with Belt Style", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
        ],
    },
    {
        icon: "👜",
        name: "Accessories",
        color: "bg-orange-100 text-orange-600",
        subCategories: [
            { name: "Bags & Potlis", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
            { name: "Handmade Jewelry", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
            { name: "Caps & Scarves", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
            { name: "Footwear", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
        ],
    },
    {
        icon: "🏠",
        name: "Lifestyle",
        color: "bg-green-100 text-green-600",
        subCategories: [
            { name: "Nakshi Kantha", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
            { name: "Home Décor", color: "bg-green-50 text-green-700 hover:bg-green-100" },
            { name: "Jute & Handicrafts", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
        ],
    },
    {
        icon: "🧵",
        name: "Traditional Fabrics & Materials",
        color: "bg-red-100 text-red-600",
        subCategories: [
            { name: "Cotton Collection", color: "bg-red-50 text-red-700 hover:bg-red-100" },
            { name: "Silk Collection", color: "bg-pink-50 text-pink-700 hover:bg-pink-100" },
            { name: "Linen Collection", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
            { name: "Handloom Fabric", color: "bg-green-50 text-green-700 hover:bg-green-100" },
        ],
    }
];

export default function CategorySidebar() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleCategory = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="hidden lg:block w-72">
            <div className="bg-white shadow-lg rounded-xl p-4 min-h-screen">
                {/* Sidebar content */}
                {categories.map((category, index) => (
                    <div key={index} className="mb-2">
                        <button
                            onClick={() => toggleCategory(index)}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                        >
                            <div
                                className={`w-10 h-10 rounded-full ${category.color} flex items-center justify-center text-lg`}
                            >
                                {category.icon}
                            </div>
                            <span className="flex-1 text-left font-medium text-gray-700">
                        {category.name}
                    </span>
                            {openIndex === index ? (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                            ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
                        </button>

                        {openIndex === index && (
                            <div className="ml-14 mt-2 space-y-2">
                                {category.subCategories?.map((sub, subIndex) => (
                                    <div
                                        key={subIndex}
                                        className={`px-3 py-2 rounded-lg shadow-sm cursor-pointer text-sm font-medium transition-all duration-200 ${sub.color}`}
                                    >
                                        {sub.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
