import React, { useState, useEffect } from "react";
import { auth, db } from "./lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "firebase/auth";
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
        try {
          console.log("Auth state changed, fetching user doc for:", firebaseUser.uid);
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // If user doc doesn't exist, they might be in the middle of signing up via handleEnter.
            // We don't set user to null here, we let handleEnter finish creating the profile.
            console.log("User doc does not exist yet.");
          }
        } catch (err: any) {
          console.error("Error in getDoc during onAuthStateChanged:", err);
          setLoginError(`Database Error: ${err.message || "Failed to connect"}`);
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

  const handleEnter = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      // 1. Sign in with Google
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const uid = firebaseUser.uid;

      // 2. Check if this user already exists in our "users" collection
      const userDoc = await getDoc(doc(db, "users", uid));
      
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      } else {
        // Create new user profile
        const nameParts = (firebaseUser.displayName || "").split(" ");
        const firstName = nameParts[0] || "User";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        const isAdmin = firebaseUser.email === "vedantpalandurkar14@gmail.com";
        
        const userData: User = {
          id: uid,
          firstName,
          lastName,
          isAdmin,
          enteredAt: new Date().toISOString(),
        };

        try {
          await setDoc(doc(db, "users", uid), {
            ...userData,
            enteredAt: serverTimestamp(),
          });
          setUser(userData);
        } catch (setDocErr) {
          console.error("Error in setDoc:", setDocErr);
          throw setDocErr;
        }
      }
    } catch (error: any) {
      console.error("Error entering platform:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setLoginError("Sign-in popup was closed. Please try again.");
      } else {
        setLoginError(`Login Error: ${error.message || "Failed to connect."}`);
      }
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
