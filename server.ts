import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";

const app = express();

// ✅ IMPORTANT: Use dynamic port for Render
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*" // later replace with your Vercel URL
}));

app.use(express.json());

// ✅ File paths
const MOVIES_FILE = path.join(process.cwd(), "data", "movies.json");
const USERS_FILE = path.join(process.cwd(), "data", "users.json");

// ---------------- HELPER FUNCTIONS ----------------
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

// ---------------- MOVIES API ----------------
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

// ---------------- USERS API ----------------
app.get("/api/users", async (req, res) => {
  const users = await readData(USERS_FILE);
  res.json(users);
});

app.post("/api/users", async (req, res) => {
  const users = await readData(USERS_FILE);

  const { firstName, lastName } = req.body;

  // ✅ Admin check
  const isAdmin =
    firstName === "Vedant" && lastName === "Palandurkar@1980";

  const newUser = {
    ...req.body,
    id: Date.now().toString(),
    enteredAt: new Date().toISOString(),
    isAdmin,
  };

  users.push(newUser);
  await writeData(USERS_FILE, users);

  if (isAdmin) {
    console.log(`[ADMIN LOGIN] Admin Vedant logged in`);
  } else {
    console.log(
      `[USER LOGIN] ${newUser.firstName} ${newUser.lastName}`
    );
  }

  res.status(201).json(newUser);
});

// ---------------- HEALTH CHECK ----------------
// ✅ Useful for debugging deployment
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ---------------- START SERVER ----------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});