import type { ErrorRequestHandler } from "express";
import { enviarError } from "../utils/error-response.js";

/**
 * Middleware central de errores. Captura los errores que llegan desde los
 * middlewares previos (por ejemplo, las validaciones de Zod) y el JSON mal
 * formado del body, delegando el formato de la respuesta en enviarError
 * para mantener la estructura estándar en toda la API.
 */
export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
) => {
  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400
  ) {
    res.status(400).json({
      status: 400,
      message: "El cuerpo de la petición no contiene un JSON válido",
      code: "INVALID_JSON",
      details: [],
    });
    return;
  }

  enviarError(res, error);
};
