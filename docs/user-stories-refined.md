## Cambios respecto a la versión manual

- Epica 3 - HU-07 - criterio de aceptacion 2: Esta sugerencia por parte de la ia estaria de mas en el sistema dado que si el usuario no tiene acceso a eliminar tickets de por si deberia no aparecerle la opcion por defecto y no esperar una comprobacion de permisos cada que se intente realizar la accion
- Epica 3 - HU-08 - criterio de aceptacion 2: Al ser un listado inmutable no deberia aparecer la opcion de eliminar o editar algun registro ni siquiera por el admin, ya que esta estipulado asi como regla de negocio

# Sistema de Gestión de Tickets — Historias de Usuario (Refinadas)

> Versión refinada de [user-stories-manual.md](./user-stories-manual.md).
> Cada historia sigue el formato **Como / Quiero / Para** e incluye **Criterios de Aceptación**
> verificables (Gherkin: Dado / Cuando / Entonces). Las reglas de negocio clave están
> marcadas con 🔒 y desarrolladas en la sección [Reglas de Negocio](#reglas-de-negocio).

---

## Roles del sistema

| Rol     | Descripción                                                        |
| ------- | ------------------------------------------------------------------ |
| `admin` | Acceso total. Único que puede eliminar tickets.                    |
| `user`  | Gestiona tickets según permisos, con restricciones de negocio.     |

---

## Épica 1 — Autenticación y gestión de cuenta

### HU-01 · Registro de usuario
**Como** persona sin cuenta
**quiero** registrarme en el sistema
**para** poder acceder a la gestión de tickets.

**Criterios de aceptación**
- **Dado** que ingreso nombre, correo, contraseña y rol válidos, **cuando** envío el formulario, **entonces** se crea mi cuenta con estado `activo`.
- **Dado** que el correo ya existe, **cuando** intento registrarme, **entonces** el sistema rechaza el registro con un mensaje claro.
- La contraseña se almacena **hasheada**, nunca en texto plano.
- Campos del usuario: `nombre`, `correo` (único), `rol` (`admin` | `user`), `contraseña`, `estado` (`activo` | `inactivo`).

### HU-02 · Inicio de sesión
**Como** usuario registrado
**quiero** iniciar sesión con correo y contraseña
**para** acceder a mis tickets.

**Criterios de aceptación**
- **Dado** credenciales válidas y estado `activo`, **cuando** inicio sesión, **entonces** recibo un token/sesión válido.
- **Dado** un usuario con estado `inactivo`, **cuando** intenta iniciar sesión, **entonces** el acceso es denegado.
- **Dado** credenciales inválidas, **cuando** inicio sesión, **entonces** se muestra un error genérico (sin revelar si falló el correo o la contraseña).

---

## Épica 2 — Gestión de tickets (CRUD)

### HU-03 · Visualizar tickets
**Como** usuario autenticado
**quiero** ver los tickets en una tabla
**para** conocer su estado de un vistazo.

**Criterios de aceptación**
- La tabla muestra: `título`, `descripción`, `prioridad`, `estado` y `usuario asignado`.
- **Dado** un volumen grande de tickets, **cuando** abro la tabla, **entonces** los resultados se muestran **paginados**.
- Puedo **filtrar y ordenar** por cada columna (título, prioridad, estado, usuario asignado).
- No se muestran tickets con *soft delete* aplicado.

### HU-04 · Crear ticket
**Como** usuario autenticado
**quiero** crear un ticket
**para** registrar una incidencia o solicitud.

**Criterios de aceptación**
- Campos: `título`, `descripción`, `prioridad` (`baja` | `media` | `alta` | `crítica`), `estado` (`abierto` | `en progreso` | `resuelto` | `cerrado`), `usuario asignado`.
- **Dado** que no completo un campo obligatorio, **cuando** guardo, **entonces** se rechaza con validación.
- Al crearse, el ticket queda en estado `abierto` por defecto y se registra en el historial (ver 🔒 [RN-03](#rn-03--historial-inmutable)).
- `prioridad` y `estado` son de tipo **enum**.

### HU-05 · Editar prioridad de un ticket 🔒
**Como** usuario autenticado
**quiero** ajustar la prioridad de un ticket
**para** reflejar su urgencia real.

**Criterios de aceptación**
- **Dado** un ticket con prioridad `media`, **cuando** un `user` la cambia a `alta` o `crítica`, **entonces** el cambio se acepta.
- **Dado** un ticket con prioridad `alta`, **cuando** un `user` intenta cambiarla a `media` o `baja`, **entonces** el sistema **rechaza** la operación con error (ver 🔒 [RN-01](#rn-01--la-prioridad-solo-puede-aumentar-para-user)).
- Todo cambio de prioridad queda registrado en el historial con fecha, hora y usuario.

### HU-06 · Cambiar estado de un ticket
**Como** usuario autenticado
**quiero** cambiar el estado de un ticket
**para** reflejar su avance en el flujo de trabajo.

**Criterios de aceptación**
- Estados válidos: `abierto` → `en progreso` → `resuelto` → `cerrado`.
- **Dado** cualquier cambio de estado, **cuando** se guarda, **entonces** se crea un registro **inmutable** en el historial (ver 🔒 [RN-03](#rn-03--historial-inmutable)).

---

## Épica 3 — Historial y trazabilidad

### HU-07 · Eliminar ticket 🔒
**Como** administrador
**quiero** eliminar un ticket
**para** retirar registros inválidos o duplicados.

**Criterios de aceptación**
- **Dado** un usuario con rol `admin`, **cuando** elimina un ticket, **entonces** se aplica *soft delete* y deja de listarse.
- **Dado** un usuario con rol `user`, **cuando** intenta eliminar un ticket, **entonces** el sistema **rechaza** la acción con error de autorización (ver 🔒 [RN-02](#rn-02--solo-admin-elimina-tickets)).
- La eliminación es *soft delete*: el registro y su historial se conservan en base de datos.

### HU-08 · Consultar historial de cambios 🔒
**Como** usuario autenticado
**quiero** ver el historial de cambios de un ticket
**para** auditar quién hizo qué y cuándo.

**Criterios de aceptación**
- Cada entrada registra: `campo modificado`, `valor anterior`, `valor nuevo`, `fecha`, `hora` y `usuario` que lo realizó.
- **Dado** un registro de historial existente, **cuando** cualquier usuario (incluido `admin`) intenta editarlo o borrarlo, **entonces** el sistema **lo impide**: el historial es **inmutable** (ver 🔒 [RN-03](#rn-03--historial-inmutable)).

---

## Épica 4 — Reportes

### HU-09 · Resumen estadístico
**Como** usuario autenticado
**quiero** ver un resumen estadístico de los tickets
**para** entender la carga y distribución del trabajo.

**Criterios de aceptación**
- Puedo ver conteos agrupados **por estado** y **por prioridad**.
- Los tickets con *soft delete* no se incluyen en las estadísticas.

---

## Reglas de Negocio

### RN-01 · La prioridad solo puede aumentar (para `user`)
Un `user` **no puede reducir** la prioridad de un ticket, solo mantenerla o **aumentarla**.

- Orden de prioridad: `baja` (1) < `media` (2) < `alta` (3) < `crítica` (4).
- Regla: `prioridad_nueva >= prioridad_actual` cuando el actor es `user`.
- Se valida en el **backend** (no solo en la UI); el intento de reducción devuelve error `422/403`.
- Se recomienda registrar el intento rechazado para auditoría.
- **Decisión confirmada:** el rol `admin` **está exento** de esta regla y **sí puede reducir** la prioridad.

### RN-02 · Solo `admin` elimina tickets
La eliminación de tickets está restringida al rol `admin`.

- Se valida en el **backend** mediante política/autorización, no solo ocultando el botón en la UI.
- Aplica sobre *soft delete*; el registro nunca se borra físicamente.
- Un `user` que intente eliminar recibe error `403`.

### RN-03 · Historial inmutable
El historial de cambios de estado (y de cambios en general) es **inmutable**.

- Solo se permite la operación **INSERT**; nunca `UPDATE` ni `DELETE` sobre registros de historial.
- Ni siquiera un `admin` puede modificar o borrar entradas de historial.
- Se recomienda reforzarlo a nivel de base de datos (p. ej., ausencia de endpoints de edición, permisos restringidos, o triggers que rechacen `UPDATE`/`DELETE`).
- El *soft delete* de un ticket **no** elimina su historial.

---

## Requisitos transversales
- **Soft delete** en las tablas de usuarios y tickets.
- **Enums** para `prioridad` y `estado` (conjunto cerrado, no crece con el tiempo).
- **Filtrado, ordenamiento y paginación** en la tabla de tickets.
- Todas las reglas de negocio se validan en el **backend** como fuente de verdad.
