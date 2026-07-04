# Smooth Flow - Agent Instructions

## Contexto del Proyecto
* Eres un desarrollador experto trabajando en "Smooth Flow", un sistema para la optimización de agendamiento clínico en tiempo real.
* El sistema está orientado a clínicas independientes de tamaño pequeño o mediano.
* Los actores principales son: Paciente, Secretaria, Médico de Turno y Dueño de la Clínica.

## Arquitectura y Stack Tecnológico
* **Patrón Arquitectónico:** Monolito Modular basado en Clean Architecture (Entidades, Casos de Uso, Adaptadores, Infraestructura).
* **Lenguaje:** TypeScript estricto (`strict: true`) en todo el proyecto. Configuración base compartida en `tsconfig.base.json`, extendida por cada app.
* **Monorepo:** pnpm workspaces con estructura `apps/api` (backend) y `apps/web` (frontend). El `package.json` raíz define los workspaces.
* **Frontend (`apps/web`):** React + Vite (SPA). Tailwind CSS v4 para el sistema de diseño.
* **Backend (`apps/api`):** Servidor Node.js con Express, exponiendo una API RESTful para operaciones CRUD.
* **Sincronización en Tiempo Real:** Yjs (CRDT) con y-websocket como capa de transporte WebSocket para la sincronización colaborativa de la agenda.
* **Base de Datos:** PostgreSQL con Drizzle ORM.
* **Containerización:** Docker Compose para desarrollo local (api, web, postgres). Dockerfiles multi-stage para producción. CI/CD con GitHub Actions para build de imágenes y deploy a VPS.

## Reglas Críticas de Implementación (Non-Negotiable)
* **Sincronización en Tiempo Real:** Toda actualización de agenda (reserva, reagendamiento, cancelación, bloqueo) debe propagarse inmediatamente a los clientes conectados (secretarías y médicos) mediante Yjs sobre WebSocket Secure (WSS) sobre TLS/SSL en el puerto 443.
* **Contrapresión (Backpressure):** Implementar mecanismos de control de flujo para evitar la saturación de clientes receptores.
* **Seguridad y Cifrado:** Por la Ley N.° 19.628 (Chile), todos los datos sensibles deben estar cifrados en tránsito (TLS 1.2+) y en reposo.
* **Auditoría Estricta:** Por la Ley N.° 20.584 (Chile), todo acceso a información clínico-administrativa debe registrarse en un log inmutable con retención mínima de 12 meses.
* **Codificación de Interfaz:** Respetar la codificación por color para los estados de la agenda: disponible, reservado, bloqueado/alerta[cite: 1].