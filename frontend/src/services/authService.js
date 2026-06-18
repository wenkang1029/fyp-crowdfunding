import axiosInstance from '../api/axios';

const extractData = (response) => {
    if (response?.data?.data !== undefined) {
        return response.data.data;
    }

    return response?.data;
};

export const loginUser = async (credentials) => {
    const response = await axiosInstance.post('/login', credentials);
    const data = extractData(response);

    return {
        user: data?.user ?? null,
        token: data?.token ?? null,
        message: response?.data?.message ?? 'Login successful',
    };
};

export const logoutUser = async () => {
    const response = await axiosInstance.post('/logout');
    return extractData(response);
};

export const getAuthenticatedUser = async () => {
    const response = await axiosInstance.get('/user');
    const data = extractData(response);

    return data?.user ?? data;
};

export const registerUser = async (payload) => {
    const response = await axiosInstance.post('/register', payload);
    return extractData(response);
};

export const updateProfile = async (payload) => {
    const response = await axiosInstance.patch('/profile', payload);
    return extractData(response);
};

export const getAllUsers = async () => {
    const response = await axiosInstance.get('/admin/users');
    return extractData(response);
};

export const updateUserStatus = async (userId, status) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/status`, { status });
    return extractData(response);
};

export const deleteUser = async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return extractData(response);
};

export const adminCreateUser = async (payload) => {
    const response = await axiosInstance.post('/admin/users', payload);
    return extractData(response);
};
