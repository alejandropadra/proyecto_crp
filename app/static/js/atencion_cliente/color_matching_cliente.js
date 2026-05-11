(() => {
  'use strict';

  // ─── Constantes ─────────────────────────────────────────
  const STORAGE_KEY = 'corimon_solicitud_color_estado';

  const VALIDACIONES = [
    { campo: 'color',   mensaje: 'Ingrese el nombre del color' },
    { campo: 'cod_std', mensaje: 'Ingrese el código STD' },
    { campo: 'marca',   mensaje: 'Seleccione una marca' }
  ];

  // ─── Persistencia ───────────────────────────────────────
  function guardarEstado() {
    const datos = {};
    document.querySelectorAll('[data-campo]').forEach(input => {
      datos[input.dataset.campo] = input.value;
    });
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  }

  function recuperarEstado() {
    try {
      const guardado = sessionStorage.getItem(STORAGE_KEY);
      if (!guardado) return;
      const datos = JSON.parse(guardado);

      Object.entries(datos).forEach(([nombre, valor]) => {
        if (!valor) return;
        const input = document.querySelector(`[data-campo="${nombre}"]`);
        if (!input) return;
        input.value = valor;
        if (input.tomselect) input.tomselect.setValue(valor, true);
      });
    } catch (e) {
      console.warn('Error recuperando estado:', e);
    }
  }

  function limpiarEstado() {
    sessionStorage.removeItem(STORAGE_KEY);
  }

  // ─── Validación local ───────────────────────────────────
  function validar() {
    let todoValido = true;
    let primerError = null;

    VALIDACIONES.forEach(regla => {
      const input = document.querySelector(`[data-campo="${regla.campo}"]`);
      const valor = (input?.value || '').trim();
      const campoEl = input?.closest('.campo');

      if (!valor) {
        campoEl?.classList.add('error');
        if (!primerError) primerError = campoEl;
        todoValido = false;
      } else {
        campoEl?.classList.remove('error');
      }
    });

    if (primerError) {
      primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return todoValido;
  }

  // ─── Errores del servidor (WTForms inline por campo) ────
  function mostrarErroresServidor(errores) {
    document.querySelectorAll('.campo.error').forEach(c => c.classList.remove('error'));

    let primerCampoConError = null;

    Object.entries(errores).forEach(([nombreCampo, mensajes]) => {
      const input = document.querySelector(`[name="${nombreCampo}"], [data-campo="${nombreCampo}"]`);
      if (!input) return;

      const campoEl = input.closest('.campo');
      if (!campoEl) return;

      campoEl.classList.add('error');
      const spanError = campoEl.querySelector('.campo-error-mensaje');
      if (spanError) spanError.textContent = mensajes.join(', ');

      if (!primerCampoConError) primerCampoConError = campoEl;
    });

    if (primerCampoConError) {
      primerCampoConError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ─── Tom Select ─────────────────────────────────────────
  function inicializarTomSelect() {
    document.querySelectorAll('select.tom-select').forEach(selectEl => {
      const esSelectConImagen = selectEl.dataset.campo === 'marca';

      const renderConImagen = {
        option: (data, escape) => {
          const img = window.MARCAS_IMG?.[data.value];
          return `
            <div class="ts-option-marca">
              ${img ? `<img src="${img}" alt="${escape(data.text)}" class="ts-option-marca-img">`
                    : `<div class="ts-option-marca-img placeholder"></div>`}
              <span>${escape(data.text)}</span>
            </div>`;
        },
        item: (data, escape) => {
          const img = window.MARCAS_IMG?.[data.value];
          return `
            <div class="ts-item-marca">
              ${img ? `<img src="${img}" alt="${escape(data.text)}" class="ts-item-marca-img">` : ''}
              <span>${escape(data.text)}</span>
            </div>`;
        }
      };

      const renderTexto = {
        option: (data, escape) => `<div class="ts-option-item">${escape(data.text)}</div>`
      };

      new TomSelect(selectEl, {
        create: false,
        allowEmptyOption: false,
        placeholder: 'Seleccionar…',
        maxOptions: null,
        searchField: ['text'],
        onDropdownOpen() { this.focus(); },
        render: {
          no_results: data => `
            <div class="ts-no-results">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.3-4.3"/>
              </svg>
              Sin resultados para "<strong>${data.input}</strong>"
            </div>`,
          ...(esSelectConImagen ? renderConImagen : renderTexto)
        }
      });
    });
  }

  // ─── Listeners de inputs ────────────────────────────────
  function vincularInputs() {
    document.querySelectorAll('[data-campo]').forEach(input => {
      const handler = () => {
        guardarEstado();
        const campo = input.closest('.campo');
        if (campo?.classList.contains('error') && input.value.trim()) {
          campo.classList.remove('error');
        }
      };
      input.addEventListener('input', handler);
      input.addEventListener('change', handler);
    });
  }

  // ─── Submit ─────────────────────────────────────────────
  async function manejarEnvio(e, form) {
    e.preventDefault();

    if (!validar()) return;

    const btn = form.querySelector('button[type="submit"]');
    const btnTextoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Enviando…';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        limpiarEstado();
        // Redirige para que el flash de Flask se muestre al recargar
        window.location.href = data.url || window.location.pathname;
      } else {
        mostrarErroresServidor(data.errors || {});
        btn.disabled = false;
        btn.innerHTML = btnTextoOriginal;
      }
    } catch (error) {
      console.error('Error al enviar:', error);
      btn.disabled = false;
      btn.innerHTML = btnTextoOriginal;
    }
  }

  // ─── Init ───────────────────────────────────────────────
  function init() {
    inicializarTomSelect();
    recuperarEstado();
    vincularInputs();

    const form = document.getElementById('form-color-matching');
    if (!form) return;

    form.addEventListener('submit', e => manejarEnvio(e, form));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();