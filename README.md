# Sistema Web Institucional - Escuela

Sitio web completo para una institución educativa: parte pública (noticias,
biblioteca, contacto) y panel de administración, construido con
**HTML + CSS + JavaScript puro** en el frontend y **PHP + archivos JSON**
en el backend (sin bases de datos).

## 🚀 Instalación (XAMPP u otro servidor con PHP)

1. Copia la carpeta completa `escuela/` dentro de `htdocs` (en XAMPP) o de
   la raíz web de tu servidor.
2. Asegúrate de que PHP tenga permisos de **lectura y escritura** sobre las
   carpetas `data/` y `uploads/` (y sus subcarpetas).
3. Abre tu navegador en `http://localhost/escuela/` para ver el sitio
   público, o en `http://localhost/escuela/admin/login.html` para entrar
   al panel de administración.
4. Requiere **PHP 8.0 o superior** (usa `password_hash`, `finfo`, tipado
   de funciones, etc.).

## 🔑 Credenciales iniciales del panel

El sistema crea automáticamente el primer usuario administrador la primera
vez que alguien intenta iniciar sesión:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

⚠️ **Importante:** cambia esta contraseña de inmediato desde
`Panel → Configuración → Cambiar contraseña de acceso`.

## 📁 Estructura del proyecto

```
escuela/
├── index.html            Página principal
├── noticias.html          Todas las noticias
├── biblioteca.html        Biblioteca digital (búsqueda + descarga)
├── contacto.html          Formulario de contacto
│
├── admin/                 Panel administrativo (protegido con login)
│   ├── login.html
│   ├── panel.html          Dashboard con estadísticas y mensajes
│   ├── noticias.html       CRUD de noticias
│   ├── biblioteca.html     CRUD de documentos
│   ├── configuracion.html  Datos institucionales, avisos, notas, contraseña
│   ├── css/ , js/
│
├── data/                  "Base de datos" en archivos JSON (no accesible por navegador)
│   ├── noticias.json
│   ├── biblioteca.json
│   ├── usuarios.json
│   ├── configuracion.json
│   └── mensajes.json       (se crea automáticamente al recibir el primer mensaje)
│
├── uploads/
│   ├── imagenes/           Imágenes de noticias, logo y banner
│   └── biblioteca/         Documentos PDF
│
├── css/ , js/ , img/       Recursos del sitio público
└── php/                    Backend PHP (lectura/escritura JSON, subida de
    └── admin/               archivos, autenticación, endpoints protegidos)
```

## ✏️ ¿Qué puede hacer el administrador sin conocimientos técnicos?

Desde el panel (`/admin`) se puede, con solo clics y formularios:

- Agregar, editar y eliminar **noticias**, subiendo su imagen.
- Agregar, editar y eliminar **documentos PDF** de la biblioteca.
- Editar el **nombre, eslogan, dirección, teléfono, correo, redes sociales**
  y el texto de "Sobre nosotros".
- Cambiar el **logo** y la **imagen de banner** del sitio.
- Editar o agregar **avisos importantes** que aparecen en la portada.
- Cambiar el **enlace de la plataforma de notas** (botón del sitio).
- Revisar los **mensajes** enviados desde el formulario de contacto.
- Cambiar su **contraseña** de acceso.

Todo se guarda automáticamente en los archivos JSON de `data/`, sin
necesidad de tocar código ni bases de datos.

## 🔒 Seguridad implementada

- Contraseñas cifradas con `password_hash()` / verificadas con `password_verify()`.
- Sesiones PHP con cookies `HttpOnly`, `SameSite`, expiración por
  inactividad (2 horas) y regeneración de ID al iniciar sesión.
- Límite de intentos de inicio de sesión (bloqueo temporal tras 5 fallos).
- Todos los endpoints del panel (`php/admin/*.php`) verifican la sesión
  antes de ejecutar cualquier acción.
- Subida de archivos validada por **extensión**, **tipo MIME real** y
  **firma binaria** (en el caso de PDF), con **tamaño máximo** y
  generación de **nombres únicos** para nunca sobrescribir archivos.
- Carpetas `data/`, `uploads/imagenes/` y `uploads/biblioteca/` protegidas
  mediante `.htaccess` contra listado y **ejecución de scripts PHP**
  subidos accidentalmente.
- Todo el texto proveniente de formularios se limpia con `strip_tags()`
  antes de guardarse, y se escapa (`escaparHTML`) antes de mostrarse.
- Escritura de archivos JSON con bloqueo exclusivo (`LOCK_EX`) para evitar
  corrupción de datos ante escrituras simultáneas.

## 🌐 Plataforma de notas

El botón "Plataforma de Notas" del sitio público redirige a la URL
configurada en `Panel → Configuración → Enlace de la plataforma de notas`.
Cambia esa URL para apuntar al sistema oficial de notas de la institución.

## 🎨 Personalización de diseño

Los estilos del sitio público están en `css/style.css` y usan variables
CSS (`:root`) para la paleta de colores azul/blanco — fáciles de ajustar.
El **modo oscuro** se activa con el botón 🌙 del encabezado y se recuerda
entre visitas (localStorage).

## 🖼️ Nota sobre imágenes de ejemplo

El proyecto incluye un logo (`img/logo.svg`) y una imagen de noticia por
defecto (`img/noticia-default.svg`) genéricos en formato SVG, para que el
sitio se vea completo desde el primer momento. Reemplázalos o súbelos
desde el panel de administración con las imágenes reales de la institución.
