<?php
/**
 * config.php
 * Configuración global del sistema.
 * Define rutas base, tiempo de sesión y parámetros generales.
 */

if (!defined('ESCUELA_APP')) {
    define('ESCUELA_APP', true);
}

// Ruta absoluta a la carpeta raíz del proyecto (una carpeta arriba de /php)
define('RUTA_BASE', dirname(__DIR__));

// Rutas de las carpetas de datos y de subida de archivos
define('RUTA_DATA', RUTA_BASE . '/data');
define('RUTA_UPLOADS_IMAGENES', RUTA_BASE . '/uploads/imagenes');
define('RUTA_UPLOADS_BIBLIOTECA', RUTA_BASE . '/uploads/biblioteca');

// Archivos JSON utilizados por el sistema
define('ARCHIVO_NOTICIAS', RUTA_DATA . '/noticias.json');
define('ARCHIVO_BIBLIOTECA', RUTA_DATA . '/biblioteca.json');
define('ARCHIVO_USUARIOS', RUTA_DATA . '/usuarios.json');
define('ARCHIVO_CONFIGURACION', RUTA_DATA . '/configuracion.json');

// Extensiones y tamaños permitidos para subida de archivos
define('EXTENSIONES_IMAGEN', ['jpg', 'jpeg', 'png', 'webp', 'gif']);
define('EXTENSIONES_PDF', ['pdf']);
define('TAMANO_MAXIMO_IMAGEN', 5 * 1024 * 1024);   // 5 MB
define('TAMANO_MAXIMO_PDF', 20 * 1024 * 1024);     // 20 MB

// Tiempo de vida de la sesión administrativa (en segundos) - 2 horas
define('TIEMPO_SESION', 60 * 60 * 2);

// Configuración de sesión segura antes de iniciarla
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_samesite', 'Lax');
    session_start();
}

// Cabeceras de seguridad básicas para todas las respuestas PHP
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

// Zona horaria por defecto
date_default_timezone_set('America/Guatemala');
