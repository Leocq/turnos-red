import { z } from "zod";
import {
  booleanoFlexibleSchema,
  documentoSchema,
  especialidadSchema,
  idSchema,
} from "./common.schemas.js";

const datosMedicoSchema = z
  .object({
    nombre: z
      .string({ error: "El nombre debe ser un string" })
      .trim()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(100, "El nombre no puede superar los 100 caracteres"),
    documento: documentoSchema,
    especialidad: especialidadSchema,
    disponible: booleanoFlexibleSchema,
  })
  .strict();

export const crearMedicoSchema = datosMedicoSchema.extend({ id: idSchema });
export const actualizarMedicoSchema = datosMedicoSchema;
export const medicoPersistidoSchema = datosMedicoSchema.extend({
  id: idSchema,
});

export const filtrosMedicosSchema = z
  .object({
    especialidad: especialidadSchema.optional(),
    disponible: booleanoFlexibleSchema.optional(),
  })
  .strict();
