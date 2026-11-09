import pool from "../config/db.js";

const LIMITE_MAXIMO = 50;

// Función para validar enteros positivos (igual que en programas)
const enteroPositivo = (valor, porDefecto) => {
    if (valor === undefined) return porDefecto;
    if (typeof valor !== "string") return null;
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0 ? numero : null;
};

export const listarUnidadesDidacticas = async (req, res) => {
    const { buscar, ciclo } = req.query;
    const pagina = enteroPositivo(req.query.pagina, 1);
    const limite = enteroPositivo(req.query.limite, 5);

    // 1. Validaciones
    if (pagina === null || limite === null || limite > LIMITE_MAXIMO) {
        return res.status(400).json({ mensaje: `pagina y limite deben ser enteros positivos (límite máximo ${LIMITE_MAXIMO})` });
    }
    if (buscar !== undefined && typeof buscar !== "string") {
        return res.status(400).json({ mensaje: "buscar debe ser un texto" });
    }
    if (ciclo !== undefined && enteroPositivo(ciclo, null) === null) {
        return res.status(400).json({ mensaje: "ciclo debe ser un entero positivo" });
    }

    const texto = buscar ? buscar.trim() : "";
    const condiciones = [];
    const valores = [];

    // 2. Filtro de búsqueda (código o nombre de la unidad)
    if (texto) {
        condiciones.push("(u.nombre LIKE ? OR u.codigo LIKE ?)");
        valores.push(`%${texto}%`, `%${texto}%`);
    }

    // 3. Filtro adicional por ciclo (usando el JOIN)
    if (ciclo !== undefined) {
        condiciones.push("pu.ciclo_id = ?");
        valores.push(Number(ciclo));
    }

    const where = condiciones.length > 0 ? "WHERE " + condiciones.join(" AND ") : "";
    const offset = (pagina - 1) * limite;

    try {
        // Consulta de conteo con DISTINCT para no contar duplicados si la unidad está en varios planes
        const [conteo] = await pool.query(
            `SELECT COUNT(DISTINCT u.id) AS total 
             FROM sti_unidades_didacticas u
             LEFT JOIN sti_plan_unidades pu ON pu.unidad_id = u.id
             ${where}`,
            valores
        );
        const total = conteo[0].total;

        // Consulta de datos con DISTINCT
        const [filas] = await pool.query(
            `SELECT DISTINCT u.id, u.codigo, u.nombre 
             FROM sti_unidades_didacticas u
             LEFT JOIN sti_plan_unidades pu ON pu.unidad_id = u.id
             ${where}
             ORDER BY u.nombre ASC, u.id ASC
             LIMIT ? OFFSET ?`,
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

// Agrega esto al final de tu archivo unidades.controller.js
export const obtenerUnidad = async (req, res) => {
    const { id } = req.params;

    // Validamos que el ID sea un número positivo
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        return res.status(400).json({ mensaje: "El ID debe ser un entero positivo" });
    }

    try {
        // Buscamos la unidad por su ID
        const [filas] = await pool.query(
            "SELECT id, codigo, nombre FROM sti_unidades_didacticas WHERE id = ?",
            [id]
        );

        // Si no existe, devolvemos 404
        if (filas.length === 0) {
            return res.status(404).json({ mensaje: "Unidad didáctica no encontrada" });
        }

        // Si existe, devolvemos los datos
        return res.status(200).json(filas[0]);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error interno del servidor" });
    }
};

// ==========================================
// PEGA ESTO AL FINAL DE unidades.controller.js
// ==========================================

export const registrarUnidad = async (req, res) => {
    const { codigo, nombre } = req.body;

    if (!codigo || !nombre) {
        return res.status(400).json({ mensaje: "El código y el nombre son obligatorios" });
    }

    try {
        const [resultado] = await pool.query(
            "INSERT INTO sti_unidades_didacticas (codigo, nombre) VALUES (?, ?)",
            [codigo, nombre]
        );
        return res.status(201).json({ mensaje: "Unidad registrada", id: resultado.insertId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error al registrar unidad" });
    }
};

export const actualizarUnidad = async (req, res) => {
    const { id } = req.params;
    const { codigo, nombre } = req.body;

    try {
        const [resultado] = await pool.query(
            "UPDATE sti_unidades_didacticas SET codigo = ?, nombre = ? WHERE id = ?",
            [codigo, nombre, id]
        );
        
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Unidad no encontrada" });
        }
        return res.status(200).json({ mensaje: "Unidad actualizada" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error al actualizar unidad" });
    }
};

export const eliminarUnidad = async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await pool.query(
            "DELETE FROM sti_unidades_didacticas WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Unidad no encontrada" });
        }
        return res.status(200).json({ mensaje: "Unidad eliminada" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: "Error al eliminar unidad" });
    }
};
