<?php
/**
 * get_configuracion.php
 * Endpoint público (solo lectura) que devuelve la configuración general
 * de la institución: nombre, logo, contacto, enlace a plataforma de notas, etc.
 */

require_once __DIR__ . '/functions.php';

$configuracion = leerJSON(ARCHIVO_CONFIGURACION, []);
responderJSON(true, 'Configuración obtenida correctamente', $configuracion);
