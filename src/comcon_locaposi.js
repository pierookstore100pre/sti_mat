const estudiantes = [
  { id: 1, nombre: "Lucía", edad: 20, activo: true },
  { id: 2, nombre: "Carlos", edad: 19, activo: false },
  { id: 3, nombre: "Ana", edad: 21, activo: true }
];

const existeInactivo = estudiantes.some(e => e.activo === false);
const todosActivos = estudiantes.every(e => e.activo === true);
const posicion = estudiantes.findIndex(e => e.id === 3);
const noExiste = estudiantes.findIndex(e => e.id === 99);

console.log(estudiantes.findIndex(e => e.id === 2));  // 1
console.log(estudiantes.findIndex(e => e.id === 50)); // -1
