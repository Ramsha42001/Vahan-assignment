import { createSlice } from '@reduxjs/toolkit';
import { connectWebSocket, disconnectWebSocket } from './webSocketApi';

const initialState = {
    isConnected: false,
    messages: [],
    error: null,
};

const webSocketSlice = createSlice({
    name: 'webSocket',
    initialState,
    reducers: {
        connect(state) {
            state.isConnected = true;
            state.error = null;
        },
        disconnect(state) {
            state.isConnected = false;
        },
        messageReceived(state, action) {
            state.messages.push(action.payload);
        },
        setError(state, action) {
            state.error = action.payload;
        },
    },
});

export const { connect, disconnect, messageReceived, setError } = webSocketSlice.actions;

export const websocketConnect = (url) => async (dispatch) => {
    try {
        dispatch(connectWebSocket(url));    
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export const websocketDisconnect = () => async (dispatch) => {
    try {
        dispatch(disconnectWebSocket());
    } catch (error) {
        dispatch(setError(error.message));
    }
};

export default webSocketSlice.reducer;
