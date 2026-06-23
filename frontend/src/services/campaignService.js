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

export const getNgoCampaignDetails = async (campaignId) => {
    const response = await axiosInstance.get(`/ngo/campaigns/${campaignId}`);
    return extractData(response);
};

export const createCampaign = async (payload) => {
    const response = await axiosInstance.post('/campaigns', payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return extractData(response);
};

export const updateCampaign = async (campaignId, payload) => {
    if (payload instanceof FormData) {
        payload.append('_method', 'PATCH');
        const response = await axiosInstance.post(`/campaigns/${campaignId}`, payload, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return extractData(response);
    }
    const response = await axiosInstance.patch(`/campaigns/${campaignId}`, payload);
    return extractData(response);
};

export const deleteCampaign = async (campaignId) => {
    const response = await axiosInstance.delete(`/campaigns/${campaignId}`);
    return extractData(response);
};

export const downloadCampaignReport = async (campaignId) => {
    const response = await axiosInstance.get(`/campaigns/${campaignId}/reports/summary`, {
        responseType: 'blob',
    });

    const disposition = response.headers?.['content-disposition'] || '';
    const filenameMatch = /filename="?([^";]+)"?/i.exec(disposition);
    const filename = filenameMatch?.[1] || `campaign_report_${campaignId}.pdf`;

    return {
        blob: response.data,
        filename,
    };
};

