import API from "../api/api";

export const registerUser = (email, password) => {
    return API.post("/auth/register", null, {
        params: { email, password },
    });
};

export const loginUser = async (email, password) => {
    const res = await API.post("/auth/login", null, {
        params: { email, password },
    });

    const token = res.data.access_token;
    localStorage.setItem("token", token);

    return res.data;
};

export const logout = () => {
    localStorage.removeItem("token");
};

export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};