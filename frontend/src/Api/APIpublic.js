import axios from "axios";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "http://django:8000";

const apipublic = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const PublicApiService = {
  registerAdmin: (userData) => apipublic.post("users/register/admin/", userData),


  verifyAdmin: (email, code) => apipublic.post("users/verify-admin/", { email, code }),

  login: (credentials) => apipublic.post("users/login/", credentials),

  getUserByToken: (email, token) =>
    apipublic.get("users/get-user-by-token/", { params: { email, token } }),

  completeRegistration: (userData) => apipublic.post("users/complete-registration/", userData),

  forgotPassword: (email) => apipublic.post("users/forgot-password/", { email }),

  resetPassword: ({ email, code, new_password, confirm_password }) =>
    apipublic.post("users/reset-password/", {
      email,
      code,
      new_password,
      confirm_password,
    }),


};

export default PublicApiService;

