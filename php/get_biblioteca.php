<?php
/**
 * get_biblioteca.php
 * Endpoint público (solo lectura) que devuelve el listado de documentos
 * de la biblioteca, con soporte opcional de búsqueda por nombre (?buscar=)
 * y filtro por categoría (?categoria=).
 */

require_once __DIR__ . '/functions.php';

$datos = leerJSON(ARCHIVO_BIBLIOTECA, ['documentos' => []]);
$documentos = $datos['documentos'] ?? [];

$buscar = isset($_GET['buscar']) ? limpiarTexto($_GET['buscar']) : '';
$categoria = isset($_GET['categoria']) ? limpiarTexto($_GET['categoria']) : '';

if ($buscar !== '') {
    $buscarMin = mb_strtolower($buscar);
    $documentos = array_values(array_filter($documentos, function ($doc) use ($buscarMin) {
        return mb_strpos(mb_strtolower($doc['titulo'] ?? ''), $buscarMin) !== false;
    }));
}

if ($categoria !== '' && $categoria !== 'Todas') {
    $documentos = array_values(array_filter($documentos, function ($doc) use ($categoria) {
        return ($doc['categoria'] ?? '') === $categoria;
    }));
}

// Ordenar por fecha descendente
usort($documentos, function ($a, $b) {
    return strtotime($b['fecha'] ?? '1970-01-01') <=> strtotime($a['fecha'] ?? '1970-01-01');
});

responderJSON(true, 'Documentos obtenidos correctamente', $documentos);
