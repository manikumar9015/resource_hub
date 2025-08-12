// frontend/src/api/auth.js
import axios from 'axios';

// The base URL for our backend server.
// Make sure your backend server is running on port 5001.
const API_URL = 'http://localhost:5001/api/auth/';

const register = (name, email, password) => {
  // We make a POST request to the 'register' endpoint
  return axios.post(API_URL + 'register', {
    name,
    email,
    password,
  });
};

const login = (email, password) => {
  return axios.post(API_URL + 'login', { email, password });
};

export default {
  register,
  login, // Export the new function
};

