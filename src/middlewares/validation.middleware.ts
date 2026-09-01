import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError, type ErrorDetail } from "../errors/app-error.js";

interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

type ValidationTarget = keyof ValidationSchemas;

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const details: ErrorDetail[] = [];

    for (const target of Object.keys(schemas) as ValidationTarget[]) {
      const schema = schemas[target];

      if (!schema) {
        continue;
      }

      const result = schema.safeParse(req[target]);

      if (!result.success) {
        details.push(
          ...result.error.issues.map((issue) => ({
            field: [target, ...issue.path.map(String)].join("."),
            message: issue.message,
          })),
        );
        continue;
      }

      if (target === "body") {
        req.body = result.data;
      }
    }

    if (details.length > 0) {
      next(
        new AppError(
          400,
          "Error de validación en los datos ingresados",
          "VALIDATION_ERROR",
          details,
        ),
      );
      return;
    }

    next();
  };
}
