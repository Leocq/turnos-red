import type { Request, Response } from "express";

/**
 * Controlador general de la aplicación. Agrupa el endpoint de bienvenida
 * (Hello World) y el manejo de las peticiones hacia rutas inexistentes.
 */

export async function bienvenida(_req: Request, res: Response): Promise<void> {
  const status = 200;

  res.status(status).json({
    status,
    message: "Bienvenido a la API de TurnosRed",
    code: "WELCOME",
    data: {
      nombre: "TurnosRed API",
      version: "1.0.0",
      recursos: ["/turnos", "/medicos"],
    },
  });
  return;
}

export async function rutaNoEncontrada(
  req: Request,
  res: Response,
): Promise<void> {
  const status = 404;

  res.status(status).json({
    status,
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    code: "ROUTE_NOT_FOUND",
    details: [],
  });
  return;
}
