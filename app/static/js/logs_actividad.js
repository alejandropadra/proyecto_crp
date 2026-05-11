let tablaLogs;

$(document).ready(function() {
    inicializarTabla();
});

function inicializarTabla() {
    tablaLogs = $('#tablaLogs').DataTable({
        serverSide: true,              // ← Paginación del lado del servidor
        processing: true,
        searching: false,              // Desactivado: usamos nuestros filtros personalizados
        ordering: false,              
        
        ajax: {
            url: window.location.pathname,
            data: function(d) {
                // DataTables pasa: d.start (offset), d.length (per_page)
                const page = Math.floor(d.start / d.length) + 1;
                
                return {
                    get_data: 'true',
                    page: page,
                    per_page: d.length,
                    rif: $('#filtro-rif').val() || '',
                    username: $('#filtro-username').val() || '',
                    ip: $('#filtro-ip').val() || '',
                    fecha_desde: $('#filtro-desde').val() || '',
                    fecha_hasta: $('#filtro-hasta').val() || '',
                };
            },
            dataSrc: function(json) {
                return json.logs;
            },
            dataFilter: function(data) {
                const json = JSON.parse(data);
                json.recordsTotal = json.total;
                json.recordsFiltered = json.total;
                json.data = json.logs;
                return JSON.stringify(json);
            }
        },
        columns: [
            { data: 'created_at' },
            { data: 'username' },
            { data: 'rif' },
            { data: 'ip' },
            { 
                data: 'device_name',
                render: function(data, type, row) {
                    if (type === 'display' && data) {
                        // Tooltip con el device_id completo
                        return `<span title="Device ID: ${row.device_id || 'N/A'}">${data}</span>`;
                    }
                    return data || '-';
                }
            },
            /*{ 
                data: 'method',
                render: function(data) {
                    return formatearMetodo(data);
                }
            },*/
            { 
                data: 'path',
                render: function(data) {
                    if (!data) return '-';
                    // Truncar paths muy largos
                    return data.length > 40 
                        ? `<span title="${data}">${data.substring(0, 40)}...</span>` 
                        : data;
                }
            },
            { data: 'seller' },
            
            /*{ 
                data: 'status_code',
                render: function(data) {
                    return formatearStatus(data);
                }
            },*/
        ],
        language: {
            processing: "Cargando...",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Sin registros",
            infoFiltered: "",
            zeroRecords: "No se encontraron registros",
            emptyTable: "No hay logs disponibles",
            paginate: {
                first: "Primero",
                previous: "Anterior",
                next: "Siguiente",
                last: "Último"
            }
        },
        pageLength: 50,
        lengthMenu: [[25, 50, 100, 200], [25, 50, 100, 200]],
        responsive: true,
        autoWidth: false,
        initComplete: function() {
            $('#loader-container').remove();
            $('#tabla-container').fadeIn(300);
        }
    });
}

function formatearMetodo(metodo) {
    if (!metodo) return '-';
    const colores = {
        'GET': 'badge-info',
        'POST': 'badge-success',
        'PUT': 'badge-warning',
        'DELETE': 'badge-danger',
        'PATCH': 'badge-warning'
    };
    const clase = colores[metodo] || 'badge-secondary';
    return `<span class="badge ${clase}">${metodo}</span>`;
}

function formatearStatus(code) {
    if (!code) return '-';
    let clase = 'badge-secondary';
    if (code >= 200 && code < 300) clase = 'badge-success';
    else if (code >= 300 && code < 400) clase = 'badge-info';
    else if (code >= 400 && code < 500) clase = 'badge-warning';
    else if (code >= 500) clase = 'badge-danger';
    return `<span class="badge ${clase}">${code}</span>`;
}

// =========================================
// Filtros
// =========================================
$('#btn-aplicar-filtros').on('click', function() {
    tablaLogs.ajax.reload();
});

$('#btn-limpiar-filtros').on('click', function() {
    $('#filtro-rif').val('');
    $('#filtro-username').val('');
    $('#filtro-ip').val('');
    $('#filtro-desde').val('');
    $('#filtro-hasta').val('');
    tablaLogs.ajax.reload();
});

// Permitir aplicar filtros con Enter
$('.filtros-logs input').on('keypress', function(e) {
    if (e.which === 13) {
        tablaLogs.ajax.reload();
    }
});

// ========================================================
// GRÁFICAS DE ANÁLISIS (ECharts)
// ========================================================
let chartUsuarios, chartDispositivos;

$(document).ready(function() {
    // Inicializar gráficas vacías
    chartUsuarios = echarts.init(document.getElementById('chart-usuarios'));
    chartDispositivos = echarts.init(document.getElementById('chart-dispositivos'));
    
    // Mostrar loading mientras carga la data
    chartUsuarios.showLoading({ text: 'Cargando...' });
    chartDispositivos.showLoading({ text: 'Cargando...' });
    
    // Cargar datos de las gráficas
    cargarStats();
    
    // Responsive: redibujar al cambiar tamaño de ventana
    window.addEventListener('resize', function() {
        chartUsuarios.resize();
        chartDispositivos.resize();
    });
});

function cargarStats() {
    $.ajax({
        url: '/logs-actividad/stats',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            renderChartUsuarios(data.usuarios_multidispositivo);
            renderChartDispositivos(data.dispositivos_multiusuario);
        },
        error: function(xhr, status, error) {
            console.error('Error cargando stats:', error);
            chartUsuarios.hideLoading();
            chartDispositivos.hideLoading();
        }
    });
}

// ========================================================
// Gráfica 1: Usuarios con más dispositivos distintos
// ========================================================
function renderChartUsuarios(data) {
    chartUsuarios.hideLoading();
    
    if (!data || data.length === 0) {
        chartUsuarios.setOption({
            title: {
                text: 'Sin datos suficientes',
                subtext: 'Ningún usuario ha usado más de 1 dispositivo',
                left: 'center',
                top: 'center',
                textStyle: { fontSize: 14, color: '#999' },
                subtextStyle: { fontSize: 12, color: '#bbb' }
            }
        });
        return;
    }
    
    // Mantener orden descendente (mayores a la izquierda)
    const nombres = data.map(u => u.username || u.rif);
    const dispositivos = data.map(u => u.dispositivos_distintos);
    const ips = data.map(u => u.ips_distintas);
    
    chartUsuarios.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            borderColor: 'transparent',
            borderRadius: 10,
            padding: [12, 16],
            textStyle: { color: '#fff', fontSize: 13 },
            extraCssText: 'box-shadow: 0 10px 25px rgba(0,0,0,0.25);',
            formatter: function(params) {
                const idx = params[0].dataIndex;
                const usuario = data[idx];
                return `
                    <div style="font-weight:700; font-size:14px; margin-bottom:6px;">
                        ${usuario.username || 'N/A'}
                    </div>
                    <div style="font-size:11px; color:#9CA3AF; margin-bottom:8px;">
                        RIF: ${usuario.rif}
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                        <span style="width:10px; height:10px; background:#0062E6; border-radius:2px; display:inline-block;"></span>
                        Dispositivos: <strong>${usuario.dispositivos_distintos}</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="width:10px; height:10px; background:#13315c; border-radius:2px; display:inline-block;"></span>
                        IPs distintas: <strong>${usuario.ips_distintas}</strong>
                    </div>
                `;
            }
        },
        legend: {
            data: ['Dispositivos', 'IPs'],
            top: 10,
            right: 20,
            icon: 'roundRect',
            itemWidth: 14,
            itemHeight: 10,
            textStyle: { color: '#6B7280', fontSize: 12, fontWeight: 600 }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '18%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: nombres,
            axisLine: { lineStyle: { color: '#E5E7EB' } },
            axisTick: { show: false },
            axisLabel: {
                color: '#6B7280',
                fontSize: 11,
                interval: 0,
                rotate: 30,
                formatter: function(value) {
                    return value.length > 12 ? value.substring(0, 12) + '...' : value;
                }
            }
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
            axisLabel: { color: '#9CA3AF', fontSize: 11 }
        },
        series: [
            {
                name: 'Dispositivos',
                type: 'bar',
                data: dispositivos,
                barMaxWidth: 32,
                itemStyle: {
                    borderRadius: [8, 8, 0, 0],
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: '#0062E6' },   // --color-blue-500
                            { offset: 1, color: '#004BC2' }    // --color-blue-700
                        ]
                    }
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 12,
                        shadowColor: 'rgba(0, 98, 230, 0.45)'
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    color: '#004BC2',
                    fontSize: 11,
                    fontWeight: 700
                }
            },
            {
                name: 'IPs',
                type: 'bar',
                data: ips,
                barMaxWidth: 32,
                itemStyle: {
                    borderRadius: [8, 8, 0, 0],
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: '#13315c' },   // --blue-mid
                            { offset: 1, color: '#0b2545' }    // --blue-dark
                        ]
                    }
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 12,
                        shadowColor: 'rgba(11, 37, 69, 0.45)'
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    color: '#0b2545',
                    fontSize: 11,
                    fontWeight: 700
                }
            }
        ]
    });
    
    // Click en una barra → filtrar la tabla por ese usuario
    chartUsuarios.on('click', function(params) {
        const usuario = data[params.dataIndex];
        $('#filtro-rif').val(usuario.rif);
        if (tablaLogs) {
            tablaLogs.ajax.reload();
        }
    });
}

// ========================================================
// Gráfica 2: Dispositivos con más usuarios distintos
// ========================================================
function renderChartDispositivos(data) {
    chartDispositivos.hideLoading();
    
    if (!data || data.length === 0) {
        chartDispositivos.setOption({
            title: {
                text: 'Sin cuentas compartidas detectadas',
                subtext: 'Cada dispositivo tiene un único usuario asociado ✓',
                left: 'center',
                top: 'center',
                textStyle: { fontSize: 14, color: '#065f46', fontWeight: 700 },
                subtextStyle: { fontSize: 12, color: '#10b981' }
            }
        });
        return;
    }
    
    const labels = data.map(d => d.device_name || d.device_id_corto);
    const usuarios = data.map(d => d.usuarios_distintos);
    
    // Gradients según severidad
    const gradients = usuarios.map(n => {
        if (n >= 4) {
            // Crítico: rojo oscuro
            return {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                    { offset: 0, color: '#dc2626' },
                    { offset: 1, color: '#7f1d1d' }
                ]
            };
        }
        if (n === 3) {
            // Moderado: rojo medio
            return {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                    { offset: 0, color: '#ef4444' },
                    { offset: 1, color: '#b91c1c' }
                ]
            };
        }
        // Leve: rojo claro (sustituye al naranja, más coherente con la paleta)
        return {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
                { offset: 0, color: '#f87171' },
                { offset: 1, color: '#dc2626' }
            ]
        };
    });
    
    chartDispositivos.setOption({
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            borderColor: 'transparent',
            borderRadius: 10,
            padding: [12, 16],
            textStyle: { color: '#fff', fontSize: 13 },
            extraCssText: 'box-shadow: 0 10px 25px rgba(0,0,0,0.25);',
            formatter: function(params) {
                const idx = params[0].dataIndex;
                const disp = data[idx];
                const usuariosLista = disp.lista_usuarios.slice(0, 5).join('<br/>• ');
                const extras = disp.lista_usuarios.length > 5 
                    ? `<br/>...y ${disp.lista_usuarios.length - 5} más` : '';
                return `
                    <div style="font-weight:700; font-size:14px; margin-bottom:6px;">
                        ${disp.device_name}
                    </div>
                    <div style="font-size:11px; color:#9CA3AF; margin-bottom:4px;">
                        IP: ${disp.ip} · ID: ${disp.device_id_corto}
                    </div>
                    <div style="border-top:1px solid #374151; padding-top:8px; margin-top:6px;">
                        <div style="margin-bottom:6px;">
                            Usuarios distintos con los que ingresó: <strong>${disp.usuarios_distintos}</strong>
                        </div>
                        <div style="font-size:12px; color:#D1D5DB;">
                            • ${usuariosLista}${extras}
                        </div>
                    </div>
                `;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: labels,
            axisLine: { lineStyle: { color: '#E5E7EB' } },
            axisTick: { show: false },
            axisLabel: {
                color: '#6B7280',
                fontSize: 11,
                interval: 0,
                rotate: 30,
                formatter: function(value) {
                    return value.length > 14 ? value.substring(0, 14) + '...' : value;
                }
            }
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            name: 'Usuarios',
            nameTextStyle: { color: '#9CA3AF', fontSize: 11, fontWeight: 600 },
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
            axisLabel: { color: '#9CA3AF', fontSize: 11 }
        },
        series: [{
            type: 'bar',
            data: usuarios.map((val, idx) => ({
                value: val,
                itemStyle: {
                    borderRadius: [8, 8, 0, 0],
                    color: gradients[idx]
                }
            })),
            barMaxWidth: 48,
            emphasis: {
                itemStyle: {
                    shadowBlur: 14,
                    shadowColor: 'rgba(185, 28, 28, 0.5)'
                }
            },
            label: { 
                show: true, 
                position: 'top',
                color: '#b91c1c',
                fontSize: 12,
                fontWeight: 700,
                formatter: '{c}'
            }
        }]
    });
    
    // Click en una barra → filtrar la tabla por ese device
    chartDispositivos.on('click', function(params) {
        const disp = data[params.dataIndex];
        $('#filtro-ip').val(disp.ip);
        if (tablaLogs) {
            tablaLogs.ajax.reload();
        }
    });
}