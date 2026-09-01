/**
 * panel.js
 * Carga las estadísticas generales y los mensajes recientes de contacto
 * para el dashboard principal del panel administrativo.
 */

document.addEventListener('DOMContentLoaded', async () => {
    await cargarEstadisticas();
    await cargarMensajesRecientes();
});

async function cargarEstadisticas() {
    try {
        const [noticias, biblioteca, mensajes] = await Promise.all([
            obtenerJSON('admin/noticias_crud.php', '?accion=listar'),
            obtenerJSON('admin/biblioteca_crud.php', '?accion=listar'),
            obtenerJSON('admin/mensajes.php', '?accion=listar'),
        ]);

        document.getElementById('estadistica-noticias').textContent = (noticias.datos || []).length;
        document.getElementById('estadistica-documentos').textContent = (biblioteca.datos || []).length;

        const totalMensajes = (mensajes.datos || []).length;
        const noLeidos = (mensajes.datos || []).filter((m) => !m.leido).length;
        document.getElementById('estadistica-mensajes').textContent = totalMensajes;
        document.getElementById('estadistica-no-leidos').textContent = noLeidos;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

async function cargarMensajesRecientes() {
    const contenedor = document.getElementById('lista-mensajes-recientes');
    if (!contenedor) return;

    try {
        const respuesta = await obtenerJSON('admin/mensajes.php', '?accion=listar');
        const mensajes = (respuesta.datos || []).slice(0, 5);

        if (mensajes.length === 0) {
            contenedor.innerHTML = '<p class="cargando-texto">No hay mensajes recibidos todavía.</p>';
            return;
        }

        contenedor.innerHTML = `
            <div class="contenedor-tabla">
            <table class="tabla-admin">
                <thead>
                    <tr><th>Nombre</th><th>Correo</th><th>Asunto</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                    ${mensajes.map((m) => `
                        <tr>
                            <td>${escaparHTML(m.nombre)}</td>
                            <td>${escaparHTML(m.correo)}</td>
                            <td>${escaparHTML(m.asunto)}</td>
                            <td>${escaparHTML(m.fecha)}</td>
                            <td>${m.leido ? '<span class="etiqueta-badge">Leído</span>' : '<span class="etiqueta-badge" style="background:#fff3cd;color:#8a6d00;">Nuevo</span>'}</td>
                            <td class="acciones">
                                ${!m.leido ? `<button class="boton boton-secundario" data-marcar-leido="${m.id}">Marcar leído</button>` : ''}
                                <button class="boton boton-peligro" data-eliminar-mensaje="${m.id}">Eliminar</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            </div>
        `;

        contenedor.querySelectorAll('[data-marcar-leido]').forEach((boton) => {
            boton.addEventListener('click', async () => {
                const formData = new FormData();
                formData.append('accion', 'marcar_leido');
                formData.append('id', boton.getAttribute('data-marcar-leido'));
                await enviarFormData('admin/mensajes.php', formData);
                cargarMensajesRecientes();
                cargarEstadisticas();
            });
        });

        contenedor.querySelectorAll('[data-eliminar-mensaje]').forEach((boton) => {
            boton.addEventListener('click', async () => {
                if (!confirm('¿Eliminar este mensaje?')) return;
                const formData = new FormData();
                formData.append('accion', 'eliminar');
                formData.append('id', boton.getAttribute('data-eliminar-mensaje'));
                await enviarFormData('admin/mensajes.php', formData);
                cargarMensajesRecientes();
                cargarEstadisticas();
            });
        });
    } catch (error) {
        console.error('Error al cargar mensajes recientes:', error);
        contenedor.innerHTML = '<p class="cargando-texto">Ocurrió un error al cargar los mensajes.</p>';
    }
}
