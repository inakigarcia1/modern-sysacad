/*
 * frro.js — Lógica específica de la Facultad Regional Rosario (FRRo).
 *
 * Se inyecta DESPUÉS de common/common.js (mismo bloque del manifest, en
 * document_idle), por lo que reutiliza todo lo de common (sidebar, modo oscuro,
 * promedios, botones, etc.). Acá solo vive el delta propio de Rosario; NO se
 * duplica código de common.
 *
 * Variables globales que consume de common.js:
 *   - isLogin       (flag de página de login)
 *   - sidebarLinks  (links base del sidebar)
 *
 * Los links extra del menú (Calendario, Trámites) los lee y cachea
 * frro-capture.js en document_start; acá solo se leen del cache.
 *
 * Qué hace Rosario sobre el común:
 *   1. Antepone al sidebar los links extra cacheados desde el menú principal.
 *   2. Quita "Inicio" del sidebar (en Rosario el menú principal ya cumple esa
 *      función de navegación).
 */

const FRRO_REGIONAL_CODE = (window.location.hostname.toLowerCase().match(/fr[a-z]+/) || [''])[0];
const FRRO_EXTRA_LINKS_STORAGE_KEY = `sysacad_extra_links_${FRRO_REGIONAL_CODE}`;

/**
 * Lee los links extra cacheados por frro-capture.js.
 * @returns {Array<{text:string, href:string, svg:string, external:boolean}>}
 */
function getExtraSidebarLinks() {
    try {
        const cached = JSON.parse(localStorage.getItem(FRRO_EXTRA_LINKS_STORAGE_KEY) || '[]');
        return Array.isArray(cached) ? cached : [];
    } catch (e) {
        return [];
    }
}

/**
 * Reescribe el sidebar que common.js ya construyó, aplicando los ajustes de
 * Rosario: antepone los links extra y quita "Inicio".
 */
function patchSidebar() {
    const menu = document.querySelector('#modern-sidebar .sidebar-menu');
    if (!menu) return;

    // En Rosario el menú principal ya cumple la función de "Inicio". Filtramos
    // por href (más estable que por el texto, que common podría cambiar).
    const baseLinks = sidebarLinks.filter(l => !l.href.toLowerCase().startsWith('menualumno.asp'));
    const allLinks = [...getExtraSidebarLinks(), ...baseLinks];

    menu.innerHTML = allLinks.map(link => {
        const targetAttr = link.external ? ' target="_blank" rel="noopener"' : '';
        return `
            <li>
                <a href="${link.href}"${targetAttr}>
                    ${link.svg}
                    <span>${link.text}</span>
                </a>
            </li>
        `;
    }).join('');
}

// common.js solo dibuja el sidebar cuando la página no es de login.
if (!isLogin) {
    patchSidebar();
}
