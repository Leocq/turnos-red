import type { Turno, TurnoCrudo } from "../models/turno.model.js";

function normalizarFecha(fecha: string): string {
  const partes = fecha.trim().split("/");

  if (partes.length !== 3) {
    return fecha.trim();
  }

  const [dia, mes, anio] = partes;

  return `${anio}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

function normalizarHora(hora: string): string {
  return hora.trim().replace(".", ":");
}

function normalizarConfirmado(valor: string | boolean): boolean {
  if (typeof valor === "boolean") {
    return valor;
  }

  const valorNormalizado = valor.trim().toLowerCase();

  return valorNormalizado === "si" || valorNormalizado === "sí";
}

function normalizarEspecialidad(especialidad: string): string {
  const texto = especialidad.trim().toLocaleLowerCase("es");

  return texto.charAt(0).toLocaleUpperCase("es") + texto.slice(1);
}

export function normalizarTurno(
  turnoCrudo: TurnoCrudo | undefined | null,
): Turno | null {
  if (!turnoCrudo) {
    return null;
  }

  const id = Number(turnoCrudo.id);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  const paciente = turnoCrudo.paciente?.trim();
  const documento = String(turnoCrudo.documento ?? "").trim();
  const especialidad = turnoCrudo.especialidad?.trim();
  const fecha = turnoCrudo.fecha?.trim();
  const hora = turnoCrudo.hora?.trim();

  if (
    !paciente ||
    !documento ||
    !especialidad ||
    !fecha ||
    !hora ||
    turnoCrudo.confirmado === undefined
  ) {
    return null;
  }

  return {
    id,
    paciente,
    documento,
    especialidad: normalizarEspecialidad(especialidad),
    fecha: normalizarFecha(fecha),
    hora: normalizarHora(hora),
    confirmado: normalizarConfirmado(turnoCrudo.confirmado),
    ...(turnoCrudo.observaciones?.trim()
      ? { observaciones: turnoCrudo.observaciones.trim() }
      : {}),
  };
}
