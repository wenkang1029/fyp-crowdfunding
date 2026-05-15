import React from 'react';

const Badge = ({ status }) => {
    // Determine styles based on the status string
    const getVariantStyles = (statusText) => {
        const normalized = statusText?.toLowerCase();
        switch (normalized) {
            case 'approved':
            case 'active':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'completed':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'pending':
            default:
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    return (
        <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${getVariantStyles(status)}`}>
            {status || 'Pending'}
        </span>
    );
};

export default Badge;