<?php
/**
 * functions.php
 * Funciones auxiliares reutilizables:
 *  - Lectura y escritura segura de archivos JSON (con bloqueo de archivo)
 *  - Respuestas JSON estandarizadas
 *  - Validación y saneamiento de datos
 *  - Generación de nombres de archivo únicos
 */

require_once __DIR__ . '/config.php';

/**
 * Lee un archivo JSON y lo devuelve como arreglo asociativo.
 * Si el archivo no existe, devuelve la estructura por defecto indicada.
 */
function leerJSON(string $ruta, $estructuraPorDefecto = []) {
    if (!file_exists($ruta)) {
        return $estructuraPorDefecto;
    }
    $contenido = file_get_contents($ruta);
    if ($contenido === false || trim($contenido) === '') {
        return $estructuraPorDefecto;
    }
    $datos = json_decode($contenido, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return $estructuraPorDefecto;
    }
    return $datos;
}

/**
 * Escribe un arreglo asociativo en un archivo JSON de forma segura,
 * utilizando bloqueo exclusivo (LOCK_EX) para evitar corrupción de datos
 * cuando hay escrituras simultáneas.
 */
function escribirJSON(string $ruta, $datos): bool {
    $json = json_encode($datos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        return false;
    }
    $resultado = file_put_contents($ruta, $json, LOCK_EX);
    return $resultado !== false;
}

/**
 * Envía una respuesta JSON estandarizada y termina la ejecución.
 */
function responderJSON(bool $exito, string $mensaje = '', $datos = null, int $codigoHttp = 200) {
    http_response_code($codigoHttp);
    header('Content-Type: application/json; charset=utf-8');
    $respuesta = ['exito' => $exito, 'mensaje' => $mensaje];
    if ($datos !== null) {
        $respuesta['datos'] = $datos;
    }
    echo json_encode($respuesta, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Limpia una cadena de texto de espacios y etiquetas HTML peligrosas,
 * conservando el texto legible.
 */
function limpiarTexto($texto): string {
    $texto = trim((string) $texto);
    $texto = strip_tags($texto);
    return $texto;
}

/**
 * Genera un identificador incremental único dentro de una colección
 * (arreglo de elementos que tienen la clave 'id').
 */
function generarSiguienteId(array $coleccion): int {
    $maximo = 0;
    foreach ($coleccion as $elemento) {
        if (isset($elemento['id']) && (int) $elemento['id'] > $maximo) {
            $maximo = (int) $elemento['id'];
        }
    }
    return $maximo + 1;
}

/**
 * Genera un nombre de archivo único y seguro a partir de un nombre original,
 * evitando sobrescribir archivos existentes y eliminando caracteres peligrosos.
 */
function generarNombreArchivoSeguro(string $nombreOriginal, string $carpetaDestino): string {
    $extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
    $nombreBase = pathinfo($nombreOriginal, PATHINFO_FILENAME);

    // Solo letras, números, guiones y guiones bajos
    $nombreBase = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nombreBase);
    $nombreBase = substr($nombreBase, 0, 60);
    if ($nombreBase === '') {
        $nombreBase = 'archivo';
    }

    $nombreFinal = $nombreBase . '.' . $extension;
    $contador = 1;

    // Evita sobrescribir archivos existentes agregando un sufijo numérico
    while (file_exists($carpetaDestino . '/' . $nombreFinal)) {
        $nombreFinal = $nombreBase . '_' . $contador . '.' . $extension;
        $contador++;
    }

    return $nombreFinal;
}

/**
 * Valida que la extensión de un archivo subido esté dentro de la lista permitida.
 */
function extensionPermitida(string $nombreArchivo, array $extensionesPermitidas): bool {
    $extension = strtolower(pathinfo($nombreArchivo, PATHINFO_EXTENSION));
    return in_array($extension, $extensionesPermitidas, true);
}

/**
 * Crea el usuario administrador por defecto la primera vez que se ejecuta
 * el sistema, si el archivo de usuarios no existe o está vacío.
 * Usuario:  admin
 * Password: admin123  (se recomienda cambiarla desde el panel al ingresar)
 */
function inicializarUsuarioPorDefecto(): void {
    $usuarios = leerJSON(ARCHIVO_USUARIOS, ['usuarios' => []]);
    if (empty($usuarios['usuarios'])) {
        $usuarios['usuarios'] = [
            [
                'id' => 1,
                'usuario' => 'admin',
                'password' => password_hash('admin123', PASSWORD_DEFAULT),
                'nombre' => 'Administrador',
            ],
        ];
        escribirJSON(ARCHIVO_USUARIOS, $usuarios);
    }
}
