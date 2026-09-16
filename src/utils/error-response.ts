import type { Response } from "express";
import { AppError } from "../errors/app-error.js";

/**
 * Envía una respuesta de error con la estructura estándar de la API
 * ({ status, message, code, details }). Se usa desde el bloque catch de
 * cada controlador y desde el middleware de errores para garantizar un
 * formato de respuesta coherente en toda la aplicación.
 */
export function enviarError(res: Response, error: unknown): Response {
  if (error instanceof AppError) {
    return res.status(error.status).json({
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    });
  }

  console.error(error);

  return res.status(500).json({
    status: 500,
    message: "Ocurrió un error interno en el servidor",
    code: "INTERNAL_SERVER_ERROR",
    details: [],
  });
}
