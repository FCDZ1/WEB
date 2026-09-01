/**
 * biblioteca.js
 * Carga, busca y filtra los documentos de la biblioteca (biblioteca.html).
 */

let temporizadorBusqueda = null;

document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('lista-documentos');
    if (!contenedor) return; // Esta página no es biblioteca.html

    const campoBusqueda = document.getElementById('campo-busqueda');
    const selectCategoria = document.getElementById('select-categoria');

    cargarDocumentos();

    if (campoBusqueda) {
        campoBusqueda.addEventListener('input', () => {
            clearTimeout(temporizadorBusqueda);
            temporizadorBusqueda = setTimeout(cargarDocumentos, 350);
        });
    }

    if (selectCategoria) {
        selectCategoria.addEventListener('change', cargarDocumentos);
    }
});

async function cargarDocumentos() {
    const contenedor = document.getElementById('lista-documentos');
    const campoBusqueda = document.getElementById('campo-busqueda');
    const selectCategoria = document.getElementById('select-categoria');

    const buscar = campoBusqueda ? campoBusqueda.value.trim() : '';
    const categoria = selectCategoria ? selectCategoria.value : '';

    contenedor.innerHTML = '<p class="cargando">Buscando documentos...</p>';

    try {
        const parametros = `?buscar=${encodeURIComponent(buscar)}&categoria=${encodeURIComponent(categoria)}`;
        const respuesta = await obtenerJSON('get_biblioteca.php', parametros);
        const documentos = respuesta.datos || [];

        if (!respuesta.exito || documentos.length === 0) {
            contenedor.innerHTML = '<p class="estado-vacio">No se encontraron documentos que coincidan con tu búsqueda.</p>';
            return;
        }

        // Llena el filtro de categorías la primera vez (si aún no tiene opciones más allá de "Todas")
        if (selectCategoria && selectCategoria.options.length <= 1) {
            const categorias = [...new Set(documentos.map((d) => d.categoria).filter(Boolean))];
            categorias.forEach((cat) => {
                const opcion = document.createElement('option');
                opcion.value = cat;
                opcion.textContent = cat;
                selectCategoria.appendChild(opcion);
            });
        }

        contenedor.innerHTML = documentos.map((doc) => `
            <article class="tarjeta-documento aparecer">
                <span class="categoria-doc">${escaparHTML(doc.categoria || 'General')}</span>
                <h3>${escaparHTML(doc.titulo)}</h3>
                <p>${escaparHTML(doc.descripcion || '')}</p>
                <span class="fecha-doc">📅 Publicado: ${formatearFecha(doc.fecha)}</span>
                ${doc.archivo ? `<a class="boton boton-primario" href="${escaparHTML(doc.archivo)}" target="_blank" rel="noopener">⬇ Descargar PDF</a>` : ''}
            </article>
        `).join('');
    } catch (error) {
        console.error('Error al cargar la biblioteca:', error);
        contenedor.innerHTML = '<p class="estado-vacio">Ocurrió un error al cargar los documentos.</p>';
    }
}
