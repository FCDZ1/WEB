/**
 * admin-common.js
 * Funciones compartidas por todas las páginas del panel administrativo:
 *  - Verificación de sesión activa (redirige a login si no hay sesión)
 *  - Cierre de sesión
 *  - Apertura/cierre del menú lateral en móvil
 *  - Utilidades de petición a la API (reutilizadas del sitio público)
 */

const RUTA_API = '../php/';

async function obtenerJSON(endpoint, parametros = '') {
    const respuesta = await fetch(RUTA_API + endpoint + parametros, { credentials: 'same-origin' });
    return respuesta.json();
}

async function enviarFormData(endpoint, formData) {
    const respuesta = await fetch(RUTA_API + endpoint, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
    });
    return respuesta.json();
}

function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto ?? '';
    return div.innerHTML;
}

function mostrarMensaje(elemento, texto, tipo) {
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.className = 'mensaje-estado';
    if (tipo) elemento.classList.add('mostrar', tipo);
    if (texto) elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/** Verifica la sesión; si no está activa, redirige al login. Devuelve el nombre del admin. */
async function verificarSesionORedirigir() {
    try {
        const respuesta = await obtenerJSON('admin/check_session.php');
        if (!respuesta.exito) {
            window.location.href = 'login.html';
            return null;
        }
        const nombreEl = document.getElementById('nombre-admin-sesion');
        if (nombreEl) nombreEl.textContent = respuesta.datos.nombre || 'Administrador';
        return respuesta.datos.nombre;
    } catch (error) {
        window.location.href = 'login.html';
        return null;
    }
}

function inicializarCierreSesion() {
    const boton = document.getElementById('boton-cerrar-sesion');
    if (!boton) return;
    boton.addEventListener('click', async () => {
        if (!confirm('¿Seguro que deseas cerrar sesión?')) return;
        await obtenerJSON('admin/logout.php');
        window.location.href = 'login.html';
    });
}

function inicializarMenuLateral() {
    const boton = document.getElementById('boton-menu-panel');
    const barra = document.getElementById('barra-lateral');
    if (!boton || !barra) return;
    boton.addEventListener('click', () => barra.classList.toggle('abierta'));
}

document.addEventListener('DOMContentLoaded', () => {
    verificarSesionORedirigir();
    inicializarCierreSesion();
    inicializarMenuLateral();
});
