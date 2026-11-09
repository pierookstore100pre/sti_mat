import { Router } from "express";
import { listarProgramas, 
        obtenerPrograma,
        registrarPrograma, 
        actualizarPrograma, 
        actualizarParcialPrograma,
        listarUnidadesPorPrograma,
        eliminarPrograma
        
        } from "../controllers/programas.controller.js";

import { validarPrograma } from "../middlewares/validarPrograma.js";
import { verificarToken, autorizar } from "../middlewares/auth.js";

const router = Router();

//el orden importante, primero verificarToken, luego autorizar y finalmente validarPrograma

router.post("/", verificarToken, autorizar("ADMIN", "SECRETARIA"), validarPrograma, registrarPrograma);
router.put("/:id", verificarToken, autorizar("ADMIN", "SECRETARIA"), validarPrograma, actualizarPrograma);
router.patch("/:id", verificarToken, autorizar("ADMIN", "SECRETARIA"), actualizarParcialPrograma);
router.delete("/:id", verificarToken, autorizar("ADMIN"), eliminarPrograma);

router.get("/", listarProgramas);
router.get("/:id", obtenerPrograma);
router.put("/:id", actualizarPrograma);
router.patch("/:id", actualizarParcialPrograma);
router.get("/:id/unidades", listarUnidadesPorPrograma);
router.post("/", registrarPrograma);
router.delete("/:id", eliminarPrograma);


router.post("/", validarPrograma, registrarPrograma);
router.put("/:id", validarPrograma, actualizarPrograma);

export default router;