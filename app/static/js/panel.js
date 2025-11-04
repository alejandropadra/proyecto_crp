document.addEventListener('DOMContentLoaded', () => {

    const allFiles = JSON.parse(document.querySelector('input[type="hidden"][name=""]').value);
    console.log(allFiles);

    let currentPage = 1;
    let filesPerPage = 10;
    let filteredFiles = [...allFiles];
    let searchTerm = '';
    let dateRange = null; 

    function renderFiles() {
        const container = document.getElementById('filesContainer');
        const noResults = document.getElementById('noResults');

        const startIndex = (currentPage - 1) * filesPerPage;
        const endIndex = startIndex + filesPerPage;
        const filesToShow = filteredFiles.slice(startIndex, endIndex);
        

        container.innerHTML = '';
        
        if (filesToShow.length === 0) {
            noResults.style.display = 'block';
            document.getElementById('paginationNav').style.display = 'none';
            updateInfo();
            return;
        }
        
        noResults.style.display = 'none';
        document.getElementById('paginationNav').style.display = 'block';
        
        filesToShow.forEach(file => {
            const downloadUrl = `/download_panel/${encodeURIComponent(file.name)}`;
            
            const fileItem = `
                <div class="file-item border-bottom py-3">
                    <div class="file-icon d-flex align-items-center">
                        <span class="icono-subfile me-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                <path fill="#b10505" d="M30 18v-2h-6v10h2v-4h3v-2h-3v-2zm-11 8h-4V16h4a3.003 3.003 0 0 1 3 3v4a3.003 3.003 0 0 1-3 3m-2-2h2a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2zm-6-8H6v10h2v-3h3a2.003 2.003 0 0 0 2-2v-3a2 2 0 0 0-2-2m-3 5v-3h3l.001 3z"/>
                                <path fill="#b10505" d="M22 14v-4a.91.91 0 0 0-.3-.7l-7-7A.9.9 0 0 0 14 2H4a2.006 2.006 0 0 0-2 2v24a2 2 0 0 0 2 2h16v-2H4V4h8v6a2.006 2.006 0 0 0 2 2h6v2Zm-8-4V4.4l5.6 5.6Z"/>
                            </svg>
                        </span>
                        <div class="file-info flex-grow-1">
                            <p class="file-name m-0 fw-bold">${file.name}</p>
                            <small class="text-muted">
                                Tamaño: ${file.size} • 
                                <span class="subido">Subido: ${file.created} • </span>
                            </small>
                        </div>
                        <div class="file-actions">
                            <a href="${downloadUrl}" 
                            class="btn btn-primary btn-sm download-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-to-line-icon lucide-arrow-down-to-line">
                                    <path d="M12 17V3"/><path d="m6 11 6 6 6-6"/><path d="M19 21H5"/>
                                </svg>
                                Descargar
                            </a>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML += fileItem;
        });
        
        updatePagination();
        updateInfo();
    }


    function parseFileDate(dateString) {

        const datePart = dateString.split(' ')[0]; // "24/10/2025"
        const [day, month, year] = datePart.split('/');
        return new Date(year, month - 1, day); // Crear fecha (mes es 0-indexed)
    }


    function applyFilters() {
        filteredFiles = allFiles.filter(file => {

            const matchesSearch = searchTerm === '' || 
                file.name.toLowerCase().includes(searchTerm);

            let matchesDate = true;
            if (dateRange) {
                const fileDate = parseFileDate(file.created);
                matchesDate = fileDate >= dateRange.start && fileDate <= dateRange.end;
            }
            
            return matchesSearch && matchesDate;
        });
        
        currentPage = 1;
        renderFiles();
    }


    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchTerm = e.target.value.toLowerCase().trim();
        applyFilters();
    });


    document.getElementById('perPageSelect').addEventListener('change', function(e) {
        filesPerPage = parseInt(e.target.value);
        currentPage = 1;
        renderFiles();
    });

    function updatePagination() {
        const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';
        
        if (totalPages <= 1) {
            document.getElementById('paginationNav').style.display = 'none';
            return;
        }
        
        document.getElementById('paginationNav').style.display = 'block';
        

        const prevDisabled = currentPage === 1 ? 'disabled' : '';
        pagination.innerHTML += `
            <li class="page-item ${prevDisabled}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1}); return false;">
                    &laquo;
                </a>
            </li>
        `;
        
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            pagination.innerHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
                </li>
            `;
            if (startPage > 2) {
                pagination.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const active = i === currentPage ? 'active' : '';
            pagination.innerHTML += `
                <li class="page-item ${active}">
                    <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pagination.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            pagination.innerHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
                </li>
            `;
        }
        

        const nextDisabled = currentPage === totalPages ? 'disabled' : '';
        pagination.innerHTML += `
            <li class="page-item ${nextDisabled}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1}); return false;">
                    &raquo;
                </a>
            </li>
        `;
    }

    function updateInfo() {
        const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
        const startIndex = (currentPage - 1) * filesPerPage;
        const endIndex = Math.min(startIndex + filesPerPage, filteredFiles.length);
        
        document.getElementById('showingCount').textContent = filteredFiles.length > 0 ? `${startIndex + 1}-${endIndex}` : '0';
        document.getElementById('totalCount').textContent = filteredFiles.length;
        document.getElementById('currentPage').textContent = currentPage;
        document.getElementById('totalPages').textContent = totalPages || 1;
    }

    window.changePage = function(page) {
        const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderFiles();

        const container = document.querySelector('.contenedor-tabla');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Configuración de easepick
    const picker = new easepick.create({
        element: document.getElementById('datepicker'),
        css: [
            'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css',
        ],
        plugins: ['RangePlugin'],
        RangePlugin: {
            elementEnd: document.getElementById('end-date'),
        },
        format: 'DD-MM-YYYY',
        lang: 'es-ES',
        setup(picker) {

            picker.on('select', (e) => {
                const { start, end } = e.detail;
                
                if (start && end) {

                    dateRange = {
                        start: new Date(start),
                        end: new Date(end)
                    };
                    
                    console.log('Rango seleccionado:', dateRange);
                    applyFilters();
                }
            });
            

            picker.on('clear', () => {
                dateRange = null;
                applyFilters();
            });
        }
    });

    function forceZIndex(pickerInstance, z = 9999) {
        setTimeout(() => {
            const shadowRoot = pickerInstance.ui.shadowRoot;
            if (!shadowRoot) return;

            const container = shadowRoot.querySelector('.container');
            if (container) {
                container.style.zIndex = z;
            }
        }, 100);
    }
    
    forceZIndex(picker);
    renderFiles();
});