export type MovieStatus = "Watched" | "Watching" | "Wishlist";

export interface Movie {
  id: string;
  title: string;
  genre: string;
  rating: number;
  status: MovieStatus;
  posterUrl?: string;
  tmdbId?: string;
  overview?: string;
  releaseDate?: string;
  platform?: string;
  addedBy?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  enteredAt: string;
  isAdmin?: boolean;
}
