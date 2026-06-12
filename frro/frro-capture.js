/*
 * frro-capture.js — Captura temprana de links extra de la FRRo.
 *
 * Se inyecta en `document_start`, ANTES que common/common.js (que corre en
 * `document_idle` y vacía el body en la página del menú). Su única tarea es
 * leer del menú principal los links propios de Rosario (Calendario, Trámites)
 * y cachearlos en localStorage, para que frro.js pueda reconstruir el sidebar
 * en cualquier página, incluso donde ese menú ya no está disponible.
 *
 * Usa un MutationObserver para capturar los links en cuanto aparecen en el DOM,
 * garantizando que se leen antes de que common borre el body sin depender del
 * orden exacto de ejecución entre content scripts.
 *
 * No depende de common.js ni produce UI: solo lee y cachea.
 */
(() => {
    const regionalCode = (window.location.hostname.toLowerCase().match(/fr[a-z]+/) || [''])[0];
    const STORAGE_KEY = `sysacad_extra_links_${regionalCode}`;

    const isMenuAlumno = window.location.href.toLowerCase().includes('menualumno.asp');
    if (!isMenuAlumno) return;

    // Texto del link en el menú -> ícono a mostrar luego en el sidebar.
    const extraLinkConfig = [
        { match: 'calendario', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>` },
        { match: 'tramites', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="menu-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>` },
    ];

    // Normaliza texto: minúsculas y sin diacríticos.
    const normalizeText = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

    let captured = false;

    /**
     * Lee los links extra del menú. Devuelve true si encontró el menú (haya o
     * no links que matcheen), false si el menú todavía no está en el DOM.
     */
    function tryCapture() {
        if (captured) return true;

        const anchors = document.querySelectorAll('ul.textoTabla li a');
        if (!anchors.length) return false;

        const links = [];
        anchors.forEach(a => {
            const text = a.textContent.trim();
            const cfg = extraLinkConfig.find(c => normalizeText(text).includes(c.match));
            if (cfg && a.href) {
                links.push({ text, href: a.href, svg: cfg.svg, external: a.target === '_blank' });
            }
        });

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
        } catch (e) { /* ignorar: localStorage puede no estar disponible */ }

        captured = true;
        return true;
    }

    // Intento inmediato (por si el DOM ya tiene el menú).
    if (tryCapture()) return;

    // Si no, observo el DOM y capturo en cuanto aparezca el menú, antes de que
    // common (document_idle) lo borre.
    const observer = new MutationObserver(() => {
        if (tryCapture()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // Red de seguridad 1: cuando el documento termine de parsear, último intento
    // y dejar de observar. Solo aplica si el script corrió en fase 'loading'
    // (lo normal para document_start).
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            tryCapture();
            observer.disconnect();
        }, { once: true });
    }

    // Red de seguridad 2: nunca dejar el observer corriendo indefinidamente
    // (ej. el menú nunca aparece, o DOMContentLoaded ya había pasado al inyectar).
    setTimeout(() => observer.disconnect(), 10000);
})();
