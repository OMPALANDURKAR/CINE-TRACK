import React, { useState, useEffect } from "react";
import axios from "./lib/axios";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import AddMoviePage from "./pages/AddMoviePage";
import AdminPanel from "./pages/AdminPanel";
import Sidebar from "./components/Sidebar";
import { User, Movie } from "./types";
import { AnimatePresence, motion } from "motion/react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("cinetrack_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchMovies();
    }
  }, [user]);

  const fetchMovies = async () => {
    setMoviesLoading(true);
    try {
      const response = await axios.get("/api/movies");
      setMovies(response.data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setMoviesLoading(false);
    }
  };

  const handleEnter = async (firstName: string, lastName: string) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const response = await axios.post("/api/users", { firstName, lastName });
      const newUser = response.data;
      setUser(newUser);
      localStorage.setItem("cinetrack_user", JSON.stringify(newUser));
    } catch (error: any) {
      console.error("Error entering platform:", error);
      if (error.response?.data?.message) {
        setLoginError(error.response.data.message);
      } else if (error.code === "ECONNABORTED") {
        setLoginError("Backend is taking too long to wake up. Please try again in a few seconds.");
      } else if (error.message === "Network Error") {
        setLoginError("Could not connect to backend. Please check your VITE_API_URL in Vercel.");
      } else {
        setLoginError("Login failed. Check console for details.");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cinetrack_user");
    setActiveTab("dashboard");
  };

  if (loading) return null;

  if (!user) {
    return (
      <LandingPage 
        onEnter={handleEnter} 
        loading={loginLoading} 
        error={loginError} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Background Glows */}
        <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="min-h-full flex flex-col"
          >
            {activeTab === "dashboard" && (
              <Dashboard 
                user={user} 
                movies={movies} 
                setMovies={setMovies} 
                loading={moviesLoading} 
              />
            )}
            {activeTab === "add" && (
              <AddMoviePage 
                user={user} 
                onMovieAdded={fetchMovies} 
              />
            )}
            {activeTab === "admin" && user.isAdmin && (
              <AdminPanel 
                user={user} 
                movies={movies} 
                setMovies={setMovies} 
                loading={moviesLoading} 
              />
            )}
            {activeTab === "admin" && !user.isAdmin && (
              <Dashboard 
                user={user} 
                movies={movies} 
                setMovies={setMovies} 
                loading={moviesLoading} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
