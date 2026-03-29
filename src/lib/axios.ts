import axios from "axios";

// ✅ Centralized axios instance for deployment
const getBaseURL = () => {
  // 1. Try env var (standard way)
  const envURL = import.meta.env.VITE_API_URL;
  if (envURL && envURL !== "undefined" && envURL.length > 0) {
    return envURL;
  }

  // 2. SAFETY NET: If we are on your Vercel domain, force the Render URL
  if (typeof window !== "undefined" && window.location.origin.includes("cinetrack-steel.vercel.app")) {
    console.log("[AXIOS] Safety net triggered: Forcing Render backend URL");
    return "https://cine-track-pew3.onrender.com";
  }

  // 3. Fallback for local development
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return ""; 
};

const API_URL = getBaseURL();

console.log("[AXIOS] Initialized with baseURL:", API_URL || "(RELATIVE)");

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increased to 15s for Render cold starts
});

export default instance;
