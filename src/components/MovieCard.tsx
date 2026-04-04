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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 transition-opacity duration-500" />
        
        {movie.adminComment && (
          <div className="absolute top-4 left-4 max-w-[65%] z-10">
            <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 shadow-2xl">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-indigo-500" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-300">Editor's Note</span>
              </div>
              <p className="text-[10px] font-medium text-white/90 leading-snug">
                {movie.adminComment}
              </p>
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5 pt-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 drop-shadow-md">
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
                      "w-4 h-4 transition-colors drop-shadow-sm",
                      i < movie.rating ? "text-amber-400 fill-amber-400" : "text-white/40 hover:text-white/60"
                    )}
                  />
                </button>
              ))}
            </div>
            {movie.platform && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 shadow-sm">
                <Monitor className="w-3 h-3" />
                {movie.platform}
              </div>
            )}
          </div>
          <h3 className="text-xl font-black text-white leading-tight mb-1.5 drop-shadow-lg group-hover:text-indigo-300 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between drop-shadow-md">
            <p className="text-xs text-indigo-200 font-bold uppercase tracking-widest">{movie.genre}</p>
            {movie.addedBy && (
              <p className="text-[10px] text-white/60 font-medium truncate max-w-[100px]">
                By {movie.authorName || movie.addedBy}
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
