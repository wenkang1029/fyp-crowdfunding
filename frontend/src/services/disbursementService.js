import axiosInstance from '../api/axios';

const extractData = (response) => {
    if (response?.data?.data !== undefined) {
        return response.data.data;
    }

    return response?.data;
};

export const getNgoDisbursementDashboard = async () => {
    const response = await axiosInstance.get('/dashboard/ngo/disbursements');
    return extractData(response);
};

export const getAdminDisbursements = async () => {
    const response = await axiosInstance.get('/admin/disbursements');
    return extractData(response);
};

export const createDisbursement = async (campaignId, payload) => {
    const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await axiosInstance.post(`/campaigns/${campaignId}/disbursements`, payload, { headers });
    return extractData(response);
};

export const updateDisbursementStatus = async (disbursementId, payload) => {
    const response = await axiosInstance.patch(`/admin/disbursements/${disbursementId}/status`, payload);
    return extractData(response);
};
