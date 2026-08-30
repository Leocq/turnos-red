import type { Request, Response } from "express";
import type { TurnoCrudo } from "../models/turno.model.js";
import {
  cargarTurnosDesdeArchivo,
  guardarTurnosEnArchivo,
} from "../services/turnos.service.js";
import { normalizarTurno } from "../services/normalizacion.service.js";
import { turnosEventBus, EVENTOS_TURNOS } from "../events/turnos.events.js";

const obtenerRutaArchivo = (): string => {
  return process.env.DATA_FILE ?? "./data/turnos.json";
};

// GET /turnos
export async function obtenerTurnos(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const rutaArchivo = obtenerRutaArchivo();
    const turnos = await cargarTurnosDesdeArchivo(rutaArchivo);

    res.status(200).json(turnos);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener los turnos",
    });
  }
}

// GET /turnos/:id
export async function obtenerTurnoPorId(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        mensaje: "El ID debe ser un número entero positivo",
      });
      return;
    }

    const rutaArchivo = obtenerRutaArchivo();
    const turnos = await cargarTurnosDesdeArchivo(rutaArchivo);

    const turno = turnos.find((item) => item.id === id);

    if (!turno) {
      res.status(404).json({
        mensaje: "Turno no encontrado",
      });
      return;
    }

    res.status(200).json(turno);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener el turno",
    });
  }
}

// POST /turnos
export async function crearTurno(req: Request, res: Response): Promise<void> {
  try {
    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({
        mensaje: "Debe enviar los datos del turno en formato JSON",
      });
      return;
    }

    const datosCrudos = req.body as TurnoCrudo;
    const nuevoTurno = normalizarTurno(datosCrudos);

    if (!nuevoTurno) {
      res.status(400).json({
        mensaje: "Los datos del turno no son válidos",
      });
      return;
    }

    const rutaArchivo = obtenerRutaArchivo();
    const turnos = await cargarTurnosDesdeArchivo(rutaArchivo);

    const existeId = turnos.some((turno) => turno.id === nuevoTurno.id);

    if (existeId) {
      res.status(400).json({
        mensaje: `Ya existe un turno con el ID ${nuevoTurno.id}`,
      });
      return;
    }

    turnos.push(nuevoTurno);

    await guardarTurnosEnArchivo(rutaArchivo, turnos);

    // Evento interno
    turnosEventBus.emit(EVENTOS_TURNOS.CREADO, nuevoTurno);

    res.status(201).json(nuevoTurno);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al crear el turno",
    });
  }
}

// PUT /turnos/:id
export async function actualizarTurno(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        mensaje: "El ID debe ser un número entero positivo",
      });
      return;
    }

    if (!req.body || typeof req.body !== "object") {
      res.status(400).json({
        mensaje: "Debe enviar los datos del turno en formato JSON",
      });
      return;
    }

    const rutaArchivo = obtenerRutaArchivo();
    const turnos = await cargarTurnosDesdeArchivo(rutaArchivo);

    const indice = turnos.findIndex((turno) => turno.id === id);

    if (indice === -1) {
      res.status(404).json({
        mensaje: "Turno no encontrado",
      });
      return;
    }

    const datosCrudos: TurnoCrudo = {
      ...req.body,
      id,
    };

    const turnoActualizado = normalizarTurno(datosCrudos);

    if (!turnoActualizado) {
      res.status(400).json({
        mensaje: "Los datos del turno no son válidos",
      });
      return;
    }

    turnos[indice] = turnoActualizado;

    await guardarTurnosEnArchivo(rutaArchivo, turnos);

    // Evento interno
    turnosEventBus.emit(EVENTOS_TURNOS.ACTUALIZADO, turnoActualizado);

    res.status(200).json(turnoActualizado);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al actualizar el turno",
    });
  }
}

// DELETE /turnos/:id
export async function eliminarTurno(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        mensaje: "El ID debe ser un número entero positivo",
      });
      return;
    }

    const rutaArchivo = obtenerRutaArchivo();
    const turnos = await cargarTurnosDesdeArchivo(rutaArchivo);

    const indice = turnos.findIndex((turno) => turno.id === id);

    if (indice === -1) {
      res.status(404).json({
        mensaje: "Turno no encontrado",
      });
      return;
    }

    const turnoEliminado = turnos[indice];

    turnos.splice(indice, 1);

    await guardarTurnosEnArchivo(rutaArchivo, turnos);

    // Evento interno
    turnosEventBus.emit(EVENTOS_TURNOS.ELIMINADO, turnoEliminado);

    res.status(200).json({
      mensaje: "Turno eliminado correctamente",
      turno: turnoEliminado,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al eliminar el turno",
    });
  }
}
