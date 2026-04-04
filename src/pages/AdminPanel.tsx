import React, { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, doc, deleteDoc, updateDoc, getDocs, query, orderBy } from "firebase/firestore";
import { User, Movie, MovieStatus } from "../types";
import { Users, Film, Trash2, Edit3, Loader2, AlertCircle, X, Check, Star, Link as LinkIcon, Monitor } from "lucide-react";
import MovieCard from "../components/MovieCard";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface AdminPanelProps {
  user: User;
  movies: Movie[];
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
  loading: boolean;
}

export default function AdminPanel({ user, movies, setMovies, loading }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("enteredAt", "desc"));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDeleteMovie = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, "movies", deletingId));
      // No need to manually filter if onSnapshot is used in App.tsx, but good for immediate feedback
      setMovies(movies.filter((m) => m.id !== deletingId));
      setDeletingId(null);
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;
    setIsSaving(true);
    try {
      const { id, ...movieData } = editingMovie;
      await updateDoc(doc(db, "movies", id), movieData);
      setEditingMovie(null);
    } catch (error) {
      console.error("Error updating movie:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMovieUpdate = (updatedMovie: Movie) => {
    setMovies((prev) => prev.map((m) => (m.id === updatedMovie.id ? updatedMovie : m)));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-12 max-w-7xl mx-auto w-full relative">
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
                  user={user}
                  onEdit={(m) => setEditingMovie(m)}
                  onDelete={(id) => setDeletingId(id)}
                  onUpdate={handleMovieUpdate}
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editingMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingMovie(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
            >
              <button
                onClick={() => setEditingMovie(null)}
                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-3xl font-bold text-white mb-8">Edit Movie</h3>

              <form onSubmit={handleUpdateMovie} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Title</label>
                    <input
                      type="text"
                      value={editingMovie.title}
                      onChange={(e) => setEditingMovie({ ...editingMovie, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Genre</label>
                      <select
                        value={editingMovie.genre}
                        onChange={(e) => setEditingMovie({ ...editingMovie, genre: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all"
                      >
                        {["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Animation", "Romance", "Feel Good", "Fantasy"].map((g) => (
                          <option key={g} value={g} className="bg-neutral-900">{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Status</label>
                      <select
                        value={editingMovie.status}
                        onChange={(e) => setEditingMovie({ ...editingMovie, status: e.target.value as MovieStatus })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all"
                      >
                        {["Watched", "Watching", "Wishlist"].map((s) => (
                          <option key={s} value={s} className="bg-neutral-900">{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Platform</label>
                    <div className="relative">
                      <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                      <input
                        type="text"
                        value={editingMovie.platform || ""}
                        onChange={(e) => setEditingMovie({ ...editingMovie, platform: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Rating</label>
                    <div className="flex gap-4 items-center bg-white/5 border border-white/10 rounded-2xl py-4 px-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditingMovie({ ...editingMovie, rating: star })}
                          className="transition-transform hover:scale-125"
                        >
                          <Star
                            className={cn(
                              "w-6 h-6 transition-colors",
                              star <= (editingMovie.rating || 0) ? "text-amber-400 fill-amber-400" : "text-white/10"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Admin Comment</label>
                    <textarea
                      value={editingMovie.adminComment || ""}
                      onChange={(e) => setEditingMovie({ ...editingMovie, adminComment: e.target.value })}
                      placeholder="Add a crisp comment..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none h-24"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Poster URL</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                      <input
                        type="text"
                        value={editingMovie.posterUrl}
                        onChange={(e) => setEditingMovie({ ...editingMovie, posterUrl: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingMovie(null)}
                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="text-red-400 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Delete Movie?</h3>
              <p className="text-white/40 mb-8">This action cannot be undone. The movie will be removed from the global library.</p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteMovie}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

