import React from "react";
import { Star, Clock, CheckCircle, Bookmark, Monitor, User as UserIcon, X, Send, Trash2, Loader2 } from "lucide-react";
import { Movie, User } from "../types";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface MovieCardProps {
  movie: Movie;
  user: User;
  onEdit?: (movie: Movie) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (movie: Movie) => void;
  isAdmin?: boolean;
  key?: React.Key;
}

export default function MovieCard({ movie, user, onEdit, onDelete, onUpdate, isAdmin }: MovieCardProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRate = async (rating: number) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const movieRef = doc(db, "movies", movie.id);
      await updateDoc(movieRef, {
        rating: rating,
      });
      // onUpdate is no longer strictly needed if we use onSnapshot in App.tsx, 
      // but we'll keep it for local UI feedback if any
      onUpdate?.({ ...movie, rating });
    } catch (error) {
      console.error("Error updating rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusIcons = {
    Watched: CheckCircle,
    Watching: Clock,
    Wishlist: Bookmark,
  };

  const statusColors = {
    Watched: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    Watching: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    Wishlist: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  };

  const StatusIcon = statusIcons[movie.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-500 shadow-2xl hover:shadow-indigo-500/10"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={movie.posterUrl || "https://picsum.photos/seed/movie/400/600"}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://picsum.photos/seed/movie/400/600";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
        
        <div className="absolute top-4 right-4">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-bold uppercase tracking-wider",
            statusColors[movie.status]
          )}>
            <StatusIcon className="w-3 h-3" />
            {movie.status}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  disabled={isSubmitting}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(i + 1);
                  }}
                  className={cn(
                    "transition-transform hover:scale-125 disabled:opacity-50",
                    isSubmitting ? "cursor-not-allowed" : "cursor-pointer"
                  )}
                >
                  <Star
                    className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      i < movie.rating ? "text-amber-400 fill-amber-400" : "text-white/20 hover:text-white/40"
                    )}
                  />
                </button>
              ))}
            </div>
            {movie.platform && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                <Monitor className="w-2.5 h-2.5" />
                {movie.platform}
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-indigo-400 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/50 font-medium uppercase tracking-widest">{movie.genre}</p>
            {movie.addedBy && (
              <p className="text-[9px] text-white/20 font-medium truncate max-w-[100px]">
                By {movie.addedBy}
              </p>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="p-4 pt-0 flex gap-2 bg-black/20 backdrop-blur-md">
          <button
            onClick={() => onEdit?.(movie)}
            className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete?.(movie.id)}
            className="flex-1 py-2 rounded-lg bg-red-400/10 hover:bg-red-400/20 text-red-400 text-xs font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </motion.div>
  );
}
