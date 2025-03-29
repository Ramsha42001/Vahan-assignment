import { createSlice } from '@reduxjs/toolkit';
import { fetchMetricsApi } from './metricApi';

const initialState = {
    metrics: [],
    loading: false,
    error: null,
};

const metricsSlice = createSlice({
    name: 'metrics',
    initialState,
    reducers: {
        fetchMetricsRequest(state) {
            state.loading = true;
            state.error = null;
        },
        fetchMetricsSuccess(state, action) {
            state.metrics = action.payload;
            state.loading = false;
        },
        fetchMetricsFailure(state, action) {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const { fetchMetricsRequest, fetchMetricsSuccess, fetchMetricsFailure } = metricsSlice.actions;

export const fetchMetrics = () => async (dispatch) => {
    dispatch(fetchMetricsRequest());
    try {
        const data = await fetchMetricsApi();
        dispatch(fetchMetricsSuccess(data));
    } catch (error) {
        dispatch(fetchMetricsFailure(error.message));
    }
};

export default metricsSlice.reducer;
