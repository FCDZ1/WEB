/**
 * noticias.js
 * Carga y renderiza las noticias desde noticias.json (vía get_noticias.php).
 * Se usa tanto en index.html (últimas 3 noticias) como en noticias.html (todas).
 */

const LIMITE_CARACTERES_RESUMEN = 150;

/**
 * Carga las noticias y las dibuja dentro del contenedor indicado.
 * @param {string} idContenedor - id del elemento donde se insertarán las tarjetas
 * @param {number|null} limite - cantidad máxima de noticias a mostrar (null = todas)
 */
async function cargarNoticias(idContenedor, limite = null) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    contenedor.innerHTML = '<p class="cargando">Cargando noticias...</p>';

    try {
        const respuesta = await obtenerJSON('get_noticias.php');
        let noticias = respuesta.datos || [];

        if (!respuesta.exito || noticias.length === 0) {
            contenedor.innerHTML = '<p class="estado-vacio">Aún no hay noticias publicadas.</p>';
            return;
        }

        if (limite) {
            noticias = noticias.slice(0, limite);
        }

        contenedor.innerHTML = noticias.map((noticia) => crearTarjetaNoticia(noticia)).join('');

        // Conecta el evento "Leer más" de cada tarjeta con el modal
        contenedor.querySelectorAll('[data-abrir-noticia]').forEach((boton) => {
            boton.addEventListener('click', () => {
                const id = parseInt(boton.getAttribute('data-abrir-noticia'), 10);
                const noticia = noticias.find((n) => n.id === id);
                if (noticia) abrirModalNoticia(noticia);
            });
        });
    } catch (error) {
        console.error('Error al cargar noticias:', error);
        contenedor.innerHTML = '<p class="estado-vacio">Ocurrió un error al cargar las noticias.</p>';
    }
}

function crearTarjetaNoticia(noticia) {
    const esLarga = (noticia.contenido || '').length > LIMITE_CARACTERES_RESUMEN + 40;
    const imagen = noticia.imagen && noticia.imagen !== ''
        ? noticia.imagen
        : 'img/noticia-default.svg';

    return `
        <article class="tarjeta-noticia aparecer">
            <img class="imagen-noticia" src="${escaparHTML(imagen)}" alt="${escaparHTML(noticia.titulo)}" loading="lazy" onerror="this.src='img/noticia-default.svg'">
            <div class="contenido-tarjeta">
                ${noticia.destacado ? '<span class="etiqueta-destacado">Destacado</span>' : ''}
                <span class="fecha-noticia">📅 ${formatearFecha(noticia.fecha)}</span>
                <h3>${escaparHTML(noticia.titulo)}</h3>
                <p class="resumen">${escaparHTML(noticia.resumen)}</p>
                ${esLarga ? `<a href="#" class="enlace-leer-mas" data-abrir-noticia="${noticia.id}">Leer más →</a>` : ''}
            </div>
        </article>
    `;
}

/* ---------- Modal de noticia completa ---------- */

function abrirModalNoticia(noticia) {
    let modal = document.getElementById('modal-noticia');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-noticia';
        modal.className = 'modal-fondo';
        modal.innerHTML = `
            <div class="modal-caja">
                <button class="modal-cerrar" id="cerrar-modal-noticia" aria-label="Cerrar">✕</button>
                <div id="contenido-modal-noticia"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (evento) => {
            if (evento.target === modal) cerrarModalNoticia();
        });
        document.getElementById('cerrar-modal-noticia').addEventListener('click', cerrarModalNoticia);
        document.addEventListener('keydown', (evento) => {
            if (evento.key === 'Escape') cerrarModalNoticia();
        });
    }

    const imagen = noticia.imagen && noticia.imagen !== '' ? noticia.imagen : 'img/noticia-default.svg';
    document.getElementById('contenido-modal-noticia').innerHTML = `
        <img src="${escaparHTML(imagen)}" alt="${escaparHTML(noticia.titulo)}" onerror="this.style.display='none'">
        <span class="fecha-noticia">📅 ${formatearFecha(noticia.fecha)}</span>
        <h2>${escaparHTML(noticia.titulo)}</h2>
        <p>${escaparHTML(noticia.contenido)}</p>
    `;

    modal.classList.add('abierto');
}

function cerrarModalNoticia() {
    const modal = document.getElementById('modal-noticia');
    if (modal) modal.classList.remove('abierto');
}
