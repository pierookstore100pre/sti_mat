import { Router } from "express";
import {
  listarUnidades,
  obtenerUnidad,
  registrarUnidad
} from "../controllers/unidades.controller.js";

const router = Router();

router.get("/", listarUnidades);
router.get("/:id", obtenerUnidad);
router.post("/", registrarUnidad);

export default router;
