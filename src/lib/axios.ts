import axios from "axios";

// ✅ Centralized axios instance for deployment
// In production, VITE_API_URL should be your Render backend URL
// In development, it defaults to http://localhost:5000 (or whatever your local server port is)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

console.log("[AXIOS] Initialized with baseURL:", API_URL);

if (import.meta.env.PROD && API_URL.includes("localhost")) {
  console.warn("[AXIOS] WARNING: You are in production but VITE_API_URL is pointing to localhost. Check your Vercel environment variables.");
}

const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10s timeout for Render spin-up
});

export default instance;
