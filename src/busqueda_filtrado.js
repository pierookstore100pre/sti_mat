const estudiantes = [
  { id: 1, nombre: "Lucía", edad: 20, activo: true },
  { id: 2, nombre: "Carlos", edad: 19, activo: false },
  { id: 3, nombre: "Ana", edad: 21, activo: true }
];
const serviciosTI = [
  { id: 1, nombre: "Matrícula", activo: true },
  { id: 2, nombre: "Pagos", activo: true },
  { id: 3, nombre: "Certificados", activo: false }
];


const id3 = estudiantes.find(e => e.id === 3);
console.log(id3);

const mayores20 = estudiantes.filter(e => e.edad >= 20);
console.log(mayores20);

const etiquetas = estudiantes.map(e => {
  return `${e.nombre} - ${e.activo ? "Activo" : "Inactivo"}`;
});
console.log(etiquetas);
