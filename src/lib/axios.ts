import axios from "axios";

// ✅ Centralized axios instance for deployment
const getBaseURL = () => {
  if (typeof window === "undefined") return "";

  const origin = window.location.origin;
  const hostname = window.location.hostname;
  const envURL = import.meta.env.VITE_API_URL;

  console.log("[AXIOS] Current Origin:", origin);
  console.log("[AXIOS] VITE_API_URL from env:", envURL);

  // 1. SAFETY NET: If we are on ANY Vercel domain, force the Render URL
  // This is the most reliable way since env vars are failing to bake in
  if (hostname.includes("vercel.app") || origin.includes("vercel.app")) {
    console.log("[AXIOS] Vercel environment detected. Forcing Render backend URL.");
    return "https://cine-track-pew3.onrender.com";
  }

  // 2. Try env var (standard way)
  if (envURL && envURL !== "undefined" && envURL.length > 0) {
    return envURL;
  }

  // 3. Fallback for local development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000";
  }

  console.error("[AXIOS] CRITICAL: baseURL is empty! Requests will fail with 404 on Vercel.");
  return ""; 
};

const API_URL = getBaseURL();

console.log("[AXIOS] Initialized with baseURL:", API_URL || "(RELATIVE)");

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increased to 15s for Render cold starts
});

export default instance;
