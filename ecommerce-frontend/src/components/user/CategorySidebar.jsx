import {ChevronRight, ChevronDown} from "lucide-react";
import {useState} from 'react';
import {useNavigate} from "react-router-dom";

export default function CategorySidebar({ categories = [] }) {
    const [openIndex, setOpenIndex] = useState(null);
    const navigate = useNavigate();

    const toggleCategory = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleSubCategoryClick = (subCategoryId) => {
        navigate(`/subcategory/${subCategoryId}`)
    }

    return (
        <div className="hidden lg:block w-72">
            <div className="bg-white shadow-lg rounded-xl p-4 min-h-screen">
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
                                <ChevronDown className="h-5 w-5 text-gray-600"/>
                            ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400"/>
                            )}
                        </button>

                        {openIndex === index && (
                            <div className="ml-14 mt-2 space-y-2">
                                {category.subCategories?.map((sub, subIndex) => (
                                    <div
                                        key={subIndex}
                                        onClick={() => handleSubCategoryClick(sub.id)}
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
