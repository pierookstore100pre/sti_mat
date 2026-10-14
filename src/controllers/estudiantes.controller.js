import { estudiantes } from "../data/estudiantes.js";

export const listarEstudiantes = (req, res) => {
  res.json(estudiantes);
};
