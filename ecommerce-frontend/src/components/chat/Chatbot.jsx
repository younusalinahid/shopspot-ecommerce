import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { chatApi } from "../../api/chatApi";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi! 👋 I'm ShopSpot's AI assistant. How can I help you today?"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        let cartTimer = null;
        let lastAddedProduct = "";

        const handleCartTrigger = (event) => {
            const addedProductName = event.detail.productName;
            lastAddedProduct = addedProductName;

            if (cartTimer) {
                clearTimeout(cartTimer);
            }

            cartTimer = setTimeout(async () => {
                setIsOpen(true);
                setLoading(true);

                setMessages(prev => [...prev, {
                    role: "user",
                    content: `🛒 Added items to cart!`
                }]);

                const systemTriggerMessage = {
                    role: "user",
                    content: `SYSTEM_CART_TRIGGER:${lastAddedProduct}`
                };

                try {
                    const response = await chatApi.sendMessage([systemTriggerMessage]);
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: response.message
                    }]);
                } catch {
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: "Could not fetch suggestions right now. 😔"
                    }]);
                } finally {
                    setLoading(false);
                }
            }, 5000);
        };

        window.addEventListener("cartItemAdded", handleCartTrigger);

        return () => {
            window.removeEventListener("cartItemAdded", handleCartTrigger);
            if (cartTimer) clearTimeout(cartTimer);
        };
    }, []);

    const renderMessageContent = (content) => {
        const regex = /\[([^\]]+)\]\(search:([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(content)) !== null) {
            if (match.index > lastIndex) {
                parts.push(content.substring(lastIndex, match.index));
            }

            const linkText = match[1];
            const searchKeyword = match[2];

            parts.push(
                <Link
                    key={match.index}
                    to={`/search?q=${encodeURIComponent(searchKeyword.trim())}`}
                    className="inline-flex items-center gap-1.5 mx-1 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-sm transition-all text-xs"
                    onClick={() => setIsOpen(false)}
                >
                    {linkText}
                    <ExternalLink className="w-3.5 h-3.5" />
                </Link>
            );

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < content.length) {
            parts.push(content.substring(lastIndex));
        }

        return parts.length > 0 ? parts : content;
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: "user", content: input.trim() };
        const updatedMessages = [...messages, userMessage];

        setMessages(updatedMessages);
        setInput("");
        setLoading(true);

        try {
            const response = await chatApi.sendMessage(updatedMessages);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: response.message
            }]);
        } catch {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Sorry, something went wrong. Please try again! 😔"
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                     style={{ height: "500px" }}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">ShopSpot Assistant</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <p className="text-white/80 text-xs">Online</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, i) => (
                            <div key={i}
                                 className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                                {/* Avatar */}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                                    ${msg.role === "user"
                                    ? "bg-cyan-500"
                                    : "bg-gradient-to-br from-blue-500 to-cyan-500"}`}>
                                    {msg.role === "user"
                                        ? <User className="w-4 h-4 text-white" />
                                        : <Bot className="w-4 h-4 text-white" />
                                    }
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                                    ${msg.role === "user"
                                    ? "bg-cyan-500 text-white rounded-br-sm"
                                    : "bg-white text-gray-700 shadow-sm rounded-bl-sm"}`}>
                                    {msg.role === "assistant" ? renderMessageContent(msg.content) : msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Loading */}
                        {loading && (
                            <div className="flex items-end gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-cyan-400 transition">
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                rows={1}
                                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="w-8 h-8 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 rounded-lg flex items-center justify-center transition flex-shrink-0"
                            >
                                {loading
                                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                    : <Send className="w-4 h-4 text-white" />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110
                    ${isOpen
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"}`}
            >
                {isOpen
                    ? <X className="w-6 h-6 text-white" />
                    : <MessageCircle className="w-6 h-6 text-white" />
                }
            </button>
        </div>
    );
};

export default Chatbot;