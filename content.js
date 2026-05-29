const href = window.location.href.toLowerCase();
const path = window.location.pathname.toLowerCase();
const isMenuAlumno = href.includes('menualumno.asp');
const isErrorPage = document.querySelector('.textoError') !== null;
const isRoot = path === '/' || path.endsWith('default.asp');
const isLogin = href.includes('loginalumno.asp') || isRoot || (isMenuAlumno && isErrorPage);

// Mapa inmutable de códigos regionales a nombres
const regionalMap = Object.freeze({
    fra: 'Avellaneda',
    frba: 'Bahía Blanca',
    frb: 'Buenos Aires',
    frcon: 'Concordia',
    frc: 'Córdoba',
    frcu: 'Cuyo',
    frgp: 'General Pacheco',
    frh: 'Haedo',
    frl: 'La Rioja',
    frlp: 'La Plata',
    frm: 'Mendoza',
    frn: 'Neuquén',
    frp: 'Paraná',
    frr: 'Resistencia',
    frre: 'Reconquista',
    frro: 'Rosario',
    frsa: 'Salta',
    frsan: 'San Nicolás',
    frs: 'Santa Fe',
    frsc: 'San Francisco',
    frt: 'Tucumán',
    frvm: 'Villa María',
});

/**
 * Obtiene el nombre de la regional a partir del hostname.
 * @param {string} [hostname=window.location.hostname] - Hostname a analizar.
 * @returns {string} Nombre de la regional o el código en mayúsculas si no está en el mapa.
 */
const getRegionalName = (hostname = window.location.hostname) => {
    const match = hostname.toLowerCase().match(/fr[a-z]+/);
    if (match && match[0]) {
        return regionalMap[match[0]] || match[0].toUpperCase();
    }
    return '';
};

const regionalName = getRegionalName();

/**
 * Obtiene el código de regional (ej: 'frro', 'frt') a partir del hostname.
 * @param {string} [hostname=window.location.hostname] - Hostname a analizar.
 * @returns {string} Código en minúsculas o '' si no matchea.
 */
const getRegionalCode = (hostname = window.location.hostname) => {
    const match = hostname.toLowerCase().match(/fr[a-z]+/);
    return (match && match[0]) ? match[0] : '';
};

const regionalCode = getRegionalCode();
const isFRRO = regionalCode === 'frro';

// Links extra de Rosario (no están en el sidebar base): se leen del menú y se cachean para el resto de páginas
const EXTRA_LINKS_STORAGE_KEY = `sysacad_extra_links_${regionalCode}`;
let extraSidebarLinks = [];

if (isFRRO && isMenuAlumno && !isErrorPage) {
    // Normaliza texto: minúsculas y sin diacríticos
    const normalizeText = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    // Texto del link en el menú -> ícono en el sidebar
    const extraLinkConfig = [
        { match: 'calendario', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>` },
        { match: 'tramites', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>` },
    ];

    document.querySelectorAll('ul.textoTabla li a').forEach(a => {
        const text = a.textContent.trim();
        const normalized = normalizeText(text);
        const cfg = extraLinkConfig.find(c => normalized.includes(c.match));
        if (cfg && a.href) {
            extraSidebarLinks.push({
                text,
                href: a.href,
                svg: cfg.svg,
                external: a.target === '_blank',
            });
        }
    });

    try {
        localStorage.setItem(EXTRA_LINKS_STORAGE_KEY, JSON.stringify(extraSidebarLinks));
    } catch (e) { /* ignorar */ }
} else if (isFRRO) {
    // En páginas internas leemos los links cacheados desde el menú
    try {
        const cached = JSON.parse(localStorage.getItem(EXTRA_LINKS_STORAGE_KEY) || '[]');
        if (Array.isArray(cached)) extraSidebarLinks = cached;
    } catch (e) { extraSidebarLinks = []; }
}

if (isMenuAlumno && !isErrorPage) {
    document.body.innerHTML = '';

    let logoUrl = chrome.runtime.getURL('icons/UTN_logo.png');
    if (!logoUrl || logoUrl.startsWith('undefined')) {
        logoUrl = chrome.runtime.getURL('ModernSysacad/icons/UTN_logo.png');
    }

    const heroContainer = document.createElement('div');
    heroContainer.style.position = 'fixed';
    heroContainer.style.top = '50%';
    heroContainer.style.left = '50%';
    heroContainer.style.transform = 'translate(-50%, -50%)';
    heroContainer.style.display = 'flex';
    heroContainer.style.flexDirection = 'column';
    heroContainer.style.alignItems = 'center';
    heroContainer.style.justifyContent = 'center';
    heroContainer.style.gap = '24px';
    heroContainer.style.width = '100%';

    heroContainer.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
            <img src="${logoUrl}" alt="UTN Logo" style="width: 90px; height: 90px; object-fit: contain;">
            <div style="text-align: left; line-height: 1.15; font-family: var(--font-family); color: var(--text-primary);">
                <div style="font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">Universidad Tecnológica Nacional</div>
                <div style="font-size: 28px; font-weight: 900; letter-spacing: -0.02em;">Facultad Regional ${regionalName}</div>
            </div>
        </div>
        <div style="text-align: center; line-height: 1.4; font-family: var(--font-family); color: var(--text-secondary);">
            <div style="font-size: 20px; font-weight: 500;">Sistema Académico SYSACAD</div>
            <div style="font-size: 20px; font-weight: 500;">Módulo de autogestión alumnos</div>
        </div>
    `;

    document.body.appendChild(heroContainer);
} else if (isMenuAlumno && isErrorPage) {
    const errorText = document.querySelector('.textoError').textContent.replace('ERROR:', '').trim();
    document.body.innerHTML = '';
    document.body.style.backgroundColor = 'var(--bg-primary)';

    const errorCard = document.createElement('div');
    errorCard.style.position = 'fixed';
    errorCard.style.top = '50%';
    errorCard.style.left = '50%';
    errorCard.style.transform = 'translate(-50%, -50%)';
    errorCard.style.backgroundColor = 'var(--bg-secondary)';
    errorCard.style.padding = '32px';
    errorCard.style.borderRadius = '12px';
    errorCard.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
    errorCard.style.textAlign = 'center';
    errorCard.style.fontFamily = 'var(--font-family)';
    errorCard.style.color = 'var(--text-primary)';
    errorCard.style.maxWidth = '400px';
    errorCard.style.width = '90%';

    errorCard.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Error de inicio de sesión</h2>
        <p style="margin: 0 0 24px 0; color: var(--text-secondary); font-size: 16px; line-height: 1.5;">${errorText}</p>
        <a href="loginAlumno.asp" class="btn-modern btn-primary" style="display: inline-flex; width: 100%; justify-content: center; box-sizing: border-box;">Volver al Login</a>
    `;

    document.body.appendChild(errorCard);
} else {
    const tituloElements = document.querySelectorAll('h2.titulo');

    for (const h2 of tituloElements) {
        if (h2.textContent.includes('Universidad Tecn') || h2.textContent.includes('Facultad Regional')) {
            let logoUrl = chrome.runtime.getURL('icons/UTN_logo.png');
            if (!logoUrl || logoUrl.startsWith('undefined')) {
                logoUrl = chrome.runtime.getURL('ModernSysacad/icons/UTN_logo.png');
            }

            h2.innerHTML = `
                <div style="position: relative; display: inline-block; text-align: left; line-height: 1.2; font-family: var(--font-family); font-weight: 800; color: var(--text-primary); white-space: nowrap;">
                    <img src="${logoUrl}" alt="UTN Logo" style="position: absolute; right: 100%; margin-right: 15px; top: 50%; transform: translateY(-50%); width: 65px; height: 65px; object-fit: contain;">
                    <div>Universidad Tecnológica Nacional</div>
                    <div>Facultad Regional ${regionalName}</div>
                </div>
            `;

            h2.style.display = 'block';
            h2.style.width = '100%';
            h2.style.textAlign = 'center';
            h2.style.margin = '0 0 10px 0';
            h2.style.padding = '0';
            break;
        }
    }
}

const matchId = window.location.search.match(/id=([^&]+)/);
const sessionId = matchId ? `?id=${matchId[1]}` : '';

const sidebarLinks = [
    { text: 'Inicio', href: `menuAlumno.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>` },
    { text: 'Materias del plan', href: `materiasPlan.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>` },
    { text: 'Estado académico', href: `estadoAcademico.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>` },
    { text: 'Exámenes', href: `examenes.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>` },
    { text: 'Cursado / Notas de parciales', href: `notasParciales.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>` },
    { text: 'Correlatividad para cursar', href: `correlatividadCursado.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>` },
    { text: 'Correlatividad para rendir', href: `correlatividadExamen.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>` },
    { text: 'Descarga de certificados', href: `menuCertificados.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>` },
    { text: 'Inscripción a examen', href: `materiasExamen.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="12" y1="14" x2="12" y2="18"></line><line x1="10" y1="16" x2="14" y2="16"></line></svg>` },
    { text: 'Inscripción a cursado', href: `materiasCursado.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>` },
    { text: 'Cambio de Contraseña', href: `cambioPassword.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>` },
    { text: 'Avisos', href: `menuAvisosAlumnos.asp${sessionId}`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>` },
    { text: 'Salir', href: `loginAlumno.asp?refrescar`, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>` }
];

if (!isLogin) {
    const hamburgerBtn = document.createElement('div');
    hamburgerBtn.id = 'hamburger-btn';
    hamburgerBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    document.body.appendChild(hamburgerBtn);
}

const themeBtn = document.createElement('div');
themeBtn.id = 'theme-btn';
if (isLogin) {
    themeBtn.style.setProperty('top', '24px', 'important');
}

const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

const isDarkMode = localStorage.getItem('sysacad_dark_mode') === 'true';
if (isDarkMode) {
    document.documentElement.classList.add('dark');
    themeBtn.innerHTML = sunIcon;
} else {
    themeBtn.innerHTML = moonIcon;
}
document.body.appendChild(themeBtn);

themeBtn.addEventListener('click', () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark');
    if (isCurrentlyDark) {
        document.documentElement.classList.remove('dark');
        themeBtn.innerHTML = moonIcon;
        localStorage.setItem('sysacad_dark_mode', 'false');
    } else {
        document.documentElement.classList.add('dark');
        themeBtn.innerHTML = sunIcon;
        localStorage.setItem('sysacad_dark_mode', 'true');
    }
});

const cafecitoBtn = document.createElement('a');
cafecitoBtn.id = 'cafecito-btn';
cafecitoBtn.href = 'https://cafecito.app/inakigarcia';
cafecitoBtn.target = '_blank';
cafecitoBtn.title = 'Si te ahorré el dolor de ojos, invitame un cafecito';
if (isLogin) {
    cafecitoBtn.style.setProperty('top', '84px', 'important');
}
cafecitoBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`;
document.body.appendChild(cafecitoBtn);

const githubBtn = document.createElement('a');
githubBtn.id = 'github-btn';
githubBtn.href = 'https://github.com/inakigarcia1/modern-sysacad';
githubBtn.target = '_blank';
githubBtn.title = 'Colaborá con el código acá';
if (isLogin) {
    githubBtn.style.setProperty('top', '144px', 'important');
}
githubBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
document.body.appendChild(githubBtn);

if (!isLogin) {
    const sidebar = document.createElement('nav');
    sidebar.id = 'modern-sidebar';

    let linksHtml = '';
    const allSidebarLinks = [...extraSidebarLinks, ...sidebarLinks];
    allSidebarLinks.forEach(link => {
        const targetAttr = link.external ? ' target="_blank" rel="noopener"' : '';
        linksHtml += `
            <li>
                <a href="${link.href}"${targetAttr}>
                    ${link.svg}
                    <span>${link.text}</span>
                </a>
            </li>
        `;
    });

    sidebar.innerHTML = `
        <div class="sidebar-header">SYSACAD</div>
        <ul class="sidebar-menu">
            ${linksHtml}
        </ul>
    `;
    document.body.appendChild(sidebar);

    const isSidebarOpen = localStorage.getItem('sysacad_sidebar_open') === 'true';
    if (isSidebarOpen) {
        document.body.classList.add('sidebar-open');
        sidebar.classList.add('open');
    }

    const hamburgerBtn = document.getElementById('hamburger-btn');
    hamburgerBtn.addEventListener('click', () => {
        const willOpen = !sidebar.classList.contains('open');
        sidebar.classList.toggle('open', willOpen);
        document.body.classList.toggle('sidebar-open', willOpen);
        localStorage.setItem('sysacad_sidebar_open', willOpen);
    });
}

if (window.location.href.toLowerCase().includes('estadoacademico.asp')) {
    const dataTable = document.querySelector('table[border="1"]');
    if (dataTable) {
        let sum = 0;
        let count = 0;
        const yearStats = {};

        const rows = dataTable.querySelectorAll('tr.textoTabla');
        rows.forEach(row => {
            const tds = row.querySelectorAll('td');
            if (tds.length >= 3) {
                const yearStr = tds[0].textContent.trim();
                const estadoTexto = tds[2].textContent.trim();

                const match = estadoTexto.match(/aprobada con (\d+)/i);
                if (match && match[1]) {
                    const nota = parseInt(match[1]);
                    sum += nota;
                    count++;

                    const yearNum = parseInt(yearStr);
                    if (!isNaN(yearNum) && yearNum !== 0) {
                        if (!yearStats[yearNum]) {
                            yearStats[yearNum] = { sum: 0, count: 0 };
                        }
                        yearStats[yearNum].sum += nota;
                        yearStats[yearNum].count++;
                    }
                }
            }
        });

        if (count > 0) {
            const promedio = (sum / count).toFixed(2);

            const banner = document.createElement('div');
            banner.className = 'promedio-banner';
            banner.innerHTML = `
                <div class="promedio-title">Promedio Académico</div>
                <div class="promedio-value">${promedio}</div>
                <div class="promedio-subtitle">Basado en ${count} materias con nota numérica</div>
            `;

            dataTable.parentNode.insertBefore(banner, dataTable);

            const years = Object.keys(yearStats).map(Number).sort((a, b) => a - b);
            if (years.length > 0) {
                const yearTable = document.createElement('table');
                yearTable.setAttribute('border', '1');
                yearTable.style.maxWidth = '500px';
                yearTable.style.margin = '0 auto 24px auto';

                let tableHtml = `
                    <thead>
                        <tr>
                            <th>Año</th>
                            <th>Materias Aprobadas</th>
                            <th>Promedio</th>
                        </tr>
                    </thead>
                    <tbody>
                `;

                years.forEach(year => {
                    const stats = yearStats[year];
                    const avg = (stats.sum / stats.count).toFixed(2);
                    tableHtml += `
                        <tr class="textoTabla">
                            <td style="font-weight: 800; color: var(--text-primary);">${year}º Año</td>
                            <td>${stats.count}</td>
                            <td style="font-weight: 800; color: var(--primary-color);">${avg}</td>
                        </tr>
                    `;
                });

                tableHtml += `
                    </tbody>
                `;

                yearTable.innerHTML = tableHtml;
                dataTable.parentNode.insertBefore(yearTable, dataTable);
            }
        }
    }
}

const tituloTabla = document.querySelector('.tituloTabla');
if (tituloTabla && tituloTabla.textContent.toLowerCase().includes('exámenes')) {
    const tableExamenes = document.querySelector('table[border="1"]');
    if (tableExamenes) {
        let sumConAplazos = 0;
        let countConAplazos = 0;
        let sumSinAplazos = 0;
        let countSinAplazos = 0;

        const textToNum = {
            'diez': 10, 'nueve': 9, 'ocho': 8, 'siete': 7, 'seis': 6, 'cinco': 5,
            'cuatro': 4, 'tres': 3, 'dos': 2, 'uno': 1
        };

        const rows = tableExamenes.querySelectorAll('tr.textoTabla');
        rows.forEach(row => {
            const tds = row.querySelectorAll('td');
            if (tds.length >= 3) {
                const notaTexto = tds[2].textContent.trim().toLowerCase();
                const nota = textToNum[notaTexto];

                if (nota !== undefined) {
                    sumConAplazos += nota;
                    countConAplazos++;

                    if (nota > 5) {
                        sumSinAplazos += nota;
                        countSinAplazos++;
                    }

                    tds[2].textContent = nota;
                }
            }
        });

        if (countConAplazos > 0) {
            const promedioConAplazos = (sumConAplazos / countConAplazos).toFixed(2);
            const promedioSinAplazos = countSinAplazos > 0 ? (sumSinAplazos / countSinAplazos).toFixed(2) : '-';

            const container = document.createElement('div');
            container.className = 'promedios-container';
            container.innerHTML = `
                <div class="promedio-banner">
                    <div class="promedio-title">Promedio Con Aplazos</div>
                    <div class="promedio-value">${promedioConAplazos}</div>
                    <div class="promedio-subtitle">Basado en ${countConAplazos} notas</div>
                </div>
                <div class="promedio-banner" style="background: linear-gradient(135deg, #10b981, #059669) !important;">
                    <div class="promedio-title">Promedio Sin Aplazos</div>
                    <div class="promedio-value">${promedioSinAplazos}</div>
                    <div class="promedio-subtitle">Basado en ${countSinAplazos} notas aprobadas</div>
                </div>
            `;

            tableExamenes.parentNode.insertBefore(container, tableExamenes);
        }
    }
}

if (window.location.href.toLowerCase().includes('notasparciales.asp')) {
    const dataTable = document.querySelector('table[border="1"]');
    if (dataTable) {
        const rows = dataTable.querySelectorAll('tr.textoTabla');
        rows.forEach(row => {
            const tds = row.querySelectorAll('td');
            if (tds.length >= 2) {
                const materiaTd = tds[1];
                const link = materiaTd.querySelector('a');
                if (link) {
                    const materiaNombre = link.textContent.trim();
                    materiaTd.innerHTML = materiaNombre;
                    materiaTd.style.fontWeight = '600';
                    materiaTd.style.color = 'var(--text-primary)';
                }
            }
        });
    }
}

if (window.location.href.toLowerCase().includes('menucertificados.asp')) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    const nodesToWrap = [];
    while ((node = walker.nextNode())) {
        if (node.nodeValue.trim().toLowerCase() === 'descarga de certificados') {
            nodesToWrap.push(node);
        }
    }

    nodesToWrap.forEach(textNode => {
        if (textNode.parentElement && textNode.parentElement.closest('#modern-sidebar')) return;

        const div = document.createElement('div');
        div.textContent = textNode.nodeValue.trim();
        div.style.fontSize = '1.4rem';
        div.style.fontWeight = '800';
        div.style.color = 'var(--text-primary)';
        div.style.marginBottom = '20px';
        div.style.marginTop = '10px';
        div.style.textAlign = 'left';
        div.style.letterSpacing = '-0.02em';

        textNode.parentNode.replaceChild(div, textNode);
    });

    const links = document.querySelectorAll('ul.textoTabla li a');
    links.forEach(link => {
        if (!link.querySelector('.cert-icon')) {
            const iconSvg = `<svg class="cert-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 14px; color: var(--primary-color); flex-shrink: 0;"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`;
            link.insertAdjacentHTML('afterbegin', iconSvg);
        }
    });
}

if (window.location.href.toLowerCase().includes('certalreg.asp') || window.location.href.toLowerCase().includes('actividadacademica.asp')) {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        if (link.closest('#modern-sidebar') || link.closest('#hamburger-btn')) return;

        const text = link.textContent.trim().toLowerCase();
        link.classList.add('btn-modern');

        let iconSvg = '';
        if (text.includes('descargar')) {
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px; flex-shrink: 0;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
            link.classList.add('btn-primary');
        } else if (text.includes('volver')) {
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px; flex-shrink: 0;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`;
        }

        if (!link.querySelector('svg')) {
            link.innerHTML = iconSvg + `<span>${link.textContent.trim()}</span>`;
        }
    });
}

const allLinks = document.querySelectorAll('a');
allLinks.forEach(link => {
    if (link.closest('#modern-sidebar') || link.closest('#hamburger-btn')) return;

    const text = link.textContent.trim().toLowerCase();

    if (text.includes('imprimir esta pantalla') || (link.href && link.href.toLowerCase().includes('window.print'))) {
        link.classList.add('btn-modern');
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px; flex-shrink: 0;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`;

        if (!link.querySelector('svg')) {
            link.innerHTML = iconSvg + `<span>${link.textContent.trim()}</span>`;
        }
    }

    if (text === 'inscribir') {
        link.classList.add('btn-modern', 'btn-primary', 'btn-sm');
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; flex-shrink: 0;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
        if (!link.querySelector('svg')) {
            link.innerHTML = iconSvg + `<span>${link.textContent.trim()}</span>`;
        }
    }

    if (text.startsWith('volver')) {
        link.classList.add('btn-modern');
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px; flex-shrink: 0;"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`;
        if (!link.querySelector('svg')) {
            link.innerHTML = iconSvg + `<span>${link.textContent.trim()}</span>`;
        }
    }

    if (text === 'certificado de exámenes' || text === 'certificado de examenes') {
        link.classList.add('btn-modern');
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 12px; flex-shrink: 0;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        if (!link.querySelector('svg')) {
            link.innerHTML = iconSvg + `<span>${link.textContent.trim()}</span>`;
        }
    }
});
