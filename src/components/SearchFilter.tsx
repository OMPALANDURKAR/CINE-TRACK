import React from "react";
import { Search, Filter } from "lucide-react";
import { MovieStatus } from "../types";

interface SearchFilterProps {
  search: string;
  setSearch: (val: string) => void;
  genre: string;
  setGenre: (val: string) => void;
}

export default function SearchFilter({
  search,
  setSearch,
  genre,
  setGenre,
}: SearchFilterProps) {
  const genres = ["All", "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller", "Animation", "Romance", "Feel Good", "Fantasy"];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-12">
      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors w-5 h-5" />
        <input
          type="text"
          placeholder="Search your library..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
        />
      </div>

      <div className="flex gap-4">
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-8 text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer min-w-[140px]"
          >
            {genres.map((g) => (
              <option key={g} value={g} className="bg-neutral-900">
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
