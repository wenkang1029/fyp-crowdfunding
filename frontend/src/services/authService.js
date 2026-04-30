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
