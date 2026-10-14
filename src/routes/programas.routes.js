import { Router } from "express";
import { listarProgramas, obtenerPrograma, registrarPrograma } from "../controllers/programas.controller.js";

const router = Router();

router.get("/", listarProgramas);
router.get("/:id", obtenerPrograma);
router.post("/", registrarPrograma);
export default router;
