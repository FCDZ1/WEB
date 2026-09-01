/**
 * login.js
 * Maneja el envío del formulario de inicio de sesión del panel.
 * Si ya existe una sesión activa, redirige directamente al panel.
 */

const RUTA_API_LOGIN = '../php/';

document.addEventListener('DOMContentLoaded', async () => {
    // Si ya hay sesión activa, ir directo al panel
    try {
        const respuestaSesion = await fetch(RUTA_API_LOGIN + 'admin/check_session.php', { credentials: 'same-origin' });
        const datosSesion = await respuestaSesion.json();
        if (datosSesion.exito) {
            window.location.href = 'panel.html';
            return;
        }
    } catch (error) { /* Sin sesión activa, continuar mostrando el login */ }

    const formulario = document.getElementById('formulario-login');
    const mensajeEstado = document.getElementById('mensaje-estado-login');
    const botonIngresar = document.getElementById('boton-ingresar');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        mensajeEstado.className = 'mensaje-estado';
        botonIngresar.disabled = true;
        botonIngresar.textContent = 'Ingresando...';

        try {
            const datosFormulario = new FormData(formulario);
            const respuesta = await fetch(RUTA_API_LOGIN + 'admin/login.php', {
                method: 'POST',
                body: datosFormulario,
                credentials: 'same-origin',
            });
            const resultado = await respuesta.json();

            if (resultado.exito) {
                window.location.href = 'panel.html';
            } else {
                mensajeEstado.textContent = resultado.mensaje;
                mensajeEstado.classList.add('mostrar', 'error');
            }
        } catch (error) {
            mensajeEstado.textContent = 'No se pudo conectar con el servidor.';
            mensajeEstado.classList.add('mostrar', 'error');
        } finally {
            botonIngresar.disabled = false;
            botonIngresar.textContent = 'Ingresar';
        }
    });
});
