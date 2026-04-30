import axiosInstance from '../api/axios';

const extractData = (response) => {
    if (response?.data?.data !== undefined) {
        return response.data.data;
    }

    return response?.data;
};

export const getNgoDashboard = async () => {
    const response = await axiosInstance.get('/dashboard/ngo');
    return extractData(response);
};

export const getAdminDashboard = async () => {
    const response = await axiosInstance.get('/dashboard/admin');
    return extractData(response);
};
