import axiosInstance from '../api/axios';

const extractData = (response) => {
    if (response?.data?.data !== undefined) {
        return response.data.data;
    }

    return response?.data;
};

export const createAllocation = async (campaignId, payload) => {
    const response = await axiosInstance.post(`/campaigns/${campaignId}/allocations`, payload);
    return extractData(response);
};

export const updateAllocation = async (campaignId, allocationId, payload) => {
    const response = await axiosInstance.patch(`/campaigns/${campaignId}/allocations/${allocationId}`, payload);
    return extractData(response);
};
