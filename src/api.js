// src/api.js
import axios from 'axios';

// Use the environment variable REACT_APP_API_URL (Create React App convention).
// If it's not set, fall back to the existing backend URL.
const baseURL = process.env.REACT_APP_API_URL || 'https://swift00-backend.onrender.com/';

const API = axios.create({
  baseURL,
});

export default API;
