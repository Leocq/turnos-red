import "dotenv/config";
import { cargarTurnosDesdeArchivo } from "./services/turnos.service.js";

const rutaArchivo = process.env.DATA_FILE ?? "./data/turnos.json";

const turnos = await cargarTurnosDesdeArchivo(rutaArchivo);

console.log(turnos);
