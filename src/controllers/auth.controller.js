import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export const login = async (req, res) => {
    const { nombre_usuario, password } = req.body ?? {};
    if (typeof nombre_usuario !== "string" || typeof password !== "string") {
        return res.status(400).json({ mensaje: "nombre_usuario y password son obligatorios" });
    }

    const [filas] = await pool.execute(
        `SELECT u.id, u.nombre_usuario, u.password_hash, u.activo,
                GROUP_CONCAT(r.codigo) AS roles
         FROM sti_usuarios u
         LEFT JOIN sti_usuarios_roles ur ON ur.usuario_id = u.id
         LEFT JOIN sti_roles r ON r.id = ur.rol_id
         WHERE u.nombre_usuario = ?
         GROUP BY u.id`,
        [nombre_usuario]
    );
    const usuario = filas[0];

    if (!usuario || !usuario.activo || !(await bcrypt.compare(password, usuario.password_hash))) {
        return res.status(401).json({ mensaje: "Credenciales incorrectas" });
    }

    const roles = usuario.roles ? usuario.roles.split(",") : [];
    const token = jwt.sign(
        { id: usuario.id, nombre_usuario: usuario.nombre_usuario, roles },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    await pool.execute("UPDATE sti_usuarios SET ultimo_acceso = NOW() WHERE id = ?", [usuario.id]);
    return res.status(200).json({ token, roles });
};
