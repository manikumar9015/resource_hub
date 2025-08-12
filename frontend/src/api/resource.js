// frontend/src/api/resource.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/resources/';

const upload = (formData, token) => {
  return axios.post(API_URL + 'upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`,
    },
  });
};

const getAll = (searchTerm = '') => {
  // Now, this function takes the searchTerm and correctly adds it
  // as a query parameter to the URL.
  return axios.get(`${API_URL}?search=${searchTerm}`);
};

const getById = (id, token) => {
  return axios.get(API_URL + id, {
    headers: {
      // Use token if provided (for protected details), otherwise public
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
};

// --- ADDED NEW FUNCTIONS ---

// Get all comments for a specific resource
const getComments = (resourceId) => {
  return axios.get(`${API_URL}${resourceId}/comments`);
};

// Add a new comment to a resource
const addComment = (resourceId, message, token) => {
  return axios.post(`${API_URL}${resourceId}/comments`, { message }, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
};

// Rate a resource
const rate = (resourceId, rating, token) => {
  return axios.post(`${API_URL}${resourceId}/ratings`, { rating }, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
};

// Get all resources uploaded by the current user
const getMyResources = (token) => {
  return axios.get(`${API_URL}my-resources`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
};

// Update one of the user's own resources
const updateResource = (resourceId, resourceData, token) => {
  return axios.put(API_URL + resourceId, resourceData, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
};

// Delete one of the user's own resources
const deleteResource = (resourceId, token) => {
  return axios.delete(API_URL + resourceId, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
};

export default {
  upload,
  getAll,
  getById,
  getComments, // <-- Export new function
  addComment,  // <-- Export new function
  rate,        // <-- Export new function
  getMyResources,
  updateResource,
  deleteResource,
};