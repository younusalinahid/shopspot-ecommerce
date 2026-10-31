import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Trash2, Plus, Minus, ShoppingBag, Package, Truck, Shield, CreditCard, ArrowRight, ArrowLeft, Tag, MapPin, PartyPopper} from 'lucide-react';
import {toast} from 'react-toastify';
import {useCart} from '../../context/CartContext';
import {imageSrc} from '../../utils/imageSrc';
import {useSiteContent} from '../../hooks/useSiteContent';
import {useLanguage} from '../../context/LanguageContext';

const ZONE_KEY = 'delivery-zone';
const money = (n) => `৳${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

const readZone = () => {
    try {
        return localStorage.getItem(ZONE_KEY) === 'outside' ? 'outside' : 'dhaka';
    } catch {
        return 'dhaka';
    }
};

const CartPage = () => {
    const {delivery} = useSiteContent();
    const {t} = useLanguage();
    const {cart, isGuest, updateCartItem, removeCartItem, clearCart} = useCart();
    const [updatingItems, setUpdatingItems] = useState({});
    const [zone, setZone] = useState(readZone);

    const chooseZone = (z) => {
        setZone(z);
        try { localStorage.setItem(ZONE_KEY, z); } catch { /* ignore */ }
    };

    const handleQuantityChange = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        setUpdatingItems(prev => ({...prev, [cartItemId]: true}));
        try {
            const result = await updateCartItem(cartItemId, newQuantity);
            if (result?.success === false) toast.error(result.error || t('cart.updateFailed'));
            else toast.success(t('cart.updated'), {autoClose: 1200});
        } catch {
            toast.error(t('cart.updateFailed'));
        } finally {
            setUpdatingItems(prev => ({...prev, [cartItemId]: false}));
        }
    };

    const handleRemoveItem = async (cartItemId, name) => {
        if (!window.confirm(t('cart.removeConfirm', {name}))) return;
        try {
            await removeCartItem(cartItemId);
            toast.success(t('cart.removed'), {autoClose: 1200});
        } catch {
            toast.error(t('cart.updateFailed'));
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm(t('cart.clearConfirm'))) return;
        try {
            await clearCart();
            toast.success(t('cart.cleared'), {autoClose: 1200});
        } catch {
            toast.error(t('cart.updateFailed'));
        }
    };

    // ------------------------------------------------------------ loading / empty

    if (!cart) {
        return (
            <div className="min-h-[60vh] flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-emerald-600 mb-4"/>
                    <p className="text-gray-600 dark:text-gray-400">{t('cart.loading')}</p>
                </div>
            </div>
        );
    }

    if (!cart.items?.length) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-16">
                <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-10">
                    <div className="w-24 h-24 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                        <ShoppingBag className="w-12 h-12 text-emerald-600 dark:text-emerald-400"/>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('cart.emptyTitle')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">{t('cart.emptyNote')}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link to="/shop"
                              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                            {t('cart.continue')} <ArrowRight className="w-4 h-4"/>
                        </Link>
                        <Link to="/shop?sale=1"
                              className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors">
                            <Tag className="w-4 h-4"/> {t('cart.shopDeals')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------ totals

    const subtotal = cart.totalPrice || 0;
    const savings = cart.items.reduce((sum, item) => {
        const p = item.product || {};
        return sum + (p.originalPrice > p.price ? (p.originalPrice - p.price) * item.quantity : 0);
    }, 0);
    const freeDelivery = delivery.isFree(subtotal);
    // The exact area is chosen at checkout; here the shopper picks one to see an estimate
    const shipping = delivery.chargeFor(subtotal, zone === 'dhaka');
    const tax = Math.round(subtotal * 0.07);
    const total = subtotal + shipping + tax;
    const hasUnavailable = cart.items.some(i => i.product?.stock !== undefined && i.product.stock <= 0);
    const freeProgress = delivery.freeMin > 0 ? Math.min(100, Math.round((subtotal / delivery.freeMin) * 100)) : 0;
    const showFreeBar = delivery.freeMin > 0 && (delivery.dhaka > 0 || delivery.outside > 0);

    const checkoutButton = (extra = '') => (
        <Link to="/checkout"
              aria-disabled={hasUnavailable}
              onClick={e => { if (hasUnavailable) { e.preventDefault(); toast.info(t('cart.unavailable')); } }}
              className={`flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-colors ${hasUnavailable
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'} ${extra}`}>
            {t('cart.checkout')} <ArrowRight className="w-4 h-4"/>
        </Link>
    );

    // ------------------------------------------------------------ page

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28 lg:pb-12">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
                {/* Header */}
                <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{t('cart.title')}</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {t(cart.totalItems === 1 ? 'cart.item' : 'cart.items', {count: cart.totalItems})}
                        </p>
                    </div>
                    <Link to="/shop" className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">
                        <ArrowLeft className="w-4 h-4"/> {t('cart.continue')}
                    </Link>
                </div>

                {/* Free delivery progress */}
                {showFreeBar && (
                    <div className={`mb-6 rounded-2xl border p-4 ${freeDelivery
                        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
                        : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
                        <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100">
                            {freeDelivery
                                ? <><PartyPopper className="w-5 h-5 text-emerald-600"/> {t('cart.freeUnlocked')}</>
                                : <><Truck className="w-5 h-5 text-emerald-600"/> {t('cart.addMore', {amount: Math.max(1, delivery.freeMin - subtotal + 1).toLocaleString('en-IN')})}</>}
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                                 style={{width: `${freeDelivery ? 100 : freeProgress}%`}}/>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                    {/* Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                            {cart.items.map(item => {
                                const p = item.product || {};
                                const name = p.name || t('cart.notAvailable');
                                const img = imageSrc(p.imageData);
                                const hasDiscount = p.originalPrice > p.price;
                                const stock = p.stock;
                                const outOfStock = stock !== undefined && stock <= 0;
                                const atMax = stock !== undefined && item.quantity >= stock;
                                const busy = updatingItems[item.id];
                                return (
                                    <div key={item.id} className={`p-4 sm:p-5 flex gap-4 ${busy ? 'opacity-60' : ''}`}>
                                        <Link to={p.id ? `/product/${p.id}` : '#'}
                                              className="flex-shrink-0 w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                                            {img
                                                ? <img src={img} alt={name} className="w-full h-full object-cover object-top"/>
                                                : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-gray-400"/></div>}
                                        </Link>

                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <div className="flex items-start justify-between gap-3">
                                                <Link to={p.id ? `/product/${p.id}` : '#'}
                                                      className="font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 hover:text-emerald-700 dark:hover:text-emerald-400">
                                                    {name}
                                                </Link>
                                                <button onClick={() => handleRemoveItem(item.id, name)} title={t('cart.remove')} aria-label={t('cart.remove')}
                                                        className="flex-shrink-0 p-2 -m-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                    <Trash2 className="w-5 h-5"/>
                                                </button>
                                            </div>

                                            {(item.size || item.color) && (
                                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                    {item.size && (
                                                        <span className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                            {t('cart.size')}: {item.size}
                                                        </span>
                                                    )}
                                                    {item.color && (
                                                        <span className="px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200">
                                                            {t('cart.color')}: {item.color}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1.5 text-sm">
                                                <span className="font-semibold text-gray-900 dark:text-white">{money(p.price)}</span>
                                                {hasDiscount && (
                                                    <>
                                                        <span className="text-gray-400 line-through">{money(p.originalPrice)}</span>
                                                        <span className="px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold">
                                                            -{p.discountPercent || Math.round((1 - p.price / p.originalPrice) * 100)}%
                                                        </span>
                                                    </>
                                                )}
                                                <span className="text-gray-400 text-xs">{t('cart.each')}</span>
                                            </div>

                                            {outOfStock && (
                                                <p className="mt-1.5 text-xs font-semibold text-red-600">{t('cart.unavailable')}</p>
                                            )}
                                            {!outOfStock && stock !== undefined && stock <= 5 && (
                                                <p className="mt-1.5 text-xs font-semibold text-amber-600">{t('cart.onlyLeft', {count: stock})}</p>
                                            )}

                                            <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                                                <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                                                    <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || busy} aria-label="Decrease quantity"
                                                            className="w-9 h-9 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40">
                                                        <Minus className="w-4 h-4"/>
                                                    </button>
                                                    <span className="w-10 text-center font-semibold text-gray-900 dark:text-white" aria-live="polite">{item.quantity}</span>
                                                    <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                            disabled={atMax || busy || outOfStock} aria-label="Increase quantity"
                                                            className="w-9 h-9 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40">
                                                        <Plus className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{money(item.itemTotal ?? (p.price || 0) * item.quantity)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button onClick={handleClearCart}
                                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                            <Trash2 className="w-4 h-4"/> {t('cart.clear')}
                        </button>
                    </div>

                    {/* Summary */}
                    <aside className="lg:sticky lg:top-6">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 sm:p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">{t('cart.summary')}</h2>

                            {/* Delivery area (estimate; final charge uses the checkout address) */}
                            {!freeDelivery && (delivery.dhaka > 0 || delivery.outside > 0) && (
                                <div className="mb-5">
                                    <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                        <MapPin className="w-4 h-4 text-emerald-600"/> {t('cart.deliveryArea')}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={t('cart.deliveryArea')}>
                                        {[
                                            {id: 'dhaka', label: t('co.insideDhaka'), fee: delivery.dhaka},
                                            {id: 'outside', label: t('co.outsideDhaka'), fee: delivery.outside},
                                        ].map(opt => (
                                            <button key={opt.id} type="button" role="radio" aria-checked={zone === opt.id}
                                                    onClick={() => chooseZone(opt.id)}
                                                    className={`px-3 py-2.5 rounded-xl border text-left transition-colors ${zone === opt.id
                                                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-600'
                                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'}`}>
                                                <span className="block text-sm font-semibold text-gray-900 dark:text-white">{opt.label}</span>
                                                <span className="block text-xs text-gray-500 dark:text-gray-400">{opt.fee === 0 ? t('cart.free') : money(opt.fee)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <dl className="space-y-3 text-[15px]">
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <dt>{t('cart.subtotal')}</dt>
                                    <dd className="font-semibold text-gray-900 dark:text-white">{money(subtotal)}</dd>
                                </div>
                                {savings > 0 && (
                                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                                        <dt>{t('cart.savings')}</dt>
                                        <dd className="font-semibold">−{money(savings)}</dd>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <dt className="flex items-center gap-1.5"><Truck className="w-4 h-4"/> {t('cart.shipping')}</dt>
                                    <dd className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>
                                        {shipping === 0 ? t('cart.free') : money(shipping)}
                                    </dd>
                                </div>
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <dt>{t('cart.tax')}</dt>
                                    <dd className="font-semibold text-gray-900 dark:text-white">{money(tax)}</dd>
                                </div>
                                <div className="flex justify-between items-end pt-4 mt-1 border-t border-gray-200 dark:border-gray-700">
                                    <dt className="text-lg font-bold text-gray-900 dark:text-white">{freeDelivery ? t('cart.total') : t('cart.estimate')}</dt>
                                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">{money(total)}</dd>
                                </div>
                            </dl>

                            <div className="mt-6 hidden lg:block">{checkoutButton()}</div>

                            {isGuest && (
                                <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
                                    {t('cart.guestNote')}{' '}
                                    <button type="button"
                                            onClick={() => {
                                                sessionStorage.setItem('intendedPath', '/checkout');
                                                window.dispatchEvent(new Event('openLogin'));
                                            }}
                                            className="text-emerald-700 dark:text-emerald-400 hover:underline font-semibold">
                                        {t('cart.login')}
                                    </button>{' '}
                                    {t('cart.guestNote2')}
                                </p>
                            )}

                            <ul className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700 space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-600"/> {t('cart.secure')}</li>
                                <li className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-600"/> {t('cart.payment')}</li>
                                <li className="flex items-center gap-2"><Package className="w-4 h-4 text-emerald-600"/> {t('pd.returns')}</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Phone: total + checkout always visible */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-700 pl-4 pr-20 py-3 flex items-center gap-4">
                <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{freeDelivery ? t('cart.total') : t('cart.estimate')}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{money(total)}</p>
                </div>
                <div className="flex-1">{checkoutButton('py-3')}</div>
            </div>
        </div>
    );
};

export default CartPage;
