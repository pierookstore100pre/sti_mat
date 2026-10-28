import pool from "../config/db.js";

// GET /api/v1/estudiantes
export const listarEstudiantes = async (req, res) => {
  try {
    const [filas] = await pool.execute(
      `SELECT id, codigo, nombres, apellidos, correo, activo,
              fecha_creacion, fecha_modificacion
       FROM sti_estudiantes
       ORDER BY id ASC`
    );
    return res.status(200).json(filas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// GET /api/v1/estudiantes/:id
export const obtenerEstudiante = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }
  try {
    const [filas] = await pool.execute(
      `SELECT id, codigo, nombres, apellidos, correo, activo,
              fecha_creacion, fecha_modificacion
       FROM sti_estudiantes
       WHERE id = ?`,
      [id]
    );
    if (filas.length === 0) {
      return res.status(404).json({ mensaje: "Estudiante no encontrado" });
    }
    return res.status(200).json(filas[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// POST /api/v1/estudiantes
// Implementación de la función registrarEstudiante para registrar un nuevo estudiante
export const registrarEstudiante = async (req, res) => {
  const { codigo, nombres, apellidos, correo, usuario_id } = req.body ?? {};
  if (
    typeof codigo !== "string" || !codigo.trim() ||
    typeof nombres !== "string" || !nombres.trim() ||
    typeof apellidos !== "string" || !apellidos.trim() ||
    typeof correo !== "string" || !correo.trim()
  ) {
    return res.status(400).json({
      mensaje: "Código, nombres, apellidos y correo son obligatorios"
    });
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
      `INSERT INTO sti_estudiantes
         (codigo, nombres, apellidos, correo, usuario_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        codigo.trim(),
        nombres.trim(),
        apellidos.trim(),
        correo.trim().toLowerCase(),
        usuarioIdFinal
      ]
    );
    return res.status(201).json({
      mensaje: "Estudiante registrado",
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

// PUT /api/v1/estudiantes/:id
export const actualizarEstudiante = async (req, res) => {
  const id = Number(req.params.id);
  const { codigo, nombres, apellidos, correo, activo } = req.body ?? {};

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }

  // En estudiantes, correo es NOT NULL, así que es obligatorio
  if (
    typeof codigo !== "string" || !codigo.trim() ||
    typeof nombres !== "string" || !nombres.trim() ||
    typeof apellidos !== "string" || !apellidos.trim() ||
    typeof correo !== "string" || !correo.trim() ||
    ![0, 1, true, false].includes(activo)
  ) {
    return res.status(400).json({
      mensaje: "Código, nombres, apellidos, correo y activo son obligatorios"
    });
  }

  try {
    const [resultado] = await pool.execute(
      `UPDATE sti_estudiantes
       SET codigo = ?, nombres = ?, apellidos = ?, correo = ?, activo = ?
       WHERE id = ?`,
      [
        codigo.trim(),
        nombres.trim(),
        apellidos.trim(),
        correo.trim().toLowerCase(),
        Number(activo),
        id
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Estudiante no encontrado" });
    }

    return res.status(200).json({ mensaje: "Estudiante actualizado correctamente" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "El código ya existe" });
    }
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// PATCH /api/v1/estudiantes/:id
// Implementación de la función actualizarParcialEstudiante para actualizar parcialmente un estudiante existente
export const actualizarParcialEstudiante = async (req, res) => {
  const id = Number(req.params.id);
  const datos = req.body;

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }

  const permitidos = ["codigo", "nombres", "apellidos", "correo", "activo"];
  
  if (
    !datos || typeof datos !== "object" || Array.isArray(datos) ||
    Object.keys(datos).length === 0 ||
    Object.keys(datos).some(campo => !permitidos.includes(campo))
  ) {
    return res.status(400).json({
      mensaje: "Envía al menos un campo permitido"
    });
  }

  const cambios = [];
  for (const [campo, valor] of Object.entries(datos)) {
    if (campo === "activo") {
      if (![0, 1, true, false].includes(valor)) {
        return res.status(400).json({ mensaje: "Estado inválido" });
      }
      cambios.push([campo, Number(valor)]);
    } else {
      if (typeof valor !== "string" || !valor.trim()) {
        return res.status(400).json({ mensaje: `Valor inválido para ${campo}` });
      }
      // Si es correo, lo pasamos a minúsculas
      const valorLimpio = campo === "correo" ? valor.trim().toLowerCase() : valor.trim();
      cambios.push([campo, valorLimpio]);
    }
  }

  try {
    const asignaciones = cambios.map(([campo]) => `${campo} = ?`).join(", ");
    const valores = cambios.map(([, valor]) => valor);

    const [resultado] = await pool.execute(
      `UPDATE sti_estudiantes SET ${asignaciones} WHERE id = ?`,
      [...valores, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Estudiante no encontrado" });
    }

    return res.status(200).json({ mensaje: "Estudiante actualizado parcialmente" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "El código ya existe" });
    }
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};
