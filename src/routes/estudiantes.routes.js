import { Router } from "express";
import {
  listarEstudiantes,
  obtenerEstudiante,
  registrarEstudiante
} from "../controllers/estudiantes.controller.js";

const router = Router();

router.get("/", listarEstudiantes);
router.get("/:id", obtenerEstudiante);
router.post("/", registrarEstudiante);

export default router;
