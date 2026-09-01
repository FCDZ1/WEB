/**
 * biblioteca.js (admin)
 * Administra el CRUD completo de documentos de la biblioteca: listar, crear,
 * editar, eliminar y subir el archivo PDF asociado a cada documento.
 */

let documentoEnEdicionId = null;
let rutaArchivoSeleccionado = '';

document.addEventListener('DOMContentLoaded', () => {
    cargarListaDocumentos();
    inicializarFormularioDocumento();
    inicializarZonaSubidaPdf();
});

/* ---------- Listado ---------- */

async function cargarListaDocumentos() {
    const contenedor = document.getElementById('tabla-documentos');
    contenedor.innerHTML = '<p class="cargando-texto">Cargando documentos...</p>';

    try {
        const respuesta = await obtenerJSON('admin/biblioteca_crud.php', '?accion=listar');
        const documentos = respuesta.datos || [];

        if (documentos.length === 0) {
            contenedor.innerHTML = '<p class="cargando-texto">Aún no hay documentos registrados.</p>';
            return;
        }

        contenedor.innerHTML = `
            <div class="contenedor-tabla">
            <table class="tabla-admin">
                <thead>
                    <tr><th>Título</th><th>Categoría</th><th>Fecha</th><th>Archivo</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    ${documentos.map((d) => `
                        <tr>
                            <td>${escaparHTML(d.titulo)}</td>
                            <td><span class="etiqueta-badge">${escaparHTML(d.categoria || 'General')}</span></td>
                            <td>${escaparHTML(d.fecha)}</td>
                            <td>${d.archivo ? `<a href="../${escaparHTML(d.archivo)}" target="_blank">Ver PDF</a>` : '—'}</td>
                            <td class="acciones">
                                <button class="boton boton-secundario" data-editar="${d.id}">Editar</button>
                                <button class="boton boton-peligro" data-eliminar="${d.id}">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            </div>
        `;

        contenedor.querySelectorAll('[data-editar]').forEach((boton) => {
            boton.addEventListener('click', () => cargarDocumentoEnFormulario(parseInt(boton.getAttribute('data-editar'), 10), documentos));
        });
        contenedor.querySelectorAll('[data-eliminar]').forEach((boton) => {
            boton.addEventListener('click', () => eliminarDocumento(parseInt(boton.getAttribute('data-eliminar'), 10)));
        });
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="cargando-texto">Ocurrió un error al cargar los documentos.</p>';
    }
}

/* ---------- Formulario (crear / editar) ---------- */

function inicializarFormularioDocumento() {
    const formulario = document.getElementById('formulario-documento');
    const botonCancelar = document.getElementById('boton-cancelar-edicion-doc');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        await guardarDocumento();
    });

    botonCancelar.addEventListener('click', () => reiniciarFormularioDocumento());
}

function cargarDocumentoEnFormulario(id, documentos) {
    const doc = documentos.find((d) => d.id === id);
    if (!doc) return;

    documentoEnEdicionId = id;
    rutaArchivoSeleccionado = doc.archivo || '';

    document.getElementById('titulo-formulario-doc').textContent = 'Editar documento';
    document.getElementById('doc-titulo').value = doc.titulo;
    document.getElementById('doc-categoria').value = doc.categoria || '';
    document.getElementById('doc-descripcion').value = doc.descripcion || '';
    document.getElementById('doc-fecha').value = doc.fecha;
    document.getElementById('nombre-archivo-pdf').textContent = doc.archivo ? 'Archivo PDF actual conservado (elige otro para reemplazarlo)' : 'Ningún archivo seleccionado';
    document.getElementById('boton-cancelar-edicion-doc').classList.remove('oculto');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function reiniciarFormularioDocumento() {
    documentoEnEdicionId = null;
    rutaArchivoSeleccionado = '';
    document.getElementById('formulario-documento').reset();
    document.getElementById('titulo-formulario-doc').textContent = 'Agregar documento';
    document.getElementById('nombre-archivo-pdf').textContent = 'Ningún archivo seleccionado';
    document.getElementById('boton-cancelar-edicion-doc').classList.add('oculto');
}

async function guardarDocumento() {
    const mensajeEstado = document.getElementById('mensaje-estado-doc');
    const botonGuardar = document.getElementById('boton-guardar-doc');

    if (!rutaArchivoSeleccionado) {
        mostrarMensaje(mensajeEstado, 'Debes subir un archivo PDF antes de guardar.', 'error');
        return;
    }

    botonGuardar.disabled = true;

    try {
        const formData = new FormData();
        formData.append('accion', documentoEnEdicionId ? 'editar' : 'crear');
        if (documentoEnEdicionId) formData.append('id', documentoEnEdicionId);
        formData.append('titulo', document.getElementById('doc-titulo').value);
        formData.append('categoria', document.getElementById('doc-categoria').value);
        formData.append('descripcion', document.getElementById('doc-descripcion').value);
        formData.append('fecha', document.getElementById('doc-fecha').value);
        formData.append('archivo', rutaArchivoSeleccionado);

        const respuesta = await enviarFormData('admin/biblioteca_crud.php', formData);

        if (respuesta.exito) {
            mostrarMensaje(mensajeEstado, respuesta.mensaje, 'exito');
            reiniciarFormularioDocumento();
            cargarListaDocumentos();
        } else {
            mostrarMensaje(mensajeEstado, respuesta.mensaje, 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarMensaje(mensajeEstado, 'Ocurrió un error al guardar el documento.', 'error');
    } finally {
        botonGuardar.disabled = false;
    }
}

async function eliminarDocumento(id) {
    if (!confirm('¿Seguro que deseas eliminar este documento? Esta acción no se puede deshacer.')) return;

    try {
        const formData = new FormData();
        formData.append('accion', 'eliminar');
        formData.append('id', id);
        const respuesta = await enviarFormData('admin/biblioteca_crud.php', formData);

        if (respuesta.exito) {
            cargarListaDocumentos();
        } else {
            alert(respuesta.mensaje);
        }
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al eliminar el documento.');
    }
}

/* ---------- Subida de PDF ---------- */

function inicializarZonaSubidaPdf() {
    const zona = document.getElementById('zona-subida-pdf');
    const input = document.getElementById('input-pdf-documento');
    const nombreArchivo = document.getElementById('nombre-archivo-pdf');

    zona.addEventListener('click', () => input.click());

    input.addEventListener('change', async () => {
        if (!input.files.length) return;
        const archivo = input.files[0];
        nombreArchivo.textContent = `Subiendo "${archivo.name}"...`;

        try {
            const formData = new FormData();
            formData.append('documento', archivo);
            const respuesta = await enviarFormData('admin/upload_pdf.php', formData);

            if (respuesta.exito) {
                rutaArchivoSeleccionado = respuesta.datos.ruta;
                nombreArchivo.textContent = `✓ ${archivo.name}`;
            } else {
                nombreArchivo.textContent = 'Error: ' + respuesta.mensaje;
            }
        } catch (error) {
            console.error(error);
            nombreArchivo.textContent = 'Ocurrió un error al subir el archivo.';
        }
    });
}
