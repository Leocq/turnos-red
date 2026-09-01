import express from "express";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import medicosRoutes from "./routes/medicos.routes.js";
import turnosRoutes from "./routes/turnos.routes.js";

export const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/turnos", turnosRoutes);
app.use("/medicos", medicosRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
