import React, { useState } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Search, Plus, Star, Link as LinkIcon, Check, Loader2, Monitor } from "lucide-react";
import { searchMovies } from "../lib/tmdb";
import { Movie, MovieStatus, User } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface AddMoviePageProps {
  user: User;
  onMovieAdded: () => void;
}

export default function AddMoviePage({ user, onMovieAdded }: AddMoviePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [manualMovie, setManualMovie] = useState<Partial<Movie>>({
    title: "",
    genre: "Action",
    rating: 3,
    status: "Watched",
    posterUrl: "",
    platform: "",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setSearching(true);
    const results = await searchMovies(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleAddMovie = async (movieData: Partial<Movie>) => {
    setLoading(true);
    try {
      const finalMovieData = {
        ...movieData,
        addedBy: user.id, // Store UID instead of name for better security rules
        authorName: `${user.firstName} ${user.lastName}`, // Denormalize for display
        createdAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, "movies"), finalMovieData);
      
      onMovieAdded();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      if (movieData.tmdbId) {
        setSearchResults([]);
        setSearchQuery("");
      } else {
        setManualMovie({
          title: "",
          genre: "Action",
          rating: 3,
          status: "Watched",
          posterUrl: "",
          platform: "",
        });
      }
    } catch (error) {
      console.error("Error adding movie:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-12 max-w-7xl mx-auto w-full">
      <header className="mb-16">
        <h2 className="text-6xl font-black text-white mb-4 tracking-tighter">
          Add <span className="text-white/20">Movie</span>
        </h2>
        <p className="text-white/40 text-lg max-w-2xl font-medium">
          Expand your collection by searching our global database or adding details manually.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Search Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center">
              <Search className="text-indigo-400 w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-white">Search Database</h3>
          </div>

          <form onSubmit={handleSearch} className="relative group mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title (e.g. Inception)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={searching}
              className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 rounded-xl font-bold text-sm transition-all"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </form>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {searchResults.map((result) => (
                <motion.div
                  key={result.tmdbId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 border border-white/10 p-4 rounded-2xl flex gap-4 hover:border-indigo-500/30 transition-all group"
                >
                  <img
                    src={result.posterUrl || "https://picsum.photos/seed/movie/100/150"}
                    alt={result.title}
                    className="w-20 h-28 object-cover rounded-xl shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="text-white font-bold truncate mb-1">{result.title}</h4>
                    <p className="text-xs text-white/40 mb-4">{result.releaseDate?.split("-")[0] || "N/A"}</p>
                    <button
                      onClick={() => handleAddMovie({ ...result, rating: 5, status: "Watched" })}
                      disabled={loading}
                      className="w-fit flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      Add to Library
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {searchResults.length === 0 && !searching && searchQuery && (
              <p className="text-center text-white/20 py-12 font-medium">No results found or API key missing.</p>
            )}
          </div>
        </section>

        {/* Manual Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Plus className="text-purple-400 w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-white">Manual Entry</h3>
          </div>

          <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] space-y-6 relative overflow-hidden">
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-indigo-600 flex flex-col items-center justify-center z-20"
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Check className="text-white w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-white">Movie Added!</h4>
                <p className="text-white/60">Your library has been updated.</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Movie Title</label>
                <input
                  type="text"
                  value={manualMovie.title}
                  onChange={(e) => setManualMovie({ ...manualMovie, title: e.target.value })}
                  placeholder="Enter title..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Genre</label>
                  <select
                    value={manualMovie.genre}
                    onChange={(e) => setManualMovie({ ...manualMovie, genre: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all"
                  >
                    {["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Animation", "Romance"].map((g) => (
                      <option key={g} value={g} className="bg-neutral-900">{g}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Status</label>
                  <select
                    value={manualMovie.status}
                    onChange={(e) => setManualMovie({ ...manualMovie, status: e.target.value as MovieStatus })}
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
                    value={manualMovie.platform}
                    onChange={(e) => setManualMovie({ ...manualMovie, platform: e.target.value })}
                    placeholder="Netflix, Prime, etc."
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
                      onClick={() => setManualMovie({ ...manualMovie, rating: star })}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        className={cn(
                          "w-6 h-6 transition-colors",
                          star <= (manualMovie.rating || 0) ? "text-amber-400 fill-amber-400" : "text-white/10"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {user.isAdmin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Poster URL (Optional)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                    <input
                      type="text"
                      value={manualMovie.posterUrl}
                      onChange={(e) => setManualMovie({ ...manualMovie, posterUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => handleAddMovie(manualMovie)}
              disabled={loading || !manualMovie.title}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Add to Library"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
