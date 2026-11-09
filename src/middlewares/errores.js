export const noEncontrado = (req, res) => {
    res.status(404).json({ mensaje: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
};

export const manejadorErrores = (err, req, res, next) => {
    console.error(err); // en consola
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ mensaje: "El cuerpo JSON está mal formado" });
    }
    const status = err.status || 500;
    res.status(status).json({
        mensaje: status === 500 ? "Error interno del servidor" : err.message
    });
};
