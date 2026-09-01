/**
 * contacto.js
 * Maneja el envío del formulario de contacto público mediante fetch,
 * mostrando mensajes de éxito o error sin recargar la página.
 */

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario-contacto');
    if (!formulario) return;

    const mensajeEstado = document.getElementById('mensaje-estado-contacto');
    const botonEnviar = document.getElementById('boton-enviar-contacto');

    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        mostrarMensaje(mensajeEstado, '', '');
        botonEnviar.disabled = true;
        botonEnviar.textContent = 'Enviando...';

        try {
            const datosFormulario = new FormData(formulario);
            const respuesta = await enviarFormData('enviar_contacto.php', datosFormulario);

            if (respuesta.exito) {
                mostrarMensaje(mensajeEstado, respuesta.mensaje, 'exito');
                formulario.reset();
            } else {
                mostrarMensaje(mensajeEstado, respuesta.mensaje, 'error');
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            mostrarMensaje(mensajeEstado, 'No se pudo enviar el mensaje. Intenta más tarde.', 'error');
        } finally {
            botonEnviar.disabled = false;
            botonEnviar.textContent = 'Enviar mensaje';
        }
    });
});

function mostrarMensaje(elemento, texto, tipo) {
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.className = 'mensaje-estado';
    if (tipo) {
        elemento.classList.add('mostrar', tipo);
    }
}
