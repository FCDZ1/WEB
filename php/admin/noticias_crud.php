<?php
/**
 * admin/noticias_crud.php
 * Permite listar, crear, editar y eliminar noticias.
 * Requiere sesión administrativa activa.
 *
 * Acciones (parámetro "accion" por POST o GET):
 *   listar  -> devuelve todas las noticias (incluye no destacadas)
 *   crear   -> agrega una nueva noticia
 *   editar  -> modifica una noticia existente por id
 *   eliminar-> elimina una noticia por id (y su imagen asociada si existe)
 */

require_once __DIR__ . '/../auth.php';
requerirSesion();

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

$datos = leerJSON(ARCHIVO_NOTICIAS, ['noticias' => []]);

switch ($accion) {

    case 'listar':
        usort($datos['noticias'], function ($a, $b) {
            return strtotime($b['fecha'] ?? '1970-01-01') <=> strtotime($a['fecha'] ?? '1970-01-01');
        });
        responderJSON(true, 'Noticias obtenidas', $datos['noticias']);
        break;

    case 'crear':
        $titulo = limpiarTexto($_POST['titulo'] ?? '');
        $fecha = limpiarTexto($_POST['fecha'] ?? '');
        $resumen = limpiarTexto($_POST['resumen'] ?? '');
        $contenido = limpiarTexto($_POST['contenido'] ?? '');
        $imagen = limpiarTexto($_POST['imagen'] ?? '');
        $destacado = filter_var($_POST['destacado'] ?? false, FILTER_VALIDATE_BOOLEAN);

        if ($titulo === '' || $fecha === '' || $resumen === '') {
            responderJSON(false, 'Título, fecha y resumen son obligatorios.', null, 422);
        }

        $nuevaNoticia = [
            'id' => generarSiguienteId($datos['noticias']),
            'titulo' => $titulo,
            'fecha' => $fecha,
            'imagen' => $imagen,
            'resumen' => $resumen,
            'contenido' => $contenido !== '' ? $contenido : $resumen,
            'destacado' => $destacado,
        ];

        $datos['noticias'][] = $nuevaNoticia;

        if (!escribirJSON(ARCHIVO_NOTICIAS, $datos)) {
            responderJSON(false, 'No se pudo guardar la noticia.', null, 500);
        }

        responderJSON(true, 'Noticia creada correctamente', $nuevaNoticia);
        break;

    case 'editar':
        $id = (int) ($_POST['id'] ?? 0);
        $encontrada = false;

        foreach ($datos['noticias'] as &$noticia) {
            if ((int) $noticia['id'] === $id) {
                $noticia['titulo'] = limpiarTexto($_POST['titulo'] ?? $noticia['titulo']);
                $noticia['fecha'] = limpiarTexto($_POST['fecha'] ?? $noticia['fecha']);
                $noticia['resumen'] = limpiarTexto($_POST['resumen'] ?? $noticia['resumen']);
                $noticia['contenido'] = limpiarTexto($_POST['contenido'] ?? $noticia['contenido']);
                if (isset($_POST['imagen']) && $_POST['imagen'] !== '') {
                    $noticia['imagen'] = limpiarTexto($_POST['imagen']);
                }
                $noticia['destacado'] = filter_var($_POST['destacado'] ?? false, FILTER_VALIDATE_BOOLEAN);
                $encontrada = true;
                break;
            }
        }
        unset($noticia);

        if (!$encontrada) {
            responderJSON(false, 'Noticia no encontrada.', null, 404);
        }

        if (!escribirJSON(ARCHIVO_NOTICIAS, $datos)) {
            responderJSON(false, 'No se pudo actualizar la noticia.', null, 500);
        }

        responderJSON(true, 'Noticia actualizada correctamente');
        break;

    case 'eliminar':
        $id = (int) ($_POST['id'] ?? 0);
        $noticiaEliminar = null;

        foreach ($datos['noticias'] as $noticia) {
            if ((int) $noticia['id'] === $id) {
                $noticiaEliminar = $noticia;
                break;
            }
        }

        if ($noticiaEliminar === null) {
            responderJSON(false, 'Noticia no encontrada.', null, 404);
        }

        $datos['noticias'] = array_values(array_filter($datos['noticias'], function ($n) use ($id) {
            return (int) $n['id'] !== $id;
        }));

        if (!escribirJSON(ARCHIVO_NOTICIAS, $datos)) {
            responderJSON(false, 'No se pudo eliminar la noticia.', null, 500);
        }

        // Elimina la imagen asociada del servidor si existe y pertenece a uploads/imagenes
        if (!empty($noticiaEliminar['imagen'])) {
            $rutaImagen = RUTA_BASE . '/' . ltrim($noticiaEliminar['imagen'], '/');
            $rutaReal = realpath($rutaImagen);
            if ($rutaReal !== false && strpos($rutaReal, realpath(RUTA_UPLOADS_IMAGENES)) === 0 && is_file($rutaReal)) {
                @unlink($rutaReal);
            }
        }

        responderJSON(true, 'Noticia eliminada correctamente');
        break;

    default:
        responderJSON(false, 'Acción no válida.', null, 400);
}
