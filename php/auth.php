<?php
/**
 * auth.php
 * Control de autenticación y sesión para el panel administrativo.
 */

require_once __DIR__ . '/functions.php';

/**
 * Verifica si hay una sesión administrativa activa y vigente.
 * Si la sesión expiró por inactividad, la destruye.
 */
function sesionActiva(): bool {
    if (!isset($_SESSION['admin_id']) || !isset($_SESSION['ultimo_acceso'])) {
        return false;
    }
    if (time() - $_SESSION['ultimo_acceso'] > TIEMPO_SESION) {
        session_unset();
        session_destroy();
        return false;
    }
    $_SESSION['ultimo_acceso'] = time();
    return true;
}

/**
 * Corta la ejecución con un error 401 si no hay sesión activa.
 * Debe llamarse al inicio de cada endpoint PHP protegido del panel.
 */
function requerirSesion(): void {
    if (!sesionActiva()) {
        responderJSON(false, 'Sesión no válida o expirada. Vuelve a iniciar sesión.', null, 401);
    }
}

/**
 * Intenta autenticar a un usuario contra el archivo usuarios.json.
 * Devuelve el arreglo del usuario si las credenciales son correctas,
 * o null si son inválidas.
 */
function autenticarUsuario(string $usuario, string $password): ?array {
    inicializarUsuarioPorDefecto();
    $datos = leerJSON(ARCHIVO_USUARIOS, ['usuarios' => []]);
    foreach ($datos['usuarios'] as $u) {
        if (hash_equals((string) $u['usuario'], $usuario) && password_verify($password, $u['password'])) {
            return $u;
        }
    }
    return null;
}
