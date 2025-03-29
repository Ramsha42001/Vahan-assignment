import { createSlice } from '@reduxjs/toolkit';
import { loginApi, signupApi } from './authApi';



const initialState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    token: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginRequest(state) {
            state.loading = true;
            state.error = null;
        },
        loginSuccess(state, action) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.loading = false;
        },
        loginFailure(state, action) {
            state.error = action.payload;
            state.loading = false;
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
            window.location.href='/'
        },
        signupRequest(state) {
            state.loading = true;
            state.error = null;
        },
        signupSuccess(state, action) {
            state.user = action.payload;
            state.loading = false;
        },
        signupFailure(state, action) {
            state.error = action.payload;
            state.loading = false;
        },   
    },
});

export const { loginRequest, loginSuccess, loginFailure, logout,signupRequest,signupSuccess,signupFailure} = authSlice.actions;

export const login = (credentials) => async (dispatch) => {
    dispatch(loginRequest());
    try {
        const user = await loginApi(credentials);
        dispatch(loginSuccess(user));
        console.log(user);
        localStorage.setItem('token', user.access_token);
        localStorage.setItem('email', credentials.email)
      
    } catch (error) {
        dispatch(loginFailure(error.message));
    }
};

export const logoutFunction = () => async (dispatch) => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    dispatch(logout());

}

export const signup = (credentials) => async (dispatch) => {
    dispatch(signupRequest());
    try {
        const user = await signupApi(credentials);
        dispatch(signupSuccess(user));
    } catch (error) {
        dispatch(signupFailure(error.message));
    }
};


export default authSlice.reducer;
