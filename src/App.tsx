import React, { useState, useEffect } from "react";
import { auth, db } from "./lib/firebase";
import { signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, onSnapshot, doc, getDoc, setDoc, serverTimestamp, orderBy } from "firebase/firestore";
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if we have user profile in Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // If auth exists but no doc, maybe it was a partial login or anonymous without profile
          // We'll let the LandingPage handle profile creation
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      setMoviesLoading(true);
      const q = query(collection(db, "movies"), orderBy("createdAt", "desc"));
      const unsubscribeMovies = onSnapshot(q, (snapshot) => {
        const moviesData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Movie[];
        setMovies(moviesData);
        setMoviesLoading(false);
      }, (error) => {
        console.error("Error fetching movies:", error);
        setMoviesLoading(false);
      });

      return () => unsubscribeMovies();
    }
  }, [user]);

  const handleEnter = async (firstName: string, lastName: string) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      // 1. Sign in anonymously to get a UID
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      // 2. Check if this user (by name) already exists in our "users" collection
      // For simplicity in this demo, we'll just create/update the profile for this UID
      const isAdmin = firstName === "Vedant" && lastName === "Palandurkar@1980";
      
      const userData: User = {
        id: uid,
        firstName,
        lastName,
        isAdmin,
        enteredAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", uid), {
        ...userData,
        enteredAt: serverTimestamp(),
      });

      setUser(userData);
    } catch (error: any) {
      console.error("Error entering platform:", error);
      setLoginError("Login failed. Please check your connection.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full"
      />
    </div>
  );

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
                onMovieAdded={() => setActiveTab("dashboard")} 
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
