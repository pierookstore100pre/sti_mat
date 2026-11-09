import { Router } from "express";
import {
  //listarUnidades,
  obtenerUnidad,
  registrarUnidad,
  listarUnidadesDidacticas
} from "../controllers/unidades.controller.js";

const router = Router();

//router.get("/", listarUnidades);
// Endpoint para listar unidades didácticas con filtros y paginación, // incluyendo la opción de filtrar por ciclo y buscar por nombre o código
// Este endpoint se encuentra en el controlador unidades.controller.js y utiliza la función listarUnidadesDidacticas para manejar la lógica de filtrado y paginación. 
//ademas /didacticas es un sub-endpoint de /unidades, lo que significa que se accede a él mediante la ruta /unidades/didacticas.  
// en el codigo sale que solo lleva / y no /didacticas, pero en la ruta se accede a /unidades/didacticas, ya que el router de unidades.routes.js se monta en la ruta /unidades en el archivo principal de rutas (por ejemplo, app.js o index.js). 
router.get("/didacticas", listarUnidadesDidacticas);
router.get("/:id", obtenerUnidad);
router.post("/", registrarUnidad);

export default router;
