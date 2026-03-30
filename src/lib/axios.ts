import axios from "axios";

// ✅ Centralized axios instance for deployment
const getBaseURL = () => {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const envURL = import.meta.env.VITE_API_URL;
  const appURL = import.meta.env.VITE_APP_URL;

  console.log("[AXIOS] Hostname:", hostname);
  console.log("[AXIOS] VITE_API_URL:", envURL);
  console.log("[AXIOS] VITE_APP_URL (AI Studio):", appURL);

  // 1. LOCAL DEVELOPMENT (localhost)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:3000"; // server.ts is now on 3000
  }

  // 2. AI STUDIO PREVIEW (run.app)
  // If we are in AI Studio, we want to use the local backend (appURL)
  if (hostname.includes("run.app")) {
    console.log("[AXIOS] AI Studio detected. Using local backend:", appURL);
    return appURL || "";
  }

  // 3. PRODUCTION (Vercel/Other)
  // Force the Render URL because Vercel env vars are unreliable.
  console.log("[AXIOS] Production detected. Forcing Render backend: https://cine-track-pew3.onrender.com");
  return "https://cine-track-pew3.onrender.com";
};

const API_URL = getBaseURL();

console.log("[AXIOS] Initialized with baseURL:", API_URL || "(RELATIVE)");

const instance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increased to 15s for Render cold starts
});

export default instance;
