import { Router } from "express";
import { listarCursos } from "../controllers/cursos.controller.js";

const router = Router();

router.get("/", listarCursos);

export default router;
