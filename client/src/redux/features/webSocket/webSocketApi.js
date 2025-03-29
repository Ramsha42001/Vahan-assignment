import { createSlice } from '@reduxjs/toolkit';
import network from '../../../services/network';

const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState: {
    isConnected: false,
    messages: [],
    error: null,
  },
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

// WebSocket API functions
export const connectWebSocket = (url) => async (dispatch) => {
  try {
    const socket = new WebSocket(url);
    socket.onopen = () => {
      dispatch(connect());
    };
    socket.onmessage = (event) => {
      dispatch(messageReceived(event.data));
    };
    socket.onerror = (error) => {
      dispatch(setError(error.message));
    };
    socket.onclose = () => {
      dispatch(disconnect());
    };
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const disconnectWebSocket = () => async (dispatch) => {
  try {
    // Logic to close WebSocket connection
    dispatch(disconnect());
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export default webSocketSlice.reducer;
