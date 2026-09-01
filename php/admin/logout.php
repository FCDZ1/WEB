<?php
/**
 * admin/logout.php
 * Cierra la sesión activa del administrador.
 */

require_once __DIR__ . '/../auth.php';

session_unset();
session_destroy();

responderJSON(true, 'Sesión cerrada correctamente');
