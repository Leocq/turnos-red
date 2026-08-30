import { EventEmitter } from "node:events";

export const turnosEventBus = new EventEmitter();

export const EVENTOS_TURNOS = {
  CREADO: "turno:creado",
  ACTUALIZADO: "turno:actualizado",
  ELIMINADO: "turno:eliminado",
} as const;
