import type { Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { EVENTOS_TURNOS, turnosEventBus } from "../events/turnos.events.js";
import type { FiltrosTurnos, Turno } from "../models/turno.model.js";
import { buscarMedicoPorId } from "../services/medicos.service.js";
import {
  actualizarTurno as actualizarTurnoEnArchivo,
  buscarTurnoPorId,
  crearTurno as crearTurnoEnArchivo,
  eliminarTurno as eliminarTurnoEnArchivo,
  listarTurnos,
} from "../services/turnos.service.js";

async function validarMedicoAsignado(turno: Turno): Promise<void> {
  const medico = await buscarMedicoPorId(turno.medicoId);

  if (!medico) {
    throw new AppError(
      400,
      `No existe un médico con el ID ${turno.medicoId}`,
      "INVALID_MEDICO_ID",
      [{ field: "body.medicoId", message: "El médico indicado no existe" }],
    );
  }

  if (medico.especialidad !== turno.especialidad) {
    throw new AppError(
      400,
      "La especialidad del turno no coincide con la del médico",
      "SPECIALTY_MISMATCH",
      [
        {
          field: "body.especialidad",
          message: `El médico ${medico.id} pertenece a ${medico.especialidad}`,
        },
      ],
    );
  }
}

export async function obtenerTurnos(
  req: Request,
  res: Response,
): Promise<void> {
  const filtros = req.query as FiltrosTurnos;
  const turnos = await listarTurnos(filtros);
  res.status(200).json(turnos);
}

export async function obtenerTurnoPorId(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);
  const turno = await buscarTurnoPorId(id);

  if (!turno) {
    throw new AppError(404, "Turno no encontrado", "TURNO_NOT_FOUND");
  }

  res.status(200).json(turno);
}

export async function crearTurno(req: Request, res: Response): Promise<void> {
  const turno = req.body as Turno;
  await validarMedicoAsignado(turno);

  const creado = await crearTurnoEnArchivo(turno);
  turnosEventBus.emit(EVENTOS_TURNOS.CREADO, creado);
  res.status(201).json(creado);
}

export async function actualizarTurno(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);
  const turno = { id, ...req.body } as Turno;
  await validarMedicoAsignado(turno);

  const actualizado = await actualizarTurnoEnArchivo(id, turno);

  if (!actualizado) {
    throw new AppError(404, "Turno no encontrado", "TURNO_NOT_FOUND");
  }

  turnosEventBus.emit(EVENTOS_TURNOS.ACTUALIZADO, actualizado);
  res.status(200).json(actualizado);
}

export async function eliminarTurno(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);
  const eliminado = await eliminarTurnoEnArchivo(id);

  if (!eliminado) {
    throw new AppError(404, "Turno no encontrado", "TURNO_NOT_FOUND");
  }

  turnosEventBus.emit(EVENTOS_TURNOS.ELIMINADO, eliminado);
  res.status(204).send();
}
