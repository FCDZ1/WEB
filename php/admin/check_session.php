<?php
/**
 * admin/check_session.php
 * Usado por las páginas del panel para verificar, vía JavaScript,
 * si la sesión administrativa sigue activa antes de mostrar contenido.
 */

require_once __DIR__ . '/../auth.php';

if (sesionActiva()) {
    responderJSON(true, 'Sesión activa', ['nombre' => $_SESSION['admin_nombre'] ?? '']);
} else {
    responderJSON(false, 'Sesión no activa', null, 401);
}
