# Frontend — Sistema de Gestión de Tickets

React · TypeScript · Vite · React Router

## Puesta en marcha

```bash
npm install
npm run dev     # http://localhost:5173 (proxy /api -> http://localhost:4000)
```

> Requiere el backend corriendo en el puerto 4000 (ver `../backend`).

## Funcionalidades
- **Login** con manejo de JWT (guardado, envío en cabeceras, limpieza al expirar/cerrar sesión).
- **Listado de tickets** con filtros por estado y prioridad, búsqueda y **paginación**.
- **Formulario** de creación y edición de tickets.
- **Indicador visual de prioridad** (badges por color).
- **Resumen estadístico** por estado y prioridad.
- Reflejo de reglas de negocio en la UX:
  - RN-01: al editar, un `user` no puede seleccionar una prioridad menor (opciones deshabilitadas).
  - RN-02: la acción **Eliminar** solo se muestra a `admin`.
  - RN-03: el **Historial** se muestra en solo lectura, sin acciones de editar/borrar.

## Estructura
```
src/
  api/         cliente HTTP (JWT), endpoints de tickets y stats
  auth/        contexto de sesión y almacenamiento del token
  components/  PriorityBadge, TicketForm, TicketHistory, ProtectedRoute
  pages/       LoginPage, TicketsPage
  types/       tipos e enums del dominio
```
