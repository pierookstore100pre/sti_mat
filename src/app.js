import express from 'express';
import estudiantesRoutes from "./routes/estudiantes.routes.js";
import cursosRoutes from "./routes/cursos.routes.js";
import "dotenv/config";
import programasRouter from "./routes/programas.routes.js";


const app = express();
const port = 3000;

//parte 6, hacemos esta parte aqui
//en la parte 9 lo movemos a su propio archivo de rutas y lo importamos en app.js

// parte 7, hacemos lo mismo que en la parte 6 pero sin guia



const docentes = [
  { id: 1, nombre: "Docente 1" },
  { id: 2, nombre: "Docente 2" }
];

app.get('/', (req, res) => {
  res.send('Bienvenido a mi primer proyecto de matriculas -Alexp');
});

app.get('/info', (req, res) => {
  res.send('Hola bienvenido a mi primera API');
});

app.get('/saludo', (req, res) => {
  res.send('Hola saludos');
});

app.get("/api/v1/saludo", (req, res) => {
  res.send("Hola desde la API v1");
});


//parte 6, modificamos la ruta para que devuelva el listado de estudiantes en formato json
//en la parte 9 modificamos esta parte para que use el router de estudiantes.routes.js



// parte 7, hacemos lo mismo que en la parte 6 pero sin guia


app.get("/api/v1/docentes", (req, res) => {
  res.json(docentes);
});



app.get("/api/v1/matriculas", (req, res) => {
  res.send("Listado de matriculas");
});

//parte 9, importamos el router de estudiantes.routes.js y lo usamos en la ruta /api/v1/estudiantes
app.use("/api/v1/estudiantes", estudiantesRoutes);

//en el reto de la parte 10
app.use("/api/v1/cursos", cursosRoutes);

app.use(express.json());
app.use("/api/v1/programas", programasRouter);

app.listen(port, () => {
  console.log(`Servidor activo en http://localhost:${port}`);
});
