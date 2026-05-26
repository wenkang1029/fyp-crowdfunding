import axiosInstance from '../api/axios';

const FALLBACK_MESSAGE = "I'm not sure about that yet. Try asking about active campaigns, donations, receipts, or contact details.";

const FAQ_RESPONSES = [
    {
        intent: 'Donation Process',
        patterns: [/how\s+to\s+donat/i, /donation\s+process/i, /how\s+do\s+i\s+donat/i],
        response: 'You can donate from any campaign page. Choose an amount, confirm, and complete the checkout flow. A receipt is generated after success.',
    },
    {
        intent: 'Payment Methods',
        patterns: [/payment\s+method/i, /how\s+can\s+i\s+pay/i, /credit\s*card/i],
        response: 'We support secure online payments. If you hit an issue, please contact the admin for assistance.',
    },
    {
        intent: 'Receipt',
        patterns: [/receipt/i, /download\s+receipt/i, /proof\s+of\s+donation/i],
        response: 'Receipts are available from your donor dashboard after a successful donation.',
    },
    {
        intent: 'Contact',
        patterns: [/contact/i, /support/i, /help\s+desk/i],
        response: 'You can reach the admin via the contact details listed on the campaign page or dashboard.',
    },
    {
        intent: 'Refund',
        patterns: [/refund/i, /cancel\s+donation/i],
        response: 'Refunds are handled by the admin on a case-by-case basis. Please reach out with your donation details.',
    },
    {
        intent: 'Get Active Campaigns',
        patterns: [/active\s+campaign/i, /current\s+campaign/i, /campaigns\s+to\s+donat/i],
        response: null,
    },
];

const resolveFaqMatch = (message) => {
    const trimmed = message.trim();
    if (!trimmed) return null;

    return FAQ_RESPONSES.find((faq) => faq.patterns.some((pattern) => pattern.test(trimmed))) || null;
};

const requestActiveCampaigns = async () => {
    const response = await axiosInstance.post('/chatbot/webhook', {
        queryResult: {
            intent: {
                displayName: 'Get Active Campaigns',
            },
        },
    });

    return response?.data?.fulfillmentText || FALLBACK_MESSAGE;
};

export const sendChatbotMessage = async (message) => {
    const faqMatch = resolveFaqMatch(message);

    if (!faqMatch) {
        return FALLBACK_MESSAGE;
    }

    if (faqMatch.intent === 'Get Active Campaigns') {
        return requestActiveCampaigns();
    }

    return faqMatch.response || FALLBACK_MESSAGE;
};

export const getChatbotSuggestions = () => [
    'Show active campaigns',
    'How do I donate?',
    'Where is my receipt?',
    'Payment methods',
    'Contact support',
];
