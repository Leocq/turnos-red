import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../errors/app-error.js";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new AppError(
      404,
      `La ruta ${req.method} ${req.originalUrl} no existe`,
      "ROUTE_NOT_FOUND",
    ),
  );
};

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

  if (error instanceof AppError) {
    res.status(error.status).json({
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    status: 500,
    message: "Ocurrió un error interno en el servidor",
    code: "INTERNAL_SERVER_ERROR",
    details: [],
  });
};
