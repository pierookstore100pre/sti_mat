import pool from "../config/db.js";

const LIMITE_MAXIMO = 50;

// Función para validar que un valor sea un entero positivo, si no lo es devuelve null
const enteroPositivo = (valor, porDefecto) => {
    if (valor === undefined) return porDefecto;
    if (typeof valor !== "string") return null; // Si llega un arreglo (ej. ?buscar=a&buscar=b) falla
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0 ? numero : null;
};

// agregamos la funcion listarProgramas para listar todos los programas de estudio con paginación y búsqueda
// Implementando GET /api/v1/programas para listar todos los programas de estudio con paginación y búsqueda
export const listarProgramas = async (req, res) => {
    const { buscar, activo } = req.query;
    const pagina = enteroPositivo(req.query.pagina, 1);
    const limite = enteroPositivo(req.query.limite, 5);

    // Validaciones
    if (pagina === null || limite === null || limite > LIMITE_MAXIMO) {
        return res.status(400).json({ mensaje: `pagina y limite deben ser enteros positivos (límite máximo ${LIMITE_MAXIMO})` });
    }
    if (buscar !== undefined && typeof buscar !== "string") {
        return res.status(400).json({ mensaje: "buscar debe ser un texto" });
    }
    if (activo !== undefined && activo !== "0" && activo !== "1") {
        return res.status(400).json({ mensaje: "activo debe ser 0 o 1" });
    }

    const texto = buscar ? buscar.trim() : "";
    const condiciones = [];
    const valores = [];

    if (texto) {
        condiciones.push("(nombre_actual LIKE ? OR codigo LIKE ?)");
        valores.push(`%${texto}%`, `%${texto}%`);
    }
    if (activo !== undefined) {
        condiciones.push("activo = ?");
        valores.push(Number(activo));
    }

    const where = condiciones.length > 0 ? "WHERE " + condiciones.join(" AND ") : "";
    const offset = (pagina - 1) * limite;

    try {
        const [conteo] = await pool.query(
            `SELECT COUNT(*) AS total FROM sti_programas_estudios ${where}`,
            valores
        );
        const total = conteo[0].total;

        const [filas] = await pool.query(
            `SELECT id, codigo, nombre_actual, activo FROM sti_programas_estudios ${where} ORDER BY nombre_actual ASC, id ASC LIMIT ? OFFSET ?`,
            [...valores, limite, offset]
        );

        return res.status(200).json({
            pagina,
            limite,
            total,
            totalPaginas: Math.ceil(total / limite),
            datos: filas
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

// hasta aqui es listarProgramas, ahora agregamos la funcion obtenerPrograma para obtener un programa por su id   
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

// Implementando GET /api/v1/programas/unidades/:id para listar las unidades de un programa por su id
export const listarUnidadesPorPrograma = async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ mensaje: "ID inválido" });
    }

    const { ciclo } = req.query;
    if (ciclo !== undefined && enteroPositivo(ciclo, null) === null) {
        return res.status(400).json({ mensaje: "ciclo debe ser un entero positivo" });
    }

    try {
        const [programa] = await pool.execute("SELECT id FROM sti_programas_estudios WHERE id = ?", [id]);
        if (programa.length === 0) {
            return res.status(404).json({ mensaje: "Programa no encontrado" });
        }

        let sql = `SELECT p.id AS programa_id, p.nombre_actual AS programa, 
                          pl.codigo AS plan, c.nombre AS ciclo, 
                          u.codigo, u.nombre AS unidad, pu.creditos 
                   FROM sti_programas_estudios p 
                   INNER JOIN sti_planes_estudios pl ON pl.programa_id = p.id 
                   INNER JOIN sti_plan_unidades pu ON pu.plan_id = pl.id 
                   INNER JOIN sti_unidades_didacticas u ON u.id = pu.unidad_id 
                   INNER JOIN sti_ciclos c ON c.id = pu.ciclo_id 
                   WHERE p.id = ?`;
        
        const valores = [id];

        if (ciclo !== undefined) {
            sql += " AND pu.ciclo_id = ?";
            valores.push(Number(ciclo));
        }
        sql += " ORDER BY pl.anio_plan DESC, pu.ciclo_id, u.nombre";

        const [filas] = await pool.execute(sql, valores);
        return res.status(200).json(filas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};
