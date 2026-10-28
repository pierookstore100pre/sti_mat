import { Router } from "express";
import {
  listarDocentes,
  obtenerDocente,
  registrarDocente,
  actualizarDocente,
  actualizarParcialDocente
} from "../controllers/docentes.controller.js";

const router = Router();

router.get("/", listarDocentes);
router.get("/:id", obtenerDocente);
router.post("/", registrarDocente);
router.put("/:id", actualizarDocente);
router.patch("/:id", actualizarParcialDocente);

export default router;
