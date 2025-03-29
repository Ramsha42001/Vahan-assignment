import { createSlice } from '@reduxjs/toolkit';
import { createDocumentApi, listDocumentsApi, deleteDocumentApi } from './documentApi';

const initialState = {
    document: null,
    documents: [],
    loading: false,
    isLoading: false, // New state for background loading
    error: null,
};

const documentSlice = createSlice({
    name: 'document',
    initialState,
    reducers: {
        // Existing reducers
        createDocumentRequest(state) {
            state.loading = true;
            state.error = null;
        },
        createDocumentSuccess(state, action) {
            state.document = action.payload;
            state.loading = false;
        },
        createDocumentFailure(state, action) {
            state.error = action.payload;
            state.loading = false;
        },

        listDocumentsRequest(state) {
            state.loading = true;
            state.error = null;
        },
        listDocumentsSuccess(state, action) {
            state.documents = action.payload;
            state.loading = false;
        },
        listDocumentsFailure(state, action) {
            state.error = action.payload;
            state.loading = false;
        },

        deleteDocumentRequest(state) {
            state.loading = true;
            state.error = null;
        },
        deleteDocumentSuccess(state, action) {
           
            state.loading = false;
        },
        deleteDocumentFailure(state, action) {
            state.error = action.payload;
            state.loading = false;
        },

        // New reducer for background loading state
        setLoading(state, action) {
            state.isLoading = action.payload;
        },
    },
});

export const {
    createDocumentRequest,
    createDocumentSuccess,
    createDocumentFailure,
    listDocumentsRequest,
    listDocumentsSuccess,
    listDocumentsFailure,
    deleteDocumentRequest,
    deleteDocumentSuccess,
    deleteDocumentFailure,
    setLoading, // Export the new action
} = documentSlice.actions;

// Existing async thunks
export const createDocument = (params) => async (dispatch) => {
   const {documentData,token} = params;
    console.log(documentData)
    dispatch(createDocumentRequest());
    try {
        const documentResponse = await createDocumentApi(documentData,token);
        dispatch(createDocumentSuccess(documentResponse));
    } catch (error) {
        dispatch(createDocumentFailure(error.message));
    }
};

export const listDocuments = (email) => async (dispatch) => {
    dispatch(listDocumentsRequest());
    try {
        const token = localStorage.getItem('token');
        const documentsResponse = await listDocumentsApi(email, token);
        dispatch(listDocumentsSuccess(documentsResponse));
    } catch (error) {
        dispatch(listDocumentsFailure(error.message));
        if(error.message.includes('401')){
            localStorage.removeItem('token');
            window.location.href = '/auth/login';
        }
    }
};

export const deleteDocument = (filename) => async (dispatch) => {
    console.log('Delete document action triggered for:', filename); // Debug log
    dispatch(deleteDocumentRequest());
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        await deleteDocumentApi(filename, token);
        dispatch(deleteDocumentSuccess(filename));
        return true; // Indicate success
    } catch (error) {
        console.error('Delete document error:', error);
        dispatch(deleteDocumentFailure(error.message));
        throw error;
    }
};

export default documentSlice.reducer;