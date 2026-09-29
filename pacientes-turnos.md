# Módulo Pacientes y Turnos — Propuesta técnica (Mockup RESTful)

Propuesta conceptual y técnica del módulo **Pacientes y Turnos** de _TurnosMed_.
Este documento sirve como _mockup_ funcional para que el equipo de Frontend
avance con la pantalla de **gestión de pacientes** y **asignación de turnos
médicos** antes de que la persistencia definitiva esté disponible.

El diseño respeta las convenciones de **Clean Architecture** ya presentes en el
proyecto: cada recurso se resuelve a través de las capas
`routes → controllers → services → models`, con validación previa mediante
`schemas` (Zod) y respuestas de error estandarizadas.

---

## 1. Modelado conceptual de datos

### 1.1. Entidad `Paciente`

Un **Paciente** representa a la persona que solicita atención. Los datos mínimos
e indispensables para registrarlo son su documento (DNI), nombre y apellido,
fecha de nacimiento y, al menos, un dato de contacto para poder notificarlo.

| Campo             | Tipo      | Obligatorio | Reglas principales                                   |
| ----------------- | --------- | ----------- | ---------------------------------------------------- |
| `id`              | number    | Sí          | Entero positivo y único                              |
| `dni`             | string    | Sí          | Entre 7 y 10 caracteres, único                       |
| `nombre`          | string    | Sí          | Entre 2 y 100 caracteres                             |
| `apellido`        | string    | Sí          | Entre 2 y 100 caracteres                             |
| `fechaNacimiento` | string    | Sí          | Formato `YYYY-MM-DD` o `DD/MM/YYYY`, fecha válida     |
| `email`           | string    | Sí          | Formato de correo electrónico válido                 |
| `telefono`        | string    | Sí          | Entre 6 y 20 caracteres                              |
| `activo`          | boolean   | No          | Por defecto `true`; permite baja lógica              |

Se decide manejar `dni`, `fechaNacimiento` y `telefono` como `string` para
admitir formatos flexibles (ceros a la izquierda, separadores) sin perder
información, siguiendo el mismo criterio que el campo `documento` del recurso
`Turno`.

```typescript
// src/models/paciente.model.ts
export interface Paciente {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string; // ISO YYYY-MM-DD
  email: string;
  telefono: string;
  activo: boolean;
}

// Datos de entrada para registrar un paciente (sin id generado ni flags)
export interface NuevoPaciente {
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  email: string;
  telefono: string;
}
```

### 1.2. Entidad `Turno`

El **Turno** representa la reserva de una atención. En este módulo el turno se
vincula tanto con el **paciente** que lo solicita (`pacienteId`) como con el
**médico** que lo atiende (`medicoId`), cuya especialidad debe coincidir con la
del turno.

| Campo           | Tipo      | Obligatorio | Reglas principales                                 |
| --------------- | --------- | ----------- | -------------------------------------------------- |
| `id`            | number    | Sí          | Entero positivo y único                            |
| `pacienteId`    | number    | Sí          | Debe referenciar un paciente existente             |
| `medicoId`      | number    | Sí          | Debe referenciar un médico existente               |
| `especialidad`  | string    | Sí          | Debe coincidir con la especialidad del médico      |
| `fecha`         | string    | Sí          | Formato `YYYY-MM-DD` o `DD/MM/YYYY`, fecha válida    |
| `hora`          | string    | Sí          | Formato `HH:MM`                                    |
| `confirmado`    | boolean   | Sí          | Estado de confirmación del turno                   |
| `observaciones` | string    | No          | Opcional, máximo 500 caracteres                    |

```typescript
// src/models/turno.model.ts (evolución del modelo actual)
export interface Turno {
  id: number;
  pacienteId: number; // nueva relación con Paciente
  medicoId: number;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: boolean;
  observaciones?: string;
}

export interface NuevoTurno {
  pacienteId: number;
  medicoId: number;
  especialidad: string;
  fecha: string;
  hora: string;
  confirmado: boolean;
  observaciones?: string;
}
```

### 1.3. Relación entre entidades

- Un **Paciente** puede tener **muchos** **Turnos** (relación 1 a N).
- Un **Turno** referencia **un** Paciente (`pacienteId`) y **un** Médico
  (`medicoId`).
- Reglas de integridad del mockup:
  - No se puede crear un turno para un `pacienteId` o `medicoId` inexistente.
  - La `especialidad` del turno debe coincidir con la del médico asignado.
  - No se puede dar de baja un paciente que tenga turnos pendientes.

```text
Paciente (1) ───< (N) Turno (N) >─── (1) Médico
```

---

## 2. Definición de los dos nuevos endpoints RESTful

Ambos endpoints siguen la arquitectura en capas del proyecto:
`paciente.routes.ts → paciente.controller.ts → paciente.service.ts`, con
validación previa en `paciente.schemas.ts` y el formato de error estandarizado
`{ status, message, code, details }`.

### 2.1. `POST /pacientes` — Registrar un paciente

Registra un nuevo paciente en el sistema.

| Aspecto           | Detalle                                  |
| ----------------- | ---------------------------------------- |
| **Método y path** | `POST /pacientes`                        |
| **Descripción**   | Da de alta un paciente con sus datos personales y de contacto. |
| **Path params**   | —                                        |
| **Query params**  | —                                        |
| **Headers**       | `Content-Type: application/json`         |

**Body (JSON):**

```json
{
  "dni": "40123456",
  "nombre": "Lucía",
  "apellido": "Ramos",
  "fechaNacimiento": "1998-05-20",
  "email": "lucia.ramos@example.com",
  "telefono": "3811234567"
}
```

**Respuesta exitosa — `201 Created`:**

```json
{
  "id": 1,
  "dni": "40123456",
  "nombre": "Lucía",
  "apellido": "Ramos",
  "fechaNacimiento": "1998-05-20",
  "email": "lucia.ramos@example.com",
  "telefono": "3811234567",
  "activo": true
}
```

**Códigos de estado:**

| Código            | Situación                                                    |
| ----------------- | ------------------------------------------------------------ |
| `201 Created`     | Paciente registrado correctamente                            |
| `400 Bad Request` | Error de validación de Zod (campo faltante o formato inválido) |
| `400 Bad Request` | DNI duplicado (`code: "DUPLICATE_PACIENTE_DNI"`)             |
| `500 Internal Server Error` | Error inesperado del servidor                      |

**Ejemplo de error — `400 Bad Request`:**

```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "body.email", "message": "El email no tiene un formato válido" }
  ]
}
```

### 2.2. `POST /turnos` — Asignar un turno médico

Crea (asigna) un turno vinculando un paciente con un médico.

| Aspecto           | Detalle                                  |
| ----------------- | ---------------------------------------- |
| **Método y path** | `POST /turnos`                           |
| **Descripción**   | Asigna un turno médico a un paciente existente con un médico de la especialidad indicada. |
| **Path params**   | —                                        |
| **Query params**  | —                                        |
| **Headers**       | `Content-Type: application/json`         |

**Body (JSON):**

```json
{
  "pacienteId": 1,
  "medicoId": 3,
  "especialidad": "Odontología",
  "fecha": "20/08/2026",
  "hora": "15:30",
  "confirmado": true,
  "observaciones": "Primera consulta"
}
```

**Respuesta exitosa — `201 Created`:**

```json
{
  "id": 1000,
  "pacienteId": 1,
  "medicoId": 3,
  "especialidad": "Odontología",
  "fecha": "2026-08-20",
  "hora": "15:30",
  "confirmado": true,
  "observaciones": "Primera consulta"
}
```

**Códigos de estado:**

| Código            | Situación                                                      |
| ----------------- | -------------------------------------------------------------- |
| `201 Created`     | Turno asignado correctamente                                   |
| `400 Bad Request` | Error de validación de Zod (campo faltante o formato inválido) |
| `400 Bad Request` | El paciente no existe (`code: "INVALID_PACIENTE_ID"`)          |
| `400 Bad Request` | El médico no existe (`code: "INVALID_MEDICO_ID"`)             |
| `400 Bad Request` | La especialidad no coincide con la del médico (`code: "SPECIALTY_MISMATCH"`) |
| `500 Internal Server Error` | Error inesperado del servidor                        |

**Ejemplo de error — `400 Bad Request`:**

```json
{
  "status": 400,
  "message": "No existe un paciente con el ID 99",
  "code": "INVALID_PACIENTE_ID",
  "details": [
    { "field": "body.pacienteId", "message": "El paciente indicado no existe" }
  ]
}
```

---

## 3. Convenciones de Clean Architecture aplicadas

Cada nuevo recurso se implementa respetando la separación de responsabilidades
del proyecto:

| Capa          | Archivo propuesto            | Responsabilidad                                  |
| ------------- | ---------------------------- | ------------------------------------------------ |
| `routes`      | `paciente.routes.ts`         | Define los paths y encadena middlewares          |
| `schemas`     | `paciente.schemas.ts`        | Validación previa de `body`, `params` y `query`  |
| `controllers` | `paciente.controller.ts`     | Métodos `async`, `try-catch`, variable `status`, retorno anticipado |
| `services`    | `paciente.service.ts`        | Lógica de negocio y persistencia (archivo JSON)  |
| `models`      | `paciente.model.ts`          | Interfaces de tipos de la entidad                |

De esta forma, los endpoints de Pacientes quedan alineados con los de Turnos y
Médicos ya existentes, manteniendo la coherencia del código base.
