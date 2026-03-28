import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const MOVIES_FILE = path.join(process.cwd(), "data", "movies.json");
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

// Helper functions for file I/O
async function readData(file: string) {
  try {
    const data = await fs.readFile(file, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeData(file: string, data: any) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// API Routes
app.get("/api/movies", async (req, res) => {
  const movies = await readData(MOVIES_FILE);
  res.json(movies);
});

app.post("/api/movies", async (req, res) => {
  const movies = await readData(MOVIES_FILE);
  const newMovie = { ...req.body, id: Date.now().toString() };
  movies.push(newMovie);
  await writeData(MOVIES_FILE, movies);
  res.status(201).json(newMovie);
});

app.put("/api/movies/:id", async (req, res) => {
  const movies = await readData(MOVIES_FILE);
  const index = movies.findIndex((m: any) => m.id === req.params.id);
  if (index !== -1) {
    movies[index] = { ...movies[index], ...req.body };
    await writeData(MOVIES_FILE, movies);
    res.json(movies[index]);
  } else {
    res.status(404).json({ message: "Movie not found" });
  }
});

app.delete("/api/movies/:id", async (req, res) => {
  const movies = await readData(MOVIES_FILE);
  const filtered = movies.filter((m: any) => m.id !== req.params.id);
  await writeData(MOVIES_FILE, filtered);
  res.status(204).send();
});

app.get("/api/users", async (req, res) => {
  const users = await readData(USERS_FILE);
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  const users = await readData(USERS_FILE);
  const newUser = { ...req.body, id: Date.now().toString(), enteredAt: new Date().toISOString() };
  users.push(newUser);
  await writeData(USERS_FILE, users);
  console.log(`[ADMIN NOTIFICATION] New user entered: ${newUser.firstName} ${newUser.lastName}`);
  res.status(201).json(newUser);
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
