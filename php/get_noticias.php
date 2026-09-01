<?php
/**
 * get_noticias.php
 * Endpoint público (solo lectura) que devuelve el listado de noticias
 * ordenado desde la más reciente hasta la más antigua.
 */

require_once __DIR__ . '/functions.php';

$datos = leerJSON(ARCHIVO_NOTICIAS, ['noticias' => []]);
$noticias = $datos['noticias'] ?? [];

// Ordenar por fecha descendente (más reciente primero)
usort($noticias, function ($a, $b) {
    return strtotime($b['fecha'] ?? '1970-01-01') <=> strtotime($a['fecha'] ?? '1970-01-01');
});

responderJSON(true, 'Noticias obtenidas correctamente', $noticias);
