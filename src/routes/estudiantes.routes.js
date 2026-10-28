import { Router } from "express";
import {
  listarEstudiantes,
  obtenerEstudiante,
  registrarEstudiante,
  actualizarEstudiante,
  actualizarParcialEstudiante
} from "../controllers/estudiantes.controller.js";

const router = Router();

router.get("/", listarEstudiantes);
router.get("/:id", obtenerEstudiante);
router.post("/", registrarEstudiante);
router.put("/:id", actualizarEstudiante);
router.patch("/:id", actualizarParcialEstudiante);

export default router;
