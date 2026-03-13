
/*
Replica el formato de Python: "{:,.2f}".format(value|float|abs)
 */
function fmt(value) {
    return Math.abs(parseFloat(value) || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

//Fetch interno con headers de seguridad y manejo global de 401
async function apiFetch(url) {
    const res = await fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    if (res.status === 401) {
        window.location.href = '/login';
        return null;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

//Llena un elemento con su valor y remueve el estado skeleton
function setVal(id, value, format = true) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('skeleton-val');
    el.textContent = format ? fmt(value) : value;
}

//Marca un elemento como error (no se pudo cargar)
function setError(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('skeleton-val');
    el.classList.add('text-muted');
    el.textContent = '--';
}


function renderResumen(data) {
    // Cards superiores
    setVal('deuda-bs',    (data.tdeudabs  || 0) - (data.tdifedeudabs  || 0));
    setVal('deuda-dolar', (data.tdeudadiv || 0) - (data.tdifedeudadiv || 0));
    setVal('saldo-bs',    (data.tsaldofbs  || 0) - (data.tdifesaldofbs  || 0));
    setVal('saldo-dolar', (data.tsaldofdiv || 0) - (data.tdifesaldofdiv || 0));

    // Deuda total vencida — solo se muestra si tvencdiv > 0
    if (parseFloat(data.tvencdiv) > 0) {
        setVal('vencida-total-bs',    data.tvencbs);
        setVal('vencida-total-dolar', data.tvencdiv);
    } else {
        setVal('vencida-total-bs',    0);
        setVal('vencida-total-dolar', 0);
    }

    // Desglose por antigüedad
    setVal('no-vencida-bs',     data.tnovencbs);
    setVal('no-vencida-dolar',  data.tnovencdiv);
    setVal('vencido-130-bs',    data.tvenc130b);
    setVal('vencido-130-dolar', data.tvenc130d);
    setVal('vencido-3160-bs',    data.tvecc3160b);
    setVal('vencido-3160-dolar', data.tvecc3160d);
    setVal('vencido-60-bs',     data.tvec61masb);
    setVal('vencido-60-dolar',  data.tvec61masd);
}

function renderFacturas(data) {
    setVal('contador-por-pagar',          data.por_pagar,          false);
    setVal('contador-abono-conciliar',    data.abono_conciliar,    false);
    setVal('contador-facturas-verificar', data.facturas_verificar, false);

    // Tabla de descuentos por pronto pago
    const tbody = document.getElementById('tabla-descuentos-body');
    if (!tbody) return;

    if (!data.tabla_descuentos || data.tabla_descuentos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-3">
                    Sin descuentos por pronto pago disponibles
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = data.tabla_descuentos.map(f => `
        <tr>
            <td>${f.fkdat}</td>
            <td>${f.vbeln}</td>
            <td>${fmt(f.totfactbs)}</td>
            <td>${fmt(f.totfactbs - f.dppbs)}</td>
            <td>${fmt(f.dmbtr)}</td>
            <td>${fmt(f.dmbtr - f.montoncdpp)}</td>
        </tr>
    `).join('');
}

function renderContadores(data) {
    setVal('contador-fact',                    data.contador_fact,                   false);
    setVal('contador-retenciones-pendientes',  data.contador_retenciones_pendientes, false);
    setVal('iva-x-pagar',                      data.iva_x_pagar,                     false);
}


function errorResumen() {
    ['deuda-bs','deuda-dolar','saldo-bs','saldo-dolar',
        'vencida-total-bs','vencida-total-dolar',
        'no-vencida-bs','no-vencida-dolar',
        'vencido-130-bs','vencido-130-dolar',
        'vencido-3160-bs','vencido-3160-dolar',
        'vencido-60-bs','vencido-60-dolar'].forEach(setError);
}

function errorFacturas() {
    ['contador-por-pagar','contador-abono-conciliar','contador-facturas-verificar'].forEach(setError);
    const tbody = document.getElementById('tabla-descuentos-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Error al cargar datos</td></tr>';
}

function errorContadores() {
    ['contador-fact','contador-retenciones-pendientes','iva-x-pagar'].forEach(setError);
}


document.addEventListener('DOMContentLoaded', () => {

    const cfg = document.getElementById('sap-api-config').dataset;

    Promise.allSettled([
        apiFetch(cfg.resumen)
            .then(d => { if (d) renderResumen(d); })
            .catch(errorResumen),

        apiFetch(cfg.facturas)
            .then(d => { if (d) renderFacturas(d); })
            .catch(errorFacturas),

        apiFetch(cfg.contadores)
            .then(d => { if (d) renderContadores(d); })
            .catch(errorContadores),
    ]);
});