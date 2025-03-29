import network from '../../../services/network';

export const loginApi = async (credentials) => {
  try {
    const response = await network.post('/api/login', credentials);
    console.log(response);
    
    // Store user access directly in localStorage
    localStorage.setItem('access', JSON.stringify(response.data.user_access));
    localStorage.setItem('user_id', response.data.user_id)
   
    console.log(response.data.user_access);
    return response.data;
    
  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
};

export const signupApi = async (userData) => {
  try {
    const response = await network.post('/api/signup', userData);
    return response.data;
  } catch (error) {
    console.error("Signup API Error:", error);
    throw error;
  }
};
