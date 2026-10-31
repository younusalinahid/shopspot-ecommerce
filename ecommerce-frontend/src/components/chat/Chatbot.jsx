import {useCallback, useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {
    Bot, X, Send, Mic, Square, Volume2, VolumeX, RotateCcw, ShoppingCart, Sparkles, ExternalLink, Settings2,
} from "lucide-react";
import {toast} from "react-toastify";
import {chatApi} from "../../api/chatApi";
import {useCart} from "../../context/CartContext";
import {imageSrc} from "../../utils/imageSrc";

const STORAGE_KEY = "shopspot-chat";
const GREETING = {
    role: "assistant",
    content: "Hi! 👋 I'm the **ShopSpot assistant**.\nAsk me about products, prices, offers, delivery or returns. You can type or tap the 🎤 mic to talk — English, বাংলা or Banglish all work!",
};

const QUICK_REPLIES = [
    {label: "🔥 Today's deals", text: "Show me discounted products"},
    {label: "👗 Sarees under ৳10,000", text: "Show sarees under 10000 taka"},
    {label: "🚚 Delivery charge?", text: "What is the delivery charge and how long does delivery take?"},
    {label: "↩️ Return policy", text: "What is your return policy?"},
    {label: "🧒 Kids wear", text: "Show kids wear"},
    {label: "🇧🇩 বাংলায় বলুন", text: "আমাকে বাংলায় সাহায্য করুন। নতুন কী আছে?"},
];

// Browser voice APIs (Chrome / Edge / Safari). Not available in every browser.
const SpeechRecognition = typeof window !== "undefined"
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;
const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;

const loadHistory = () => {
    try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
        return Array.isArray(saved) && saved.length ? saved : [GREETING];
    } catch {
        return [GREETING];
    }
};

const hasBangla = (text) => /[\u0980-\u09FF]/.test(text || "");

// Female voices that ship with Windows, macOS, Android and Chrome
const FEMALE = /female|woman|zira|aria|jenny|michelle|sonia|libby|maisie|natasha|clara|emma|ava|samantha|victoria|karen|moira|tessa|fiona|serena|veena|heera|neerja|swara|tanishaa|nabanita|google us english|google uk english female|google \u09AC\u09BE\u0982\u09B2\u09BE/i;
const MALE = /\bmale\b|david|mark|guy|ryan|daniel|alex|fred|george|james|thomas|bashkar|pradeep|ravi|prabhat/i;
const isFemale = (v) => FEMALE.test(v.name) && !MALE.test(v.name.replace(/female/i, ""));

/** User's chosen voice if it fits the language, otherwise the best female voice for it. */
const pickVoice = (voices, bangla, preferredName) => {
    const forLang = voices.filter(v => (bangla ? /^bn/i : /^en/i).test(v.lang || ""));
    return forLang.find(v => v.name === preferredName)
        || forLang.find(isFemale)
        || forLang.find(v => !MALE.test(v.name))
        || forLang[0]
        || null;
};

/** Plain text for the speech engine: no markdown, link targets or emoji. */
const toSpeech = (text) => (text || "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/[•#>*_`]/g, " ")
    .replace(/৳\s?([\d,]+)/g, "$1 taka")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const Chatbot = () => {
    const navigate = useNavigate();
    const {addToCart} = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [messages, setMessages] = useState(loadHistory);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [listening, setListening] = useState(false);
    const [voiceLang, setVoiceLang] = useState(() => localStorage.getItem("chat-voice-lang") || "en");
    const [autoSpeak, setAutoSpeak] = useState(() => localStorage.getItem("chat-auto-speak") === "1");
    const [speakingIndex, setSpeakingIndex] = useState(null);
    const [voices, setVoices] = useState([]);
    const [voiceName, setVoiceName] = useState(() => localStorage.getItem("chat-voice") || "");
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const spokeLastRef = useRef(false);
    const messagesRef = useRef(messages);

    useEffect(() => {
        messagesRef.current = messages;
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
        } catch { /* storage full or blocked */ }
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages, loading, isOpen]);

    useEffect(() => {
        if (isOpen) return undefined;
        const interval = setInterval(() => {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 3500);
        }, 12000);
        return () => clearInterval(interval);
    }, [isOpen]);

    // ------------------------------------------------------------------ speech output

    const stopSpeaking = useCallback(() => {
        if (canSpeak) window.speechSynthesis.cancel();
        setSpeakingIndex(null);
    }, []);

    const speak = useCallback((text, index) => {
        if (!canSpeak) {
            toast.info("Voice replies are not supported in this browser");
            return;
        }
        window.speechSynthesis.cancel();
        const clean = toSpeech(text);
        if (!clean) return;
        const utter = new SpeechSynthesisUtterance(clean);
        const bangla = hasBangla(clean);
        utter.lang = bangla ? "bn-BD" : "en-US";
        const voice = pickVoice(window.speechSynthesis.getVoices(), bangla, voiceName);
        if (voice) utter.voice = voice;
        utter.rate = 1;
        utter.pitch = 1.05;
        utter.onend = () => setSpeakingIndex(null);
        utter.onerror = () => setSpeakingIndex(null);
        setSpeakingIndex(index);
        window.speechSynthesis.speak(utter);
    }, [voiceName]);

    useEffect(() => {
        if (!isOpen) stopSpeaking();
    }, [isOpen, stopSpeaking]);

    // Voices load asynchronously in Chrome
    useEffect(() => {
        if (!canSpeak) return undefined;
        const load = () => setVoices(window.speechSynthesis.getVoices()
            .filter(v => /^(en|bn)/i.test(v.lang || "")));
        load();
        window.speechSynthesis.addEventListener?.("voiceschanged", load);
        return () => {
            window.speechSynthesis.removeEventListener?.("voiceschanged", load);
            if (canSpeak) window.speechSynthesis.cancel();
            recognitionRef.current?.abort?.();
        };
    }, []);

    // ------------------------------------------------------------------ sending

    const send = useCallback(async (text, {fromVoice = false} = {}) => {
        const content = (text || "").trim();
        if (!content || loading) return;
        stopSpeaking();
        spokeLastRef.current = fromVoice;
        const userMessage = {role: "user", content};
        const updated = [...messagesRef.current, userMessage];
        setMessages(updated);
        setInput("");
        setLoading(true);
        try {
            const history = updated
                .filter(m => m !== GREETING && !m.hidden)
                .map(({role, content: c}) => ({role, content: c}));
            const response = await chatApi.sendMessage(history);
            const reply = {role: "assistant", content: response.message, products: response.products || []};
            setMessages(prev => {
                const next = [...prev, reply];
                if (autoSpeak || spokeLastRef.current) speak(reply.content, next.length - 1);
                return next;
            });
        } catch {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, I couldn't connect right now. Please try again! 😔",
            }]);
        } finally {
            setLoading(false);
            spokeLastRef.current = false;
        }
    }, [loading, autoSpeak, speak, stopSpeaking]);

    // After "Add to cart" on a product page, suggest matching items
    useEffect(() => {
        let timer = null;
        const onCartAdd = (event) => {
            const name = event.detail?.productName;
            if (!name) return;
            clearTimeout(timer);
            timer = setTimeout(async () => {
                setIsOpen(true);
                setLoading(true);
                setMessages(prev => [...prev, {role: "user", content: `🛒 Added "${name}" to cart`, hidden: true}]);
                try {
                    const response = await chatApi.sendMessage([{role: "user", content: `SYSTEM_CART_TRIGGER:${name}`}]);
                    setMessages(prev => [...prev, {role: "assistant", content: response.message, products: response.products || []}]);
                } catch {
                    setMessages(prev => [...prev, {role: "assistant", content: "Could not fetch suggestions right now. 😔"}]);
                } finally {
                    setLoading(false);
                }
            }, 4000);
        };
        window.addEventListener("cartItemAdded", onCartAdd);
        return () => {
            window.removeEventListener("cartItemAdded", onCartAdd);
            clearTimeout(timer);
        };
    }, []);

    // ------------------------------------------------------------------ voice input

    const toggleListening = () => {
        if (!SpeechRecognition) {
            toast.info("Voice input works in Chrome or Edge");
            return;
        }
        if (listening) {
            recognitionRef.current?.stop();
            return;
        }
        stopSpeaking();
        const recognition = new SpeechRecognition();
        recognition.lang = voiceLang === "bn" ? "bn-BD" : "en-US";
        recognition.interimResults = true;
        recognition.continuous = false;
        let finalText = "";
        recognition.onresult = (event) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) finalText += t;
                else interim += t;
            }
            setInput((finalText + interim).trim());
        };
        recognition.onerror = (event) => {
            if (event.error === "not-allowed" || event.error === "service-not-allowed") {
                toast.error("Please allow microphone access to talk to the assistant");
            } else if (event.error !== "no-speech" && event.error !== "aborted") {
                toast.error("Couldn't hear that. Please try again.");
            }
        };
        recognition.onend = () => {
            setListening(false);
            recognitionRef.current = null;
            if (finalText.trim()) send(finalText, {fromVoice: true});
        };
        recognitionRef.current = recognition;
        setListening(true);
        recognition.start();
    };

    const changeVoiceLang = () => {
        const next = voiceLang === "en" ? "bn" : "en";
        setVoiceLang(next);
        localStorage.setItem("chat-voice-lang", next);
        toast.info(next === "bn" ? "ভয়েস ইনপুট: বাংলা" : "Voice input: English", {autoClose: 1200});
    };

    const toggleAutoSpeak = () => {
        const next = !autoSpeak;
        setAutoSpeak(next);
        localStorage.setItem("chat-auto-speak", next ? "1" : "0");
        if (!next) stopSpeaking();
        toast.info(next ? "Replies will be read aloud" : "Voice replies off", {autoClose: 1200});
    };

    const chooseVoice = (name) => {
        setVoiceName(name);
        localStorage.setItem("chat-voice", name);
        if (!canSpeak) return;
        const all = window.speechSynthesis.getVoices();
        const picked = all.find(x => x.name === name) || pickVoice(all, false, "");
        const bangla = /^bn/i.test(picked?.lang || "");
        const u = new SpeechSynthesisUtterance(bangla ? "\u09B9\u09CD\u09AF\u09BE\u09B2\u09CB! \u0986\u09AE\u09BF \u09B6\u09AA\u09B8\u09CD\u09AA\u099F \u09B8\u09B9\u0995\u09BE\u09B0\u09C0\u0964" : "Hi! I'm your ShopSpot assistant.");
        if (picked) {
            u.voice = picked;
            u.lang = picked.lang;
        }
        u.pitch = 1.05;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
    };

    const resetChat = () => {
        stopSpeaking();
        setMessages([GREETING]);
    };

    // ------------------------------------------------------------------ rendering

    const closeAndGo = (to) => {
        setIsOpen(false);
        navigate(to);
    };

    const renderInline = (text, keyPrefix) => {
        const parts = [];
        const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
        let last = 0;
        let match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index > last) parts.push(text.slice(last, match.index));
            const key = `${keyPrefix}-${match.index}`;
            if (match[3]) {
                parts.push(<strong key={key} className="font-semibold">{match[3]}</strong>);
            } else {
                const label = match[1];
                const target = match[2].trim();
                let to = null;
                if (/^\d+$/.test(target)) to = `/product/${target}`;
                else if (target.startsWith("category:")) to = `/shop?category=${encodeURIComponent(target.slice(9))}`;
                else if (target.startsWith("search:")) to = `/shop?q=${encodeURIComponent(target.slice(7).trim())}`;
                if (to) {
                    const isSearch = !target.match(/^\d+$/);
                    parts.push(
                        <Link key={key} to={to} onClick={() => setIsOpen(false)}
                              className={isSearch
                                  ? "inline-flex items-center gap-1 mx-0.5 px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                                  : "font-semibold text-emerald-700 dark:text-emerald-300 underline decoration-emerald-300 underline-offset-2 hover:decoration-2"}>
                            {label}{isSearch && <ExternalLink className="w-3 h-3"/>}
                        </Link>
                    );
                } else {
                    parts.push(label);
                }
            }
            last = regex.lastIndex;
        }
        if (last < text.length) parts.push(text.slice(last));
        return parts;
    };

    const renderContent = (content) => (content || "").split("\n").map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5"/>;
        const bullet = /^([•\-*]|\d+\.)\s+/.exec(trimmed);
        if (bullet) {
            return (
                <div key={i} className="flex gap-2 my-0.5">
                    <span className="text-emerald-500 flex-shrink-0 font-bold">{/\d/.test(bullet[1]) ? bullet[1] : "•"}</span>
                    <span className="flex-1">{renderInline(trimmed.slice(bullet[0].length), i)}</span>
                </div>
            );
        }
        return <p key={i} className="my-0.5">{renderInline(trimmed, i)}</p>;
    });

    const productCards = (products) => (
        <div className="mt-2 -mx-1 px-1 flex gap-2.5 overflow-x-auto pb-1 snap-x">
            {products.map(p => {
                const hasDiscount = p.originalPrice > p.price;
                const outOfStock = p.stock !== undefined && p.stock <= 0;
                return (
                    <div key={p.id}
                         className="snap-start flex-shrink-0 w-36 bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden shadow-sm">
                        <button type="button" onClick={() => closeAndGo(`/product/${p.id}`)} className="block w-full text-left">
                            <div className="relative h-32 bg-gray-100 dark:bg-gray-800">
                                {p.imageData && <img src={imageSrc(p.imageData)} alt={p.name} loading="lazy"
                                                     className="w-full h-full object-cover object-top"/>}
                                {hasDiscount && (
                                    <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
                                        -{p.discountPercent}%
                                    </span>
                                )}
                                {outOfStock && (
                                    <span className="absolute bottom-1.5 left-1.5 bg-gray-900/80 text-white text-[11px] px-1.5 py-0.5 rounded">Out of stock</span>
                                )}
                            </div>
                            <div className="px-2 pt-1.5">
                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug">{p.name}</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                                    ৳{Number(p.price).toLocaleString("en-IN")}
                                    {hasDiscount && <span className="ml-1 text-[11px] font-normal text-gray-400 line-through">৳{Number(p.originalPrice).toLocaleString("en-IN")}</span>}
                                </p>
                            </div>
                        </button>
                        <div className="p-2 pt-1.5">
                            <button type="button" disabled={outOfStock}
                                    onClick={async () => {
                                        const r = await addToCart(p.id, 1);
                                        if (r?.success) toast.success("Added to cart!");
                                        else if (!r?.deactivated) toast.error(r?.error || "Could not add to cart");
                                    }}
                                    className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white text-xs font-semibold">
                                <ShoppingCart className="w-3.5 h-3.5"/> {outOfStock ? "Sold out" : "Add"}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const visible = messages.filter(m => !m.hidden);
    const showQuickReplies = !loading && visible.length <= 1;

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
            {isOpen && (
                <div
                    className="mb-3 w-[calc(100vw-2rem)] sm:w-[400px] h-[min(640px,calc(100vh-7rem))] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden animate-fadeIn"
                    role="dialog" aria-label="ShopSpot assistant">
                    {/* Header */}
                    <div className="relative bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 px-3.5 py-3.5 flex items-center gap-2.5 text-white">
                        <div className="relative">
                            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                                <Bot className="w-6 h-6"/>
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-300 border-2 border-emerald-600 rounded-full"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold leading-tight flex items-center gap-1.5 whitespace-nowrap">
                                <span className="truncate">ShopSpot AI</span>
                                <Sparkles className="w-3.5 h-3.5 text-yellow-200 flex-shrink-0"/>
                            </p>
                            <p className="text-xs text-emerald-50/90">
                                {listening ? "Listening… speak now" : loading ? "Typing…" : "Online · AI powered"}
                            </p>
                        </div>
                        {canSpeak && (
                            <button onClick={() => setShowVoiceSettings(o => !o)} title="Choose voice"
                                    aria-label="Voice settings" aria-expanded={showVoiceSettings}
                                    className={`p-2 rounded-full transition-colors ${showVoiceSettings ? "bg-white text-emerald-700" : "hover:bg-white/20"}`}>
                                <Settings2 className="w-4 h-4"/>
                            </button>
                        )}
                        {canSpeak && (
                            <button onClick={toggleAutoSpeak} title={autoSpeak ? "Voice replies on" : "Voice replies off"}
                                    aria-label="Toggle voice replies" aria-pressed={autoSpeak}
                                    className={`p-2 rounded-full transition-colors ${autoSpeak ? "bg-white text-emerald-700" : "hover:bg-white/20"}`}>
                                {autoSpeak ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
                            </button>
                        )}
                        <button onClick={resetChat} title="New chat" aria-label="Start a new chat"
                                className="p-2 rounded-full hover:bg-white/20 transition-colors">
                            <RotateCcw className="w-4 h-4"/>
                        </button>
                        <button onClick={() => setIsOpen(false)} aria-label="Close chat"
                                className="p-2 rounded-full hover:bg-white/20 transition-colors">
                            <X className="w-4 h-4"/>
                        </button>
                    </div>

                    {/* Voice picker */}
                    {showVoiceSettings && (
                        <div className="px-4 py-3 bg-emerald-50 dark:bg-gray-900 border-b border-emerald-100 dark:border-gray-700 text-sm">
                            <label htmlFor="chat-voice" className="block font-semibold text-gray-800 dark:text-gray-100 mb-1.5">Assistant voice</label>
                            <select id="chat-voice" value={voiceName} onChange={e => chooseVoice(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:border-emerald-500">
                                <option value="">Automatic (female voice)</option>
                                {voices.map(v => (
                                    <option key={v.name} value={v.name}>
                                        {v.name.replace(/^(Microsoft|Google) /, "")} · {/^bn/i.test(v.lang) ? "Bangla" : v.lang}{isFemale(v) ? " · female" : ""}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                Picking a voice plays a short sample. Voices come from your device; Bangla replies
                                use a Bangla voice when one is installed.
                            </p>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                        {visible.map((msg, index) => {
                            const realIndex = messages.indexOf(msg);
                            const isUser = msg.role === "user";
                            return (
                                <div key={index} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
                                    {!isUser && (
                                        <div className="w-7 h-7 mt-0.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center flex-shrink-0">
                                            <Bot className="w-4 h-4 text-white"/>
                                        </div>
                                    )}
                                    <div className={`min-w-0 ${isUser ? "max-w-[80%]" : "max-w-[85%]"}`}>
                                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${isUser
                                            ? "bg-emerald-600 text-white rounded-br-md"
                                            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm rounded-bl-md"}`}>
                                            {isUser ? msg.content : renderContent(msg.content)}
                                        </div>
                                        {!isUser && msg.products?.length > 0 && productCards(msg.products)}
                                        {!isUser && canSpeak && index > 0 && (
                                            <button
                                                onClick={() => (speakingIndex === realIndex ? stopSpeaking() : speak(msg.content, realIndex))}
                                                className="mt-1 ml-1 inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
                                                {speakingIndex === realIndex
                                                    ? <><Square className="w-3 h-3"/> Stop</>
                                                    : <><Volume2 className="w-3 h-3"/> Listen</>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="flex gap-2 items-end">
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white"/>
                                </div>
                                <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm flex gap-1">
                                    {[0, 150, 300].map(d => (
                                        <span key={d} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: `${d}ms`}}/>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showQuickReplies && (
                            <div className="flex flex-wrap gap-2 pl-9">
                                {QUICK_REPLIES.map(q => (
                                    <button key={q.label} onClick={() => send(q.text)}
                                            className="px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-700 bg-white dark:bg-gray-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors">
                                        {q.label}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef}/>
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        {listening && (
                            <div className="flex items-center gap-2 mb-2 px-1 text-xs text-red-500 font-medium">
                                <span className="relative flex w-2.5 h-2.5">
                                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping"/>
                                    <span className="relative w-2.5 h-2.5 rounded-full bg-red-500"/>
                                </span>
                                Listening ({voiceLang === "bn" ? "বাংলা" : "English"})… tap ■ when you finish
                            </div>
                        )}
                        <div className="flex items-end gap-2">
                            <div className="flex-1 flex items-end gap-1 bg-gray-100 dark:bg-gray-700 rounded-2xl pl-3.5 pr-1.5 py-1.5 border border-transparent focus-within:border-emerald-500 transition-colors">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            send(input);
                                        }
                                    }}
                                    placeholder={listening ? "Listening…" : "Ask anything…"}
                                    rows={1}
                                    maxLength={1000}
                                    disabled={loading}
                                    aria-label="Message"
                                    className="flex-1 bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none resize-none max-h-28 py-1.5"
                                    style={{height: "auto"}}
                                    onInput={e => {
                                        e.target.style.height = "auto";
                                        e.target.style.height = `${Math.min(e.target.scrollHeight, 112)}px`;
                                    }}
                                />
                                {SpeechRecognition && (
                                    <>
                                        <button type="button" onClick={changeVoiceLang} title="Voice input language"
                                                className="mb-0.5 px-1.5 py-1 rounded-lg text-[11px] font-bold text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600">
                                            {voiceLang === "bn" ? "বাং" : "EN"}
                                        </button>
                                        <button type="button" onClick={toggleListening}
                                                aria-label={listening ? "Stop listening" : "Speak your question"}
                                                title={listening ? "Stop" : "Speak"}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${listening
                                                    ? "bg-red-500 text-white animate-pulse"
                                                    : "text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-gray-600"}`}>
                                            {listening ? <Square className="w-4 h-4"/> : <Mic className="w-5 h-5"/>}
                                        </button>
                                    </>
                                )}
                            </div>
                            <button onClick={() => send(input)} disabled={!input.trim() || loading} aria-label="Send"
                                    className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-md transition-all">
                                <Send className="w-4 h-4"/>
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">AI can make mistakes. Check prices on the product page.</p>
                    </div>
                </div>
            )}

            {/* Launcher */}
            <div className="relative flex justify-end">
                {showTooltip && !isOpen && (
                    <div className="hidden sm:block absolute bottom-3 right-full mr-3 animate-fadeIn">
                        <div className="bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-xl whitespace-nowrap shadow-lg">
                            Need help? Ask me or talk to me 🎤
                        </div>
                    </div>
                )}
                <button
                    onClick={() => {
                        setIsOpen(o => !o);
                        setShowTooltip(false);
                    }}
                    aria-label={isOpen ? "Close chat" : "Open chat assistant"}
                    className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/30 flex items-center justify-center hover:scale-105 transition-transform"
                >
                    {!isOpen && <span className="absolute inset-0 rounded-2xl bg-emerald-400 opacity-30 animate-ping"/>}
                    {isOpen ? <X className="w-6 h-6 relative"/> : <Bot className="w-7 h-7 relative"/>}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
