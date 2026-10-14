const estudiantes = [
  { id: 1, nombre: "Lucía", edad: 20, activo: true },
  { id: 2, nombre: "Carlos", edad: 19, activo: false },
  { id: 3, nombre: "Ana", edad: 21, activo: true }
];

const obtenerNombres = () => {
  return estudiantes.map(estudiante => estudiante.nombre);
};

console.log(obtenerNombres());
