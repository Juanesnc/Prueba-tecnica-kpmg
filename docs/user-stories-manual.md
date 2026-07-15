## Sistema de gestión de tickets

El sistema cuenta inicialmente con un login basico de ingreso al sistema, este debe contar con las opciones de ingreso y registro en el sistema usando campos que deben pertenecer al usuario 

* Los campos con los que deben contar los usuarios son:
    - Nombre
    - Correo
    - Rol
    - Contraseña
    - Estado

Seguidamente debe abrir a nuestro CRUD principal el cual esta encargado de los tickets del sistema, este debe ser una tabla la cual nos dejen visualizar las columnas de Titulo, descripcion, prioridad, estado y el usuario al cual fue asignado

* Los campos con los que deben contar los tickets son:
    - Titulo / Nombre
    - Descripcion
    - Prioridad - Las opciones de prioridad deben ser baja | media | alta | critica
    - Estado - Las opciones de estado deben ser abierto | en progreso | resuleto | cerrado
    - usuario asignado 

## Detalles a considerar: 

- Los campos con opciones como prioridad y estado deben ser de tipo enum dado que las opciones de las mismas no creceran con el tiempo
- Deben existir dos roles en el sistema, admin y usuario (admin | user)
- El rol de usuario no podria reducir la prioridad de un ticket
- El admin es el unico que podria eliminar registros de la tabla de tickets
- Ambas tablas deben contar con softdelete
- La tabla debe contar con filtrado y paginacion por las distintas columnas
- Se debe contar con un historial de cambios teniendo en cuenta la fecha, hora y usuario que lo realizo 
- Se debe poder tener un resumen estadistico sobre los tickets, ya sea por estado o por prioridad

