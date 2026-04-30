import axiosInstance from '../api/axios';

const extractData = (response) => {
    if (response?.data?.data !== undefined) {
        return response.data.data;
    }

    return response?.data;
};

export const getCampaigns = async () => {
    const response = await axiosInstance.get('/campaigns');
    return extractData(response);
};

export const getCampaignById = async (campaignId) => {
    const response = await axiosInstance.get(`/campaigns/${campaignId}`);
    return extractData(response);
};

export const createCampaign = async (payload) => {
    const response = await axiosInstance.post('/campaigns', payload);
    return extractData(response);
};

export const updateCampaign = async (campaignId, payload) => {
    const response = await axiosInstance.patch(`/campaigns/${campaignId}`, payload);
    return extractData(response);
};

export const deleteCampaign = async (campaignId) => {
    const response = await axiosInstance.delete(`/campaigns/${campaignId}`);
    return extractData(response);
};
