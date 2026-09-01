<?php
/**
 * admin/mensajes.php
 * Permite al administrador ver los mensajes recibidos desde el formulario
 * de contacto público, marcarlos como leídos y eliminarlos.
 * Requiere sesión administrativa activa.
 */

require_once __DIR__ . '/../auth.php';
requerirSesion();

$archivoMensajes = RUTA_DATA . '/mensajes.json';
$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'listar';

$datos = leerJSON($archivoMensajes, ['mensajes' => []]);

switch ($accion) {

    case 'listar':
        $mensajes = $datos['mensajes'];
        usort($mensajes, function ($a, $b) {
            return strtotime($b['fecha'] ?? '1970-01-01') <=> strtotime($a['fecha'] ?? '1970-01-01');
        });
        responderJSON(true, 'Mensajes obtenidos', $mensajes);
        break;

    case 'marcar_leido':
        $id = (int) ($_POST['id'] ?? 0);
        foreach ($datos['mensajes'] as &$m) {
            if ((int) $m['id'] === $id) {
                $m['leido'] = true;
                break;
            }
        }
        unset($m);
        escribirJSON($archivoMensajes, $datos);
        responderJSON(true, 'Mensaje marcado como leído');
        break;

    case 'eliminar':
        $id = (int) ($_POST['id'] ?? 0);
        $datos['mensajes'] = array_values(array_filter($datos['mensajes'], function ($m) use ($id) {
            return (int) $m['id'] !== $id;
        }));
        escribirJSON($archivoMensajes, $datos);
        responderJSON(true, 'Mensaje eliminado');
        break;

    default:
        responderJSON(false, 'Acción no válida.', null, 400);
}
