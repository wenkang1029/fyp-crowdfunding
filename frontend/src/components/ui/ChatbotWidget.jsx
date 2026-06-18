import React, { useEffect, useRef } from 'react';
import { MessageCircle, X, SendHorizontal } from 'lucide-react';
import { useChatbot } from '../../hooks/useChatbot';

const ChatbotWidget = () => {
    const {
        messages,
        isOpen,
        isSending,
        input,
        error,
        suggestions,
        toggleOpen,
        handleInputChange,
        handleSubmit,
        handleSuggestionClick,
    } = useChatbot();

    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="w-[320px] sm:w-[360px] h-[500px] max-h-[75vh] flex flex-col bg-white rounded-2xl shadow-apple border border-aidwise-border overflow-hidden mb-4">
                    <div className="flex items-center justify-between px-4 py-3 bg-aidwise-blue text-white flex-shrink-0">
                        <div>
                            <p className="text-sm font-semibold">AidWise Assistant</p>
                            <p className="text-[11px] text-blue-100">FAQ help for donors</p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleOpen}
                            className="p-1 rounded-full hover:bg-white/10"
                            aria-label="Close chatbot"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-aidwise-light">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`px-3 py-2 rounded-2xl text-sm max-w-[240px] shadow-sm ${
                                        message.role === 'user'
                                            ? 'bg-aidwise-blue text-white rounded-br-sm'
                                            : 'bg-white text-aidwise-text border border-aidwise-border rounded-bl-sm'
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                        {isSending && (
                            <div className="flex justify-start">
                                <div className="px-3 py-2 rounded-2xl text-sm max-w-[240px] bg-white text-aidwise-text border border-aidwise-border">
                                    Typing...
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-3 border-t border-aidwise-border bg-white flex-shrink-0">
                        {error && (
                            <p className="text-xs text-red-500 mb-2">
                                {error}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="text-[11px] px-3 py-1.5 rounded-full border border-aidwise-border text-gray-600 hover:bg-aidwise-light"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(event) => handleInputChange(event.target.value)}
                                placeholder="Type your question..."
                                className="flex-1 rounded-xl border border-aidwise-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aidwise-blue"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isSending}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-aidwise-blue text-white disabled:opacity-60"
                                aria-label="Send message"
                            >
                                <SendHorizontal size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={toggleOpen}
                className="h-12 w-12 rounded-full bg-aidwise-blue text-white flex items-center justify-center shadow-lg hover:shadow-xl"
                aria-label="Open chatbot"
            >
                <MessageCircle size={22} />
            </button>
        </div>
    );
};

export default ChatbotWidget;
