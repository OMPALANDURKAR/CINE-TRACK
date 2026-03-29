import axios from "axios";

// ✅ Centralized axios instance for deployment
// In production, VITE_API_URL should be your Render backend URL
// In development, it defaults to http://localhost:5000 (or whatever your local server port is)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const instance = axios.create({
  baseURL: API_URL,
});

export default instance;
