import axios from "axios";

// ✅ Centralized axios instance for deployment
const getBaseURL = () => {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const envURL = import.meta.env.VITE_API_URL;

  console.log("[AXIOS] Hostname:", hostname);
  console.log("[AXIOS] VITE_API_URL:", envURL);

  // 1. THE ULTIMATE SAFETY NET
  // If we are NOT on localhost, we MUST be in production.
  // In production, we FORCE the Render URL because Vercel env vars are unreliable.
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    console.log("[AXIOS] Production detected. Forcing Render backend: https://cine-track-pew3.onrender.com");
    return "https://cine-track-pew3.onrender.com";
  }

  // 2. Fallback for local development
  if (envURL && envURL !== "undefined" && envURL.length > 0) {
    return envURL;
  }

  return "http://localhost:5000";
};

const API_URL = getBaseURL();

console.log("[AXIOS] Initialized with baseURL:", API_URL || "(RELATIVE)");

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increased to 15s for Render cold starts
});

export default instance;
