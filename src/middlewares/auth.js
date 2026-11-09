import jwt from "jsonwebtoken";

export const verificarToken = (req, res, next) => {
    const [tipo, token] = (req.headers.authorization || "").split(" ");
    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({ mensaje: "Token requerido" });
    }
    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ mensaje: "Token inválido o expirado" });
    }
};

export const autorizar = (...rolesPermitidos) => (req, res, next) => {
    const roles = req.usuario?.roles ?? [];
    if (!roles.some(rol => rolesPermitidos.includes(rol))) {
        return res.status(403).json({ mensaje: "No tiene permiso para esta acción" });
    }
    next();
};
