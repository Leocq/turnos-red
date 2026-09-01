export const ESPECIALIDADES = [
  "Clínica médica",
  "Pediatría",
  "Odontología",
  "Nutrición",
] as const;

export type Especialidad = (typeof ESPECIALIDADES)[number];
