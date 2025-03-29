import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
    baseURL: "https://vahan-server-410805250566.us-central1.run.app",
    // timeout: 5000,
    headers: {
    },
});

// Add a request interceptor to add auth token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) =>{
        const navigate = useNavigate();

        if(error.response.status === 401){
            localStorage.removeItem('token');
            navigate('/auth/login');
        }

        Promise.reject(error)

    } 

);

export default api;
