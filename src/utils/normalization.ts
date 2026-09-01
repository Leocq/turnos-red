import {
  ESPECIALIDADES,
  type Especialidad,
} from "../models/especialidad.model.js";

export function quitarAcentos(valor: string): string {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizarTextoParaComparar(valor: string): string {
  return quitarAcentos(valor.trim().toLocaleLowerCase("es"));
}

export function normalizarEspecialidad(
  valor: string,
): Especialidad | undefined {
  const buscada = normalizarTextoParaComparar(valor);

  return ESPECIALIDADES.find(
    (especialidad) => normalizarTextoParaComparar(especialidad) === buscada,
  );
}

export function normalizarFecha(valor: string): string {
  const fecha = valor.trim();
  const formatoLatino = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha);

  if (formatoLatino) {
    const [, dia, mes, anio] = formatoLatino;
    return `${anio}-${mes}-${dia}`;
  }

  return fecha;
}

export function esFechaValida(valor: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const [anio, mes, dia] = valor.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  return (
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  );
}

export function normalizarBooleano(valor: unknown): unknown {
  if (typeof valor !== "string") {
    return valor;
  }

  const texto = normalizarTextoParaComparar(valor);

  if (["true", "si", "1"].includes(texto)) {
    return true;
  }

  if (["false", "no", "0"].includes(texto)) {
    return false;
  }

  return valor;
}
