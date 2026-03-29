import axios from "axios";

// ✅ Centralized axios instance for deployment
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  
  // If we have an env var, use it
  if (envURL && envURL !== "undefined" && envURL.length > 0) {
    return envURL;
  }

  // Fallback for local development
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  // If we are on Vercel but VITE_API_URL is missing, we have a build-time issue
  console.error("[AXIOS] CRITICAL: VITE_API_URL is missing at build time!");
  return ""; // This will cause relative requests and 404s on Vercel
};

const API_URL = getBaseURL();

console.log("[AXIOS] Initialized with baseURL:", API_URL || "(RELATIVE)");

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increased to 15s for Render cold starts
});

export default instance;
