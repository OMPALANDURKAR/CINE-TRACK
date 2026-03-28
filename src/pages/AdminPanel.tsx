import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Movie } from "../types";
import { Users, Film, Trash2, Edit3, Loader2, AlertCircle } from "lucide-react";
import MovieCard from "../components/MovieCard";
import { motion, AnimatePresence } from "motion/react";

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, moviesRes] = await Promise.all([
        axios.get("/api/users"),
        axios.get("/api/movies"),
      ]);
      setUsers(usersRes.data);
      setMovies(moviesRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      await axios.delete(`/api/movies/${id}`);
      setMovies(movies.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-12 max-w-7xl mx-auto w-full">
      <header className="mb-16">
        <h2 className="text-6xl font-black text-white mb-4 tracking-tighter">
          Admin <span className="text-white/20">Panel</span>
        </h2>
        <p className="text-white/40 text-lg max-w-2xl font-medium">
          Global management of users and library content. Monitor platform activity.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Stats Column */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center">
                <Users className="text-indigo-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{users.length}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Total Users</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Recent Entries</h4>
              {users.slice(-5).reverse().map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-white/30">{new Date(user.enteredAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center">
                <Film className="text-purple-400 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{movies.length}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Global Movies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Library Column */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white">Global Library</h3>
            <div className="flex items-center gap-2 text-xs font-medium text-white/30 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <AlertCircle className="w-3 h-3" />
              Admin Actions are Permanent
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isAdmin
                  onDelete={handleDeleteMovie}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {movies.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
              <p className="text-white/20 font-medium">No movies in global library.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
