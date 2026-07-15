# Backend — Sistema de Gestión de Tickets

Node.js · TypeScript · Express · Sequelize (SQLite) · JWT

Implementación de [../docs/ai-workflow.md](../docs/ai-workflow.md). El contrato está en
[../docs/openapi.yaml](../docs/openapi.yaml).

## Requisitos
- Node.js 20+

## Puesta en marcha

```bash
cp .env.example .env      # ajusta JWT_SECRET si quieres
npm install
npm run db:migrate        # crea el esquema (roles, users, tickets, history_logs)
npm run db:seed           # datos de ejemplo (admin, user, tickets)
npm run dev               # API en http://localhost:4000/api
```

### Usuarios sembrados
| Correo                 | Contraseña | Rol   |
| ---------------------- | ---------- | ----- |
| admin@tickets.dev      | admin1234  | admin |
| user@tickets.dev       | user1234   | user  |
| inactivo@tickets.dev   | user1234   | user (inactivo) |

## Pruebas unitarias

```bash
npm test
```

Cubren las 6 pruebas del plan (login ok/fallido, creación, RN-01, RN-02, historial)
más casos adicionales. Usan SQLite en memoria.

## Reglas de negocio
- **RN-01** (`src/utils/priority.ts`, `ticket.service.ts`): un `user` no puede reducir la
  prioridad; el `admin` sí. → `403 PRIORITY_CANNOT_DECREASE`.
- **RN-02** (`routes/ticket.routes.ts` + `authorize`): solo `admin` elimina (soft delete). → `403`.
- **RN-03** (`models/historyLog.model.ts`): historial inmutable (hooks bloquean UPDATE/DELETE);
  la API solo expone lectura.

## Estructura
```
src/
  config/        conexión, env, config de sequelize-cli
  models/        Role, User, Ticket, HistoryLog + asociaciones
  db/            migrations/ y seeders/
  middleware/    authenticate, authorize, validate, errorHandler
  validators/    esquemas Zod
  services/      lógica de negocio (auth, ticket, history, stats)
  controllers/   adaptadores HTTP
  routes/        definición de endpoints
  utils/         jwt, password, priority, AppError, asyncHandler
```
