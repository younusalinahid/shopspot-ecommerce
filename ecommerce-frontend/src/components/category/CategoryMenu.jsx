import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {ChevronDown, ChevronRight, EllipsisVertical} from 'lucide-react';
import {useCategories} from '../../hooks/useCategory';
import {useLanguage} from '../../context/LanguageContext';

const shopLink = (category) => `/shop?category=${category.id}`;
const subCategoryLink = (sub) => `/subcategory/${sub.id}`;

/** Desktop navbar item: click opens a panel with categories on the left and their subcategories on the right. */
export default function CategoryMenu({open, onOpenChange, getClassName}) {
    const {t} = useLanguage();
    const {categories, loading} = useCategories();
    const [activeId, setActiveId] = useState(null);
    const rootRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e) => {
            if (!rootRef.current?.contains(e.target)) onOpenChange(false);
        };
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                onOpenChange(false);
                buttonRef.current?.focus();
            }
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, onOpenChange]);

    const active = categories.find(c => c.id === activeId) || categories[0];
    const close = () => onOpenChange(false);

    return (
        <div ref={rootRef} className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => onOpenChange(!open)}
                aria-expanded={open}
                aria-haspopup="true"
                className={`${getClassName(open)} flex items-center gap-1`}
            >
                <EllipsisVertical size={18} className="-ml-1"/>
                {t('nav.categories')}
                <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`}/>
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-3 z-50 flex w-[880px] min-h-[420px] rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
                    {loading || categories.length === 0 ? (
                        <p className="w-full p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            {loading ? t('nav.loadingCategories') : t('nav.noCategories')}
                        </p>
                    ) : (
                        <>
                            <ul className="w-80 flex-shrink-0 max-h-[75vh] overflow-y-auto p-3 space-y-0.5 bg-gray-50 dark:bg-gray-900/40">
                                {categories.map(category => {
                                    const isActive = category.id === active.id;
                                    return (
                                        <li key={category.id}>
                                            {/* Click as well as hover, so touch screens can open subcategories too */}
                                            <button
                                                type="button"
                                                onMouseEnter={() => setActiveId(category.id)}
                                                onFocus={() => setActiveId(category.id)}
                                                onClick={() => setActiveId(category.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-base font-semibold transition-colors ${isActive
                                                    ? 'bg-white dark:bg-gray-800 text-emerald-800 dark:text-emerald-300 shadow-sm'
                                                    : 'text-gray-700 dark:text-gray-200'}`}
                                            >
                                                <span className="text-xl leading-none">{category.icon}</span>
                                                <span className="flex-1 min-w-0">{category.name}</span>
                                                <ChevronRight size={15} className="flex-shrink-0 opacity-60"/>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="flex-1 min-w-0 max-h-[75vh] overflow-y-auto p-5">
                                <Link to={shopLink(active)} onClick={close}
                                      className="flex items-center gap-1 mb-4 px-3 text-base font-bold text-emerald-800 dark:text-emerald-300 hover:underline underline-offset-2">
                                    {t('nav.viewAllCategory', {name: active.name})}
                                    <ChevronRight size={15} className="flex-shrink-0"/>
                                </Link>
                                <div className="grid grid-cols-3 gap-1">
                                    {active.subCategories.map(sub => (
                                        <Link key={sub.id} to={subCategoryLink(sub)} onClick={close}
                                              className="px-3 py-2.5 rounded-lg text-[15px] text-gray-700 dark:text-gray-200 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-gray-700 dark:hover:text-emerald-300 transition-colors">
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

/** Phones and tablets: the same categories as an accordion inside the hamburger menu. */
export function MobileCategoryMenu({onNavigate}) {
    const {t} = useLanguage();
    const {categories} = useCategories();
    const [openId, setOpenId] = useState(null);

    if (categories.length === 0) return null;

    return (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <p className="flex items-center gap-1 mb-2 font-bold text-gray-900 dark:text-white">
                <EllipsisVertical size={18} className="-ml-1"/>
                {t('nav.categories')}
            </p>
            <ul className="space-y-1">
                {categories.map(category => {
                    const isOpen = openId === category.id;
                    return (
                        <li key={category.id}>
                            <button
                                type="button"
                                onClick={() => setOpenId(isOpen ? null : category.id)}
                                aria-expanded={isOpen}
                                className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-left font-semibold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                            >
                                <span className="text-lg leading-none">{category.icon}</span>
                                <span className="flex-1 min-w-0">{category.name}</span>
                                <ChevronDown size={18} className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
                            </button>
                            {isOpen && (
                                <div className="py-1 pl-4">
                                    <Link to={shopLink(category)} onClick={onNavigate}
                                          className="block px-3 py-2.5 text-sm font-bold text-emerald-800 dark:text-emerald-300">
                                        {t('nav.viewAllCategory', {name: category.name})}
                                    </Link>
                                    {category.subCategories.map(sub => (
                                        <Link key={sub.id} to={subCategoryLink(sub)} onClick={onNavigate}
                                              className="block px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200">
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
