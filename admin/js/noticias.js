/**
 * noticias.js (admin)
 * Administra el CRUD completo de noticias: listar, crear, editar, eliminar
 * y subir la imagen asociada a cada noticia.
 */

let noticiaEnEdicionId = null;
let rutaImagenSeleccionada = '';

document.addEventListener('DOMContentLoaded', () => {
    cargarListaNoticias();
    inicializarFormularioNoticia();
    inicializarZonaSubidaImagen();
});

/* ---------- Listado ---------- */

async function cargarListaNoticias() {
    const contenedor = document.getElementById('tabla-noticias');
    contenedor.innerHTML = '<p class="cargando-texto">Cargando noticias...</p>';

    try {
        const respuesta = await obtenerJSON('admin/noticias_crud.php', '?accion=listar');
        const noticias = respuesta.datos || [];

        if (noticias.length === 0) {
            contenedor.innerHTML = '<p class="cargando-texto">Aún no hay noticias registradas.</p>';
            return;
        }

        contenedor.innerHTML = `
            <div class="contenedor-tabla">
            <table class="tabla-admin">
                <thead>
                    <tr><th>Imagen</th><th>Título</th><th>Fecha</th><th>Destacado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    ${noticias.map((n) => `
                        <tr>
                            <td><img class="miniatura" src="${escaparHTML(n.imagen ? '../' + n.imagen : '../img/noticia-default.svg')}" alt="" onerror="this.src='../img/noticia-default.svg'"></td>
                            <td>${escaparHTML(n.titulo)}</td>
                            <td>${escaparHTML(n.fecha)}</td>
                            <td>${n.destacado ? '<span class="etiqueta-badge">Sí</span>' : 'No'}</td>
                            <td class="acciones">
                                <button class="boton boton-secundario" data-editar="${n.id}">Editar</button>
                                <button class="boton boton-peligro" data-eliminar="${n.id}">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            </div>
        `;

        contenedor.querySelectorAll('[data-editar]').forEach((boton) => {
            boton.addEventListener('click', () => cargarNoticiaEnFormulario(parseInt(boton.getAttribute('data-editar'), 10), noticias));
        });
        contenedor.querySelectorAll('[data-eliminar]').forEach((boton) => {
            boton.addEventListener('click', () => eliminarNoticia(parseInt(boton.getAttribute('data-eliminar'), 10)));
        });
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="cargando-texto">Ocurrió un error al cargar las noticias.</p>';
    }
}

/* ---------- Formulario (crear / editar) ---------- */

function inicializarFormularioNoticia() {
    const formulario = document.getElementById('formulario-noticia');
    const botonCancelar = document.getElementById('boton-cancelar-edicion');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        await guardarNoticia();
    });

    botonCancelar.addEventListener('click', () => reiniciarFormularioNoticia());
}

function cargarNoticiaEnFormulario(id, noticias) {
    const noticia = noticias.find((n) => n.id === id);
    if (!noticia) return;

    noticiaEnEdicionId = id;
    rutaImagenSeleccionada = noticia.imagen || '';

    document.getElementById('titulo-formulario-noticia').textContent = 'Editar noticia';
    document.getElementById('noticia-titulo').value = noticia.titulo;
    document.getElementById('noticia-fecha').value = noticia.fecha;
    document.getElementById('noticia-resumen').value = noticia.resumen;
    document.getElementById('noticia-contenido').value = noticia.contenido;
    document.getElementById('noticia-destacado').checked = !!noticia.destacado;
    document.getElementById('nombre-archivo-imagen').textContent = noticia.imagen ? 'Imagen actual conservada (elige otra para reemplazarla)' : 'Ningún archivo seleccionado';
    document.getElementById('boton-cancelar-edicion').classList.remove('oculto');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reiniciarFormularioNoticia() {
    noticiaEnEdicionId = null;
    rutaImagenSeleccionada = '';
    document.getElementById('formulario-noticia').reset();
    document.getElementById('titulo-formulario-noticia').textContent = 'Agregar noticia';
    document.getElementById('nombre-archivo-imagen').textContent = 'Ningún archivo seleccionado';
    document.getElementById('boton-cancelar-edicion').classList.add('oculto');
}

async function guardarNoticia() {
    const mensajeEstado = document.getElementById('mensaje-estado-noticia');
    const botonGuardar = document.getElementById('boton-guardar-noticia');
    botonGuardar.disabled = true;

    try {
        const formData = new FormData();
        formData.append('accion', noticiaEnEdicionId ? 'editar' : 'crear');
        if (noticiaEnEdicionId) formData.append('id', noticiaEnEdicionId);
        formData.append('titulo', document.getElementById('noticia-titulo').value);
        formData.append('fecha', document.getElementById('noticia-fecha').value);
        formData.append('resumen', document.getElementById('noticia-resumen').value);
        formData.append('contenido', document.getElementById('noticia-contenido').value);
        formData.append('destacado', document.getElementById('noticia-destacado').checked);
        formData.append('imagen', rutaImagenSeleccionada);

        const respuesta = await enviarFormData('admin/noticias_crud.php', formData);

        if (respuesta.exito) {
            mostrarMensaje(mensajeEstado, respuesta.mensaje, 'exito');
            reiniciarFormularioNoticia();
            cargarListaNoticias();
        } else {
            mostrarMensaje(mensajeEstado, respuesta.mensaje, 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje(mensajeEstado, 'Ocurrió un error al guardar la noticia.', 'error');
    } finally {
        botonGuardar.disabled = false;
    }
}

async function eliminarNoticia(id) {
    if (!confirm('¿Seguro que deseas eliminar esta noticia? Esta acción no se puede deshacer.')) return;

    try {
        const formData = new FormData();
        formData.append('accion', 'eliminar');
        formData.append('id', id);
        const respuesta = await enviarFormData('admin/noticias_crud.php', formData);

        if (respuesta.exito) {
            cargarListaNoticias();
        } else {
            alert(respuesta.mensaje);
        }
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al eliminar la noticia.');
    }
}

/* ---------- Subida de imagen ---------- */

function inicializarZonaSubidaImagen() {
    const zona = document.getElementById('zona-subida-imagen');
    const input = document.getElementById('input-imagen-noticia');
    const nombreArchivo = document.getElementById('nombre-archivo-imagen');

    zona.addEventListener('click', () => input.click());

    input.addEventListener('change', async () => {
        if (!input.files.length) return;
        const archivo = input.files[0];
        nombreArchivo.textContent = `Subiendo "${archivo.name}"...`;

        try {
            const formData = new FormData();
            formData.append('imagen', archivo);
            const respuesta = await enviarFormData('admin/upload_imagen.php', formData);

            if (respuesta.exito) {
                rutaImagenSeleccionada = respuesta.datos.ruta;
                nombreArchivo.textContent = `✓ ${archivo.name}`;
            } else {
                nombreArchivo.textContent = 'Error: ' + respuesta.mensaje;
            }
        } catch (error) {
            console.error(error);
            nombreArchivo.textContent = 'Ocurrió un error al subir la imagen.';
        }
    });
}
