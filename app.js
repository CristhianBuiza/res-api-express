const express = require("express");
const crypto = require("node:crypto");
const movies = require("./movies.json");
const cors = require("cors");
const {
  validateMovie,
  validatePartialMovie,
} = require("./schemas/movie-schema");

const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.json({ message: "Hola Mundo" });
});

app.get("/movies", (req, res) => {
  const { genre, pag, qt } = req.query;

  if (genre) {
    const movieGen = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(movieGen);
  }
  if (pag) {
    const pageNumber = pag - 1;
    const itemsPerPage = parseInt(qt) || 4;
    const moviePag = movies.slice(
      pageNumber * itemsPerPage,
      pageNumber * itemsPerPage + itemsPerPage
    );
    if (moviePag.length === 0)
      return res.status(404).json({ message: "Not enought data" });
    return res.json(moviePag);
  }
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.find((m) => m.id == id);
  if (movie) return res.json(movie);
  return res.status(404).json({ message: "Not Found" });
});

app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((m) => m.id == id);

  if (movieIndex !== -1) {
    movies.splice(movieIndex, 1); // Remove 1 element at movieIndex

    res.status(204).send(); // Respond with a success status and no content
  } else {
    res.status(404).send("Movie not found"); // Respond with a not found status
  }
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: JSON.parse(result.error.message),
    });
  }
  const { id } = req.params;
  const movieIndex = movies.findIndex((m) => m.id === id);

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };
  movies[movieIndex] = updateMovie;
  return res.json(updateMovie);
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }
  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };
  movies.push(newMovie);
  res.status(201).json(newMovie);
});

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});
