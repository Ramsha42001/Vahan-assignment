import network from '../../../services/network';

export const fetchMetricsApi = async () => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token'); // Changed from 'access' to 'token'
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await network.get('/api/metrics', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Metrics API Response:', response);
    return response.data;
    
  } catch (error) {
    console.error("Metrics API Error:", error);
    if (error.response?.status === 401) {
      // Handle unauthorized error - you might want to redirect to login
      localStorage.removeItem('token'); // Clear invalid token
      window.location.href = '/auth/login'; // Redirect to login page
    }
    throw error;
  }
};



