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
import { enviarError } from "../utils/error-response.js";

/**
 * Validación previa: verifica que el médico asignado al turno exista y que
 * su especialidad coincida con la del turno. Lanza un AppError (400) cuando
 * no se cumple para cortar el flujo con un retorno anticipado.
 */
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
  let status = 200;

  try {
    const filtros = req.query as FiltrosTurnos;
    const turnos = await listarTurnos(filtros);

    res.status(status).json(turnos);
    return;
  } catch (error) {
    enviarError(res, error);
    return;
  }
}

export async function obtenerTurnoPorId(
  req: Request,
  res: Response,
): Promise<void> {
  let status = 200;

  try {
    const id = Number(req.params.id);
    const turno = await buscarTurnoPorId(id);

    if (!turno) {
      status = 404;
      throw new AppError(status, "Turno no encontrado", "TURNO_NOT_FOUND");
    }

    res.status(status).json(turno);
    return;
  } catch (error) {
    enviarError(res, error);
    return;
  }
}

export async function crearTurno(req: Request, res: Response): Promise<void> {
  let status = 201;

  try {
    const turno = req.body as Turno;
    await validarMedicoAsignado(turno);

    const creado = await crearTurnoEnArchivo(turno);
    turnosEventBus.emit(EVENTOS_TURNOS.CREADO, creado);

    res.status(status).json(creado);
    return;
  } catch (error) {
    enviarError(res, error);
    return;
  }
}

export async function actualizarTurno(
  req: Request,
  res: Response,
): Promise<void> {
  let status = 200;

  try {
    const id = Number(req.params.id);
    const turno = { id, ...req.body } as Turno;
    await validarMedicoAsignado(turno);

    const actualizado = await actualizarTurnoEnArchivo(id, turno);

    if (!actualizado) {
      status = 404;
      throw new AppError(status, "Turno no encontrado", "TURNO_NOT_FOUND");
    }

    turnosEventBus.emit(EVENTOS_TURNOS.ACTUALIZADO, actualizado);

    res.status(status).json(actualizado);
    return;
  } catch (error) {
    enviarError(res, error);
    return;
  }
}

export async function eliminarTurno(req: Request, res: Response): Promise<void> {
  let status = 204;

  try {
    const id = Number(req.params.id);
    const eliminado = await eliminarTurnoEnArchivo(id);

    if (!eliminado) {
      status = 404;
      throw new AppError(status, "Turno no encontrado", "TURNO_NOT_FOUND");
    }

    turnosEventBus.emit(EVENTOS_TURNOS.ELIMINADO, eliminado);

    res.status(status).send();
    return;
  } catch (error) {
    enviarError(res, error);
    return;
  }
}
