import pool from "../config/db.js";

export const listarProgramas = async (req, res) => {
  try {
    const [filas] = await pool.execute(
      "SELECT id, codigo, nombre_actual, activo FROM sti_programas_estudios"
    );
    return res.status(200).json(filas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

//agregamos la funcion obtenerPrograma para obtener un programa por su id

export const obtenerPrograma = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }

  try {
    const [filas] = await pool.execute(
      "SELECT id, codigo, nombre_actual, activo FROM sti_programas_estudios WHERE id = ?",
      [id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Programa no encontrado" });
    }

    return res.status(200).json(filas[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

//agregamos la funcion registrarPrograma para registrar un nuevo programa

export const registrarPrograma = async (req, res) => {
  const { codigo, nombre_actual } = req.body ?? {};

  if (
    typeof codigo !== "string" || !codigo.trim() ||
    typeof nombre_actual !== "string" || !nombre_actual.trim()
  ) {
    return res.status(400).json({ mensaje: "Código y nombre son obligatorios" });
  }

  try {
    const [resultado] = await pool.execute(
      "INSERT INTO sti_programas_estudios (codigo, nombre_actual) VALUES (?, ?)",
      [codigo.trim(), nombre_actual.trim()]
    );

    return res.status(201).json({
      mensaje: "Programa registrado",
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
