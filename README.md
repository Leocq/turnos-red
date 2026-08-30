# TurnosRed

TurnosRed es un backend desarrollado con Node.js, TypeScript y Express para gestionar turnos médicos de diferentes centros de atención.

La aplicación permite leer registros desde un archivo JSON, normalizar datos con formatos inconsistentes, gestionar los turnos mediante una API REST y comunicar cambios en tiempo real mediante Socket.IO.

## Tecnologías utilizadas

- Node.js 22 LTS
- TypeScript
- Express
- Socket.IO
- EventEmitter
- dotenv
- ESLint
- Prettier
- npm

## Requisitos previos

Para ejecutar el proyecto es necesario tener instalado:

- Node.js
- NVM
- npm
- Git

La versión de Node utilizada por el proyecto está definida en el archivo `.nvmrc`:

```text
22.14.0
```

Para seleccionar esta versión:

```bash
nvm use 22.14.0
```

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Leocq/turnos-red.git
```

Ingresar a la carpeta del proyecto:

```bash
cd turnos-red
```

Seleccionar la versión de Node:

```bash
nvm use 22.14.0
```

Instalar las dependencias:

```bash
npm install
```

Crear el archivo `.env` tomando como referencia `.env.example`.

Ejemplo:

```env
PORT=3000
DATA_FILE=./data/turnos.json
```

Iniciar el servidor:

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:3000
```

## Variables de entorno

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `PORT` | Puerto utilizado por el servidor HTTP | `3000` |
| `DATA_FILE` | Ruta del archivo JSON que contiene los turnos | `./data/turnos.json` |

El archivo `.env` se encuentra excluido del repositorio mediante `.gitignore`.

## Scripts disponibles

Los siguientes scripts se encuentran definidos en `package.json`:

| Comando | Descripción |
|---|---|
| `npm run dev` | Ejecuta el servidor TypeScript en modo desarrollo |
| `npm run build` | Compila el código TypeScript en la carpeta `dist` |
| `npm start` | Ejecuta la aplicación compilada |
| `npm run lint` | Analiza el código TypeScript con ESLint |
| `npm run format` | Aplica formato al proyecto utilizando Prettier |

## Estructura del proyecto

```text
turnos-red/
│
├── data/
│   └── turnos.json
│
├── public/
│   └── index.html
│
├── src/
│   ├── controllers/
│   │   └── turnos.controller.ts
│   │
│   ├── events/
│   │   └── turnos.events.ts
│   │
│   ├── models/
│   │   └── turno.model.ts
│   │
│   ├── routes/
│   │   └── turnos.routes.ts
│   │
│   ├── services/
│   │   ├── normalizacion.service.ts
│   │   └── turnos.service.ts
│   │
│   ├── index.ts
│   └── server.ts
│
├── .env.example
├── .gitignore
├── .nvmrc
├── eslint.config.js
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### Responsabilidades

- `models`: interfaces y modelos de datos.
- `services`: lectura, escritura y normalización de los turnos.
- `controllers`: lógica asociada a las peticiones HTTP.
- `routes`: definición de endpoints de la API.
- `events`: bus de eventos internos basado en EventEmitter.
- `public`: cliente simple utilizado para demostrar los eventos Socket.IO.

## Modelo de datos

La aplicación diferencia entre los datos crudos recibidos y los datos normalizados utilizados internamente.

### TurnoCrudo

Representa los datos recibidos desde el archivo JSON, que pueden contener tipos o formatos inconsistentes.

### Turno

Representa los datos normalizados utilizados por la aplicación.

Incluye los siguientes campos:

- `id`
- `paciente`
- `documento`
- `especialidad`
- `fecha`
- `hora`
- `confirmado`
- `observaciones` (opcional)

## Normalización de datos

Un registro de entrada puede tener el siguiente formato:

```json
{
  "id": "102",
  "paciente": "   Carlos Ruiz ",
  "documento": 31654210,
  "especialidad": "PEDIATRÍA",
  "fecha": "14/08/2026",
  "hora": "10.00",
  "confirmado": "si"
}
```

Después del proceso de normalización se transforma en:

```json
{
  "id": 102,
  "paciente": "Carlos Ruiz",
  "documento": "31654210",
  "especialidad": "Pediatría",
  "fecha": "2026-08-14",
  "hora": "10:00",
  "confirmado": true
}
```

Durante el proceso se realizan, entre otras, las siguientes operaciones:

- Conversión del `id` a número.
- Conversión del documento a string.
- Eliminación de espacios innecesarios en el nombre del paciente.
- Normalización de especialidades.
- Conversión de fecha al formato `YYYY-MM-DD`.
- Normalización de la hora.
- Conversión del valor de confirmación a boolean.
- Validación del `id` como entero positivo.

Los registros que no cumplen la estructura mínima requerida son rechazados.

La aplicación informa por consola la cantidad de registros aceptados y rechazados.

## Lectura de archivos

El archivo `turnos.json` se lee de forma asíncrona mediante:

```text
node:fs/promises
```

Se utiliza `async/await` junto con bloques `try...catch` para gestionar errores.

También se incluye en el código un ejemplo comparativo utilizando callbacks con `node:fs`, con el objetivo de mostrar la diferencia entre ambos enfoques.

## API REST

### Obtener todos los turnos

```http
GET /turnos
```

Respuesta exitosa:

```text
200 OK
```

### Obtener un turno por ID

```http
GET /turnos/:id
```

Ejemplo:

```text
GET /turnos/102
```

Posibles respuestas:

- `200 OK`
- `400 Bad Request`
- `404 Not Found`
- `500 Internal Server Error`

### Crear un turno

```http
POST /turnos
```

Ejemplo de Body:

```json
{
  "id": "106",
  "paciente": "Pedro Sánchez",
  "documento": 30111222,
  "especialidad": "CLÍNICA MÉDICA",
  "fecha": "19/08/2026",
  "hora": "14.00",
  "confirmado": "si"
}
```

Respuesta exitosa:

```text
201 Created
```

### Actualizar un turno

```http
PUT /turnos/:id
```

Ejemplo:

```text
PUT /turnos/106
```

Respuesta exitosa:

```text
200 OK
```

### Eliminar un turno

```http
DELETE /turnos/:id
```

Ejemplo:

```text
DELETE /turnos/106
```

Respuesta exitosa:

```text
200 OK
```

## Eventos internos

La aplicación implementa un bus de eventos utilizando el módulo nativo `EventEmitter` de Node.js.

Los eventos internos son:

```text
turno:creado
turno:actualizado
turno:eliminado
```

Estos eventos se generan después de una operación exitosa de creación, actualización o eliminación.

## Comunicación en tiempo real

Socket.IO se encuentra integrado con el servidor HTTP de Express.

Los eventos internos son retransmitidos a los clientes conectados utilizando:

```text
turno:nuevo
turno:actualizado
turno:eliminado
```

Por ejemplo:

```text
turno:creado
        ↓
EventEmitter
        ↓
turno:nuevo
        ↓
Socket.IO
        ↓
Cliente conectado
```

El cliente de prueba puede abrirse en:

```text
http://localhost:3000
```

Cuando se crea, modifica o elimina un turno mediante la API, el cliente recibe el evento automáticamente sin recargar la página y sin utilizar polling.

## Calidad del código

Antes de realizar una entrega se pueden ejecutar los siguientes comandos:

```bash
npm run format
npm run lint
npx tsc --noEmit
```

Para compilar el proyecto:

```bash
npm run build
```

La salida compilada se genera dentro de:

```text
dist/
```

Esta carpeta no se incluye en Git porque se encuentra declarada en `.gitignore`.

## Repositorio

Repositorio público del proyecto:

https://github.com/Leocq/turnos-red