<?php
/**
 * enviar_contacto.php
 * Recibe los mensajes del formulario de contacto público, los valida
 * y los almacena en data/mensajes.json para que el administrador
 * pueda revisarlos posteriormente.
 */

require_once __DIR__ . '/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJSON(false, 'Método no permitido', null, 405);
}

$nombre = limpiarTexto($_POST['nombre'] ?? '');
$correo = limpiarTexto($_POST['correo'] ?? '');
$asunto = limpiarTexto($_POST['asunto'] ?? '');
$mensaje = limpiarTexto($_POST['mensaje'] ?? '');

// Validaciones básicas del formulario
if ($nombre === '' || $correo === '' || $mensaje === '') {
    responderJSON(false, 'Por favor completa los campos obligatorios (nombre, correo y mensaje).', null, 422);
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responderJSON(false, 'El correo electrónico no es válido.', null, 422);
}

if (mb_strlen($mensaje) > 3000) {
    responderJSON(false, 'El mensaje es demasiado largo.', null, 422);
}

$archivoMensajes = RUTA_DATA . '/mensajes.json';
$datos = leerJSON($archivoMensajes, ['mensajes' => []]);

$nuevoMensaje = [
    'id' => generarSiguienteId($datos['mensajes']),
    'nombre' => $nombre,
    'correo' => $correo,
    'asunto' => $asunto !== '' ? $asunto : '(sin asunto)',
    'mensaje' => $mensaje,
    'fecha' => date('Y-m-d H:i:s'),
    'leido' => false,
];

$datos['mensajes'][] = $nuevoMensaje;

if (!escribirJSON($archivoMensajes, $datos)) {
    responderJSON(false, 'No se pudo guardar el mensaje. Intenta nuevamente.', null, 500);
}

responderJSON(true, 'Tu mensaje fue enviado correctamente. Pronto nos pondremos en contacto contigo.');
