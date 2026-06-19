import axiosInstance from '../api/axios';

export const getNotifications = async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
};

export const markAsRead = async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
};

export const markAllAsRead = async () => {
    const response = await axiosInstance.patch('/notifications/read-all');
    return response.data;
};
