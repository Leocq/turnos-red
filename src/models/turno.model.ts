import type { Especialidad } from "./especialidad.model.js";

export interface Turno {
  id: number;
  paciente: string;
  documento: string;
  especialidad: Especialidad;
  fecha: string;
  hora: string;
  confirmado: boolean;
  medicoId: number;
  observaciones?: string;
}

export interface FiltrosTurnos {
  especialidad?: string;
  fecha?: string;
  medicoId?: string | number;
}
