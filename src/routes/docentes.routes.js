import { Router } from "express";
import {
  listarDocentes,
  obtenerDocente,
  registrarDocente
} from "../controllers/docentes.controller.js";

const router = Router();

router.get("/", listarDocentes);
router.get("/:id", obtenerDocente);
router.post("/", registrarDocente);

export default router;
