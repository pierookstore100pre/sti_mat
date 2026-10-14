import { estudiantes } from "../data/estudiantes.js";

export const buscarPorId = id => {
  return estudiantes.find(e => e.id === id);
};

export const listarActivos = () => {
  return estudiantes.filter(e => e.activo === true);
};