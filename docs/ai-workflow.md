# Plan de Implementación — Sistema de Gestión de Tickets

> Plan de implementación que integra los artefactos previos:
> - Historias de usuario: [user-stories-refined.md](./user-stories-refined.md)
> - Plan de trabajo (fases y dependencias): [work-plan.md](./work-plan.md)
> - Contrato de API: [openapi.yaml](./openapi.yaml)
>
> A diferencia del plan de trabajo, aquí **sí** se aterriza en el stack tecnológico,
> los entregables por capa y el mapeo de requisitos y pruebas unitarias.

---

## Principio rector: separación de lógica

El sistema se divide en **dos aplicaciones independientes** con responsabilidades claras:

| Capa         | Responsabilidad                                                                 | Fuente de verdad |
| ------------ | ------------------------------------------------------------------------------- | ---------------- |
| **Backend**  | Reglas de negocio, autenticación, autorización, persistencia, validaciones.     | ✅ Sí            |
| **Frontend** | Presentación, experiencia de usuario, validación por conveniencia.              | ❌ No            |

> Las reglas de negocio (RN-01, RN-02, RN-03) se implementan y validan **en el backend**.
> El frontend las refleja en la UX (ocultar opciones, deshabilitar controles) pero nunca
> es la única barrera.

---

## Stack tecnológico

### Backend
- **Runtime:** Node.js
- **Lenguaje:** TypeScript
- **Framework HTTP:** Express
- **ORM:** TypeORM o Sequelize
- **Auth:** JWT con middleware
- **Base de datos:** relacional (según ORM elegido)

### Frontend
- **Librería:** React
- **Lenguaje:** TypeScript
- **Consumo de API:** cliente HTTP con manejo de token JWT

---

# Parte A — Backend

## A1. Requisitos a cubrir

| # | Requisito                                             | Historias / Reglas relacionadas |
| - | ----------------------------------------------------- | ------------------------------- |
| 1 | Autenticación JWT con middleware aplicado             | HU-02                           |
| 2 | Autorización por roles (`admin` / `user`)             | RN-02, HU-05, HU-07             |
| 3 | Validación de reglas de negocio de la spec            | RN-01, RN-02, RN-03             |
| 4 | Migraciones y seeders funcionales                     | Fundaciones (INF-01..03)        |
| 5 | Relaciones correctamente definidas en el ORM          | INF-01, Usuario–Ticket–Historial |

## A2. Fases de implementación del backend

> El orden respeta las dependencias definidas en [work-plan.md](./work-plan.md).

### Fase B0 — Fundaciones
- Configuración del proyecto (Node + TypeScript + Express).
- Configuración del ORM y conexión a base de datos.
- Definición de **entidades y relaciones**: `Usuario` (1) ─ (N) `Ticket`, `Ticket` (1) ─ (N) `Historial`.
- Definición de **enums**: `prioridad`, `estado` de ticket, `rol`, `estado` de usuario.
- **Migraciones** iniciales de las tres tablas + *soft delete*.
- **Seeders**: al menos un `admin`, un `user` y tickets de ejemplo.
- *Entrega:* base de datos levantada y poblada, esquema versionado.

### Fase B1 — Autenticación y autorización
- Registro de usuario (hash de contraseña, correo único).
- Login que emite **JWT**.
- **Middleware de autenticación**: valida el token en rutas protegidas.
- **Middleware de autorización**: verifica rol (`admin` / `user`).
- Bloqueo de usuarios `inactivo`.
- *Entrega:* rutas protegidas por JWT y rol reutilizables por el resto del sistema.

### Fase B2 — Tickets: lectura y creación
- Crear ticket (estado inicial `abierto`, validaciones, enums).
- Listar tickets con **filtrado, ordenamiento y paginación**.
- Exclusión de registros con *soft delete*.
- *Entrega:* CRUD base de lectura/creación operativo.

### Fase B3 — Reglas de negocio de edición
- 🔒 **RN-01**: cambio de prioridad que rechaza reducciones cuando el actor es `user`.
- Cambio de estado dentro del flujo válido.
- *Entrega:* edición de ticket con RN-01 aplicada en el backend.

### Fase B4 — Historial (RN-03)
- Registro **automático** de historial en creación/cambio de prioridad/estado (fecha, hora, usuario, valor anterior/nuevo).
- 🔒 **RN-03**: historial **inmutable** — sin endpoints de edición/borrado, ni para `admin`.
- Consulta de historial por ticket.
- *Entrega:* trazabilidad completa e inmutable.

### Fase B5 — Eliminación (RN-02)
- 🔒 **RN-02**: eliminar ticket vía *soft delete*, restringido a `admin`; el historial se conserva.
- *Entrega:* eliminación segura y auditada.

### Fase B6 — Reportes
- Resumen estadístico por estado y por prioridad, excluyendo *soft delete*.
- *Entrega:* endpoint de estadísticas.

## A3. Pruebas unitarias del backend (mínimo 5)

> Se concentran en la lógica de negocio (fuente de verdad). Mapeo con las historias:

| # | Prueba                                                        | Cubre           | ¿Requerida? |
| - | ------------------------------------------------------------- | --------------- | ----------- |
| 1 | **Login exitoso** — credenciales válidas devuelven JWT.       | HU-02           | ✅          |
| 2 | **Login fallido** — credenciales incorrectas son rechazadas con error genérico. | HU-02 | ✅ |
| 3 | **Creación de ticket** — se crea con estado `abierto` y datos válidos. | HU-04 | ✅ |
| 4 | 🔒 **RN-01** — un `user` **no puede reducir** la prioridad (rechazo); sí puede mantener/aumentar. | HU-05 | ✅ |
| 5 | 🔒 **RN-02** — solo `admin` puede eliminar; un `user` es rechazado. | HU-07 | ✅ |
| 6 | 🔒 **(Bonus) RN-03** — un cambio de prioridad/estado registra correctamente una entrada de historial. | HU-08 | ⭐ Bonus |

**Casos límite recomendados (adicionales):**
- Registro con correo duplicado → rechazado.
- Login de usuario `inactivo` → acceso denegado.
- Enum inválido en prioridad/estado → rechazado.
- Intento de editar/borrar una entrada de historial → no existe la operación (RN-03).

---

# Parte B — Frontend

## B1. Requisitos a cubrir

| # | Requisito                                                        | Historias relacionadas |
| - | --------------------------------------------------------------- | ---------------------- |
| 1 | Pantalla de login con manejo de **JWT**                          | HU-02                  |
| 2 | Listado de tickets con **filtros por estado y prioridad** (paginado) | HU-03             |
| 3 | Formulario de **creación y edición** de ticket                   | HU-04, HU-05, HU-06    |
| 4 | **Indicador visual de prioridad** (badges o colores)             | HU-03                  |

## B2. Fases de implementación del frontend

> El frontend consume la API definida en [openapi.yaml](./openapi.yaml).
> Cada fase de FE depende de que la fase de BE equivalente exponga su endpoint.

### Fase F0 — Fundaciones
- Configuración del proyecto (React + TypeScript).
- Estructura de navegación: login → tablero de tickets → detalle/historial → reportes.
- Cliente HTTP con inyección automática del **JWT** en cabeceras.
- Guardas de ruta según autenticación y rol.
- *Depende de:* B0, B1 (contrato de auth).

### Fase F1 — Autenticación
- **Pantalla de login**: captura credenciales, guarda el JWT, maneja errores genéricos.
- Persistencia de sesión y expiración/limpieza del token.
- Redirección post-login según rol.
- *Depende de:* B1.

### Fase F2 — Listado de tickets
- Tabla con columnas: título, descripción, prioridad, estado, usuario asignado.
- **Filtros por estado y prioridad** + **paginación** (y ordenamiento).
- **Indicador visual de prioridad**: badges/colores (`baja`, `media`, `alta`, `crítica`).
- *Depende de:* B2.

### Fase F3 — Creación y edición de ticket
- **Formulario de creación** con validación por conveniencia.
- **Formulario de edición**: cambio de prioridad y estado.
- 🔒 UX de RN-01: para `user`, no permitir seleccionar una prioridad menor a la actual (reflejo del backend).
- *Depende de:* B2, B3.

### Fase F4 — Historial y eliminación (reflejo de reglas)
- 🔒 Vista de historial en **solo lectura**, sin acciones de editar/eliminar para ningún rol (RN-03).
- 🔒 Acción de eliminar visible **solo** para `admin`; oculta por defecto para `user` (RN-02).
- *Depende de:* B4, B5.

### Fase F5 — Reportes
- Visualización del resumen estadístico por estado y prioridad.
- *Depende de:* B6.

## B3. Consideraciones de pruebas del frontend

> El frontend no lista pruebas unitarias obligatorias en la spec, pero se recomienda cubrir
> la lógica de presentación aislada de la red:

- Render del **badge/indicador de prioridad** según el valor (mapeo valor → color/etiqueta).
- Lógica de **filtros y paginación** en el listado (estado de UI).
- Manejo del **JWT**: guardado tras login, envío en peticiones, limpieza al expirar/cerrar sesión.
- Guardas de ruta: acceso denegado sin sesión; opciones de `admin` ocultas para `user`.
- Validación del formulario de ticket (campos requeridos, RN-01 en la selección de prioridad).

---

## Orden de integración recomendado (Backend ↔ Frontend)

```
B0 ─► B1 ─► B2 ─► B3 ─► B4 ─► B5 ─► B6      (Backend por fases)
        │      │      │      │      │
        ▼      ▼      ▼      ▼      ▼
F0 ──► F1 ──► F2 ──► F3 ──► F4 ──────► F5    (Frontend consume cada fase lista)
```

- El backend **lidera** cada capa; el frontend integra en cuanto el endpoint correspondiente está disponible.
- Las reglas de negocio 🔒 se implementan **primero en el backend** (con su prueba unitaria) y **después** se reflejan en la UX del frontend.

---

## Definición de "terminado" (Definition of Done)

Una historia se considera completada cuando:
1. El endpoint/lógica de backend está implementado y **cubierto por su prueba unitaria** cuando aplica.
2. La regla de negocio (si la toca) se valida en el backend, no solo en la UI.
3. La pantalla/flujo de frontend consume el endpoint y refleja la regla en la UX.
4. Migraciones y seeders permiten reproducir el escenario de prueba.
5. Los criterios de aceptación Gherkin de la historia se cumplen.


## Prompts clave empleados 
1. quiero que analises mi archivo y me des un refinamiento de como se podria mejorar mi historia de usuario, teniendo en cuenta 3 reglas de negocio importantes

un usuario no puede reducir la prioridad de un ticket, solo aumentarla
solo un administrador puede eliminar tickets
el historial de cambios de estado es inmutable

seguidamente quiero que agregues la version refinada al archivo user-stories-refined

2. teniendo en cuenta nuestro archivo de user-stories-refined.md quiero que realices un plan de trabajo en el archivo work-plan.md
teniendo en cuenta consideraciones como que las tareas deben estar ordenadas por dependencia
deben existir separaciones claras entre las tareas pertenecientes al backend y cuales al frontend 
y que elementos se cubrira en las pruebas unitarias del sistema

concentrate en crear solo el plan sin tener en cuenta por el momento indicaciones del codigo, el codigo se va a trabajar con node.js, typescript, express y sequelize, pero el plan todavia no debe ondar en esta parte

3. quiero que teniendo en cuenta todos mis archivos anteriormente trabajados se pueda crear un plan de implementacion en mi archivo ai-workflow.md 
mi backend y frontend deben tener la logica separada
mi backend va a contar con la tecnologia 
- Node.js · TypeScript · Express + TypeORM o Sequelize

y mi frontend con 
- React + TypeScript

cada uno cuenta con requisitos y pruebas unitarias a considerar 

backend
**Requisitos:**

- Autenticación JWT con middleware aplicado
- Autorización por roles (`admin` / `user`)
- Validación de reglas de negocio de la spec
- Migraciones y seeders funcionales
- Relaciones correctamente definidas en el ORM

**Pruebas unitarias (mínimo 5):**

1. Login exitoso
2. Login fallido (credenciales incorrectas)
3. Creación de ticket
4. Restricción: usuario no puede reducir prioridad
5. Restricción: solo admin puede eliminar
6. (Bonus) Historial de cambios se registra correctamente


frontend 
**Requisitos:**

- Pantalla de login con manejo de JWT
- Listado de tickets con filtros por estado y prioridad (paginado)
- Formulario de creación y edición de ticket
- Indicador visual de prioridad (badges o colores)

4. seguidamente quiero que lleves a cabo el proceso de implementacion siguiendo el archivo creado