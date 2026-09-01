import type { Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import type { FiltrosMedicos, Medico } from "../models/medico.model.js";
import {
  actualizarMedico as actualizarMedicoEnArchivo,
  buscarMedicoPorId,
  crearMedico as crearMedicoEnArchivo,
  eliminarMedico as eliminarMedicoEnArchivo,
  listarMedicos,
} from "../services/medicos.service.js";

export async function obtenerMedicos(
  req: Request,
  res: Response,
): Promise<void> {
  const filtros = req.query as FiltrosMedicos;
  const medicos = await listarMedicos(filtros);
  res.status(200).json(medicos);
}

export async function obtenerMedicoPorId(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);
  const medico = await buscarMedicoPorId(id);

  if (!medico) {
    throw new AppError(404, "Médico no encontrado", "MEDICO_NOT_FOUND");
  }

  res.status(200).json(medico);
}

export async function crearMedico(req: Request, res: Response): Promise<void> {
  const medico = req.body as Medico;
  const creado = await crearMedicoEnArchivo(medico);
  res.status(201).json(creado);
}

export async function actualizarMedico(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);
  const medico = { id, ...req.body } as Medico;
  const actualizado = await actualizarMedicoEnArchivo(id, medico);

  if (!actualizado) {
    throw new AppError(404, "Médico no encontrado", "MEDICO_NOT_FOUND");
  }

  res.status(200).json(actualizado);
}

export async function eliminarMedico(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);
  const eliminado = await eliminarMedicoEnArchivo(id);

  if (!eliminado) {
    throw new AppError(404, "Médico no encontrado", "MEDICO_NOT_FOUND");
  }

  res.status(204).send();
}
