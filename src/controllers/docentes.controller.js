import pool from "../config/db.js";

// GET /api/v1/docentes
export const listarDocentes = async (req, res) => {
  try {
    const [filas] = await pool.execute(
      `SELECT id, codigo, nombres, apellidos, correo, activo,
              fecha_creacion, fecha_modificacion
       FROM sti_docentes
       ORDER BY id ASC`
    );
    return res.status(200).json(filas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/v1/docentes/:id
export const obtenerDocente = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }
  try {
    const [filas] = await pool.execute(
      `SELECT id, codigo, nombres, apellidos, correo, activo,
              fecha_creacion, fecha_modificacion
       FROM sti_docentes
       WHERE id = ?`,
      [id]
    );
    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Docente no encontrado" });
    }
    return res.status(200).json(filas[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/v1/docentes
export const registrarDocente = async (req, res) => {
  const { codigo, nombres, apellidos, correo, usuario_id } = req.body ?? {};
  if (
    typeof codigo !== "string" || !codigo.trim() ||
    typeof nombres !== "string" || !nombres.trim() ||
    typeof apellidos !== "string" || !apellidos.trim()
  ) {
    return res.status(400).json({
      mensaje: "Código, nombres y apellidos son obligatorios"
    });
  }
  let correoFinal = null;
  if (correo !== undefined && correo !== null && correo !== "") {
    if (typeof correo !== "string" || !correo.trim()) {
      return res.status(400).json({ mensaje: "Correo inválido" });
    }
    correoFinal = correo.trim().toLowerCase();
  }
  const usuarioIdFinal =
    usuario_id === undefined || usuario_id === null || usuario_id === ""
      ? null
      : Number(usuario_id);
  if (usuarioIdFinal !== null && !Number.isSafeInteger(usuarioIdFinal)) {
    return res.status(400).json({ mensaje: "usuario_id inválido" });
  }
  try {
    const [resultado] = await pool.execute(
      `INSERT INTO sti_docentes
         (codigo, nombres, apellidos, correo, usuario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        codigo.trim(),
        nombres.trim(),
        apellidos.trim(),
        correoFinal,
        usuarioIdFinal
      ]
    );
    return res.status(201).json({
      mensaje: "Docente registrado",
      id: resultado.insertId
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        mensaje: "El código o usuario_id ya existe"
      });
    }
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
