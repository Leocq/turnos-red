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
import { enviarError } from "../utils/error-response.js";

export async function obtenerMedicos(
  req: Request,
  res: Response,
): Promise<void> {
  let status = 200;

  try {
    const filtros = req.query as FiltrosMedicos;
    const medicos = await listarMedicos(filtros);

    res.status(status).json(medicos);
    return;
  } catch (error) {
    enviarError(res, error);
    return;
  }
}

export async function obtenerMedicoPorId(
  req: Request,
  res: Response,
): Promise<void> {
  let status = 200;

  try {
    const id = Number(req.params.id);
    const medico = await buscarMedicoPorId(id);

    if (!medico) {
      status = 404;
      throw new AppError(status, "Médico no encontrado", "MEDICO_NOT_FOUND");
    }

    res.status(status).json(medico);
    return;
  } catch (error) {
    enviarError(res, error);
    return;
  }
}

export async function crearMedico(req: Request, res: Response): Promise<void> {
  let status = 201;

  try {
    const medico = req.body as Medico;
    const creado = await crearMedicoEnArchivo(medico);

    res.status(status).json(creado);
    return;
  } catch (error) {
    enviarError(res, error);
    return;
  }
}

export async function actualizarMedico(
  req: Request,
  res: Response,
): Promise<void> {
  let status = 200;

  try {
    const id = Number(req.params.id);
    const medico = { id, ...req.body } as Medico;
    const actualizado = await actualizarMedicoEnArchivo(id, medico);

    if (!actualizado) {
      status = 404;
      throw new AppError(status, "Médico no encontrado", "MEDICO_NOT_FOUND");
    }

    res.status(status).json(actualizado);
    return;
  } catch (error) {
    enviarError(res, error);
    return;
  }
}

export async function eliminarMedico(
  req: Request,
  res: Response,
): Promise<void> {
  let status = 204;

  try {
    const id = Number(req.params.id);
    const eliminado = await eliminarMedicoEnArchivo(id);

    if (!eliminado) {
      status = 404;
      throw new AppError(status, "Médico no encontrado", "MEDICO_NOT_FOUND");
    }

    res.status(status).send();
    return;
  } catch (error) {
    enviarError(res, error);
    return;
  }
}
