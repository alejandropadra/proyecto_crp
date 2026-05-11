
function driveUrlToImg(url) {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) return null;
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;
}

function getColorSub(material) {
    const parts = material.split('-');
    if (parts.length < 2) return material;
    const rest = parts[1];
    return rest.length === 8 ? rest.slice(3, 6) : rest.slice(3);
}

function calcularPrefijoComun(textos) {
    if (!textos.length) return '';
    if (textos.length === 1) return textos[0];

    const sorted = [...textos].sort();
    const primero = sorted[0];
    const ultimo = sorted[sorted.length - 1];

    let i = 0;
    while (i < primero.length && primero[i] === ultimo[i]) i++;

    // Retroceder al último espacio para no cortar palabras
    const prefijo = primero.slice(0, i);
    const ultimoEspacio = prefijo.lastIndexOf(' ');
    return ultimoEspacio > 0 ? prefijo.slice(0, ultimoEspacio + 1) : '';
}

function extraerNombreColor(descripcion, prefijo) {
    if (!prefijo || !descripcion) return descripcion || 'Sin nombre';
    const nombre = descripcion.startsWith(prefijo)
        ? descripcion.slice(prefijo.length).trim()
        : descripcion;
    return nombre || descripcion;
}

// ── Carousel ──
function initCarousel(wrapEl) {
    if (!wrapEl) return;
    const track = wrapEl.querySelector('.carousel-track');
    const arrowL = wrapEl.querySelector('.carousel-arrow--left');
    const arrowR = wrapEl.querySelector('.carousel-arrow--right');
    if (!track || !arrowL || !arrowR) return;

    const SCROLL_AMOUNT = 180;

    arrowL.addEventListener('click', () => {
        track.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    });
    arrowR.addEventListener('click', () => {
        track.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    });

    function updateArrows() {
        const { scrollLeft, scrollWidth, clientWidth } = track;
        const canLeft = scrollLeft > 2;
        const canRight = scrollLeft < scrollWidth - clientWidth - 2;

        arrowL.classList.toggle('visible', canLeft);
        arrowR.classList.toggle('visible', canRight);
        wrapEl.classList.toggle('fade-left', canLeft);
        wrapEl.classList.toggle('fade-right', canRight);
    }

    track.addEventListener('scroll', updateArrows);
    new MutationObserver(updateArrows).observe(track, { childList: true });
    requestAnimationFrame(updateArrows);
}


function animateCodeChange(el, newText) {
    if (!el) return;
    el.classList.add('updating');
    setTimeout(() => {
        el.textContent = newText;
        el.classList.remove('updating');
        el.classList.add('entering');
        setTimeout(() => el.classList.remove('entering'), 300);
    }, 180);
}


let allPresentaciones = [];
let selectedColorSub = null;
let selectedMaterial = null;

// ============================================================================
//  CARGAR PRESENTACIONES
// ============================================================================
function cargarPresentaciones() {
    const el = document.getElementById('presentacionesJson');
    if (!el || !el.value) return;

    try {
        allPresentaciones = JSON.parse(el.value);
    } catch (e) {
        console.error('Error parseando presentaciones:', e);
        return;
    }

    if (!allPresentaciones.length) return;

    // 1) Extraer colores únicos
    const coloresMap = new Map();
    allPresentaciones.forEach(p => {
        const sub = getColorSub(p.material);
        if (!coloresMap.has(sub)) {
            coloresMap.set(sub, {
                sub,
                descripcion: p.descripcion || 'Sin nombre',
                imagen: driveUrlToImg(p.imagen_color)
            });
        }
    });

    const colores = Array.from(coloresMap.values());
    const descripciones = colores.map(c => c.descripcion);
    const prefijo = calcularPrefijoComun(descripciones);
    colores.forEach(c => {
        c.nombreCorto = extraerNombreColor(c.descripcion, prefijo);
    });

    colores.sort((a, b) => {
        const aTieneImg = !!a.imagen;
        const bTieneImg = !!b.imagen;

        if (aTieneImg && !bTieneImg) return -1;
        
        if (!aTieneImg && bTieneImg) return 1;
        return a.descripcion.localeCompare(b.descripcion);
    });
    const divPadre = document.querySelector('.presentacion-selector');
    const colorSelector = document.getElementById('colorSelector');
    const colorOptions  = document.getElementById('colorOptions');
    const colorCount    = document.getElementById('colorCount');

    // 2) Renderizar colores
    if (colores.length <= 1) {
        if (colorSelector) colorSelector.style.display = 'none';
        if (divPadre) divPadre.style.display = 'none';
        if (colores.length === 1) selectedColorSub = colores[0].sub;
    } else {
        if (colorSelector) colorSelector.style.display = '';
        if (colorCount) colorCount.textContent = colores.length;
        if (colorOptions) colorOptions.innerHTML = '';

        colores.forEach((c, i) => {
            const chip = document.createElement('div');
            chip.className = 'color-chip' + (i === 0 ? ' active' : '');
            chip.dataset.sub = c.sub;

            const thumbHTML = c.imagen
                ? '<img src="' + c.imagen + '" alt="' + c.descripcion + '">'
                    + '<span class="thumb-no-digital" style="display:none">Color no digitalizado</span>'
                : '<span class="thumb-no-digital">Color no digitalizado</span>';
            chip.innerHTML =
                '<div class="color-chip-thumb">' + thumbHTML + '</div>' +
                '<span class="color-chip-name" title="' + c.descripcion + '">' + c.nombreCorto + '</span>' +
                '<div class="color-chip-check">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                        '<polyline points="20 6 9 17 4 12"/>' +
                    '</svg>' +
                '</div>';

            // Fallback si la imagen falla
            const img = chip.querySelector('.color-chip-thumb img');
            if (img) {
                img.onerror = function() {
                    this.style.display = 'none';
                    var fb = this.nextElementSibling;
                    if (fb) fb.style.display = 'block';
                };
            }

            chip.addEventListener('click', () => {
                colorOptions.querySelectorAll('.color-chip').forEach(x => x.classList.remove('active'));
                chip.classList.add('active');
                selectedColorSub = c.sub;
                cargarPresentacionesPorColor(c.sub);
            });

            colorOptions.appendChild(chip);
        });

        selectedColorSub = colores[0].sub;
        initCarousel(document.getElementById('colorCarousel'));
    }

    cargarPresentacionesPorColor(selectedColorSub || (colores[0] && colores[0].sub));
}



/*Esta es para la de presentacion si es cuñete, galon o cuartico */
function cargarPresentacionesPorColor(sub) {
    if (!sub) return;

    const filtradas = allPresentaciones.filter(p => getColorSub(p.material) === sub);

    const presSelector = document.getElementById('presSelector');
    const presOptions  = document.getElementById('presOptions');
    const presCount    = document.getElementById('presCount');

    if (filtradas.length < 1) {
        if (presSelector) presSelector.style.display = 'none';
        if (filtradas.length === 1) {
            selectedMaterial = filtradas[0].material;
            updateSummary(filtradas[0]);
        }
        return;
    }

    if (presSelector) presSelector.style.display = '';
    if (presCount) presCount.textContent = filtradas.length;
    if (presOptions) presOptions.innerHTML = '';

    filtradas.forEach((p, i) => {
        const chip = document.createElement('div');
        chip.className = 'pres-chip' + (i === 0 ? ' active' : '');
        chip.dataset.material = p.material;

        const nombre = p.unidad_venta || p.cod_presentacion || 'Presentación';

        chip.innerHTML =
            '<div class="pres-chip-icon">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paint-bucket-icon lucide-paint-bucket"><path d="M11 7 6 2"/><path d="M18.992 12H2.041"/><path d="M21.145 18.38A3.34 3.34 0 0 1 20 16.5a3.3 3.3 0 0 1-1.145 1.88c-.575.46-.855 1.02-.855 1.595A2 2 0 0 0 20 22a2 2 0 0 0 2-2.025c0-.58-.285-1.13-.855-1.595"/><path d="m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33"/></svg>' +
            '</div>' +
            '<div class="pres-chip-info">' +
                '<span class="pres-chip-name" title="' + nombre + '">' + nombre + '</span>' +
            '</div>' +
            '<div class="pres-chip-check">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
                    '<polyline points="20 6 9 17 4 12"/>' +
                '</svg>' +
            '</div>';

        chip.addEventListener('click', () => {
            presOptions.querySelectorAll('.pres-chip').forEach(x => x.classList.remove('active'));
            chip.classList.add('active');
            selectedMaterial = p.material;
            updateSummary(p);
        });

        presOptions.appendChild(chip);
    });

    selectedMaterial = filtradas[0].material;
    updateSummary(filtradas[0]);

}

// ============================================================================
//  ACTUALIZAR RESUMEN + CÓDIGO DEL HEADER
// ============================================================================
function updateSummary(presentacion) {
    const summary     = document.getElementById('selectionSummary');
    const summaryText = document.getElementById('summaryText');
    const summaryCode = document.getElementById('summaryCode');
    const codigoValue = document.getElementById('codigoValue');

    if (summary) summary.style.display = 'flex';

    var desc   = presentacion.descripcion || '';
    var unidad = presentacion.unidad_venta || presentacion.cod_presentacion || '';

    if (summaryText) {
        summaryText.innerHTML = '<strong>' + desc + '</strong> · ' + unidad;
    }

    if (summaryCode) animateCodeChange(summaryCode, presentacion.material);
    if (codigoValue) animateCodeChange(codigoValue, presentacion.material);
}









// ============================================================================
//  COMPARTIR PRODUCTO
// ============================================================================


function buildShareText() {
    var nombre = (document.querySelector('.info-nombre')?.textContent?.trim()) || 'Producto';
    var codigo = (document.getElementById('summaryCode')?.textContent?.trim())
            || (document.getElementById('codigoValue')?.textContent?.trim()) || '';
    var descripcion = (document.querySelector('.info-descripcion')?.textContent?.trim()) || '';
    var url = window.location.href;

    descripcion = descripcion.replace(/\s+/g, ' ').trim();
    if (descripcion.length > 160) {
        descripcion = descripcion.slice(0, 157).trim() + '...';
    }
    var lineas = [];

    lineas.push('🎨 *' + nombre + '*');

    if (codigo) {
        lineas.push('📋 Cód: ' + codigo);
    }

    lineas.push('');

    if (descripcion && descripcion !== 'Descripción no disponible.') {
        lineas.push(descripcion);
        lineas.push('');
    }

    lineas.push('👉 Conoce más detalles de este producto aquí:');
    lineas.push(url);

    return {
        texto: lineas.join('\n'),
        url: url,
        nombre: nombre
    };
}

function compartirProducto() {
    var share = buildShareText();

    if (window.innerWidth < 768) {
        if (navigator.share && window.isSecureContext) {
            navigator.share({
                title: share.nombre,
                text: share.texto,
                url: share.url
            }).catch(function(err) {
                if (err.name !== 'AbortError') mostrarShareMenu(share);
            });
            return;
        }
        mostrarShareMenu(share);
        return;
    }


    copiarAlPortapapeles(share.url);
}

function mostrarShareMenu(share) {

    var prev = document.getElementById('shareMenu');
    if (prev) prev.remove();

    var mensajeCodificado = encodeURIComponent(share.texto);
    var urlCodificada = encodeURIComponent(share.url);
    var textoCodificado = encodeURIComponent(share.texto.split('\n').slice(0, -1).join('\n'));

    var menu = document.createElement('div');
    menu.id = 'shareMenu';
    menu.className = 'share-menu';
    menu.innerHTML =
        '<div class="share-menu-backdrop"></div>' +
        '<div class="share-menu-panel">' +
            '<div class="share-menu-header">' +
                '<span>Compartir producto</span>' +
                '<button class="share-menu-close">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
                '</button>' +
            '</div>' +
            '<div class="share-menu-options">' +
                '<a href="https://wa.me/?text=' + mensajeCodificado + '" target="_blank" class="share-option share-option--whatsapp">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.654-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
                    '<span>WhatsApp</span>' +
                '</a>' +
                '<a href="https://t.me/share/url?url=' + urlCodificada + '&text=' + textoCodificado + '" target="_blank" class="share-option share-option--telegram">' +
                    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>' +
                    '<span>Telegram</span>' +
                '</a>' +
                '<a href="mailto:?subject=' + textoCodificado + '&body=' + mensajeCodificado + '" class="share-option share-option--email">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' +
                    '<span>Correo</span>' +
                '</a>' +
                '<button class="share-option share-option--copy" onclick="copiarYCerrar()">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
                    '<span>Copiar enlace</span>' +
                '</button>' +
            '</div>' +
        '</div>';

    document.body.appendChild(menu);


    menu.dataset.url = share.url;

    requestAnimationFrame(function() {
        menu.classList.add('visible');
    });

    // Cerrar con backdrop o botón X
    menu.querySelector('.share-menu-backdrop').addEventListener('click', cerrarShareMenu);
    menu.querySelector('.share-menu-close').addEventListener('click', cerrarShareMenu);
}

function cerrarShareMenu() {
    var menu = document.getElementById('shareMenu');
    if (!menu) return;
    menu.classList.remove('visible');
    setTimeout(function() { menu.remove(); }, 300);
}

function copiarYCerrar() {
    var menu = document.getElementById('shareMenu');
    var url = menu ? menu.dataset.url : window.location.href;
    copiarAlPortapapeles(url);
    cerrarShareMenu();
}

function copiarAlPortapapeles(texto) {

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(texto).then(function() {
            mostrarToast('Enlace copiado al portapapeles');
        });
        return;
    }

    // Fallback para HTTP — usa un textarea temporal
    var ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();

    try {
        document.execCommand('copy');
        mostrarToast('Enlace copiado al portapapeles');
    } catch (err) {
        mostrarToast('No se pudo copiar el enlace');
    }

    document.body.removeChild(ta);
}

// ============================================================================
//  TOAST — Notificación temporal
// ============================================================================
function mostrarToast(mensaje) {
    // Remover toast previo si existe
    var prev = document.getElementById('shareToast');
    if (prev) prev.remove();

    var toast = document.createElement('div');
    toast.id = 'shareToast';
    toast.className = 'share-toast';
    toast.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M20 6 9 17l-5-5"/>' +
        '</svg>' +
        '<span>' + mensaje + '</span>';

    document.body.appendChild(toast);

    // Trigger animación de entrada
    requestAnimationFrame(function() {
        toast.classList.add('visible');
    });

    // Auto-remover después de 2.5s
    setTimeout(function() {
        toast.classList.remove('visible');
        setTimeout(function() { toast.remove(); }, 300);
    }, 2500);
}



function toggleInfoTecnica() {
    var seccion = document.querySelector('.info-tecnica');
    var btn = document.getElementById('btnInfoTecnica');
    if (!seccion || !btn) return;

    var isVisible = seccion.classList.contains('visible');

    if (isVisible) {
        seccion.style.maxHeight = seccion.scrollHeight + 'px';
        requestAnimationFrame(function() {
            seccion.style.maxHeight = '0';
        });
        seccion.classList.remove('visible');
        btn.classList.remove('active');
    } else {
        seccion.classList.add('visible');
        seccion.style.maxHeight = seccion.scrollHeight + 'px';
        btn.classList.add('active');
        // Después de la transición, quitar maxHeight para que sea flexible
        setTimeout(function() {
            if (seccion.classList.contains('visible')) {
                seccion.style.maxHeight = 'none';
            }
        }, 400);
    }
}

// ── Init ──
document.addEventListener('DOMContentLoaded', function() {
    cargarPresentaciones();

});