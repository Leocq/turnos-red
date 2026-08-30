import { readFile, writeFile } from "node:fs/promises";
import type { Turno, TurnoCrudo } from "../models/turno.model.js";
import { normalizarTurno } from "./normalizacion.service.js";

export async function cargarTurnosDesdeArchivo(
  rutaArchivo: string,
): Promise<Turno[]> {
  try {
    const contenido = await readFile(rutaArchivo, "utf-8");
    const datos: unknown = JSON.parse(contenido);

    if (!Array.isArray(datos)) {
      throw new Error("El archivo JSON debe contener un array de turnos.");
    }

    const turnosAceptados: Turno[] = [];
    let rechazados = 0;

    for (const registro of datos) {
      if (typeof registro !== "object" || registro === null) {
        rechazados++;
        continue;
      }

      const turno = normalizarTurno(registro as TurnoCrudo);

      if (turno) {
        turnosAceptados.push(turno);
      } else {
        rechazados++;
      }
    }

    console.log(`Registros aceptados: ${turnosAceptados.length}`);
    console.log(`Registros rechazados: ${rechazados}`);

    return turnosAceptados;
  } catch (error) {
    console.error("Error al leer o procesar turnos.json:", error);
    throw error;
  }
}

export async function guardarTurnosEnArchivo(
  rutaArchivo: string,
  turnos: Turno[],
): Promise<void> {
  try {
    const contenido = JSON.stringify(turnos, null, 2);

    await writeFile(rutaArchivo, contenido, "utf-8");
  } catch (error) {
    console.error("Error al guardar turnos.json:", error);
    throw error;
  }
}

/*
Ejemplo equivalente utilizando callbacks con node:fs:

import { readFile } from "node:fs";

readFile("./data/turnos.json", "utf-8", (error, contenido) => {
  if (error) {
    console.error(error);
    return;
  }

  const datos = JSON.parse(contenido);
  console.log(datos);
});

Se utiliza node:fs/promises porque async/await permite un flujo más
legible y facilita el manejo de errores mediante try...catch.
*/
