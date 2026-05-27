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
        const pct = Math.round((done / total) * 100);
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
                        <li>Kobluk, T.</li>
                        <li>Fidanza, G.</li>
                        <li>Arduino, L.</li>
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

    function buildScheduleGrid(rowsData) {
        const allEvents = [];
        rowsData.forEach((r, i) => {
            const color = SCHEDULE_COLORS[i % SCHEDULE_COLORS.length];
            r.events.forEach(ev => {
                allEvents.push({ ...ev, materia: r.materia, comision: r.comision, color });
            });
        });
        if (allEvents.length === 0) return null;

        // Rango de horas: redondeo al hour boundary para grilla limpia
        let minHour = 24, maxHour = 0;
        allEvents.forEach(e => {
            minHour = Math.min(minHour, Math.floor(e.start / 60));
            maxHour = Math.max(maxHour, Math.ceil(e.end / 60));
        });
        minHour = Math.max(0, minHour);
        maxHour = Math.min(24, maxHour);
        const totalHours = maxHour - minHour;
        const totalMinutes = totalHours * 60;
        if (totalMinutes <= 0) return null;

        const dayNames = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        const dayCount = 6; // Lun-Sáb (omito Domingo)

        const card = el('div', { className: 'ms-schedule-card' });

        card.appendChild(el('div', {
            className: 'ms-schedule-head',
            html: `
                <div class="ms-schedule-title">Tu semana</div>
                <div class="ms-schedule-subtitle">Horarios de cursado actuales</div>
            `
        }));

        // Inner wrapper que sí scrollea horizontalmente en mobile
        const wrap = el('div', { className: 'ms-schedule-wrap' });

        // Day headers
        const dayHeaders = el('div', { className: 'ms-schedule-day-headers' });
        dayHeaders.appendChild(el('div', { className: 'ms-schedule-corner' }));
        for (let i = 0; i < dayCount; i++) {
            dayHeaders.appendChild(el('div', { className: 'ms-schedule-day-name', text: dayNames[i] }));
        }
        wrap.appendChild(dayHeaders);

        // Body
        const body = el('div', { className: 'ms-schedule-body' });
        body.style.height = `${totalHours * 60}px`; // 60px por hora

        // Time labels column
        const timesCol = el('div', { className: 'ms-schedule-times' });
        for (let h = minHour; h <= maxHour; h++) {
            const label = el('div', {
                className: 'ms-schedule-time',
                text: `${String(h).padStart(2, '0')}:00`
            });
            const topPct = ((h - minHour) * 60 / totalMinutes) * 100;
            label.style.top = `${topPct}%`;
            timesCol.appendChild(label);
        }
        body.appendChild(timesCol);

        // Grid con day columns
        const grid = el('div', { className: 'ms-schedule-grid' });
        grid.style.gridTemplateColumns = `repeat(${dayCount}, 1fr)`;
        grid.style.setProperty('--ms-hour-step', `${100 / totalHours}%`);

        for (let d = 0; d < dayCount; d++) {
            const dayCol = el('div', { className: 'ms-schedule-day' });
            const dayEvents = allEvents.filter(e => e.dayIdx === d);
            dayEvents.forEach(ev => {
                const topPct = ((ev.start - minHour * 60) / totalMinutes) * 100;
                const heightPct = ((ev.end - ev.start) / totalMinutes) * 100;
                const block = el('div', {
                    className: 'ms-schedule-block',
                    attrs: {
                        title: `${ev.materia}${ev.comision ? ' · ' + ev.comision : ''} (${formatMinutes(ev.start)}–${formatMinutes(ev.end)})`
                    },
                    html: `
                        <div class="ms-schedule-block-title">${ev.materia}</div>
                        <div class="ms-schedule-block-time">${formatMinutes(ev.start)}–${formatMinutes(ev.end)}</div>
                        ${ev.comision ? `<div class="ms-schedule-block-comision">${ev.comision}</div>` : ''}
                    `
                });
                block.style.top = `${topPct}%`;
                block.style.height = `${heightPct}%`;
                block.style.setProperty('--ms-block-color', ev.color);
                block.style.setProperty('--ms-block-bg', ev.color + '22'); // #RRGGBB + 22 alpha (~13%)
                dayCol.appendChild(block);
            });
            grid.appendChild(dayCol);
        }

        body.appendChild(grid);
        wrap.appendChild(body);
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
