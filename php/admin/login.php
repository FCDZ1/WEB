<?php
/**
 * admin/login.php
 * Procesa el formulario de inicio de sesión del panel administrativo.
 */

require_once __DIR__ . '/../auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJSON(false, 'Método no permitido', null, 405);
}

$usuario = limpiarTexto($_POST['usuario'] ?? '');
$password = (string) ($_POST['password'] ?? '');

if ($usuario === '' || $password === '') {
    responderJSON(false, 'Debes ingresar usuario y contraseña.', null, 422);
}

// Limitar intentos de inicio de sesión por sesión de navegador (protección básica de fuerza bruta)
if (!isset($_SESSION['intentos_login'])) {
    $_SESSION['intentos_login'] = 0;
    $_SESSION['bloqueo_hasta'] = 0;
}

if (time() < $_SESSION['bloqueo_hasta']) {
    $segundosRestantes = $_SESSION['bloqueo_hasta'] - time();
    responderJSON(false, "Demasiados intentos fallidos. Intenta nuevamente en {$segundosRestantes} segundos.", null, 429);
}

$usuarioValido = autenticarUsuario($usuario, $password);

if ($usuarioValido === null) {
    $_SESSION['intentos_login']++;
    if ($_SESSION['intentos_login'] >= 5) {
        $_SESSION['bloqueo_hasta'] = time() + 60; // Bloqueo de 1 minuto tras 5 fallos
        $_SESSION['intentos_login'] = 0;
    }
    responderJSON(false, 'Usuario o contraseña incorrectos.', null, 401);
}

// Regenerar el ID de sesión al iniciar sesión (previene fijación de sesión)
session_regenerate_id(true);

$_SESSION['admin_id'] = $usuarioValido['id'];
$_SESSION['admin_usuario'] = $usuarioValido['usuario'];
$_SESSION['admin_nombre'] = $usuarioValido['nombre'] ?? $usuarioValido['usuario'];
$_SESSION['ultimo_acceso'] = time();
$_SESSION['intentos_login'] = 0;

responderJSON(true, 'Inicio de sesión exitoso', [
    'nombre' => $_SESSION['admin_nombre'],
]);
