// === MAPA (IIFE - scope aislado) ===
(function() {
    var LAT = 10.1599255;
    var LNG = -67.9568912;

    var map = L.map('mapaContacto', {
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false
    }).setView([8.0, -66.0], 6);

    L.control.zoom({ position: 'topright' }).addTo(map);

    var tileLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 18
    }).addTo(map);

    var icon = L.divIcon({
        className: 'custom-marker',
        html: '<div class="marker-pin">'
            + '<svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">'
            +   '<path d="M20 0C8.954 0 0 8.954 0 20c0 14 20 32 20 32s20-18 20-32C40 8.954 31.046 0 20 0z" fill="#E50914"/>'
            +   '<circle cx="20" cy="18" r="9" fill="white"/>'
            +   '<text x="20" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="#E50914">C</text>'
            + '</svg>'
            + '</div>',
        iconSize: [40, 52],
        iconAnchor: [20, 52],
        popupAnchor: [0, -48]
    });

    var popup = '<div class="mapa-popup">'
        + '<h4>Corimon Pinturas C.A.</h4>'
        + '<p>Av. Hans Neumann, Urb. Industrial<br>El Bosque, Valencia, Edo. Carabobo</p>'
        + '<a href="https://www.google.com/maps/dir/?api=1&destination=10.1599255,-67.9568912" target="_blank" class="mapa-popup-btn">'
        +   'Cómo llegar'
        +   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
        + '</a>'
        + '</div>';

    var marker = L.marker([LAT, LNG], { icon: icon, opacity: 0 }).addTo(map);
    var hasFlown = false;

    function startFly() {
        if (hasFlown) return;
        hasFlown = true;

        // Espera 1.5s para que se vea Venezuela
        setTimeout(function() {
            map.flyTo([LAT, LNG], 16, {
                duration: 4,
                easeLinearity: 0.15
            });

            map.once('moveend', function() {
                marker.setOpacity(1);
                marker.bindPopup(popup, { closeButton: false }).openPopup();
            });
        }, 1500);
    }

    // Esperar a que los tiles carguen Y el mapa sea visible
    var tilesLoaded = false;
    var isVisible = false;

    tileLayer.once('load', function() {
        tilesLoaded = true;
        if (isVisible) startFly();
    });

    var observer = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
            observer.disconnect();
            isVisible = true;
            if (tilesLoaded) startFly();

            setTimeout(function() { startFly(); }, 3000);
        }
    }, { threshold: 0.3 });

    observer.observe(document.getElementById('mapaContacto'));

    map.on('click', function() { map.scrollWheelZoom.enable(); });
    map.on('mouseout', function() { map.scrollWheelZoom.disable(); });

    window.addEventListener('resize', function() {
        setTimeout(function() { map.invalidateSize(); }, 200);
    });

    setTimeout(function() { map.invalidateSize(); }, 500);
})();


// === TURNSTILE (funciones globales necesarias para Cloudflare) ===
window.onTurnstileSuccess = function(token) {
    var btn = document.getElementById('submitBtn'); 
    var msg = document.getElementById('turnstile-message');

    if (btn) btn.disabled = false;
    if (msg) {
        msg.textContent = '';
        msg.className = 'turnstile-message';
    }
};

window.onTurnstileError = function() {
    var btn = document.getElementById('submitBtn');  
    var msg = document.getElementById('turnstile-message');

    if (btn) btn.disabled = true;
    if (msg) {
        msg.textContent = 'Error de verificación. Recarga la página e intenta de nuevo.';
        msg.className = 'turnstile-message error';
    }
};

window.onTurnstileExpired = function() {
    var btn = document.getElementById('submitBtn');  
    var msg = document.getElementById('turnstile-message');

    if (btn) btn.disabled = true;
    if (msg) {
        msg.textContent = 'La verificación expiró. Por favor, complétala nuevamente.';
        msg.className = 'turnstile-message warning';
    }

    if (window.turnstile) {
        window.turnstile.reset();
    }
};


(function() {
    var MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    var ALLOWED = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];

    // Iconos SVG según tipo de archivo
    var FILE_ICONS = {
        pdf: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6M9 11h6"/></svg>',
        doc: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
        img: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
    };

    function getFileIcon(extension) {
        if (extension === 'pdf') return FILE_ICONS.pdf;
        if (extension === 'doc' || extension === 'docx') return FILE_ICONS.doc;
        if (['jpg', 'jpeg', 'png'].indexOf(extension) !== -1) return FILE_ICONS.img;
        return FILE_ICONS.doc;
    }

    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    function setState(zone, state) {
        var states = zone.querySelectorAll('.upload-state');
        for (var i = 0; i < states.length; i++) {
            states[i].hidden = states[i].dataset.state !== state;
        }
    }

    function showError(zone, errorEl, message) {
        zone.classList.add('has-error');
        errorEl.textContent = message;
        errorEl.hidden = false;
    }

    function clearError(zone, errorEl) {
        zone.classList.remove('has-error');
        errorEl.textContent = '';
        errorEl.hidden = true;
    }

    function validateFile(file) {
        var ext = file.name.split('.').pop().toLowerCase();
        if (ALLOWED.indexOf(ext) === -1) {
            return 'Formato no permitido. Usa PDF, Word o imagen.';
        }
        if (file.size > MAX_SIZE) {
            return 'El archivo supera 5 MB.';
        }
        if (file.size === 0) {
            return 'El archivo está vacío.';
        }
        return null;
    }

    function handleFile(file, input, zone, errorEl) {
        clearError(zone, errorEl);

        var error = validateFile(file);
        if (error) {
            input.value = '';
            showError(zone, errorEl, error);
            setState(zone, 'idle');
            zone.classList.remove('has-file');
            return;
        }

        // Mostrar loading brevemente para feedback visual
        setState(zone, 'loading');

        setTimeout(function() {
            var ext = file.name.split('.').pop().toLowerCase();
            
            document.getElementById('uploadFileIcon').innerHTML = getFileIcon(ext);
            document.getElementById('uploadFileName').textContent = file.name;
            document.getElementById('uploadFileSize').textContent = formatSize(file.size);

            zone.classList.add('has-file');
            setState(zone, 'file');
        }, 300);
    }

    function resetFile(input, zone, errorEl) {
        input.value = '';
        zone.classList.remove('has-file');
        clearError(zone, errorEl);
        setState(zone, 'idle');
    }

    function handleFormSubmit(e) {
        var btn = document.getElementById('submitBtn');
        if (!btn) return;
        btn.disabled = true;
        btn.textContent = 'Enviando...';
    }

    document.addEventListener('DOMContentLoaded', function() {
        var form = document.getElementById('contactForm');
        var zone = document.getElementById('uploadZone');
        var input = document.getElementById('archivo');
        var removeBtn = document.getElementById('uploadFileRemove');
        var errorEl = document.getElementById('uploadError');

        if (form) form.addEventListener('submit', handleFormSubmit);
        if (!zone || !input) return;

        // Click en la zona abre el selector (excepto en el botón remover)
        zone.addEventListener('click', function(e) {
            if (e.target.closest('.upload-file-remove')) return;
            if (zone.classList.contains('has-file')) return;
            input.click();
        });

        // Keyboard: Enter o Espacio activan el selector
        zone.addEventListener('keydown', function(e) {
            if ((e.key === 'Enter' || e.key === ' ') && !zone.classList.contains('has-file')) {
                e.preventDefault();
                input.click();
            }
        });

        // Selección manual de archivo
        input.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0], input, zone, errorEl);
            }
        });

        // Drag & drop
        ['dragenter', 'dragover'].forEach(function(evt) {
            zone.addEventListener(evt, function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (!zone.classList.contains('has-file')) {
                    zone.classList.add('is-dragging');
                }
            });
        });

        ['dragleave', 'drop'].forEach(function(evt) {
            zone.addEventListener(evt, function(e) {
                e.preventDefault();
                e.stopPropagation();
                zone.classList.remove('is-dragging');
            });
        });

        zone.addEventListener('drop', function(e) {
            if (zone.classList.contains('has-file')) return;
            var files = e.dataTransfer.files;
            if (files && files[0]) {
                // Asignar al input para que viaje con el form
                input.files = files;
                handleFile(files[0], input, zone, errorEl);
            }
        });

        // Prevenir que el browser abra el archivo si se suelta fuera de la zona
        ['dragover', 'drop'].forEach(function(evt) {
            document.addEventListener(evt, function(e) {
                if (!zone.contains(e.target)) {
                    e.preventDefault();
                }
            });
        });

        // Botón remover archivo
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                resetFile(input, zone, errorEl);
            });
        }
    });
})();