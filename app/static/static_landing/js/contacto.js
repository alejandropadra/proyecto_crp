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