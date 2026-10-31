import { Router } from "express";
import { listarProgramas, 
        obtenerPrograma,
        registrarPrograma, 
        actualizarPrograma, 
        actualizarParcialPrograma,
        listarUnidadesPorPrograma,
        eliminarPrograma
        } from "../controllers/programas.controller.js";

const router = Router();

router.get("/", listarProgramas);
router.get("/:id", obtenerPrograma);
router.put("/:id", actualizarPrograma);
router.patch("/:id", actualizarParcialPrograma);
router.get("/:id/unidades", listarUnidadesPorPrograma);
router.post("/", registrarPrograma);
router.delete("/:id", eliminarPrograma);
export default router;


