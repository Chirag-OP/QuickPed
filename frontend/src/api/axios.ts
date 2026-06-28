import axios from 'axios';
export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qp_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
            localStorage.removeItem('qp_auth_token');
      localStorage.removeItem('qp_user_profile');
                  window.dispatchEvent(new Event('unauthorized_redirect'));
    }
    return Promise.reject(error);
  }
);
export default api;
