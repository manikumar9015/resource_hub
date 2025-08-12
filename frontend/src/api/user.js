// frontend/src/api/user.js
import axios from 'axios';

const API_URL = 'http://localhost:5001/api/users/';

// Add or remove a bookmark
const toggleBookmark = (resourceId, token) => {
  return axios.put(`${API_URL}bookmarks/${resourceId}`, {}, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
};

// Get all of the current user's bookmarks
const getBookmarks = (token) => {
  return axios.get(`${API_URL}bookmarks`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
};

export default {
  toggleBookmark,
  getBookmarks,
};