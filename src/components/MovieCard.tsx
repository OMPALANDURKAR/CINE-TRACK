import React from "react";
import { Star, Clock, CheckCircle, Bookmark } from "lucide-react";
import { Movie } from "../types";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

interface MovieCardProps {
  movie: Movie;
  onEdit?: (movie: Movie) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  key?: React.Key;
}

export default function MovieCard({ movie, onEdit, onDelete, isAdmin }: MovieCardProps) {
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
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-3 h-3",
                  i < movie.rating ? "text-amber-400 fill-amber-400" : "text-white/20"
                )}
              />
            ))}
          </div>
          <h3 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-indigo-400 transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-white/50 font-medium uppercase tracking-widest">{movie.genre}</p>
        </div>
      </div>

      {isAdmin && (
        <div className="p-4 flex gap-2 border-t border-white/10 bg-black/40 backdrop-blur-md">
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
