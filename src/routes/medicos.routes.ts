import { Router } from "express";
import {
  actualizarMedico,
  crearMedico,
  eliminarMedico,
  obtenerMedicoPorId,
  obtenerMedicos,
} from "../controllers/medicos.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { idParamsSchema } from "../schemas/common.schemas.js";
import {
  actualizarMedicoSchema,
  crearMedicoSchema,
  filtrosMedicosSchema,
} from "../schemas/medico.schemas.js";

const router = Router();

router.get("/", validate({ query: filtrosMedicosSchema }), obtenerMedicos);
router.get("/:id", validate({ params: idParamsSchema }), obtenerMedicoPorId);
router.post("/", validate({ body: crearMedicoSchema }), crearMedico);
router.put(
  "/:id",
  validate({ params: idParamsSchema, body: actualizarMedicoSchema }),
  actualizarMedico,
);
router.delete("/:id", validate({ params: idParamsSchema }), eliminarMedico);

export default router;
