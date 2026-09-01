import { z } from "zod";
import {
  booleanoFlexibleSchema,
  documentoSchema,
  especialidadSchema,
  fechaSchema,
  horaSchema,
  idSchema,
} from "./common.schemas.js";

const datosTurnoSchema = z
  .object({
    paciente: z
      .string({ error: "El paciente debe ser un string" })
      .trim()
      .min(2, "El paciente debe tener al menos 2 caracteres")
      .max(100, "El paciente no puede superar los 100 caracteres"),
    documento: documentoSchema,
    especialidad: especialidadSchema,
    fecha: fechaSchema,
    hora: horaSchema,
    confirmado: booleanoFlexibleSchema,
    medicoId: idSchema,
    observaciones: z
      .string({ error: "Las observaciones deben ser un string" })
      .trim()
      .max(500, "Las observaciones no pueden superar los 500 caracteres")
      .optional(),
  })
  .strict();

export const crearTurnoSchema = datosTurnoSchema.extend({ id: idSchema });
export const actualizarTurnoSchema = datosTurnoSchema;

export const turnoPersistidoSchema = datosTurnoSchema.extend({ id: idSchema });

export const filtrosTurnosSchema = z
  .object({
    especialidad: especialidadSchema.optional(),
    fecha: fechaSchema.optional(),
    medicoId: idSchema.optional(),
  })
  .strict();
