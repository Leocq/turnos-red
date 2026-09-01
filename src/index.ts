import "dotenv/config";
import { cargarMedicosDesdeArchivo } from "./services/medicos.service.js";
import { cargarTurnosDesdeArchivo } from "./services/turnos.service.js";

const turnos = await cargarTurnosDesdeArchivo();
const medicos = await cargarMedicosDesdeArchivo();

console.log({ turnos, medicos });
