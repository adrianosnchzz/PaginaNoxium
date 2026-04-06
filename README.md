Las cosas que he ido añadiendo:
Tabla de concentradores
He montado la tabla con ngx-datatable. La paginación y el ordenamiento los gestiona el servidor, no el front. También he añadido un buscador que filtra mandando el texto a la API al pulsar Enter.
Selección y exportación
Añadí checkboxes para seleccionar filas y un selector propio para elegir qué columnas quieres exportar. Con eso puedes descargar lo seleccionado en Excel, CSV o JSON. Los botones se desactivan solos si no tienes nada seleccionado.
Login
Pantalla de login con correo y contraseña. Si te equivocas sale un mensaje de error. Cuando entras bien te redirige a la tabla. La barra de navegación no aparece mientras estás en el login.

Las cosas que he usado

ngx-datatable — para la tabla, me ha venido muy bien porque tiene la paginación y el ordenamiento integrados
xlsx — para generar los archivos de Excel y CSV desde el front
HttpClient de Angular — para las llamadas a la API
Bootstrap 5 — para los estilos y el layout