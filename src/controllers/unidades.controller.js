import pool from "../config/db.js";

// GET /api/v1/unidades-didacticas
export const listarUnidades = async (req, res) => {
  try {
    const [filas] = await pool.execute(
      `SELECT id, codigo, nombre, descripcion,
              fecha_creacion, fecha_modificacion
       FROM sti_unidades_didacticas
       ORDER BY id ASC`
    );
    return res.status(200).json(filas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/v1/unidades-didacticas/:id
export const obtenerUnidad = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }
  try {
    const [filas] = await pool.execute(
      `SELECT id, codigo, nombre, descripcion,
              fecha_creacion, fecha_modificacion
       FROM sti_unidades_didacticas
       WHERE id = ?`,
      [id]
    );
    if (filas.length === 0) {
      return res
        .status(404)
        .json({ mensaje: "Unidad didáctica no encontrada" });
    }
    return res.status(200).json(filas[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/v1/unidades-didacticas
export const registrarUnidad = async (req, res) => {
  const { codigo, nombre, descripcion } = req.body ?? {};
  if (
    typeof codigo !== "string" || !codigo.trim() ||
    typeof nombre !== "string" || !nombre.trim()
  ) {
    return res.status(400).json({
      mensaje: "Código y nombre son obligatorios"
    });
  }
  let descripcionFinal = null;
  if (descripcion !== undefined && descripcion !== null && descripcion !== "") {
    if (typeof descripcion !== "string") {
      return res.status(400).json({ mensaje: "Descripción inválida" });
    }
    descripcionFinal = descripcion.trim();
  }
  try {
    const [resultado] = await pool.execute(
      `INSERT INTO sti_unidades_didacticas
         (codigo, nombre, descripcion)
       VALUES (?, ?, ?)`,
      [codigo.trim(), nombre.trim(), descripcionFinal]
    );
    return res.status(201).json({
      mensaje: "Unidad didáctica registrada",
      id: resultado.insertId
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "El código ya existe" });
    }
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
