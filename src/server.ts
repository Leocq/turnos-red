import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";

import { app } from "./app.js";
import { turnosEventBus, EVENTOS_TURNOS } from "./events/turnos.events.js";

const port = Number(process.env.PORT ?? 3000);

const httpServer = createServer(app);

const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(`Cliente Socket.IO conectado: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Cliente Socket.IO desconectado: ${socket.id}`);
  });
});

// Evento interno: turno:creado
// Evento enviado al cliente: turno:nuevo
turnosEventBus.on(EVENTOS_TURNOS.CREADO, (turno) => {
  console.log("Evento interno turno:creado");

  io.emit("turno:nuevo", turno);
});

// Evento interno: turno:actualizado
turnosEventBus.on(EVENTOS_TURNOS.ACTUALIZADO, (turno) => {
  console.log("Evento interno turno:actualizado");

  io.emit("turno:actualizado", turno);
});

// Evento interno: turno:eliminado
turnosEventBus.on(EVENTOS_TURNOS.ELIMINADO, (turno) => {
  console.log("Evento interno turno:eliminado");

  io.emit("turno:eliminado", turno);
});

httpServer.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
