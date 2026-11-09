export const registrarSolicitud = (req, res, next) => {
    const hora = new Date().toLocaleTimeString();
    console.log(`${hora} ${req.method} ${req.originalUrl}`);
    next(); // deja pasar la solicitud al siguiente paso
};
