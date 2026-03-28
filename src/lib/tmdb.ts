import axios from "axios";

// TMDB API Key placeholder. User should provide their own in .env.example
// For now, I'll use a placeholder or let it fail gracefully.
const TMDB_API_KEY = "YOUR_TMDB_API_KEY"; // User needs to replace this
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export const searchMovies = async (query: string) => {
  if (TMDB_API_KEY === "YOUR_TMDB_API_KEY") return [];
  try {
    const response = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
      },
    });
    return response.data.results.map((movie: any) => ({
      tmdbId: movie.id.toString(),
      title: movie.title,
      posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
      overview: movie.overview,
      releaseDate: movie.release_date,
      genre: "Action", // Defaulting as TMDB uses genre IDs
    }));
  } catch (error) {
    console.error("TMDB Search Error:", error);
    return [];
  }
};
