import express from "express";
import cors from "cors";

import "dotenv/config";

// Router antiguo de cursos (Semana 07) — lo conservamos por si lo usas
import cursosRoutes from "./routes/cursos.routes.js";

// Middleware para registrar solicitudes, guia practica 11
import { registrarSolicitud } from "./middlewares/registrarSolicitud.js";
// Middleware para manejo de errores
import { noEncontrado, manejadorErrores } from "./middlewares/errores.js";
//Routes de autenticación, semana 11
import authRoutes from "./routes/auth.routes.js";

// Routers nuevos (MySQL)
import programasRouter from "./routes/programas.routes.js";
import estudiantesRouter from "./routes/estudiantes.routes.js";
import docentesRouter from "./routes/docentes.routes.js";
import unidadesRouter from "./routes/unidades.routes.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);


// Configuración de CORS, prueba de la guía práctica 11. Si no la usaremos, la elimínamos.
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware JSON: SIEMPRE antes de las rutas
app.use(express.json());
//middleware para registrar solicitudes, guia practica 11
app.use(registrarSolicitud); 

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

// Rutas de autenticación, semana 11
app.use("/api/v1/auth", authRoutes);

// Middleware de manejo de errores: siempre al final, después de todas las rutas
app.use(noEncontrado);     // ninguna ruta coincidió
app.use(manejadorErrores); // siempre al último


