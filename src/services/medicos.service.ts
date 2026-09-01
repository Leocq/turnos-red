import { AppError } from "../errors/app-error.js";
import type { FiltrosMedicos, Medico } from "../models/medico.model.js";
import { medicoPersistidoSchema } from "../schemas/medico.schemas.js";
import {
  normalizarBooleano,
  normalizarEspecialidad,
} from "../utils/normalization.js";
import { readJsonArray, writeJsonArray } from "./json-file.service.js";
import { listarTurnos } from "./turnos.service.js";

export function obtenerRutaMedicos(): string {
  return process.env.MEDICOS_DATA_FILE ?? "./data/medicos.json";
}

export async function cargarMedicosDesdeArchivo(): Promise<Medico[]> {
  const rutaArchivo = obtenerRutaMedicos();
  const datos = await readJsonArray(rutaArchivo);
  const medicos: Medico[] = [];

  for (const [indice, registro] of datos.entries()) {
    const resultado = medicoPersistidoSchema.safeParse(registro);

    if (!resultado.success) {
      throw new Error(
        `El médico en la posición ${indice} de ${rutaArchivo} no es válido`,
      );
    }

    medicos.push(resultado.data);
  }

  return medicos;
}

async function guardarMedicos(medicos: Medico[]): Promise<void> {
  await writeJsonArray(obtenerRutaMedicos(), medicos);
}

export async function listarMedicos(
  filtros: FiltrosMedicos = {},
): Promise<Medico[]> {
  let medicos = await cargarMedicosDesdeArchivo();

  if (filtros.especialidad) {
    const especialidad = normalizarEspecialidad(filtros.especialidad);
    medicos = medicos.filter((medico) => medico.especialidad === especialidad);
  }

  if (filtros.disponible !== undefined) {
    const disponible = normalizarBooleano(filtros.disponible) as boolean;
    medicos = medicos.filter((medico) => medico.disponible === disponible);
  }

  return medicos;
}

export async function buscarMedicoPorId(
  id: number,
): Promise<Medico | undefined> {
  const medicos = await cargarMedicosDesdeArchivo();
  return medicos.find((medico) => medico.id === id);
}

export async function crearMedico(medico: Medico): Promise<Medico> {
  const medicos = await cargarMedicosDesdeArchivo();

  if (medicos.some((existente) => existente.id === medico.id)) {
    throw new AppError(
      400,
      `Ya existe un médico con el ID ${medico.id}`,
      "DUPLICATE_MEDICO_ID",
    );
  }

  if (medicos.some((existente) => existente.documento === medico.documento)) {
    throw new AppError(
      400,
      `Ya existe un médico con el documento ${medico.documento}`,
      "DUPLICATE_MEDICO_DOCUMENTO",
    );
  }

  medicos.push(medico);
  await guardarMedicos(medicos);
  return medico;
}

export async function actualizarMedico(
  id: number,
  medico: Medico,
): Promise<Medico | undefined> {
  const medicos = await cargarMedicosDesdeArchivo();
  const indice = medicos.findIndex((existente) => existente.id === id);

  if (indice === -1) {
    return undefined;
  }

  const documentoDuplicado = medicos.some(
    (existente) =>
      existente.id !== id && existente.documento === medico.documento,
  );

  if (documentoDuplicado) {
    throw new AppError(
      400,
      `Ya existe un médico con el documento ${medico.documento}`,
      "DUPLICATE_MEDICO_DOCUMENTO",
    );
  }

  medicos[indice] = medico;
  await guardarMedicos(medicos);
  return medico;
}

export async function eliminarMedico(id: number): Promise<Medico | undefined> {
  const medicos = await cargarMedicosDesdeArchivo();
  const indice = medicos.findIndex((medico) => medico.id === id);

  if (indice === -1) {
    return undefined;
  }

  const turnosAsignados = await listarTurnos({ medicoId: id });

  if (turnosAsignados.length > 0) {
    throw new AppError(
      400,
      "No se puede eliminar un médico que tiene turnos asignados",
      "MEDICO_HAS_TURNOS",
      [
        {
          field: "params.id",
          message: `El médico tiene ${turnosAsignados.length} turno(s) asignado(s)`,
        },
      ],
    );
  }

  const [eliminado] = medicos.splice(indice, 1);
  await guardarMedicos(medicos);
  return eliminado;
}
