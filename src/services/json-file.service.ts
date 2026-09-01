import { readFile, writeFile } from "node:fs/promises";

export async function readJsonArray(rutaArchivo: string): Promise<unknown[]> {
  const contenido = await readFile(rutaArchivo, "utf-8");
  const datos: unknown = JSON.parse(contenido);

  if (!Array.isArray(datos)) {
    throw new Error(`El archivo ${rutaArchivo} debe contener un array JSON`);
  }

  return datos;
}

export async function writeJsonArray<T>(
  rutaArchivo: string,
  datos: T[],
): Promise<void> {
  await writeFile(rutaArchivo, JSON.stringify(datos, null, 2), "utf-8");
}
