# TurnosRed

TurnosRed es un prototipo de backend desarrollado con Node.js, TypeScript y Express para centralizar la gestión de turnos médicos de diferentes centros de atención.

La aplicación permite leer registros heterogéneos desde un archivo JSON, normalizarlos, gestionarlos mediante una API REST y comunicar modificaciones en tiempo real mediante Socket.IO.

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

Antes de ejecutar el proyecto es necesario tener instalado:

- Node.js
- NVM
- npm
- Git

La versión de Node utilizada está definida en el archivo:

`.nvmrc`

```text
22.14.0