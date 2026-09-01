import { Router } from "express";
import {
  obtenerTurnos,
  obtenerTurnoPorId,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
} from "../controllers/turnos.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { idParamsSchema } from "../schemas/common.schemas.js";
import {
  actualizarTurnoSchema,
  crearTurnoSchema,
  filtrosTurnosSchema,
} from "../schemas/turno.schemas.js";

const router = Router();

router.get("/", validate({ query: filtrosTurnosSchema }), obtenerTurnos);
router.get("/:id", validate({ params: idParamsSchema }), obtenerTurnoPorId);
router.post("/", validate({ body: crearTurnoSchema }), crearTurno);
router.put(
  "/:id",
  validate({ params: idParamsSchema, body: actualizarTurnoSchema }),
  actualizarTurno,
);
router.delete("/:id", validate({ params: idParamsSchema }), eliminarTurno);

export default router;
