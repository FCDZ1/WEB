/**
 * configuracion.js (admin)
 * Permite editar la información institucional, el enlace de la plataforma
 * de notas, los avisos importantes, el logo/banner y cambiar la contraseña
 * del administrador.
 */

let listaAvisos = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarConfiguracionActual();
    inicializarFormularioConfiguracion();
    inicializarFormularioPassword();
    inicializarSubidaLogoBanner();
    document.getElementById('boton-agregar-aviso').addEventListener('click', () => {
        listaAvisos.push({ titulo: '', texto: '' });
        renderizarAvisosFormulario();
    });
});

/* ---------- Cargar configuración actual ---------- */

async function cargarConfiguracionActual() {
    try {
        const respuesta = await obtenerJSON('admin/configuracion.php', '?accion=obtener');
        const config = respuesta.datos || {};

        document.getElementById('config-nombre').value = config.nombre_institucion || '';
        document.getElementById('config-eslogan').value = config.eslogan || '';
        document.getElementById('config-direccion').value = config.direccion || '';
        document.getElementById('config-telefono').value = config.telefono || '';
        document.getElementById('config-email').value = config.email || '';
        document.getElementById('config-facebook').value = config.facebook || '';
        document.getElementById('config-instagram').value = config.instagram || '';
        document.getElementById('config-notas-url').value = config.plataforma_notas_url || '';
        document.getElementById('config-info').value = config.informacion_institucional || '';

        window.__rutaLogoActual = config.logo || '';
        window.__rutaBannerActual = config.banner || '';
        document.getElementById('vista-logo-actual').src = config.logo ? '../' + config.logo : '../img/logo.svg';
        if (config.banner) {
            document.getElementById('vista-banner-actual').src = '../' + config.banner;
            document.getElementById('vista-banner-actual').style.display = '';
        }

        listaAvisos = Array.isArray(config.avisos) ? config.avisos : [];
        renderizarAvisosFormulario();
    } catch (error) {
        console.error('Error al cargar la configuración:', error);
    }
}

/* ---------- Avisos dinámicos ---------- */

function renderizarAvisosFormulario() {
    const contenedor = document.getElementById('contenedor-avisos-form');

    if (listaAvisos.length === 0) {
        contenedor.innerHTML = '<p class="texto-ayuda">No hay avisos agregados. Usa el botón "+ Agregar aviso".</p>';
        return;
    }

    contenedor.innerHTML = listaAvisos.map((aviso, indice) => `
        <div class="fila-aviso">
            <input type="text" placeholder="Título del aviso" value="${escaparHTML(aviso.titulo)}" data-aviso-titulo="${indice}">
            <input type="text" placeholder="Texto del aviso" value="${escaparHTML(aviso.texto)}" data-aviso-texto="${indice}">
            <button type="button" class="boton boton-peligro" data-quitar-aviso="${indice}">Quitar</button>
        </div>
    `).join('');

    contenedor.querySelectorAll('[data-aviso-titulo]').forEach((input) => {
        input.addEventListener('input', () => {
            listaAvisos[parseInt(input.getAttribute('data-aviso-titulo'), 10)].titulo = input.value;
        });
    });
    contenedor.querySelectorAll('[data-aviso-texto]').forEach((input) => {
        input.addEventListener('input', () => {
            listaAvisos[parseInt(input.getAttribute('data-aviso-texto'), 10)].texto = input.value;
        });
    });
    contenedor.querySelectorAll('[data-quitar-aviso]').forEach((boton) => {
        boton.addEventListener('click', () => {
            listaAvisos.splice(parseInt(boton.getAttribute('data-quitar-aviso'), 10), 1);
            renderizarAvisosFormulario();
        });
    });
}

/* ---------- Guardar configuración general ---------- */

function inicializarFormularioConfiguracion() {
    const formulario = document.getElementById('formulario-configuracion');
    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const mensajeEstado = document.getElementById('mensaje-estado-config');
        const boton = document.getElementById('boton-guardar-config');
        boton.disabled = true;

        try {
            const formData = new FormData();
            formData.append('accion', 'guardar');
            formData.append('nombre_institucion', document.getElementById('config-nombre').value);
            formData.append('eslogan', document.getElementById('config-eslogan').value);
            formData.append('direccion', document.getElementById('config-direccion').value);
            formData.append('telefono', document.getElementById('config-telefono').value);
            formData.append('email', document.getElementById('config-email').value);
            formData.append('facebook', document.getElementById('config-facebook').value);
            formData.append('instagram', document.getElementById('config-instagram').value);
            formData.append('plataforma_notas_url', document.getElementById('config-notas-url').value);
            formData.append('informacion_institucional', document.getElementById('config-info').value);
            formData.append('avisos', JSON.stringify(listaAvisos));
            if (window.__rutaLogoNueva) formData.append('logo', window.__rutaLogoNueva);
            if (window.__rutaBannerNueva) formData.append('banner', window.__rutaBannerNueva);

            const respuesta = await enviarFormData('admin/configuracion.php', formData);

            if (respuesta.exito) {
                mostrarMensaje(mensajeEstado, 'Configuración guardada correctamente.', 'exito');
            } else {
                mostrarMensaje(mensajeEstado, respuesta.mensaje, 'error');
            }
        } catch (error) {
            console.error(error);
            mostrarMensaje(mensajeEstado, 'Ocurrió un error al guardar la configuración.', 'error');
        } finally {
            boton.disabled = false;
        }
    });
}

/* ---------- Subida de logo y banner ---------- */

function inicializarSubidaLogoBanner() {
    const inputLogo = document.getElementById('input-logo');
    const inputBanner = document.getElementById('input-banner');

    inputLogo.addEventListener('change', async () => {
        if (!inputLogo.files.length) return;
        const respuesta = await subirImagenConfiguracion(inputLogo.files[0]);
        if (respuesta && respuesta.exito) {
            window.__rutaLogoNueva = respuesta.datos.ruta;
            document.getElementById('vista-logo-actual').src = '../' + respuesta.datos.ruta;
        }
    });

    inputBanner.addEventListener('change', async () => {
        if (!inputBanner.files.length) return;
        const respuesta = await subirImagenConfiguracion(inputBanner.files[0]);
        if (respuesta && respuesta.exito) {
            window.__rutaBannerNueva = respuesta.datos.ruta;
            const vistaBanner = document.getElementById('vista-banner-actual');
            vistaBanner.src = '../' + respuesta.datos.ruta;
            vistaBanner.style.display = '';
        }
    });
}

async function subirImagenConfiguracion(archivo) {
    try {
        const formData = new FormData();
        formData.append('imagen', archivo);
        return await enviarFormData('admin/upload_imagen.php', formData);
    } catch (error) {
        console.error(error);
        alert('Ocurrió un error al subir la imagen.');
        return null;
    }
}

/* ---------- Cambio de contraseña ---------- */

function inicializarFormularioPassword() {
    const formulario = document.getElementById('formulario-password');
    formulario.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        const mensajeEstado = document.getElementById('mensaje-estado-password');
        const boton = document.getElementById('boton-cambiar-password');
        boton.disabled = true;

        try {
            const formData = new FormData(formulario);
            formData.append('accion', 'password');
            const respuesta = await enviarFormData('admin/configuracion.php', formData);

            if (respuesta.exito) {
                mostrarMensaje(mensajeEstado, respuesta.mensaje, 'exito');
                formulario.reset();
            } else {
                mostrarMensaje(mensajeEstado, respuesta.mensaje, 'error');
            }
        } catch (error) {
            console.error(error);
            mostrarMensaje(mensajeEstado, 'Ocurrió un error al cambiar la contraseña.', 'error');
        } finally {
            boton.disabled = false;
        }
    });
}
