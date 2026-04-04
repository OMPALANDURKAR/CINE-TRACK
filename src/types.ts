export interface Movie {
  id: string;
  title: string;
  genre: string;
  rating: number;
  posterUrl?: string;
  tmdbId?: string;
  overview?: string;
  releaseDate?: string;
  platform?: string;
  addedBy?: string;
  adminComment?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  enteredAt: string;
  isAdmin?: boolean;
}
