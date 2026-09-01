<?php
/**
 * admin/configuracion.php
 * Permite al administrador:
 *   - obtener  : obtener la configuración actual (para precargar el formulario)
 *   - guardar  : actualizar los datos institucionales y el enlace de notas
 *   - password : cambiar la contraseña del usuario administrador
 * Requiere sesión administrativa activa.
 */

require_once __DIR__ . '/../auth.php';
requerirSesion();

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtener':
        $configuracion = leerJSON(ARCHIVO_CONFIGURACION, []);
        responderJSON(true, 'Configuración obtenida', $configuracion);
        break;

    case 'guardar':
        $configuracion = leerJSON(ARCHIVO_CONFIGURACION, []);

        $campos = [
            'nombre_institucion', 'eslogan', 'direccion', 'telefono', 'email',
            'facebook', 'instagram', 'plataforma_notas_url', 'informacion_institucional',
        ];

        foreach ($campos as $campo) {
            if (isset($_POST[$campo])) {
                $configuracion[$campo] = limpiarTexto($_POST[$campo]);
            }
        }

        // Logo y banner: solo se actualizan si se envió una nueva ruta (tras subir imagen)
        if (!empty($_POST['logo'])) {
            $configuracion['logo'] = limpiarTexto($_POST['logo']);
        }
        if (!empty($_POST['banner'])) {
            $configuracion['banner'] = limpiarTexto($_POST['banner']);
        }

        // Avisos importantes: se reciben como JSON codificado desde el formulario
        if (isset($_POST['avisos'])) {
            $avisosDecodificados = json_decode($_POST['avisos'], true);
            if (is_array($avisosDecodificados)) {
                $avisosLimpios = [];
                foreach ($avisosDecodificados as $aviso) {
                    $avisosLimpios[] = [
                        'titulo' => limpiarTexto($aviso['titulo'] ?? ''),
                        'texto' => limpiarTexto($aviso['texto'] ?? ''),
                    ];
                }
                $configuracion['avisos'] = $avisosLimpios;
            }
        }

        if (!escribirJSON(ARCHIVO_CONFIGURACION, $configuracion)) {
            responderJSON(false, 'No se pudo guardar la configuración.', null, 500);
        }

        responderJSON(true, 'Configuración actualizada correctamente', $configuracion);
        break;

    case 'password':
        $actual = (string) ($_POST['password_actual'] ?? '');
        $nueva = (string) ($_POST['password_nueva'] ?? '');
        $confirmacion = (string) ($_POST['password_confirmacion'] ?? '');

        if ($actual === '' || $nueva === '' || $confirmacion === '') {
            responderJSON(false, 'Todos los campos de contraseña son obligatorios.', null, 422);
        }

        if (strlen($nueva) < 8) {
            responderJSON(false, 'La nueva contraseña debe tener al menos 8 caracteres.', null, 422);
        }

        if ($nueva !== $confirmacion) {
            responderJSON(false, 'La confirmación no coincide con la nueva contraseña.', null, 422);
        }

        $usuarios = leerJSON(ARCHIVO_USUARIOS, ['usuarios' => []]);
        $actualizado = false;

        foreach ($usuarios['usuarios'] as &$u) {
            if ((int) $u['id'] === (int) $_SESSION['admin_id']) {
                if (!password_verify($actual, $u['password'])) {
                    responderJSON(false, 'La contraseña actual es incorrecta.', null, 401);
                }
                $u['password'] = password_hash($nueva, PASSWORD_DEFAULT);
                $actualizado = true;
                break;
            }
        }
        unset($u);

        if (!$actualizado) {
            responderJSON(false, 'No se pudo identificar al usuario.', null, 404);
        }

        if (!escribirJSON(ARCHIVO_USUARIOS, $usuarios)) {
            responderJSON(false, 'No se pudo actualizar la contraseña.', null, 500);
        }

        responderJSON(true, 'Contraseña actualizada correctamente. Úsala en tu próximo inicio de sesión.');
        break;

    default:
        responderJSON(false, 'Acción no válida.', null, 400);
}
