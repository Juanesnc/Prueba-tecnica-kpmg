# Plan de Trabajo — Sistema de Gestión de Tickets

> Plan derivado de [user-stories-refined.md](./user-stories-refined.md).
> Las tareas están **ordenadas por dependencia** (de la base hacia arriba).
> Cada fase separa lo que corresponde a **Backend (BE)** y a **Frontend (FE)**.
> Al final se detalla el alcance de las **pruebas unitarias**.
>
> Nota: este plan es agnóstico de la implementación. No define estructura de código,
> librerías ni detalles técnicos; solo el *qué* y el *orden*.

---

## Leyenda

- **Prefijos de tarea:** `BE` = Backend · `FE` = Frontend · `QA` = Pruebas · `INF` = Infraestructura/base común.
- **Dep.:** tareas de las que depende (deben completarse antes).
- 🔒 = Toca una regla de negocio (RN-01, RN-02, RN-03).

---

## Fase 0 — Fundaciones (base común, sin dependencias)

Sienta las bases que todo lo demás necesita. Es la raíz del árbol de dependencias.

| ID     | Área | Tarea                                                                 | Dep. |
| ------ | ---- | -------------------------------------------------------------------- | ---- |
| INF-01 | BE   | Definir modelo de datos conceptual: entidades Usuario, Ticket, Historial y sus relaciones. | — |
| INF-02 | BE   | Definir los enums del dominio: `prioridad`, `estado` (ticket), `rol`, `estado` (usuario). | INF-01 |
| INF-03 | BE   | Definir estrategia transversal de *soft delete* para Usuario y Ticket. | INF-01 |
| INF-04 | BE   | Definir contrato de API (endpoints, entradas/salidas, códigos de error) a alto nivel. | INF-01, INF-02 |
| INF-05 | FE   | Definir arquitectura de navegación y layout base (login → tablero de tickets → detalle/historial → reportes). | — |
| INF-06 | FE   | Definir manejo de sesión y guardas de ruta según rol (`admin` / `user`). | INF-05 |

---

## Fase 1 — Autenticación y usuarios (Épica 1)

Depende de la Fase 0. Es prerequisito de todo lo demás porque define **quién** actúa y con **qué rol** (base para RN-01 y RN-02).

### Backend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| BE-01  | Modelo/persistencia de Usuario (con hash de contraseña y estado).     | HU-01  | INF-01..03 |
| BE-02  | Registro de usuario con validaciones (correo único, campos requeridos). | HU-01  | BE-01 |
| BE-03  | Inicio de sesión: verificación de credenciales y emisión de sesión/token. | HU-02 | BE-01 |
| BE-04  | Bloqueo de acceso a usuarios con estado `inactivo`.                   | HU-02  | BE-03 |
| BE-05  | Mecanismo de autorización por rol (base reutilizable para RN-01/RN-02). | HU-02 | BE-03 |

### Frontend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| FE-01  | Pantalla de registro con validación de formulario.                    | HU-01  | INF-05, BE-02 |
| FE-02  | Pantalla de login y manejo de errores genéricos.                      | HU-02  | INF-06, BE-03 |
| FE-03  | Persistencia de sesión y redirección post-login según rol.            | HU-02  | FE-02, BE-05 |

---

## Fase 2 — Tickets: lectura y creación (Épica 2, base del CRUD)

Depende de la Fase 1 (usuario asignado y sesión). Establece la entidad central del sistema.

### Backend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| BE-06  | Modelo/persistencia de Ticket con enums y *soft delete*.              | HU-04  | INF-02, INF-03, BE-01 |
| BE-07  | Crear ticket con validaciones y estado inicial `abierto` por defecto. | HU-04  | BE-06 |
| BE-08  | Listar tickets con **filtrado, ordenamiento y paginación** por columna. | HU-03 | BE-06 |
| BE-09  | Excluir del listado los tickets con *soft delete*.                    | HU-03  | BE-08 |

### Frontend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| FE-04  | Tabla de tickets con columnas título, descripción, prioridad, estado, usuario asignado. | HU-03 | FE-03, BE-08 |
| FE-05  | Controles de filtrado, ordenamiento y paginación en la tabla.         | HU-03  | FE-04 |
| FE-06  | Formulario de creación de ticket con validación.                      | HU-04  | FE-04, BE-07 |

---

## Fase 3 — Tickets: reglas de negocio de edición (Épica 2 + RN-01)

Depende de la Fase 2 (el ticket ya existe y se lista). Introduce **RN-01** y prepara el historial.

### Backend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| BE-10 🔒 | Cambiar prioridad aplicando RN-01 (un `user` solo puede mantener o aumentar; validación en backend). | HU-05 | BE-07, BE-05 |
| BE-11  | Cambiar estado del ticket dentro del flujo válido.                    | HU-06  | BE-07 |

### Frontend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| FE-07 🔒 | UI de edición de prioridad que impide seleccionar valores menores para `user` y muestra el error del backend. | HU-05 | FE-06, BE-10 |
| FE-08  | UI de cambio de estado del ticket.                                    | HU-06  | FE-06, BE-11 |

---

## Fase 4 — Historial de cambios (Épica 3, HU-08 + RN-03)

Depende de la Fase 3, porque el historial registra los cambios de prioridad y estado. Introduce **RN-03**.

### Backend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| BE-12  | Modelo/persistencia de Historial (campo modificado, valor anterior, valor nuevo, fecha, hora, usuario). | HU-08 | BE-01 |
| BE-13 🔒 | Registrar automáticamente una entrada de historial en cada creación/cambio de prioridad o estado. | HU-04, HU-05, HU-06 | BE-07, BE-10, BE-11, BE-12 |
| BE-14 🔒 | Garantizar inmutabilidad: solo INSERT; sin endpoints ni operaciones de edición/borrado de historial (ni para `admin`). | HU-08 | BE-12 |
| BE-15  | Consultar historial de un ticket.                                     | HU-08  | BE-12 |

### Frontend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| FE-09 🔒 | Vista de historial en modo **solo lectura**; sin acciones de editar/eliminar para ningún rol (RN-03). | HU-08 | FE-08, BE-15 |

---

## Fase 5 — Eliminación de tickets (Épica 3, HU-07 + RN-02)

Depende de las fases anteriores (el rol, el ticket y el historial ya existen). Introduce **RN-02**.

### Backend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| BE-16 🔒 | Eliminar ticket vía *soft delete*, restringido a rol `admin` (RN-02); el historial se conserva. | HU-07 | BE-06, BE-05, BE-12 |

### Frontend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| FE-10 🔒 | Mostrar la acción de eliminar **solo** a `admin`; para `user` la opción no aparece (por defecto oculta, no una comprobación reactiva). | HU-07 | FE-04, FE-03, BE-16 |

---

## Fase 6 — Reportes (Épica 4)

Depende de que existan tickets con estado/prioridad (Fase 2+). Es la capa más alta, sin dependientes.

### Backend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| BE-17  | Resumen estadístico: conteos agrupados por estado y por prioridad, excluyendo *soft delete*. | HU-09 | BE-06 |

### Frontend
| ID     | Tarea                                                                 | HU     | Dep. |
| ------ | -------------------------------------------------------------------- | ------ | ---- |
| FE-11  | Visualización del resumen estadístico por estado y por prioridad.     | HU-09  | FE-04, BE-17 |

---

## Resumen del orden por dependencia

```
Fase 0  Fundaciones (modelo, enums, soft delete, contrato API, navegación)
   │
Fase 1  Autenticación y usuarios ──► base de roles (RN-01/RN-02)
   │
Fase 2  Tickets: lectura y creación
   │
Fase 3  Tickets: prioridad (RN-01) y estado
   │
Fase 4  Historial de cambios (RN-03)
   │
Fase 5  Eliminación de tickets (RN-02)
   │
Fase 6  Reportes
```

---

## Alcance de las pruebas unitarias

Las pruebas unitarias se concentran en la **lógica de negocio del backend** (el frontend valida por conveniencia, pero el backend es la fuente de verdad). Se cubrirá:

### Reglas de negocio (prioridad máxima)
- **RN-01 — Prioridad solo aumenta:**
  - `user` sube prioridad (`media` → `alta`): se acepta.
  - `user` mantiene prioridad (`alta` → `alta`): se acepta.
  - `user` reduce prioridad (`alta` → `media`/`baja`): se rechaza.
  - Comportamiento de `admin` según la decisión pendiente (exento o no).
- **RN-02 — Solo admin elimina:**
  - `admin` elimina: aplica *soft delete*, el ticket deja de listarse.
  - `user` intenta eliminar: se rechaza.
  - El historial del ticket se conserva tras la eliminación.
- **RN-03 — Historial inmutable:**
  - Cada creación/cambio de prioridad/estado genera exactamente una entrada de historial.
  - No existe operación que edite o borre una entrada de historial (ni para `admin`).

### Autenticación y autorización
- Hash de contraseña (no se almacena en texto plano).
- Registro con correo duplicado: rechazado.
- Login con credenciales inválidas: error genérico.
- Login de usuario `inactivo`: acceso denegado.
- Verificación de rol en las acciones protegidas.

### Validaciones de dominio
- Enums de `prioridad` y `estado` rechazan valores fuera del conjunto.
- Campos obligatorios del ticket y del usuario.
- Estado inicial `abierto` por defecto al crear un ticket.
- Transiciones de estado dentro del flujo válido.

### Consultas y filtros
- Filtrado, ordenamiento y paginación del listado de tickets.
- Exclusión de registros con *soft delete* en listados y en el resumen estadístico.
- Agrupación correcta del resumen por estado y por prioridad.

### Fuera del alcance de las pruebas unitarias (referencia)
- Pruebas de integración de la API end-to-end.
- Pruebas de UI/E2E del frontend.
- Rendimiento y carga de la paginación.
- *(Se documentan aquí solo para dejar clara la frontera; se abordarán en una etapa posterior.)*
