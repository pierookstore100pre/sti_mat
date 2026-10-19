import "dotenv/config";
import express from "express";

// Routers nuevos (MySQL)
import programasRouter from "./routes/programas.routes.js";
import estudiantesRouter from "./routes/estudiantes.routes.js";
import docentesRouter from "./routes/docentes.routes.js";
import unidadesRouter from "./routes/unidades.routes.js";

// Router antiguo de cursos (Semana 07) — lo conservamos por si lo usas
import cursosRoutes from "./routes/cursos.routes.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Middleware JSON: SIEMPRE antes de las rutas
app.use(express.json());

// Rutas de prueba (puedes dejarlas o quitarlas)
app.get("/", (req, res) => {
  res.send("Bienvenido a mi primer proyecto de matrículas -Alexp");
});
app.get("/info", (req, res) => {
  res.send("Hola bienvenido a mi primera API");
});
app.get("/saludo", (req, res) => {
  res.send("Hola saludos");
});

// Rutas versionadas
app.use("/api/v1/programas", programasRouter);
app.use("/api/v1/estudiantes", estudiantesRouter);
app.use("/api/v1/docentes", docentesRouter);
app.use("/api/v1/unidades-didacticas", unidadesRouter);

// Ruta de cursos (Semana 07). Si ya no la usas, elimínala.
app.use("/api/v1/cursos", cursosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
