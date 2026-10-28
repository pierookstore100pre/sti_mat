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

//Implementando Put /api/v1/programas/:id para actualizar un programa existente
//IMPORTANTE: Agregamos la función actualizarPrograma para actualizar un programa existente
export const actualizarPrograma = async (req, res) => {
  const id = Number(req.params.id);
  const { codigo, nombre_actual, activo } = req.body ?? {};

  // 1. Validar ID
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }

  // 2. Validar que vengan los 3 campos obligatorios
  if (
    typeof codigo !== "string" || !codigo.trim() ||
    typeof nombre_actual !== "string" || !nombre_actual.trim() ||
    ![0, 1, true, false].includes(activo)
  ) {
    return res.status(400).json({
      mensaje: "Código, nombre y estado son obligatorios"
    });
  }

  try {
    const [resultado] = await pool.execute(
      `UPDATE sti_programas_estudios
       SET codigo = ?, nombre_actual = ?, activo = ?
       WHERE id = ?`,
      [codigo.trim(), nombre_actual.trim(), Number(activo), id]
    );

    // 3. Si no se actualizó ninguna fila, el ID no existe
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Programa no encontrado" });
    }

    return res.status(200).json({
      mensaje: "Programa actualizado correctamente"
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "El código ya existe" });
    }
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }


  
};

export const actualizarParcialPrograma = async (req, res) => {
  const id = Number(req.params.id);
  const datos = req.body;

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }

  // 1. Campos permitidos (evita inyección o columnas inexistentes)
  const permitidos = ["codigo", "nombre_actual", "activo"];

  // 2. Validar que el body no esté vacío y solo tenga campos permitidos
  if (
    !datos || typeof datos !== "object" || Array.isArray(datos) ||
    Object.keys(datos).length === 0 ||
    Object.keys(datos).some(campo => !permitidos.includes(campo))
  ) {
    return res.status(400).json({
      mensaje: "Envía al menos un campo permitido (codigo, nombre_actual, activo)"
    });
  }

  // 3. Construir la lista de cambios validando cada valor
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
      cambios.push([campo, valor.trim()]);
    }
  }

  try {
    // 4. Generar SQL dinámico: "codigo = ?, nombre_actual = ?"
    const asignaciones = cambios.map(([campo]) => `${campo} = ?`).join(", ");
    const valores = cambios.map(([, valor]) => valor);

    const [resultado] = await pool.execute(
      `UPDATE sti_programas_estudios SET ${asignaciones} WHERE id = ?`,
      [...valores, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Programa no encontrado" });
    }

    return res.status(200).json({
      mensaje: "Programa actualizado parcialmente"
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ mensaje: "El código ya existe" });
    }
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};

// Implementando DELETE /api/v1/programas/:id para eliminar un programa existente
export const eliminarPrograma = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ mensaje: "ID inválido" });
  }

  try {
    const [resultado] = await pool.execute(
      "DELETE FROM sti_programas_estudios WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: "Programa no encontrado" });
    }

    return res.status(200).json({
      mensaje: "Programa eliminado correctamente"
    });
  } catch (error) {
    // 2. Capturar error de clave foránea
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(409).json({
        mensaje: "No se puede eliminar: existen registros relacionados"
      });
    }
    console.error(error);
    return res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};