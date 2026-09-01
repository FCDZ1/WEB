/**
 * main.js
 * Funciones comunes a todas las páginas públicas del sitio:
 *  - Menú de navegación responsive (móvil)
 *  - Modo oscuro (con persistencia en localStorage)
 *  - Carga de la configuración institucional (logo, nombre, contacto, enlace de notas)
 *  - Utilidades generales (peticiones a la API PHP, escape de texto)
 */

const RUTA_API = 'php/';

/* ---------- Utilidades generales ---------- */

/** Realiza una petición GET a un endpoint PHP y devuelve el JSON parseado. */
async function obtenerJSON(endpoint, parametros = '') {
    const respuesta = await fetch(RUTA_API + endpoint + parametros, { credentials: 'same-origin' });
    return respuesta.json();
}

/** Realiza una petición POST (form-data) a un endpoint PHP protegido o público. */
async function enviarFormData(endpoint, formData) {
    const respuesta = await fetch(RUTA_API + endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
    });
    return respuesta.json();
}

/** Escapa texto para insertarlo de forma segura en HTML (previene XSS). */
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

/** Formatea una fecha ISO (YYYY-MM-DD) a un formato legible en español. */
function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    const fecha = new Date(fechaISO + 'T00:00:00');
    if (isNaN(fecha.getTime())) return fechaISO;
    return fecha.toLocaleDateString('es-ES', opciones);
}

/* ---------- Menú móvil ---------- */

function inicializarMenuMovil() {
    const boton = document.getElementById('boton-menu-movil');
    const menu = document.getElementById('menu-principal');
    if (!boton || !menu) return;

    boton.addEventListener('click', () => {
        menu.classList.toggle('abierto');
    });

    // Cierra el menú al seleccionar un enlace (en móvil)
    menu.querySelectorAll('a').forEach((enlace) => {
        enlace.addEventListener('click', () => menu.classList.remove('abierto'));
    });
}

/* ---------- Configuración institucional (logo, nombre, contacto, notas) ---------- */

async function cargarConfiguracionGlobal() {
    try {
        const respuesta = await obtenerJSON('get_configuracion.php');
        if (!respuesta.exito) return;
        const config = respuesta.datos;

        // Logo y nombre en el encabezado
        document.querySelectorAll('[data-config="logo"]').forEach((el) => {
            if (config.logo) el.src = config.logo;
        });
        document.querySelectorAll('[data-config="nombre_institucion"]').forEach((el) => {
            el.textContent = config.nombre_institucion || '';
        });
        document.querySelectorAll('[data-config="eslogan"]').forEach((el) => {
            el.textContent = config.eslogan || '';
        });
        document.querySelectorAll('[data-config="banner"]').forEach((el) => {
            if (config.banner) el.src = config.banner;
        });
        document.querySelectorAll('[data-config="informacion_institucional"]').forEach((el) => {
            el.textContent = config.informacion_institucional || '';
        });

        // Datos de contacto (pie de página y página de contacto)
        document.querySelectorAll('[data-config="direccion"]').forEach((el) => { el.textContent = config.direccion || ''; });
        document.querySelectorAll('[data-config="telefono"]').forEach((el) => { el.textContent = config.telefono || ''; });
        document.querySelectorAll('[data-config="email"]').forEach((el) => { el.textContent = config.email || ''; });

        document.querySelectorAll('[data-config-href="telefono"]').forEach((el) => { el.href = 'tel:' + (config.telefono || '').replace(/\s+/g, ''); });
        document.querySelectorAll('[data-config-href="email"]').forEach((el) => { el.href = 'mailto:' + (config.email || ''); });
        document.querySelectorAll('[data-config-href="facebook"]').forEach((el) => {
            el.href = config.facebook || '#';
            el.style.display = config.facebook ? '' : 'none';
        });
        document.querySelectorAll('[data-config-href="instagram"]').forEach((el) => {
            el.href = config.instagram || '#';
            el.style.display = config.instagram ? '' : 'none';
        });

        // Enlace hacia la plataforma de notas (botón configurable)
        document.querySelectorAll('[data-config-href="plataforma_notas_url"]').forEach((el) => {
            el.href = config.plataforma_notas_url || '#';
        });

        // Avisos importantes (si la página tiene el contenedor correspondiente)
        const contenedorAvisos = document.getElementById('lista-avisos');
        if (contenedorAvisos) {
            renderizarAvisos(contenedorAvisos, config.avisos || []);
        }

        // Guarda la configuración en memoria global por si otras páginas la necesitan
        window.__configuracionInstitucional = config;
    } catch (error) {
        console.error('No se pudo cargar la configuración institucional:', error);
    }
}

function renderizarAvisos(contenedor, avisos) {
    if (!avisos.length) {
        contenedor.innerHTML = '<p class="estado-vacio">No hay avisos importantes por el momento.</p>';
        return;
    }
    contenedor.innerHTML = avisos.map((aviso) => `
        <div class="aviso aparecer">
            <span class="icono-aviso">📢</span>
            <div>
                <h4>${escaparHTML(aviso.titulo)}</h4>
                <p>${escaparHTML(aviso.texto)}</p>
            </div>
        </div>
    `).join('');
}

/* ---------- Inicialización común al cargar cualquier página pública ---------- */

document.addEventListener('DOMContentLoaded', () => {
    inicializarMenuMovil();
    cargarConfiguracionGlobal();
});
