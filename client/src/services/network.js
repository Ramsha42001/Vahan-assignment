import api from './apiConfig';

const get = (url) => api.get(url);
const post = (url, data) => api.post(url, data);
const put = (url, data) => api.put(url, data);
const del = (url) => api.delete(url);

export default { get, post, put, del };
