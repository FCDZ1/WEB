<?php
/**
 * admin/biblioteca_crud.php
 * Permite listar, crear, editar y eliminar documentos de la biblioteca.
 * Requiere sesión administrativa activa.
 */

require_once __DIR__ . '/../auth.php';
requerirSesion();

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

$datos = leerJSON(ARCHIVO_BIBLIOTECA, ['documentos' => []]);

switch ($accion) {

    case 'listar':
        usort($datos['documentos'], function ($a, $b) {
            return strtotime($b['fecha'] ?? '1970-01-01') <=> strtotime($a['fecha'] ?? '1970-01-01');
        });
        responderJSON(true, 'Documentos obtenidos', $datos['documentos']);
        break;

    case 'crear':
        $titulo = limpiarTexto($_POST['titulo'] ?? '');
        $categoria = limpiarTexto($_POST['categoria'] ?? 'General');
        $descripcion = limpiarTexto($_POST['descripcion'] ?? '');
        $archivo = limpiarTexto($_POST['archivo'] ?? '');
        $fecha = limpiarTexto($_POST['fecha'] ?? date('Y-m-d'));

        if ($titulo === '' || $archivo === '') {
            responderJSON(false, 'El título y el archivo PDF son obligatorios.', null, 422);
        }

        $nuevoDocumento = [
            'id' => generarSiguienteId($datos['documentos']),
            'titulo' => $titulo,
            'categoria' => $categoria !== '' ? $categoria : 'General',
            'descripcion' => $descripcion,
            'archivo' => $archivo,
            'fecha' => $fecha,
        ];

        $datos['documentos'][] = $nuevoDocumento;

        if (!escribirJSON(ARCHIVO_BIBLIOTECA, $datos)) {
            responderJSON(false, 'No se pudo guardar el documento.', null, 500);
        }

        responderJSON(true, 'Documento agregado correctamente', $nuevoDocumento);
        break;

    case 'editar':
        $id = (int) ($_POST['id'] ?? 0);
        $encontrado = false;

        foreach ($datos['documentos'] as &$doc) {
            if ((int) $doc['id'] === $id) {
                $doc['titulo'] = limpiarTexto($_POST['titulo'] ?? $doc['titulo']);
                $doc['categoria'] = limpiarTexto($_POST['categoria'] ?? $doc['categoria']);
                $doc['descripcion'] = limpiarTexto($_POST['descripcion'] ?? $doc['descripcion']);
                if (isset($_POST['archivo']) && $_POST['archivo'] !== '') {
                    $doc['archivo'] = limpiarTexto($_POST['archivo']);
                }
                $doc['fecha'] = limpiarTexto($_POST['fecha'] ?? $doc['fecha']);
                $encontrado = true;
                break;
            }
        }
        unset($doc);

        if (!$encontrado) {
            responderJSON(false, 'Documento no encontrado.', null, 404);
        }

        if (!escribirJSON(ARCHIVO_BIBLIOTECA, $datos)) {
            responderJSON(false, 'No se pudo actualizar el documento.', null, 500);
        }

        responderJSON(true, 'Documento actualizado correctamente');
        break;

    case 'eliminar':
        $id = (int) ($_POST['id'] ?? 0);
        $documentoEliminar = null;

        foreach ($datos['documentos'] as $doc) {
            if ((int) $doc['id'] === $id) {
                $documentoEliminar = $doc;
                break;
            }
        }

        if ($documentoEliminar === null) {
            responderJSON(false, 'Documento no encontrado.', null, 404);
        }

        $datos['documentos'] = array_values(array_filter($datos['documentos'], function ($d) use ($id) {
            return (int) $d['id'] !== $id;
        }));

        if (!escribirJSON(ARCHIVO_BIBLIOTECA, $datos)) {
            responderJSON(false, 'No se pudo eliminar el documento.', null, 500);
        }

        // Elimina el PDF asociado del servidor si existe y pertenece a uploads/biblioteca
        if (!empty($documentoEliminar['archivo'])) {
            $rutaArchivo = RUTA_BASE . '/' . ltrim($documentoEliminar['archivo'], '/');
            $rutaReal = realpath($rutaArchivo);
            if ($rutaReal !== false && strpos($rutaReal, realpath(RUTA_UPLOADS_BIBLIOTECA)) === 0 && is_file($rutaReal)) {
                @unlink($rutaReal);
            }
        }

        responderJSON(true, 'Documento eliminado correctamente');
        break;

    default:
        responderJSON(false, 'Acción no válida.', null, 400);
}
