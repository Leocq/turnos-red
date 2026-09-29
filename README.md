# TurnosRed

TurnosRed es una API REST desarrollada con Node.js, TypeScript y Express para
gestionar turnos y médicos de centros de atención ambulatoria. La segunda etapa
incorpora validaciones con Zod, errores estandarizados, filtros mediante query
parameters, persistencia en archivos JSON, pruebas automáticas en Postman y
ejemplos guardados para Mock Server.

El proyecto conserva los eventos en tiempo real de la primera etapa mediante
EventEmitter y Socket.IO.

## Tecnologías

- Node.js 22 LTS
- TypeScript en modo estricto y ESM
- Express 5
- Zod
- Socket.IO
- EventEmitter
- dotenv
- ESLint y Prettier
- Postman/Newman

## Requisitos

- Git
- NVM
- Node.js `22.14.0` (definido en `.nvmrc`)
- npm
- Postman, para ejecutar la colección y crear el Mock Server

## Instalación y ejecución

```bash
git clone https://github.com/Leocq/turnos-red.git
cd turnos-red
nvm use
npm install
```

Crear un archivo `.env` a partir de `.env.example`:

```env
PORT=3000
DATA_FILE=./data/turnos.json
MEDICOS_DATA_FILE=./data/medicos.json
```

Iniciar el servidor en desarrollo:

```bash
npm run dev
```

La API estará disponible en `http://localhost:3000`.

También se puede compilar y ejecutar JavaScript:

```bash
npm run build
npm start
```

## Variables de entorno

| Variable            | Descripción                                   | Ejemplo               |
| ------------------- | --------------------------------------------- | --------------------- |
| `PORT`              | Puerto del servidor HTTP                      | `3000`                |
| `DATA_FILE`         | Archivo JSON utilizado para persistir turnos  | `./data/turnos.json`  |
| `MEDICOS_DATA_FILE` | Archivo JSON utilizado para persistir médicos | `./data/medicos.json` |

## Scripts

| Comando          | Descripción                              |
| ---------------- | ---------------------------------------- |
| `npm run dev`    | Ejecuta el servidor TypeScript con `tsx` |
| `npm run build`  | Compila el proyecto en `dist/`           |
| `npm start`      | Ejecuta la versión compilada             |
| `npm run lint`   | Analiza el código con ESLint             |
| `npm run format` | Aplica el formato de Prettier            |

## Estructura de directorios

Todas las capas se encuentran dentro de directorios nombrados en inglés.

```text
turnos-red/
├── data/
│   ├── medicos.json
│   └── turnos.json
├── public/
│   └── index.html
├── src/
│   ├── controllers/
│   │   ├── general.controller.ts
│   │   ├── medicos.controller.ts
│   │   └── turnos.controller.ts
│   ├── errors/
│   │   └── app-error.ts
│   ├── events/
│   │   └── turnos.events.ts
│   ├── middlewares/
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/
│   │   ├── especialidad.model.ts
│   │   ├── medico.model.ts
│   │   └── turno.model.ts
│   ├── routes/
│   │   ├── medicos.routes.ts
│   │   └── turnos.routes.ts
│   ├── schemas/
│   │   ├── common.schemas.ts
│   │   ├── medico.schemas.ts
│   │   └── turno.schemas.ts
│   ├── services/
│   │   ├── json-file.service.ts
│   │   ├── medicos.service.ts
│   │   └── turnos.service.ts
│   ├── utils/
│   │   ├── error-response.ts
│   │   └── normalization.ts
│   ├── app.ts
│   ├── index.ts
│   └── server.ts
├── .env.example
├── pacientes-turnos.md
├── turnos-red.postman_collection.json
└── turnos-red.postman_environment.json
```

## Módulo Pacientes y Turnos (propuesta)

La propuesta conceptual y técnica del nuevo módulo de **Pacientes y Turnos**
(modelado de datos y definición de los endpoints como _mockup_ RESTful) está
documentada en [`pacientes-turnos.md`](./pacientes-turnos.md).

## Modelos

### Turno

| Campo           | Tipo    | Reglas principales                           |
| --------------- | ------- | -------------------------------------------- |
| `id`            | number  | Entero positivo y único                      |
| `paciente`      | string  | Entre 2 y 100 caracteres                     |
| `documento`     | string  | Entre 5 y 30 caracteres                      |
| `especialidad`  | string  | Una de las especialidades admitidas          |
| `fecha`         | string  | `YYYY-MM-DD` o `DD/MM/YYYY`                  |
| `hora`          | string  | `HH:MM`; también admite `HH.MM` como entrada |
| `confirmado`    | boolean | También admite `si`, `sí`, `no`, `1` o `0`   |
| `medicoId`      | number  | Debe referenciar un médico existente         |
| `observaciones` | string? | Opcional, máximo 500 caracteres              |

### Médico

| Campo          | Tipo    | Reglas principales                                |
| -------------- | ------- | ------------------------------------------------- |
| `id`           | number  | Entero positivo y único                           |
| `nombre`       | string  | Entre 2 y 100 caracteres                          |
| `documento`    | string  | Entre 5 y 30 caracteres y único                   |
| `especialidad` | string  | Una de las especialidades admitidas               |
| `disponible`   | boolean | También admite representaciones booleanas comunes |

Las especialidades válidas son `Clínica médica`, `Pediatría`, `Odontología` y
`Nutrición`. La API acepta diferencias de mayúsculas y acentos, pero almacena y
responde siempre con el formato normalizado.

La especialidad del turno debe coincidir con la del médico indicado en
`medicoId`. No se permite eliminar un médico mientras tenga turnos asignados.

## Endpoint general

| Método | Endpoint | Resultado exitoso | Descripción                          |
| ------ | -------- | ----------------- | ------------------------------------ |
| `GET`  | `/`      | `200 OK`          | Mensaje de bienvenida de la API      |

Cualquier ruta no contemplada por la aplicación es capturada por el controlador
general y responde `404 Not Found` con la estructura de error estándar. Ambos
casos se resuelven en `general.controller.ts`.

## Endpoints de turnos

| Método   | Endpoint      | Resultado exitoso | Descripción                   |
| -------- | ------------- | ----------------- | ----------------------------- |
| `GET`    | `/turnos`     | `200 OK`          | Lista y filtra turnos         |
| `GET`    | `/turnos/:id` | `200 OK`          | Obtiene un turno por ID       |
| `POST`   | `/turnos`     | `201 Created`     | Crea un turno                 |
| `PUT`    | `/turnos/:id` | `200 OK`          | Reemplaza los datos del turno |
| `DELETE` | `/turnos/:id` | `204 No Content`  | Elimina un turno              |

Ejemplo de creación:

```json
{
  "id": 999,
  "paciente": "Lucía Ramos",
  "documento": "40123456",
  "especialidad": "Pediatría",
  "fecha": "20/08/2026",
  "hora": "15.30",
  "confirmado": "si",
  "medicoId": 1
}
```

### Filtros de turnos

`GET /turnos` admite los parámetros opcionales `especialidad`, `fecha` y
`medicoId`. Se pueden combinar sin crear endpoints adicionales.

```http
GET /turnos?especialidad=Pediatria&fecha=14/08/2026&medicoId=1
```

## Endpoints de médicos

| Método   | Endpoint       | Resultado exitoso | Descripción                    |
| -------- | -------------- | ----------------- | ------------------------------ |
| `GET`    | `/medicos`     | `200 OK`          | Lista y filtra médicos         |
| `GET`    | `/medicos/:id` | `200 OK`          | Obtiene un médico por ID       |
| `POST`   | `/medicos`     | `201 Created`     | Registra un médico             |
| `PUT`    | `/medicos/:id` | `200 OK`          | Reemplaza los datos del médico |
| `DELETE` | `/medicos/:id` | `204 No Content`  | Da de baja un médico           |

Ejemplo de creación:

```json
{
  "id": 50,
  "nombre": "Sofía Díaz",
  "documento": "30123456",
  "especialidad": "Pediatría",
  "disponible": true
}
```

### Filtros de médicos

`GET /medicos` admite los parámetros opcionales `especialidad` y `disponible`.

```http
GET /medicos?especialidad=Odontologia&disponible=false
```

## Códigos de estado por operación

Resumen de los códigos HTTP que devuelve cada endpoint, tanto en los escenarios
exitosos como en los de error.

| Operación                | Éxito | Errores posibles                                         |
| ------------------------ | ----- | -------------------------------------------------------- |
| `GET /`                  | `200` | `500`                                                    |
| Ruta inexistente         | —     | `404` (`ROUTE_NOT_FOUND`)                                |
| `GET /turnos`            | `200` | `400` (query inválida), `500`                            |
| `GET /turnos/:id`        | `200` | `400` (id inválido), `404` (`TURNO_NOT_FOUND`), `500`    |
| `POST /turnos`           | `201` | `400` (Zod / médico inexistente / especialidad), `500`   |
| `PUT /turnos/:id`        | `200` | `400`, `404` (`TURNO_NOT_FOUND`), `500`                  |
| `DELETE /turnos/:id`     | `204` | `400` (id inválido), `404` (`TURNO_NOT_FOUND`), `500`    |
| `GET /medicos`           | `200` | `400` (query inválida), `500`                            |
| `GET /medicos/:id`       | `200` | `400` (id inválido), `404` (`MEDICO_NOT_FOUND`), `500`   |
| `POST /medicos`          | `201` | `400` (Zod / `DUPLICATE_MEDICO_ID` / documento), `500`   |
| `PUT /medicos/:id`       | `200` | `400`, `404` (`MEDICO_NOT_FOUND`), `500`                 |
| `DELETE /medicos/:id`    | `204` | `400` (`MEDICO_HAS_TURNOS`), `404`, `500`                |

Todas las respuestas de error comparten la estructura estándar
`{ status, message, code, details }` descrita a continuación.

## Validaciones Zod y errores estandarizados

El middleware de validación procesa `body`, `params` y `query` antes de llegar
al controlador. Un error de Zod se responde con `400 Bad Request` e identifica
cada campo inválido:

```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "body.documento",
      "message": "El documento debe ser un string"
    }
  ]
}
```

El middleware central de errores aplica la misma estructura a respuestas `400`
y `500`, incluyendo JSON mal formado. Las rutas inexistentes (`404`) las resuelve
el controlador general.

### Flujo de control en los controladores

Cada método de los controladores es `async` y sigue el mismo patrón:

- Declara una variable local `status` que se ajusta según el resultado del flujo
  (camino feliz o casos alternativos).
- Aplica validaciones previas y, cuando alguna no se cumple, lanza un error
  (`throw`) con su código de estado, cortando la ejecución con retorno
  anticipado.
- Envuelve la lógica en un bloque `try-catch`; el `catch` delega en
  `enviarError` para responder siempre con la estructura estándar.
- Usa `return` junto a cada respuesta para evitar envíos de cabeceras duplicados
  (`headers already sent`).

## Postman, pruebas automáticas y Mock Server

Importar en Postman:

1. `turnos-red.postman_collection.json`.
2. `turnos-red.postman_environment.json`.
3. Seleccionar el entorno `TurnosRed - Local`.
4. Iniciar la API con `npm run dev`.
5. Ejecutar la colección completa con **Run collection**.

La colección contiene 16 peticiones y 30 aserciones para escenarios exitosos y
casos borde: `200`, `201`, `204`, `400` y `404`. También valida arrays, campos
requeridos, esquemas JSON, filtros y el formato uniforme de errores.

Todas las peticiones de la colección usan la variable `{{baseUrl}}` en lugar de
una URL fija. `baseUrl` está definida a nivel de **colección** y también en el
**environment** `TurnosRed - Local`, de modo que la resolución dinámica funciona
al centralizar el origin del servidor en un único lugar.

Variables utilizadas:

| Variable   | Uso                                                     |
| ---------- | ------------------------------------------------------- |
| `baseUrl`  | URL base de la API (colección + environment), local o Mock Server |
| `token`    | Variable reservada para autenticación Bearer            |
| `medicoId` | ID creado y reutilizado dinámicamente durante la prueba |
| `turnoId`  | ID creado y reutilizado dinámicamente durante la prueba |

Cada petición incluye al menos una respuesta guardada. Para crear el Mock
Server en Postman, seleccionar la colección, elegir **Mock collection** y luego
reemplazar `baseUrl` por la URL generada. Postman responderá utilizando los
Saved Examples sin requerir que la API local esté encendida.

La colección también puede ejecutarse con Newman:

```bash
npx newman run turnos-red.postman_collection.json \
  --environment turnos-red.postman_environment.json
```

## Eventos y Socket.IO

Las operaciones exitosas sobre turnos generan eventos internos:

- `turno:creado`
- `turno:actualizado`
- `turno:eliminado`

El servidor los retransmite mediante Socket.IO como `turno:nuevo`,
`turno:actualizado` y `turno:eliminado`. El cliente de demostración se encuentra
en `public/index.html` y se abre desde `http://localhost:3000`.

## Verificación de calidad

```bash
npm run format
npm run lint
npm run build
```

La ejecución de control de la colección obtuvo:

- 16 peticiones ejecutadas.
- 16 scripts de prueba.
- 30 aserciones.
- 0 errores.

## Uso de Inteligencia Artificial

La IA se utilizó como asistencia para acelerar la propuesta inicial. Todo el
código fue revisado, adaptado al repositorio existente y verificado manualmente
mediante compilación, lint y pruebas HTTP/Postman.

| Tarea                  | Herramienta   | Prompt utilizado                                                                                             | Respuesta generada                                                                               | Ajuste manual aplicado                                                                                         |
| ---------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Arquitectura y errores | ChatGPT/Codex | “Refactoriza la API TurnosRed para usar capas, errores JSON uniformes y códigos REST correctos.”             | Propuesta de `AppError`, middleware central y separación entre rutas, controladores y servicios. | Se adaptaron nombres, imports ESM, Express 5 y eventos existentes; se cambió DELETE a `204`.                   |
| Schemas Zod            | ChatGPT/Codex | “Crea schemas Zod para Turno y Médico, documento string, especialidades normalizadas y detalle por campo.”   | Esquemas para body, params y query con transformaciones y mensajes.                              | Se limitaron especialidades a la consigna, se validaron fechas reales y se agregó la relación `medicoId`.      |
| CRUD y filtros         | ChatGPT/Codex | “Agrega CRUD `/medicos` y filtros combinables para turnos y médicos sin endpoints nuevos.”                   | Servicios y controladores con filtros por especialidad, fecha, médico y disponibilidad.          | Se conservaron archivos JSON, se agregaron datos coherentes y se impidió borrar médicos con turnos.            |
| Pruebas Postman        | ChatGPT/Codex | “Genera una colección Postman con variables, tests 200/201/204/400/404 y Saved Examples para Mock Server.”   | Colección con escenarios Happy Path y errores.                                                   | Se ordenaron las peticiones para crear y limpiar datos, se probaron con Newman y se verificaron 30 aserciones. |
| Documentación          | ChatGPT/Codex | “Actualiza el README con instalación, variables, directorios, endpoints, query params, Postman y uso de IA.” | Borrador técnico completo.                                                                       | Se corrigieron comandos, ejemplos y resultados para que coincidan con la implementación final.                 |
| Mockup Pacientes/Turnos | ChatGPT/Codex | “Diseña el modelado de datos y dos endpoints RESTful para el módulo de Pacientes y Turnos según Clean Architecture.” | Borrador de `pacientes-turnos.md` con entidades, interfaces TypeScript y specs de endpoints. | Se ajustaron reglas de validación, la relación `pacienteId`/`medicoId` y los códigos de estado a la convención del proyecto. |

## Repositorio

https://github.com/Leocq/turnos-red
