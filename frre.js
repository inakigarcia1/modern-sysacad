/**
 * ModernSysacad - FRRe variant
 * Soporta SYSACAD-WEB (https://sysacadweb.frre.utn.edu.ar/)
 *
 * Stack del sitio destino: Bootstrap 3 + jQuery 1.11 + Modernizr 2.8.3
 * Estructura: div#wrapper.toggled > nav#sidebar-wrapper + div.top-nav + div.container > .page-generic
 */
(function () {
    'use strict';

    const ICONS = {
        sun: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>',
        moon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>',
        github: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>',
        cafecito: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
        search: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
        check: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const TEXT_TO_NUM = {
        diez: 10, nueve: 9, ocho: 8, siete: 7, seis: 6,
        cinco: 5, cuatro: 4, tres: 3, dos: 2, uno: 1, cero: 0
    };

    const STORAGE = {
        darkMode: 'sysacad_dark_mode',
        planTotal: 'sysacad_plan_total',
        planTotalTime: 'sysacad_plan_total_time'
    };

    // ---------- DOM helpers ----------

    function el(tag, opts = {}, children = []) {
        const node = document.createElement(tag);
        if (opts.className) node.className = opts.className;
        if (opts.attrs) {
            for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
        }
        if (opts.html != null) node.innerHTML = opts.html;
        if (opts.text != null) node.textContent = opts.text;
        for (const c of children) if (c) node.appendChild(c);
        return node;
    }

    function findTableByHeaders(...required) {
        const tables = document.querySelectorAll('table');
        for (const t of tables) {
            const headers = [...t.querySelectorAll('thead th')].map(h => h.textContent.trim().toLowerCase());
            if (required.every(r => headers.includes(r.toLowerCase()))) {
                return { table: t, headers };
            }
        }
        return null;
    }

    function normalizeText(s) {
        // Quita diacríticos: "Física" → "fisica", "Inglés" → "ingles"
        return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function reducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Animación count-up: anima un número desde 0 hasta `end` con easing.
     * Respeta prefers-reduced-motion.
     */
    function animateValue(el, end, opts = {}) {
        const { duration = 700, decimals = 2, suffix = '' } = opts;
        if (reducedMotion() || !isFinite(end)) {
            el.textContent = (decimals > 0 ? end.toFixed(decimals) : Math.round(end)) + suffix;
            return;
        }
        const startTime = performance.now();
        function step(now) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            const current = end * eased;
            el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toString()) + suffix;
            if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }


    /**
     * Obtiene la cantidad total de materias del plan.
     * 1° intenta localStorage (con freshness de 7 días).
     * 2° si no hay cache, fetch a /Alumnos/Materias_del_Plan/ usando la sesión actual.
     * Retorna 0 si nada funciona.
     */
    async function getPlanTotal() {
        const cached = parseInt(localStorage.getItem(STORAGE.planTotal) || '0', 10);
        const cachedTime = parseInt(localStorage.getItem(STORAGE.planTotalTime) || '0', 10);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (cached > 0 && Date.now() - cachedTime < sevenDays) {
            return cached;
        }

        try {
            const resp = await fetch('/Alumnos/Materias_del_Plan/', {
                credentials: 'same-origin'
            });
            if (!resp.ok) return cached || 0;
            const html = await resp.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            for (const t of doc.querySelectorAll('table')) {
                const headers = [...t.querySelectorAll('thead th')]
                    .map(h => h.textContent.trim().toLowerCase());
                if (headers.includes('año') && headers.includes('se cursa')) {
                    const rows = t.querySelectorAll('tbody tr');
                    if (rows.length > 0) {
                        localStorage.setItem(STORAGE.planTotal, String(rows.length));
                        localStorage.setItem(STORAGE.planTotalTime, String(Date.now()));
                        return rows.length;
                    }
                }
            }
        } catch (e) {
            // Silent fail: progress bar simplemente no aparece
        }
        return cached || 0;
    }

    // ---------- Components ----------

    function makeBanner({ title, value, subtitle, variant }) {
        const node = el('div', {
            className: 'ms-banner' + (variant ? ' ms-banner-' + variant : ''),
            html: `
                <div class="ms-banner-title">${title}</div>
                <div class="ms-banner-value">${value}</div>
                <div class="ms-banner-subtitle">${subtitle}</div>
            `
        });
        // Count-up si el valor es numérico (preserva decimales del input)
        const num = parseFloat(value);
        if (isFinite(num)) {
            const valueEl = node.querySelector('.ms-banner-value');
            const decimals = String(value).includes('.') ? (String(value).split('.')[1] || '').length : 0;
            requestAnimationFrame(() => animateValue(valueEl, num, { duration: 800, decimals }));
        }
        return node;
    }

    function makeStatRow(stats) {
        const row = el('div', { className: 'ms-stat-row' });
        stats.forEach((s, i) => {
            const card = el('div', {
                className: 'ms-stat-card ms-stat-' + s.kind,
                html: `
                    <div class="ms-stat-label">${s.label}</div>
                    <div class="ms-stat-value">${s.value}</div>
                `
            });
            // Stagger entrance: cada card entra ~70ms después de la anterior
            card.style.setProperty('--ms-stagger-index', i);
            row.appendChild(card);

            // Count-up del valor (todos son integers en stat row)
            const num = parseFloat(s.value);
            if (isFinite(num)) {
                const valueEl = card.querySelector('.ms-stat-value');
                requestAnimationFrame(() => animateValue(valueEl, num, { duration: 700, decimals: 0 }));
            }
        });
        return row;
    }

    function makeProgress({ done, total, label = 'Progreso de carrera', breakdown = '' }) {
        // Guard contra total inválido (0, NaN, negativo): la barra no se renderiza
        // con un width Infinity/NaN. Clamp resultado a 0..100.
        const safeDone = isFinite(done) && done >= 0 ? done : 0;
        const safeTotal = isFinite(total) && total > 0 ? total : 0;
        const rawPct = safeTotal > 0 ? (safeDone / safeTotal) * 100 : 0;
        const pct = Math.round(Math.max(0, Math.min(100, rawPct)));
        const node = el('div', {
            className: 'ms-progress-card',
            html: `
                <div class="ms-progress-head">
                    <div class="ms-progress-title">${label}</div>
                    <div class="ms-progress-pct">0%</div>
                </div>
                <div class="ms-progress-track">
                    <div class="ms-progress-fill" style="width: 0%"></div>
                </div>
                <div class="ms-progress-foot">${breakdown}</div>
            `
        });
        // Doble rAF: garantiza que el width:0 se commitea antes del cambio,
        // así la transición CSS del .ms-progress-fill (.6s ease) dispara correctamente
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const fill = node.querySelector('.ms-progress-fill');
                if (fill) fill.style.width = pct + '%';
                const pctEl = node.querySelector('.ms-progress-pct');
                if (pctEl) animateValue(pctEl, pct, { duration: 800, decimals: 0, suffix: '%' });
            });
        });
        return node;
    }

    function makeSearchInput({ placeholder, table }) {
        const wrap = el('div', {
            className: 'ms-search-wrap',
            html: `
                <span class="ms-search-icon">${ICONS.search}</span>
                <input type="text" class="ms-search-input" placeholder="${placeholder}">
            `
        });
        const input = wrap.querySelector('input');
        const rows = table.querySelectorAll('tbody tr');

        // Pre-normalizamos el texto de cada fila para que el filtro sea instantáneo
        // y accent-insensitive ("fisica" matchea "Física")
        const rowTexts = [...rows].map(r => normalizeText(r.textContent));

        input.addEventListener('input', () => {
            const q = normalizeText(input.value.trim());
            const tokens = q.split(/\s+/).filter(Boolean);
            rows.forEach((row, i) => {
                if (tokens.length === 0) {
                    row.style.display = '';
                    return;
                }
                const txt = rowTexts[i];
                const match = tokens.every(t => txt.includes(t));
                row.style.display = match ? '' : 'none';
            });
        });
        return wrap;
    }

    // ---------- FAB stack (theme + cafecito + github) ----------

    function initThemeAndFabs() {
        const isDark = localStorage.getItem(STORAGE.darkMode) === 'true';
        if (isDark) document.documentElement.classList.add('ms-dark');

        const stack = el('div', { attrs: { id: 'ms-fab-stack' } });

        const themeBtn = el('button', {
            className: 'ms-fab',
            attrs: { type: 'button', id: 'ms-theme-btn', title: 'Cambiar tema claro/oscuro' },
            html: isDark ? ICONS.sun : ICONS.moon
        });
        themeBtn.addEventListener('click', (e) => {
            const nowDark = !document.documentElement.classList.contains('ms-dark');
            const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            const applyChange = () => {
                document.documentElement.classList.toggle('ms-dark', nowDark);
                themeBtn.innerHTML = nowDark ? ICONS.sun : ICONS.moon;
                localStorage.setItem(STORAGE.darkMode, String(nowDark));
            };

            if (reduceMotion) {
                applyChange();
                return;
            }

            // Path moderno: View Transitions API — circular reveal desde el click
            if (typeof document.startViewTransition === 'function') {
                const x = e.clientX;
                const y = e.clientY;
                const endRadius = Math.hypot(
                    Math.max(x, window.innerWidth - x),
                    Math.max(y, window.innerHeight - y)
                );
                const html = document.documentElement;
                html.style.setProperty('--ms-reveal-x', `${x}px`);
                html.style.setProperty('--ms-reveal-y', `${y}px`);
                html.style.setProperty('--ms-reveal-radius', `${endRadius}px`);
                document.startViewTransition(applyChange);
                return;
            }

            // Fallback: transición global suave durante ~320ms
            document.documentElement.classList.add('ms-switching');
            applyChange();
            setTimeout(() => {
                document.documentElement.classList.remove('ms-switching');
            }, 320);
        });

        const cafecitoBtn = el('a', {
            className: 'ms-fab',
            attrs: {
                id: 'ms-cafecito-btn',
                href: 'https://cafecito.app/inakigarcia',
                target: '_blank',
                rel: 'noopener',
                title: 'Si esto te ahorró el dolor de ojos, invitale un cafecito al autor original'
            },
            html: ICONS.cafecito
        });

        const githubBtn = el('a', {
            className: 'ms-fab',
            attrs: {
                id: 'ms-github-btn',
                href: 'https://github.com/inakigarcia1/modern-sysacad',
                target: '_blank',
                rel: 'noopener',
                title: 'Repositorio en GitHub'
            },
            html: ICONS.github
        });

        // Credits / info: 4° FAB con popup de colaboradores FRRe
        const creditsAnchor = el('div', { className: 'ms-fab-anchor' });
        const creditsBtn = el('button', {
            className: 'ms-fab',
            attrs: {
                type: 'button',
                id: 'ms-credits-btn',
                title: 'Acerca de esta versión',
                'aria-expanded': 'false',
                'aria-controls': 'ms-credits-popup'
            },
            html: ICONS.info
        });
        const creditsPopup = el('div', {
            attrs: {
                id: 'ms-credits-popup',
                role: 'dialog',
                'aria-label': 'Créditos de la versión FRRe'
            },
            className: 'ms-credits-popup',
            html: `
                <div class="ms-credits-head">
                    <div class="ms-credits-title">ModernSysacad <span class="ms-credits-tag">FRRe</span></div>
                    <div class="ms-credits-subtitle">Adaptación a la Facultad Regional Resistencia</div>
                </div>
                <div class="ms-credits-section">
                    <div class="ms-credits-label">Colaboradores</div>
                    <ul class="ms-credits-list">
                        <li><a href="https://github.com/tomaskoblukUTN" target="_blank" rel="noopener">Kobluk, T.</a></li>
                        <li><a href="https://github.com/gonzaFidanza" target="_blank" rel="noopener">Fidanza, G.</a></li>
                        <li><a href="https://github.com/lorenzoarduinoh" target="_blank" rel="noopener">Arduino, L.</a></li>
                    </ul>
                </div>
                <div class="ms-credits-foot">
                    Basado en <a href="https://github.com/inakigarcia1/modern-sysacad" target="_blank" rel="noopener">ModernSysacad</a> por Iñaki García.
                </div>
            `
        });
        creditsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = creditsPopup.classList.toggle('is-open');
            creditsBtn.setAttribute('aria-expanded', String(isOpen));
        });
        // Click afuera cierra el popup
        document.addEventListener('click', (e) => {
            if (!creditsPopup.classList.contains('is-open')) return;
            if (creditsPopup.contains(e.target) || creditsBtn.contains(e.target)) return;
            creditsPopup.classList.remove('is-open');
            creditsBtn.setAttribute('aria-expanded', 'false');
        });
        // Escape cierra
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && creditsPopup.classList.contains('is-open')) {
                creditsPopup.classList.remove('is-open');
                creditsBtn.setAttribute('aria-expanded', 'false');
                creditsBtn.focus();
            }
        });
        creditsAnchor.appendChild(creditsBtn);
        creditsAnchor.appendChild(creditsPopup);

        stack.appendChild(themeBtn);
        stack.appendChild(cafecitoBtn);
        stack.appendChild(githubBtn);
        stack.appendChild(creditsAnchor);
        document.body.appendChild(stack);
    }

    // ---------- Pages ----------

    function handleEstadoAcademico() {
        const found = findTableByHeaders('Año', 'Materia', 'Estado', 'Plan');
        if (!found) return;
        const { table } = found;

        let sumNota = 0;
        let countAprobada = 0;
        let countEquiv = 0;
        let countCursando = 0;
        const yearStats = {};

        table.querySelectorAll('tbody tr').forEach(row => {
            const tds = row.querySelectorAll('td');
            if (tds.length < 3) return;

            const yearStr = tds[0].textContent.trim();
            const estadoCell = tds[2];
            const estado = estadoCell.textContent.trim();

            estadoCell.classList.add('ms-status');
            if (/^aprobada con/i.test(estado)) {
                estadoCell.classList.add('ms-status-aprobada');
                countAprobada++;
            } else if (/^aprobada en/i.test(estado)) {
                estadoCell.classList.add('ms-status-equiv');
                countEquiv++;
            } else if (/^cursa/i.test(estado)) {
                estadoCell.classList.add('ms-status-cursando');
                countCursando++;
            }

            const m = estado.match(/aprobada con (\d+)/i);
            if (!m) return;

            const nota = parseInt(m[1], 10);
            if (isNaN(nota)) return;

            sumNota += nota;

            const yearNum = parseInt(yearStr, 10);
            if (!isNaN(yearNum) && yearNum > 0) {
                if (!yearStats[yearNum]) yearStats[yearNum] = { sum: 0, count: 0 };
                yearStats[yearNum].sum += nota;
                yearStats[yearNum].count++;
            }
        });

        if (countAprobada === 0 && countEquiv === 0 && countCursando === 0) return;

        const enhancements = el('div', { className: 'ms-enhancements' });

        // Banner principal: Promedio Académico
        if (countAprobada > 0) {
            const promedio = (sumNota / countAprobada).toFixed(2);
            enhancements.appendChild(makeBanner({
                title: 'Promedio Académico',
                value: promedio,
                subtitle: `Basado en ${countAprobada} ${countAprobada === 1 ? 'materia' : 'materias'} con nota numérica`
            }));
        }

        // Stat row
        enhancements.appendChild(makeStatRow([
            { kind: 'aprobada', label: 'Aprobadas', value: countAprobada },
            { kind: 'cursando', label: 'Cursando', value: countCursando },
            { kind: 'equiv', label: 'Equivalencias', value: countEquiv }
        ]));

        // Placeholder para la progress bar (se completa async después del fetch)
        const completas = countAprobada + countEquiv;

        // Year stats grid
        const years = Object.keys(yearStats).map(Number).sort((a, b) => a - b);
        if (years.length > 0) {
            const yearGrid = el('div', { className: 'ms-year-grid' });

            const bestYear = years.reduce((best, y) => {
                const avg = yearStats[y].sum / yearStats[y].count;
                return avg > best.avg ? { y, avg } : best;
            }, { y: null, avg: -Infinity });

            years.forEach((y, i) => {
                const s = yearStats[y];
                const avg = s.sum / s.count;
                const card = el('div', {
                    className: 'ms-year-card' + (y === bestYear.y ? ' ms-year-card-best' : ''),
                    html: `
                        <div class="ms-year-label">${y}º Año</div>
                        <div class="ms-year-promedio">${avg.toFixed(2)}</div>
                        <div class="ms-year-count">${s.count} ${s.count === 1 ? 'materia' : 'materias'}</div>
                    `
                });
                card.style.setProperty('--ms-stagger-index', i);
                yearGrid.appendChild(card);

                // Count-up del promedio
                const promedioEl = card.querySelector('.ms-year-promedio');
                requestAnimationFrame(() => animateValue(promedioEl, avg, { duration: 800, decimals: 2 }));
            });

            enhancements.appendChild(yearGrid);
        }

        // Search filter
        enhancements.appendChild(makeSearchInput({
            placeholder: 'Buscar materia…',
            table: table
        }));

        const insertionPoint = table.closest('.table-responsive') || table;
        insertionPoint.parentNode.insertBefore(enhancements, insertionPoint);

        // Progress bar: async para no bloquear el render inicial.
        // Si no hay cache de plan total, fetch a /Alumnos/Materias_del_Plan/
        if (completas > 0) {
            getPlanTotal().then(planTotal => {
                if (planTotal <= 0) return;
                const progress = makeProgress({
                    done: completas,
                    total: planTotal,
                    label: 'Progreso de carrera',
                    breakdown: `<strong>${countAprobada}</strong> aprobadas · <strong>${countEquiv}</strong> equiv. · <strong>${planTotal}</strong> materias en el plan`
                });
                // Insertar entre la stat row y el year grid
                const statRow = enhancements.querySelector('.ms-stat-row');
                if (statRow) {
                    statRow.after(progress);
                } else {
                    enhancements.appendChild(progress);
                }
            });
        }
    }

    function handleExamenes() {
        const found = findTableByHeaders('Fecha', 'Materia', 'Nota');
        if (!found) return;
        const { table, headers } = found;

        const notaIdx = headers.findIndex(h => h === 'nota');
        if (notaIdx < 0) return;

        let sumConAplazos = 0, countConAplazos = 0;
        let sumSinAplazos = 0, countSinAplazos = 0;

        table.querySelectorAll('tbody tr').forEach(row => {
            const tds = row.querySelectorAll('td');
            if (tds.length <= notaIdx) return;

            const cell = tds[notaIdx];
            const text = cell.textContent.trim().toLowerCase();
            const nota = TEXT_TO_NUM[text];
            if (nota === undefined) return;

            sumConAplazos += nota;
            countConAplazos++;

            if (nota > 5) {
                sumSinAplazos += nota;
                countSinAplazos++;
            }

            cell.textContent = nota;
            cell.classList.add('ms-nota-cell');
            cell.classList.add(nota > 5 ? 'ms-nota-aprobada' : 'ms-nota-aplazo');
        });

        if (countConAplazos === 0) return;

        const enhancements = el('div', { className: 'ms-enhancements' });

        // Banners principales
        const promConAplazos = (sumConAplazos / countConAplazos).toFixed(2);
        const promSinAplazos = countSinAplazos > 0 ? (sumSinAplazos / countSinAplazos).toFixed(2) : '—';

        const banners = el('div', { className: 'ms-banners-row' });
        banners.appendChild(makeBanner({
            title: 'Promedio Con Aplazos',
            value: promConAplazos,
            subtitle: `Basado en ${countConAplazos} ${countConAplazos === 1 ? 'nota' : 'notas'}`
        }));
        banners.appendChild(makeBanner({
            title: 'Promedio Sin Aplazos',
            value: promSinAplazos,
            subtitle: `Basado en ${countSinAplazos} ${countSinAplazos === 1 ? 'nota' : 'notas'} aprobadas`,
            variant: 'success'
        }));
        enhancements.appendChild(banners);

        // Stat row
        const countAplazos = countConAplazos - countSinAplazos;
        enhancements.appendChild(makeStatRow([
            { kind: 'neutral', label: 'Total rendidos', value: countConAplazos },
            { kind: 'aprobada', label: 'Aprobados', value: countSinAplazos },
            { kind: 'aplazo', label: 'Aplazos', value: countAplazos }
        ]));

        // Search filter
        enhancements.appendChild(makeSearchInput({
            placeholder: 'Buscar materia…',
            table: table
        }));

        const insertionPoint = table.closest('.table-responsive') || table;
        insertionPoint.parentNode.insertBefore(enhancements, insertionPoint);
    }

    function handleMateriasDelPlan() {
        const found = findTableByHeaders('Año', 'Materia', 'Se Cursa', 'Se Rinde');
        if (!found) return;
        const { table, headers } = found;

        const cursaIdx = headers.findIndex(h => h === 'se cursa');
        const rindeIdx = headers.findIndex(h => h === 'se rinde');

        const rows = table.querySelectorAll('tbody tr');

        // Guardar total del plan en localStorage para usar en Estado Académico (progress bar)
        if (rows.length > 0) {
            localStorage.setItem(STORAGE.planTotal, String(rows.length));
            localStorage.setItem(STORAGE.planTotalTime, String(Date.now()));
        }

        rows.forEach(row => {
            const tds = row.querySelectorAll('td');
            [cursaIdx, rindeIdx].forEach(idx => {
                if (idx < 0 || idx >= tds.length) return;
                const cell = tds[idx];
                const txt = cell.textContent.trim().toLowerCase();
                cell.classList.add('ms-yesno-cell');
                if (txt === 'si' || txt === 'sí') {
                    cell.innerHTML = `<span class="ms-yes" aria-label="Sí">${ICONS.check}</span>`;
                } else {
                    cell.innerHTML = '<span class="ms-no" aria-hidden="true">—</span>';
                }
            });
        });

        // Search filter (la tabla tiene 50+ materias)
        const enhancements = el('div', { className: 'ms-enhancements' });
        enhancements.appendChild(makeSearchInput({
            placeholder: 'Buscar materia…',
            table: table
        }));

        const insertionPoint = table.closest('.table-responsive') || table;
        insertionPoint.parentNode.insertBefore(enhancements, insertionPoint);
    }

    // ---------- Schedule (Materias Actuales) ----------

    const SCHEDULE_COLORS = [
        '#4f63d0', // indigo
        '#10b981', // emerald
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // purple
        '#06b6d4', // cyan
        '#ec4899', // pink
        '#84cc16'  // lime
    ];

    const DAY_INDEX = {
        lunes: 0, martes: 1, miercoles: 2, jueves: 3,
        viernes: 4, sabado: 5, domingo: 6
    };

    // Slots fijos de FRRe (~45 min con recreos de 5-10 min entre bloques).
    // Cada slot tiene start/end en minutos desde medianoche.
    const FRRE_SLOTS = [
        { start:  7*60 + 45, end:  8*60 + 30 },
        { start:  8*60 + 30, end:  9*60 + 15 },
        { start:  9*60 + 15, end: 10*60      },
        { start: 10*60 + 10, end: 10*60 + 55 },
        { start: 10*60 + 55, end: 11*60 + 40 },
        { start: 11*60 + 40, end: 12*60 + 25 },
        { start: 12*60 + 45, end: 13*60 + 30 },
        { start: 13*60 + 30, end: 14*60 + 15 },
        { start: 14*60 + 15, end: 15*60      },
        { start: 15*60,      end: 15*60 + 45 },
        { start: 15*60 + 50, end: 16*60 + 35 },
        { start: 16*60 + 35, end: 17*60 + 20 },
        { start: 17*60 + 20, end: 18*60 +  5 },
        { start: 18*60 + 10, end: 18*60 + 55 },
        { start: 18*60 + 55, end: 19*60 + 40 },
        { start: 19*60 + 40, end: 20*60 + 25 },
        { start: 20*60 + 30, end: 21*60 + 15 },
        { start: 21*60 + 15, end: 22*60      },
        { start: 22*60,      end: 22*60 + 45 }
    ];

    // Un slot está "cubierto" por un evento si hay ≥50% de overlap entre ambos.
    // Esto soporta horarios que arrancan un par de minutos antes/después del slot.
    function slotCovered(event, slot) {
        const overlap = Math.max(0, Math.min(slot.end, event.end) - Math.max(slot.start, event.start));
        return overlap >= (slot.end - slot.start) * 0.5;
    }

    /**
     * Parse strings tipo "Lunes 21:15-22:45, Martes 20:30-22:00".
     * Devuelve array de { dayIdx, start, end } donde start/end son minutos
     * desde medianoche.
     */
    function parseHorarios(text) {
        if (!text) return [];
        const events = [];
        const parts = text.split(/[,;]+/);
        const re = /(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\s+(\d{1,2}):(\d{2})\s*[-a]\s*(\d{1,2}):(\d{2})/;
        for (const part of parts) {
            const norm = normalizeText(part);
            const m = norm.match(re);
            if (!m) continue;
            const dayIdx = DAY_INDEX[m[1]];
            if (dayIdx === undefined) continue;
            const start = parseInt(m[2], 10) * 60 + parseInt(m[3], 10);
            const end = parseInt(m[4], 10) * 60 + parseInt(m[5], 10);
            if (isNaN(start) || isNaN(end) || end <= start) continue;
            events.push({ dayIdx, start, end });
        }
        return events;
    }

    function formatMinutes(mins) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    /**
     * Descarga los horarios como Excel (.xls) usando el formato "Office HTML":
     * Excel abre HTML con MIME application/vnd.ms-excel como una planilla
     * nativa y respeta estilos inline (bg-color, borders, font-weight).
     *
     * Estructura: slot × día. Cada materia tiene un color consistente con
     * la vista web. Solo se incluyen slots con al menos una clase.
     */
    function downloadScheduleXLS(rowsData) {
        const dayCount = 6;
        const fullDayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        // Build slot × day grid; cada celda: { label, color } o null
        const grid = FRRE_SLOTS.map(() => Array(dayCount).fill(null));
        rowsData.forEach((r, i) => {
            const color = SCHEDULE_COLORS[i % SCHEDULE_COLORS.length];
            r.events.forEach(ev => {
                if (ev.dayIdx >= dayCount) return;
                const label = r.comision ? `${r.materia} (${r.comision})` : r.materia;
                FRRE_SLOTS.forEach((s, idx) => {
                    if (slotCovered(ev, s)) grid[idx][ev.dayIdx] = { label, color };
                });
            });
        });

        const usedRows = grid
            .map((row, i) => row.some(c => c) ? i : -1)
            .filter(i => i >= 0);
        if (usedRows.length === 0) return;

        const esc = s => String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');

        // Mezcla un hex con blanco para conseguir un tinte pastel opaco
        // (Excel no maneja alpha en colores HTML)
        const softHex = (hex, mix = 0.22) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            const blend = c => Math.round(c * mix + 255 * (1 - mix));
            const h = c => blend(c).toString(16).padStart(2, '0');
            return `#${h(r)}${h(g)}${h(b)}`;
        };

        let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]><xml>
  <x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
    <x:Name>Agenda Semanal</x:Name>
    <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
  </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook>
</xml><![endif]-->
<style>
  table { border-collapse: collapse; font-family: Arial, sans-serif; }
  th, td { border: 1px solid #cccccc; padding: 8px 10px; vertical-align: middle; text-align: center; font-size: 11pt; font-family: Arial, sans-serif; }
  th { background: #4f63d0; color: #ffffff; font-weight: 700; }
  th.time, td.time { background: #f3f4f6; color: #475569; font-weight: 600; white-space: nowrap; }
</style>
</head>
<body>
<table>
<thead>
<tr>
  <th class="time">Horario</th>`;
        fullDayNames.forEach(name => {
            html += `<th>${esc(name)}</th>`;
        });
        html += `</tr></thead><tbody>`;

        // Matriz para tracking de celdas absorbidas por rowspan de filas anteriores
        const skip = usedRows.map(() => Array(dayCount).fill(false));

        usedRows.forEach((slotIdx, visIdx) => {
            const slot = FRRE_SLOTS[slotIdx];
            const label = `${formatMinutes(slot.start)} a ${formatMinutes(slot.end)}`;
            html += `<tr><td class="time">${esc(label)}</td>`;
            for (let d = 0; d < dayCount; d++) {
                if (skip[visIdx][d]) continue; // celda absorbida por rowspan
                const cell = grid[slotIdx][d];
                if (cell) {
                    // Cuántas filas siguientes tienen la misma materia en esta columna
                    let span = 1;
                    for (let next = visIdx + 1; next < usedRows.length; next++) {
                        const nextCell = grid[usedRows[next]][d];
                        if (nextCell && nextCell.label === cell.label) {
                            span++;
                            skip[next][d] = true;
                        } else {
                            break;
                        }
                    }
                    const rowspanAttr = span > 1 ? ` rowspan="${span}"` : '';
                    const bg = softHex(cell.color);
                    html += `<td${rowspanAttr} style="background:${bg};border-left:3px solid ${cell.color};font-weight:normal;color:#0f172a;vertical-align:middle;text-align:center;font-family:Arial,sans-serif;">${esc(cell.label)}</td>`;
                } else {
                    html += `<td></td>`;
                }
            }
            html += `</tr>`;
        });

        html += `</tbody></table></body></html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'horarios-cursado.xls';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    function openInGoogleCalendar(rowsData) {
        const dayToJS = [1, 2, 3, 4, 5, 6, 0];
        const BYDAY   = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

        function nextOccurrence(dayIdx) {
            const jsDay = dayToJS[dayIdx];
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let diff = jsDay - today.getDay();
            if (diff <= 0) diff += 7;
            const d = new Date(today);
            d.setDate(d.getDate() + diff);
            return d;
        }
        function fmtDate(d) {
            return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
        }
        function fmtTime(mins) {
            return String(Math.floor(mins / 60)).padStart(2, '0') + String(mins % 60).padStart(2, '0') + '00';
        }
        function uid() {
            return Math.random().toString(36).slice(2) + Date.now().toString(36) + '@sysacad-frre';
        }

        const now = new Date();
        const dtstamp = now.getUTCFullYear() +
            String(now.getUTCMonth() + 1).padStart(2, '0') +
            String(now.getUTCDate()).padStart(2, '0') + 'T' +
            String(now.getUTCHours()).padStart(2, '0') +
            String(now.getUTCMinutes()).padStart(2, '0') +
            String(now.getUTCSeconds()).padStart(2, '0') + 'Z';

        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//SYSACAD FRRe//Horarios de Cursado//ES',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:Horarios FRRe',
            'X-WR-TIMEZONE:America/Argentina/Buenos_Aires',
            'BEGIN:VTIMEZONE',
            'TZID:America/Argentina/Buenos_Aires',
            'BEGIN:STANDARD',
            'TZOFFSETFROM:-0300',
            'TZOFFSETTO:-0300',
            'TZNAME:ART',
            'DTSTART:19700101T000000',
            'END:STANDARD',
            'END:VTIMEZONE',
        ];

        rowsData.forEach(({ materia, comision, events }) => {
            const summary = (comision ? `${materia} (${comision})` : materia)
                .replace(/[,;\\]/g, '\\$&');
            events.forEach(ev => {
                if (ev.dayIdx > 6) return;
                const startDate = nextOccurrence(ev.dayIdx);
                lines.push(
                    'BEGIN:VEVENT',
                    `UID:${uid()}`,
                    `DTSTAMP:${dtstamp}`,
                    `DTSTART;TZID=America/Argentina/Buenos_Aires:${fmtDate(startDate)}T${fmtTime(ev.start)}`,
                    `DTEND;TZID=America/Argentina/Buenos_Aires:${fmtDate(startDate)}T${fmtTime(ev.end)}`,
                    `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[ev.dayIdx]};COUNT=18`,
                    `SUMMARY:${summary}`,
                    'END:VEVENT'
                );
            });
        });

        lines.push('END:VCALENDAR');

        const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'horarios-cursado.ics';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);

        // Abre la página de importación de GCal (1 sola pestaña)
        window.open('https://calendar.google.com/calendar/r/settings/import', '_blank');

        showGCalToast();
    }

    function showGCalToast() {
        document.getElementById('ms-gcal-toast')?.remove();
        const toast = el('div', {
            attrs: { id: 'ms-gcal-toast' },
            html: `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Archivo descargado. En la pestaña de Google Calendar que se abrió, seleccioná <strong>horarios-cursado.ics</strong> e importá.</span>
            `
        });
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('ms-gcal-toast--visible'));
        setTimeout(() => {
            toast.classList.remove('ms-gcal-toast--visible');
            setTimeout(() => toast.remove(), 400);
        }, 8000);
    }

    function buildScheduleGrid(rowsData) {
        const dayCount = 6; // Lun-Sáb
        const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

        // Para cada evento, calcular el rango de slots que cubre
        const blocks = [];
        rowsData.forEach((r, i) => {
            const color = SCHEDULE_COLORS[i % SCHEDULE_COLORS.length];
            r.events.forEach(ev => {
                if (ev.dayIdx >= dayCount) return;
                const covered = FRRE_SLOTS
                    .map((s, idx) => slotCovered(ev, s) ? idx : -1)
                    .filter(idx => idx >= 0);
                if (covered.length === 0) return;
                blocks.push({
                    dayIdx: ev.dayIdx,
                    slotStart: covered[0],
                    slotEnd: covered[covered.length - 1],
                    start: ev.start,
                    end: ev.end,
                    materia: r.materia,
                    comision: r.comision,
                    color
                });
            });
        });

        if (blocks.length === 0) return null;

        // Slots visibles: los que tienen al menos un bloque que los cubre
        const usedSet = new Set();
        blocks.forEach(b => {
            for (let i = b.slotStart; i <= b.slotEnd; i++) usedSet.add(i);
        });
        const visibleSlots = [...usedSet].sort((a, b) => a - b);
        const slotIdxToRow = new Map();
        visibleSlots.forEach((origIdx, i) => slotIdxToRow.set(origIdx, i));

        const card = el('div', { className: 'ms-schedule-card' });

        // Header con título + botón de descarga
        const head = el('div', {
            className: 'ms-schedule-head',
            html: `
                <div class="ms-schedule-head-info">
                    <div class="ms-schedule-title">Tu semana</div>
                    <div class="ms-schedule-subtitle">Horarios de cursado actuales</div>
                </div>
            `
        });
        const downloadBtn = el('button', {
            className: 'ms-schedule-download',
            attrs: { type: 'button', title: 'Descargar agenda semanal como archivo Excel (.xls)' },
            html: `
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                <span>Excel</span>
            `
        });
        downloadBtn.addEventListener('click', () => downloadScheduleXLS(rowsData));

        const gcalBtn = el('button', {
            className: 'ms-schedule-gcal',
            attrs: { type: 'button', title: 'Exportar horarios a Google Calendar (.ics)' },
            html: `
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span>Google Calendar</span>
            `
        });
        gcalBtn.addEventListener('click', () => openInGoogleCalendar(rowsData));

        const actions = el('div', { className: 'ms-schedule-actions' });
        actions.appendChild(gcalBtn);
        actions.appendChild(downloadBtn);
        head.appendChild(actions);
        card.appendChild(head);

        // Wrapper con scroll horizontal en mobile
        const wrap = el('div', { className: 'ms-schedule-wrap' });

        // Grid table — CSS Grid puro: 1 col de horarios + N cols de días,
        // 1 fila de header + N filas de slots
        const grid = el('div', { className: 'ms-schedule-table' });
        grid.style.gridTemplateColumns = `auto repeat(${dayCount}, minmax(110px, 1fr))`;
        grid.style.gridTemplateRows = `auto repeat(${visibleSlots.length}, minmax(44px, auto))`;

        // IMPORTANTE: damos posición explícita a TODOS los items (no solo a
        // los bloques). Si dejamos auto-placement para los background cells,
        // el algoritmo los hace fluir alrededor de los bloques explícitos y
        // terminan en columnas/filas incorrectas.

        // Fila 1: esquina vacía + headers de días
        const corner = el('div', { className: 'ms-schedule-corner' });
        corner.style.gridRow = '1';
        corner.style.gridColumn = '1';
        grid.appendChild(corner);

        for (let d = 0; d < dayCount; d++) {
            const h = el('div', { className: 'ms-schedule-day-name', text: dayNames[d] });
            h.style.gridRow = '1';
            h.style.gridColumn = String(d + 2);
            grid.appendChild(h);
        }

        // Filas de slots: label de hora + 6 celdas vacías (bg para mostrar bordes)
        visibleSlots.forEach((origIdx, visIdx) => {
            const slot = FRRE_SLOTS[origIdx];
            const row = String(visIdx + 2);

            const label = el('div', {
                className: 'ms-schedule-time-label',
                text: `${formatMinutes(slot.start)} a ${formatMinutes(slot.end)}`
            });
            label.style.gridRow = row;
            label.style.gridColumn = '1';
            grid.appendChild(label);

            for (let d = 0; d < dayCount; d++) {
                const cell = el('div', { className: 'ms-schedule-cell' });
                cell.style.gridRow = row;
                cell.style.gridColumn = String(d + 2);
                grid.appendChild(cell);
            }
        });

        // Bloques de eventos: posicionados con grid-column/row span sobre las
        // celdas vacías de fondo
        blocks.forEach(b => {
            const rowStart = slotIdxToRow.get(b.slotStart) + 2; // +1 por header, +1 porque grid es 1-indexed
            const rowEnd = slotIdxToRow.get(b.slotEnd) + 3;     // exclusive end
            // Construir el bloque con textContent (no innerHTML) para evitar
            // que materia/comisión interpreten <, >, & como HTML.
            const block = el('div', {
                className: 'ms-schedule-block',
                attrs: {
                    title: `${b.materia}${b.comision ? ' · ' + b.comision : ''} (${formatMinutes(b.start)}–${formatMinutes(b.end)})`
                }
            });
            const titleNode = el('div', { className: 'ms-schedule-block-title', text: b.materia });
            const timeNode = el('div', {
                className: 'ms-schedule-block-time',
                text: `${formatMinutes(b.start)}–${formatMinutes(b.end)}`
            });
            block.appendChild(titleNode);
            block.appendChild(timeNode);
            if (b.comision) {
                block.appendChild(el('div', { className: 'ms-schedule-block-comision', text: b.comision }));
            }
            block.style.gridColumn = String(b.dayIdx + 2);
            block.style.gridRow = `${rowStart} / ${rowEnd}`;
            block.style.setProperty('--ms-block-color', b.color);
            block.style.setProperty('--ms-block-bg', b.color + '22');
            grid.appendChild(block);
        });

        wrap.appendChild(grid);
        card.appendChild(wrap);

        return card;
    }

    function handleMateriasActuales() {
        const found = findTableByHeaders('Año', 'Materia', 'Horarios');
        if (!found) return;
        const { table, headers } = found;

        const materiaIdx = headers.findIndex(h => h === 'materia');
        const comisionIdx = headers.findIndex(h => h === 'comisión');
        const horariosIdx = headers.findIndex(h => h === 'horarios');
        if (materiaIdx < 0 || horariosIdx < 0) return;

        const rowsData = [];
        table.querySelectorAll('tbody tr').forEach(row => {
            const tds = row.querySelectorAll('td');
            const materia = tds[materiaIdx] ? tds[materiaIdx].textContent.trim() : '';
            const comision = comisionIdx >= 0 && tds[comisionIdx]
                ? tds[comisionIdx].textContent.trim()
                : '';
            const horarios = tds[horariosIdx] ? tds[horariosIdx].textContent.trim() : '';
            const events = parseHorarios(horarios);
            if (events.length > 0 && materia) {
                rowsData.push({ materia, comision, events });
            }
        });
        if (rowsData.length === 0) return;

        const card = buildScheduleGrid(rowsData);
        if (!card) return;

        // Insertar DESPUÉS de la tabla: la grilla complementa la info detallada
        const insertionPoint = table.closest('.table-responsive') || table;
        const wrap = el('div', { className: 'ms-enhancements' });
        wrap.appendChild(card);
        if (insertionPoint.nextSibling) {
            insertionPoint.parentNode.insertBefore(wrap, insertionPoint.nextSibling);
        } else {
            insertionPoint.parentNode.appendChild(wrap);
        }
    }

    // ---------- Login page enhancements ----------

    function handleLogin() {
        const radios = document.querySelectorAll('input[name="radio"][type="radio"]');
        const logArea = document.querySelector('.log-area');
        if (radios.length !== 2 || !logArea) return;

        // 1) Reemplazo del logo: feed UTN moderno desde el bundle de la extensión
        const logoImg = document.querySelector('img[src*="/static/img/logo"]');
        if (logoImg && typeof chrome !== 'undefined' && chrome.runtime) {
            logoImg.src = chrome.runtime.getURL('icons/UTN_logo_modern.png');
            logoImg.classList.add('ms-utn-logo');
            logoImg.removeAttribute('style'); // limpia inline style del original
        }

        // 2) Segmented control fachero que reemplaza la funkyradio
        const radioA = radios[0]; // value="A" — Alumno
        const radioD = radios[1]; // value="D" — Docente

        // Ocultar visualmente las funkyradio originales (siguen en el form,
        // así la submission preserva el valor seleccionado)
        radios.forEach(r => {
            const wrap = r.closest('.col-md-6');
            if (wrap) wrap.style.display = 'none';
        });

        const iconAlumno = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>';
        const iconDocente = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>';

        const toggle = el('div', {
            className: 'ms-login-toggle' + (radioD.checked ? ' is-right' : ''),
            html: `
                <div class="ms-login-toggle-indicator"></div>
                <button type="button" class="ms-login-toggle-option ${radioA.checked ? 'is-active' : ''}" data-value="A">
                    ${iconAlumno}<span>Alumno</span>
                </button>
                <button type="button" class="ms-login-toggle-option ${radioD.checked ? 'is-active' : ''}" data-value="D">
                    ${iconDocente}<span>Docente</span>
                </button>
            `
        });

        toggle.querySelectorAll('.ms-login-toggle-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.value;
                const opts = toggle.querySelectorAll('.ms-login-toggle-option');
                opts.forEach(o => o.classList.toggle('is-active', o.dataset.value === val));
                toggle.classList.toggle('is-right', val === 'D');
                if (val === 'A') {
                    radioA.checked = true;
                    radioA.dispatchEvent(new Event('change', { bubbles: true }));
                } else {
                    radioD.checked = true;
                    radioD.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });

        // Wrap en col-md-12 para que ocupe el ancho del form
        const wrapper = el('div', { className: 'col-md-12 ms-login-toggle-wrap' });
        wrapper.appendChild(toggle);

        // Insertar antes del primer .col-md-6 oculto (queda en la posición correcta)
        const firstRadioWrap = radioA.closest('.col-md-6');
        if (firstRadioWrap && firstRadioWrap.parentNode) {
            firstRadioWrap.parentNode.insertBefore(wrapper, firstRadioWrap);
        }
    }

    /**
     * Reemplaza visualmente un <select> nativo por un dropdown custom, sin
     * romper la lógica del form:
     *   - El <select> original queda en el DOM (display: none) → sigue siendo
     *     lo que serializa el form al hacer submit.
     *   - Cuando el usuario elige una opción en la UI custom, seteamos
     *     select.value y disparamos un event 'change' nativo bubbleante,
     *     que jQuery 1.11 captura igual que un cambio real del usuario.
     */
    // ----- Listeners globales compartidos para todos los custom selects -----
    // En vez de registrar un (click + keydown) por cada select decorado
    // (multiplicaba handlers en páginas con muchos selects, ej. encuestas),
    // los listeners viven una sola vez a nivel document y consultan el Set
    // de selects actualmente abiertos.
    const _msOpenSelects = new Set();
    let _msSelectGlobalsInited = false;
    function _initSelectGlobals() {
        if (_msSelectGlobalsInited) return;
        _msSelectGlobalsInited = true;
        document.addEventListener('click', (e) => {
            _msOpenSelects.forEach(api => {
                if (!api.wrapper.contains(e.target)) api.close();
            });
        });
    }

    let _msSelectCounter = 0;

    function enhanceSelect(select) {
        if (select.dataset.msEnhanced) return;
        select.dataset.msEnhanced = '1';
        _initSelectGlobals();

        const uid = ++_msSelectCounter;
        const panelId = `ms-select-panel-${uid}`;
        const optionIdPrefix = `ms-select-opt-${uid}-`;

        const wrapper = el('div', { className: 'ms-select' });
        const trigger = el('button', {
            className: 'ms-select-trigger',
            attrs: {
                type: 'button',
                'aria-haspopup': 'listbox',
                'aria-expanded': 'false',
                'aria-controls': panelId
            }
        });
        if (select.id) {
            // Si el select original tiene un <label for=...>, lo conectamos al trigger
            const lbl = document.querySelector(`label[for="${select.id}"]`);
            if (lbl) trigger.setAttribute('aria-labelledby', lbl.id || (lbl.id = `ms-select-lbl-${uid}`));
        }
        const valueLabel = el('span', { className: 'ms-select-value' });
        const chevron = el('span', {
            className: 'ms-select-chevron',
            html: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'
        });
        trigger.appendChild(valueLabel);
        trigger.appendChild(chevron);

        const panel = el('div', {
            className: 'ms-select-panel',
            attrs: { id: panelId, role: 'listbox', tabindex: '-1' }
        });

        let highlightedIndex = -1;

        const optionEls = [];
        [...select.options].forEach((opt, i) => {
            const optionEl = el('div', {
                className: 'ms-select-option',
                attrs: {
                    id: optionIdPrefix + i,
                    role: 'option',
                    'aria-selected': 'false',
                    'data-value': opt.value,
                    'data-index': String(i)
                },
                text: opt.text || ''
            });
            if (opt.disabled) {
                optionEl.classList.add('is-disabled');
                optionEl.setAttribute('aria-disabled', 'true');
            }
            if (!opt.value) optionEl.classList.add('is-placeholder');
            optionEl.addEventListener('click', () => selectOption(i));
            optionEl.addEventListener('mouseenter', () => {
                if (!opt.disabled) setHighlight(i);
            });
            panel.appendChild(optionEl);
            optionEls.push(optionEl);
        });

        function setHighlight(idx) {
            if (idx < 0 || idx >= optionEls.length) return;
            optionEls.forEach((o, i) => o.classList.toggle('is-highlighted', i === idx));
            trigger.setAttribute('aria-activedescendant', optionIdPrefix + idx);
            highlightedIndex = idx;
            // Scroll into view dentro del panel si hace falta
            const optEl = optionEls[idx];
            if (optEl && optEl.scrollIntoView) {
                optEl.scrollIntoView({ block: 'nearest' });
            }
        }

        function clearHighlight() {
            optionEls.forEach(o => o.classList.remove('is-highlighted'));
            trigger.removeAttribute('aria-activedescendant');
            highlightedIndex = -1;
        }

        function nextEnabledIndex(from, dir) {
            let i = from;
            for (let step = 0; step < optionEls.length; step++) {
                i += dir;
                if (i < 0) i = optionEls.length - 1;
                if (i >= optionEls.length) i = 0;
                if (!select.options[i].disabled) return i;
            }
            return from;
        }

        function selectOption(idx) {
            if (idx < 0 || idx >= optionEls.length) return;
            if (select.options[idx].disabled) return;
            select.selectedIndex = idx;
            select.dispatchEvent(new Event('input', { bubbles: true }));
            select.dispatchEvent(new Event('change', { bubbles: true }));
            updateDisplay();
            close();
            trigger.focus();
        }

        function updateDisplay() {
            const sel = select.options[select.selectedIndex];
            const isPlaceholder = !sel || !sel.value;
            valueLabel.textContent = sel ? sel.text : '';
            valueLabel.classList.toggle('is-placeholder', isPlaceholder);
            optionEls.forEach((o, i) => {
                const isSelected = i === select.selectedIndex && !isPlaceholder;
                o.classList.toggle('is-selected', isSelected);
                o.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            });
        }

        const api = { wrapper, close };

        function open() {
            if (wrapper.classList.contains('is-open')) return;
            wrapper.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            _msOpenSelects.add(api);
            // Pre-highlight: la opción seleccionada o la primera no-disabled
            const initial = select.selectedIndex >= 0 && select.options[select.selectedIndex] && !select.options[select.selectedIndex].disabled
                ? select.selectedIndex
                : nextEnabledIndex(-1, 1);
            setHighlight(initial);
        }
        function close() {
            if (!wrapper.classList.contains('is-open')) return;
            wrapper.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            _msOpenSelects.delete(api);
            clearHighlight();
        }
        function toggle() {
            wrapper.classList.contains('is-open') ? close() : open();
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle();
        });

        // Keyboard nav (scope: trigger button). Maneja toda la interacción
        // ARIA listbox sin necesidad de listeners document-level.
        trigger.addEventListener('keydown', (e) => {
            const isOpen = wrapper.classList.contains('is-open');
            if (!isOpen) {
                // Acciones cuando el panel está cerrado
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp' ||
                    e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                }
                return;
            }
            // Panel abierto: ARIA listbox keyboard
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlight(nextEnabledIndex(highlightedIndex, 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlight(nextEnabledIndex(highlightedIndex, -1));
                    break;
                case 'Home':
                    e.preventDefault();
                    setHighlight(nextEnabledIndex(-1, 1));
                    break;
                case 'End':
                    e.preventDefault();
                    setHighlight(nextEnabledIndex(optionEls.length, -1));
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (highlightedIndex >= 0) selectOption(highlightedIndex);
                    break;
                case 'Escape':
                    e.preventDefault();
                    close();
                    trigger.focus();
                    break;
                case 'Tab':
                    // Tab cierra sin seleccionar y deja que el browser haga el focus next
                    close();
                    break;
            }
        });

        // Si algo externo cambia el select (raro, pero por las dudas), reflejarlo
        select.addEventListener('change', updateDisplay);

        wrapper.appendChild(trigger);
        wrapper.appendChild(panel);

        // El <select> nativo queda accesible para screen readers vía
        // visually-hidden (NO display:none). El form submission sigue funcionando
        // porque la value se sincroniza al cambiar la UI custom.
        select.classList.add('ms-select-sr-only');
        select.parentNode.insertBefore(wrapper, select.nextSibling);

        updateDisplay();
    }

    // Encuesta: marca la página y detecta el header oscuro para restilizarlo.
    function handleEncuesta() {
        document.body.classList.add('ms-page-encuesta');

        const root = document.querySelector('.page-generic') || document.body;

        // Parsea "rgb(r,g,b)" o "rgba(r,g,b,a)" y devuelve la luminancia 0..1.
        // Si el bg es transparente o no se puede parsear, devuelve null.
        function bgLuminance(el) {
            const bg = getComputedStyle(el).backgroundColor;
            const m = bg.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/);
            if (!m) return null;
            const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
            if (a < 0.5) return null; // transparente → ignorar
            const r = +m[1], g = +m[2], b = +m[3];
            // Luminance approximation (ITU-R BT.601)
            return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        }

        // Recorrer descendientes y encontrar el primer elemento con bg oscuro
        // (luminance < 0.25) y texto sustancial. Ese es el banner del título.
        const all = root.querySelectorAll('*');
        for (const elem of all) {
            const lum = bgLuminance(elem);
            if (lum === null || lum >= 0.25) continue;
            const text = (elem.textContent || '').trim();
            if (text.length < 20) continue;
            // Evitamos marcar contenedores gigantes: el header tipico tiene <800 chars
            if (text.length > 800) continue;

            elem.classList.add('ms-encuesta-header');
            elem.removeAttribute('bgcolor');
            // Limpiar inline (sin !important) para que el CSS de la clase gane
            elem.style.background = '';
            elem.style.backgroundColor = '';
            elem.style.color = '';
            elem.querySelectorAll('[bgcolor], [style*="background"], [style*="color"]').forEach(d => {
                d.removeAttribute('bgcolor');
                d.style.background = '';
                d.style.backgroundColor = '';
                d.style.color = '';
            });
            break; // solo el primero (outermost match en orden DOM)
        }

        // Marca los campos para estilarlos
        root.querySelectorAll('select, input[type="text"], textarea').forEach(i => {
            i.classList.add('ms-encuesta-field');
        });

        // Reemplazar selects nativos por dropdown custom (manteniendo el
        // <select> oculto para el submit del form)
        root.querySelectorAll('select.ms-encuesta-field').forEach(enhanceSelect);

        // Reemplazar las filas de guiones (separadores feos del template original)
        // por un divisor limpio. Las detectamos como rows cuyo texto es solo
        // guiones y espacios.
        root.querySelectorAll('tr').forEach(tr => {
            const text = (tr.textContent || '').trim();
            if (/^[-\s]{10,}$/.test(text)) {
                tr.classList.add('ms-encuesta-divider');
                tr.querySelectorAll('td, th').forEach(c => {
                    c.innerHTML = '';
                });
            }
        });

        // Botón de enviar
        root.querySelectorAll('input[type="submit"], button[type="submit"]').forEach(b => {
            b.classList.add('ms-encuesta-submit');
        });
    }

    function init() {
        initThemeAndFabs();

        const path = location.pathname.toLowerCase();
        if (path.includes('/alumnos/estado')) handleEstadoAcademico();
        if (path.includes('/alumnos/examenes')) handleExamenes();
        if (path.includes('/alumnos/materias_del_plan')) handleMateriasDelPlan();
        if (path.includes('/alumnos/cursado')) handleMateriasActuales();
        if (path.includes('/alumnos/encuesta')) handleEncuesta();
        // Login: detección por DOM, no por URL (puede vivir en /, /login/, etc.)
        handleLogin();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
