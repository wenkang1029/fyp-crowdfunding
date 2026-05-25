import axiosInstance from '../api/axios';

const extractData = (response) => {
    if (response?.data?.data !== undefined) {
        return response.data.data;
    }

    return response?.data;
};

export const getDonations = async () => {
    const response = await axiosInstance.get('/donations');
    return extractData(response);
};

export const createDonation = async (payload) => {
    const response = await axiosInstance.post('/donations', payload);
    return extractData(response);
};

export const downloadDonationReceipt = async (donationId) => {
    const response = await axiosInstance.get(`/donations/${donationId}/receipt`, {
        responseType: 'blob',
    });

    const disposition = response.headers?.['content-disposition'] || '';
    const filenameMatch = /filename="?([^";]+)"?/i.exec(disposition);
    const filename = filenameMatch?.[1] || `donation_receipt_${donationId}.pdf`;

    return {
        blob: response.data,
        filename,
    };
};
