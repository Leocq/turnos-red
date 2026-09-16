import express from "express";
import {
  bienvenida,
  rutaNoEncontrada,
} from "./controllers/general.controller.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import medicosRoutes from "./routes/medicos.routes.js";
import turnosRoutes from "./routes/turnos.routes.js";

export const app = express();

app.use(express.json());
app.use(express.static("public", { index: false }));

// Controlador general: endpoint de bienvenida (Hello World)
app.get("/", bienvenida);

// Controladores por entidad
app.use("/turnos", turnosRoutes);
app.use("/medicos", medicosRoutes);

// Controlador general: rutas inexistentes (404) y manejo central de errores
app.use(rutaNoEncontrada);
app.use(errorHandler);
