import { z } from "zod";
import { ESPECIALIDADES } from "../models/especialidad.model.js";
import {
  esFechaValida,
  normalizarBooleano,
  normalizarEspecialidad,
  normalizarFecha,
} from "../utils/normalization.js";

export const idSchema = z.coerce
  .number({ error: "El ID debe ser numérico" })
  .int("El ID debe ser un número entero")
  .positive("El ID debe ser un número entero positivo");

export const documentoSchema = z
  .string({ error: "El documento debe ser un string" })
  .trim()
  .min(5, "El documento debe tener al menos 5 caracteres")
  .max(30, "El documento no puede superar los 30 caracteres");

export const especialidadSchema = z.preprocess(
  (valor) =>
    typeof valor === "string"
      ? (normalizarEspecialidad(valor) ?? valor.trim())
      : valor,
  z.enum(ESPECIALIDADES, {
    error: `La especialidad debe ser: ${ESPECIALIDADES.join(", ")}`,
  }),
);

export const booleanoFlexibleSchema = z.preprocess(
  normalizarBooleano,
  z.boolean({ error: "El valor debe ser booleano" }),
);

export const fechaSchema = z
  .string({ error: "La fecha debe ser un string" })
  .trim()
  .transform(normalizarFecha)
  .refine(esFechaValida, "La fecha debe tener formato YYYY-MM-DD o DD/MM/YYYY");

export const horaSchema = z
  .string({ error: "La hora debe ser un string" })
  .trim()
  .transform((valor) => valor.replace(".", ":"))
  .refine(
    (valor) => /^([01]\d|2[0-3]):[0-5]\d$/.test(valor),
    "La hora debe tener formato HH:MM",
  );

export const idParamsSchema = z.object({ id: idSchema }).strict();
