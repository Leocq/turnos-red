import { AppError } from "../errors/app-error.js";
import type { FiltrosTurnos, Turno } from "../models/turno.model.js";
import { turnoPersistidoSchema } from "../schemas/turno.schemas.js";
import {
  normalizarEspecialidad,
  normalizarFecha,
} from "../utils/normalization.js";
import { readJsonArray, writeJsonArray } from "./json-file.service.js";

export function obtenerRutaTurnos(): string {
  return process.env.DATA_FILE ?? "./data/turnos.json";
}

export async function cargarTurnosDesdeArchivo(
  rutaArchivo = obtenerRutaTurnos(),
): Promise<Turno[]> {
  const datos = await readJsonArray(rutaArchivo);
  const turnos: Turno[] = [];

  for (const [indice, registro] of datos.entries()) {
    const resultado = turnoPersistidoSchema.safeParse(registro);

    if (!resultado.success) {
      throw new Error(
        `El turno en la posición ${indice} de ${rutaArchivo} no es válido`,
      );
    }

    turnos.push(resultado.data);
  }

  return turnos;
}

async function guardarTurnos(turnos: Turno[]): Promise<void> {
  await writeJsonArray(obtenerRutaTurnos(), turnos);
}

export async function listarTurnos(
  filtros: FiltrosTurnos = {},
): Promise<Turno[]> {
  let turnos = await cargarTurnosDesdeArchivo();

  if (filtros.especialidad) {
    const especialidad = normalizarEspecialidad(filtros.especialidad);
    turnos = turnos.filter((turno) => turno.especialidad === especialidad);
  }

  if (filtros.fecha) {
    const fecha = normalizarFecha(filtros.fecha);
    turnos = turnos.filter((turno) => turno.fecha === fecha);
  }

  if (filtros.medicoId !== undefined) {
    const medicoId = Number(filtros.medicoId);
    turnos = turnos.filter((turno) => turno.medicoId === medicoId);
  }

  return turnos;
}

export async function buscarTurnoPorId(id: number): Promise<Turno | undefined> {
  const turnos = await cargarTurnosDesdeArchivo();
  return turnos.find((turno) => turno.id === id);
}

export async function crearTurno(turno: Turno): Promise<Turno> {
  const turnos = await cargarTurnosDesdeArchivo();

  if (turnos.some((existente) => existente.id === turno.id)) {
    throw new AppError(
      400,
      `Ya existe un turno con el ID ${turno.id}`,
      "DUPLICATE_TURNO_ID",
    );
  }

  turnos.push(turno);
  await guardarTurnos(turnos);
  return turno;
}

export async function actualizarTurno(
  id: number,
  turno: Turno,
): Promise<Turno | undefined> {
  const turnos = await cargarTurnosDesdeArchivo();
  const indice = turnos.findIndex((existente) => existente.id === id);

  if (indice === -1) {
    return undefined;
  }

  turnos[indice] = turno;
  await guardarTurnos(turnos);
  return turno;
}

export async function eliminarTurno(id: number): Promise<Turno | undefined> {
  const turnos = await cargarTurnosDesdeArchivo();
  const indice = turnos.findIndex((turno) => turno.id === id);

  if (indice === -1) {
    return undefined;
  }

  const [eliminado] = turnos.splice(indice, 1);
  await guardarTurnos(turnos);
  return eliminado;
}
