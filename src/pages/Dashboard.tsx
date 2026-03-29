import React, { useState, useEffect } from "react";
import axios from "axios";
import { Movie, MovieStatus, User } from "../types";
import MovieCard from "../components/MovieCard";
import SearchFilter from "../components/SearchFilter";
import { motion, AnimatePresence } from "motion/react";
import { Clapperboard, Loader2 } from "lucide-react";

interface DashboardProps {
  user: User;
  movies: Movie[];
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
  loading: boolean;
}

export default function Dashboard({ user, movies, setMovies, loading }: DashboardProps) {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [status, setStatus] = useState<MovieStatus | "All">("All");

  const handleUpdateMovie = (updatedMovie: Movie) => {
    setMovies((prev) => prev.map((m) => (m.id === updatedMovie.id ? updatedMovie : m)));
  };

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genre === "All" || movie.genre === genre;
    const matchesStatus = status === "All" || movie.status === status;
    return matchesSearch && matchesGenre && matchesStatus;
  });

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
        <div className="flex items-center gap-3 mb-4">
          <Clapperboard className="text-indigo-500 w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-500/80">Your Collection</span>
        </div>
        <h2 className="text-6xl font-black text-white mb-4 tracking-tighter">
          Cinema <span className="text-white/20">Archive</span>
        </h2>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full border border-indigo-400/20">
            Platform by Vedant
          </span>
        </div>
        <p className="text-white/40 text-lg max-w-2xl font-medium">
          Manage and track your cinematic journey. Discover, rate, and organize your favorite films and series.
        </p>
      </header>

      <SearchFilter
        search={search}
        setSearch={setSearch}
        genre={genre}
        setGenre={setGenre}
        status={status}
        setStatus={setStatus}
      />

      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} user={user} onUpdate={handleUpdateMovie} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-[3rem]"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Clapperboard className="w-10 h-10 text-white/10" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No movies found</h3>
          <p className="text-white/30 font-medium">Try adjusting your filters or add a new movie to your collection.</p>
        </motion.div>
      )}
    </div>
  );
}
