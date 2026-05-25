import { useCallback, useState } from 'react';
import { downloadDonationReceipt } from '../services/donationService';

export const useDonationReceipt = () => {
    const [isDownloadingId, setIsDownloadingId] = useState(null);
    const [error, setError] = useState('');

    const requestReceipt = useCallback(async (donationId) => {
        setError('');
        setIsDownloadingId(donationId);

        try {
            const { blob, filename } = await downloadDonationReceipt(donationId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to download receipt.');
        } finally {
            setIsDownloadingId(null);
        }
    }, []);

    return {
        isDownloadingId,
        error,
        requestReceipt,
        clearError: () => setError(''),
    };
};
