<?php
/**
 * admin/upload_pdf.php
 * Sube un documento PDF a uploads/biblioteca/.
 * Valida extensión, tipo MIME real y tamaño máximo.
 * Requiere sesión administrativa activa.
 */

require_once __DIR__ . '/../auth.php';
requerirSesion();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['documento'])) {
    responderJSON(false, 'No se recibió ningún archivo.', null, 422);
}

$archivo = $_FILES['documento'];

if ($archivo['error'] !== UPLOAD_ERR_OK) {
    responderJSON(false, 'Ocurrió un error al subir el archivo.', null, 422);
}

if ($archivo['size'] > TAMANO_MAXIMO_PDF) {
    responderJSON(false, 'El archivo supera el tamaño máximo permitido (20 MB).', null, 422);
}

if (!extensionPermitida($archivo['name'], EXTENSIONES_PDF)) {
    responderJSON(false, 'Solo se permiten archivos PDF.', null, 422);
}

// Validar el tipo MIME real del archivo usando fileinfo (evita archivos
// ejecutables o scripts disfrazados con extensión .pdf)
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeReal = finfo_file($finfo, $archivo['tmp_name']);
finfo_close($finfo);

if ($mimeReal !== 'application/pdf') {
    responderJSON(false, 'El archivo no es un PDF válido.', null, 422);
}

// Verificar firma binaria (%PDF-) como capa adicional de validación
$manejador = fopen($archivo['tmp_name'], 'rb');
$cabecera = fread($manejador, 5);
fclose($manejador);

if ($cabecera !== '%PDF-') {
    responderJSON(false, 'El archivo no tiene un formato PDF válido.', null, 422);
}

$nombreSeguro = generarNombreArchivoSeguro($archivo['name'], RUTA_UPLOADS_BIBLIOTECA);
$rutaDestino = RUTA_UPLOADS_BIBLIOTECA . '/' . $nombreSeguro;

if (!move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
    responderJSON(false, 'No se pudo guardar el documento en el servidor.', null, 500);
}

@chmod($rutaDestino, 0644);

$rutaRelativa = 'uploads/biblioteca/' . $nombreSeguro;

responderJSON(true, 'Documento subido correctamente', ['ruta' => $rutaRelativa]);
