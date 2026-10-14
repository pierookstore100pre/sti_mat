import { Router } from "express";
import { listarEstudiantes } from "../controllers/estudiantes.controller.js";

const router = Router();

router.get("/", listarEstudiantes);

export default router;
