import axios from "axios";

const baseURL = "http://localhost:8000/";

const apipublic = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const PublicApiService = {
  registerAdmin: (userData) => apipublic.post("users/register-admin/", userData),

  verifyAdmin: (email, code) => apipublic.post("users/verify-admin/", { email, code }),

  login: (credentials) => apipublic.post("users/login/", credentials),

  getUserByToken: (email, token) =>
    apipublic.get("users/get-user-by-token/", { params: { email, token } }),

  completeRegistration: (userData) => apipublic.post("users/complete-registration/", userData),
};

export default PublicApiService;
