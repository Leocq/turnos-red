import type { Especialidad } from "./especialidad.model.js";

export interface Medico {
  id: number;
  nombre: string;
  documento: string;
  especialidad: Especialidad;
  disponible: boolean;
}

export interface FiltrosMedicos {
  especialidad?: string;
  disponible?: string | boolean;
}
