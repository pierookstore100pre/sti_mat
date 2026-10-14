import { cursos } from "../data/cursos.js";

export const listarCursos = (req, res) => {
  res.json(cursos);
};
