export const validarPrograma = (req, res, next) => {
    const { codigo, nombre_actual, activo } = req.body ?? {};
    const errores = [];

    if (typeof codigo !== "string" || !codigo.trim()) {
        errores.push("El codigo es obligatorio");
    } else if (codigo.trim().length > 20) {
        errores.push("El codigo admite máximo 20 caracteres");
    }

    if (typeof nombre_actual !== "string" || !nombre_actual.trim()) {
        errores.push("El nombre es obligatorio");
    } else if (nombre_actual.trim().length > 200) {
        errores.push("El nombre admite máximo 200 caracteres");
    }

    if (activo !== undefined && ![0, 1, true, false].includes(activo)) {
        errores.push("activo debe ser 0 o 1");
    }

    if (errores.length > 0) {
        return res.status(400).json({ mensaje: "Datos inválidos", errores });
    }
    next(); // datos correctos: continúa al controlador
};
