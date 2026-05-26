import { useMemo, useState } from 'react';
import { sendChatbotMessage, getChatbotSuggestions } from '../services/chatbotService';

const buildMessage = (role, text) => ({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
    timestamp: new Date().toISOString(),
});

export const useChatbot = () => {
    const [messages, setMessages] = useState([
        buildMessage('bot', 'Hi! I can help with donation FAQs and active campaigns. Ask me anything.'),
    ]);
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const suggestions = useMemo(() => getChatbotSuggestions(), []);

    const toggleOpen = () => setIsOpen((prev) => !prev);

    const handleInputChange = (value) => {
        setInput(value);
        setError('');
    };

    const appendMessage = (role, text) => {
        setMessages((prev) => [...prev, buildMessage(role, text)]);
    };

    const sendMessage = async (text) => {
        const trimmed = text.trim();
        if (!trimmed || isSending) return;

        appendMessage('user', trimmed);
        setInput('');
        setIsSending(true);
        setError('');

        try {
            const responseText = await sendChatbotMessage(trimmed);
            appendMessage('bot', responseText);
        } catch (err) {
            setError('Unable to reach the chatbot right now. Please try again.');
            appendMessage('bot', 'Sorry, I could not fetch a response. Please try again later.');
        } finally {
            setIsSending(false);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        sendMessage(input);
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion);
    };

    return {
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
    };
};
