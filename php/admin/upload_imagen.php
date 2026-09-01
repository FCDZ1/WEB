<?php
/**
 * admin/upload_imagen.php
 * Sube una imagen (para noticias, banner o logo) a uploads/imagenes/.
 * Valida extensión real del archivo, tipo MIME y tamaño máximo.
 * Requiere sesión administrativa activa.
 */

require_once __DIR__ . '/../auth.php';
requerirSesion();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['imagen'])) {
    responderJSON(false, 'No se recibió ningún archivo de imagen.', null, 422);
}

$archivo = $_FILES['imagen'];

// Verificar errores de subida estándar de PHP
if ($archivo['error'] !== UPLOAD_ERR_OK) {
    responderJSON(false, 'Ocurrió un error al subir el archivo.', null, 422);
}

// Validar tamaño máximo
if ($archivo['size'] > TAMANO_MAXIMO_IMAGEN) {
    responderJSON(false, 'La imagen supera el tamaño máximo permitido (5 MB).', null, 422);
}

// Validar extensión declarada
if (!extensionPermitida($archivo['name'], EXTENSIONES_IMAGEN)) {
    responderJSON(false, 'Extensión no permitida. Usa: ' . implode(', ', EXTENSIONES_IMAGEN), null, 422);
}

// Validar que el contenido real del archivo sea una imagen (evita subir
// scripts maliciosos disfrazados con extensión de imagen)
$infoImagen = @getimagesize($archivo['tmp_name']);
if ($infoImagen === false) {
    responderJSON(false, 'El archivo no es una imagen válida.', null, 422);
}

$mimesPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($infoImagen['mime'], $mimesPermitidos, true)) {
    responderJSON(false, 'Tipo de imagen no permitido.', null, 422);
}

// Generar nombre seguro y único para no sobrescribir archivos existentes
$nombreSeguro = generarNombreArchivoSeguro($archivo['name'], RUTA_UPLOADS_IMAGENES);
$rutaDestino = RUTA_UPLOADS_IMAGENES . '/' . $nombreSeguro;

if (!move_uploaded_file($archivo['tmp_name'], $rutaDestino)) {
    responderJSON(false, 'No se pudo guardar la imagen en el servidor.', null, 500);
}

// Asegura permisos razonables (solo lectura para el grupo/otros)
@chmod($rutaDestino, 0644);

$rutaRelativa = 'uploads/imagenes/' . $nombreSeguro;

responderJSON(true, 'Imagen subida correctamente', ['ruta' => $rutaRelativa]);
