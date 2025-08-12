// frontend/src/api/admin.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/admin/';

// Get all resources pending approval
const getPending = (token) => {
    return axios.get(`${API_URL}pending-resources`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
};

// Approve a resource
const approve = (resourceId, token) => {
    return axios.put(`${API_URL}approve/${resourceId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
};

// Reject (and delete) a resource
const reject = (resourceId, token) => {
    return axios.delete(`${API_URL}reject/${resourceId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
};

const getUsers = (token) => {
    return axios.get(`${API_URL}users`, { headers: { 'Authorization': `Bearer ${token}` } });
};

const updateUserRole = (userId, role, token) => {
    return axios.put(`${API_URL}users/${userId}/update-role`, { role }, { headers: { 'Authorization': `Bearer ${token}` } });
};

export default {
    getPending,
    approve,
    reject,
    getUsers,
    updateUserRole,
};