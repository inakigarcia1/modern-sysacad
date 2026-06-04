# ModernSysacad FRRe — Roadmap de features futuras

Lista organizada de ideas para próximas iteraciones, ordenadas por impacto. Marcar con `[x]` las que se vayan implementando.

---

## ✅ Implementado (rama `feat/frre-grafo-correlativas`)

- [x] **Capa de caché híbrida** — `MS_CACHE` sobre `sessionStorage` (data ya parseada por página, versionada + TTL) + `fetchDoc` con dedupe + prefetch en hover de links internos. Los getters (`getPlanRows`, `getEstadoMap`, `getPlanTotal`) hacen cache → fetch → extract. Estado y Plan alimentan la caché al visitarlos. Base lista para sumar PJAX.
- [x] **Grafo de correlativas** — vista nueva en la página de correlatividades. Parser de la tabla (estado `available`/`blocked` + correlativas incumplidas), cruce con plan completo + estado académico vía caché, render SVG por columnas de año con zoom/pan, búsqueda, toggle "solo lo que me falta", panel de detalle y resaltado bidireccional al clickear (prerrequisitos ↔ qué desbloquea). Al pasar el mouse sobre una materia se grisa el resto y se resalta solo el camino que desbloquea (hacia adelante). Layout por año: las electivas se ubican en su año real (se toma el número de la celda "Año", ej. "Elec. 4" → 4º) sin columna especial, y el año 0 (ingreso / materias especiales / sin año) va a la izquierda de 1º. Funciona en ambas páginas de correlatividad (**cursar** y **rendir**), detectando el modo por URL/contenido y adaptando la redacción ("Podés cursar/rendir", "Habilita a cursar/rendir"). El foco es la de **cursar**, que es la que realmente se aplica; la de rendir se mantiene por si a alguien le sirve. **Limitación conocida:** la página de correlatividad es personalizada, así que en alumnos avanzados las correlativas ya cumplidas no se muestran (grafo parcial hacia atrás).

---

## 🔥 Tier 1 — Alto impacto

Features que cambian la utilidad del producto. Información que SYSACAD no da pero el alumno necesita.

### [ ] Próximos exámenes destacados
- En la página de Exámenes, parsear fechas de la columna `Fecha` (formato `DD-MM-YYYY`)
- Detectar las filas con fechas en el futuro (relativo a `Date.now()`)
- Mostrar banner arriba: *"Tenés N exámenes próximos. Más cercano: <materia> el <fecha>"*
- O resaltar las filas con borde-left accent y badge "Próximo"
- **Complejidad**: Media. Requiere parseo de fechas robusto y separación visual.

### [ ] Lo que podés rendir / cursar ahora
- Cross-referencia entre `Estado Académico` (qué aprobaste) + `Correlatividades` (qué se necesita)
- Fetch async a `/Alumnos/Correlatividad_Rendir/` y `/Alumnos/Correlatividad_Cursado/`
- Calcular intersección: materias cuyas correlativas ya están todas aprobadas
- Mostrar en una sección dedicada: *"Podés inscribirte a estas materias"*
- **Complejidad**: Alta. Requiere parsing de varias páginas + lógica de cross-reference.
- **Valor**: Muy alto — esta info no existe en SYSACAD.

### [ ] Proyector de promedio
- Card interactivo arriba de Estado Académico
- Dropdown con todas las materias del plan no aprobadas + input de nota imaginaria
- En vivo: *"Si aprobás Análisis Matemático II con 8, tu promedio sería **7.62** (+0.06)"*
- **Complejidad**: Media. UI + cálculo on-the-fly.

### [ ] Hover preview en Materias del Plan
- Al hacer hover sobre una fila, popup flotante con:
  - Estado actual (aprobada/cursando/pendiente)
  - Nota si aplica
  - Correlatividades para rendir y cursar
- Evita tener que navegar entre páginas
- **Complejidad**: Media. Requiere fetch a varias páginas y caching.

### [ ] Detección de choque de horarios
- En la grilla semanal: si dos bloques se solapan en el mismo día
- Mostrar warning visual: borde rojo + icono ⚠️ + tooltip *"Choca con <materia>"*
- **Complejidad**: Baja. Solo requiere chequeo de overlap en `events[]`.

---

## ⭐ Tier 2 — Quality of life

Mejoras que el usuario disfruta cada día.

### [ ] Filtros chips por año en Materias del Plan
- Sobre el buscador: `[Todas] [1°] [2°] [3°] [4°] [5°] [Electivas]`
- Toggle independiente del search
- **Complejidad**: Baja.

### [ ] Sticky header en tablas largas
- Headers de tabla quedan fijos al hacer scroll vertical
- `position: sticky` con z-index alto
- **Complejidad**: Baja. Solo CSS.

### [ ] Indicador "clase en curso AHORA"
- En la grilla semanal: el bloque correspondiente a la cursada actual con pulse animado
- Detección: día actual + hora actual entre `start` y `end`
- Actualizar cada minuto con `setInterval`
- **Complejidad**: Baja.

### [ ] Tracker de inasistencias
- En Materias Actuales, fetch o parseo de `/Inasistencias/Listar/...`
- Badge en la columna Inasistencias: verde si pocas, amarillo si te acercás, rojo si crítico
- **Complejidad**: Media. Requiere fetch + lógica de límites por materia.

### [ ] Resumen de carrera
- Card arriba en Estado Académico: *"Estás cursando 4° año • 18 materias por terminar • Estimado: 2027"*
- Estimación basada en ritmo histórico (materias aprobadas / año)
- **Complejidad**: Media. Lógica de proyección.

### [ ] Gráfico de evolución del promedio
- Sparkline o mini chart en Estado Académico
- Eje X: año, eje Y: promedio
- **Complejidad**: Media. SVG inline o canvas.

### [ ] Export del horario semanal
- Botón "Descargar mi semana" → PDF o PNG
- Usar `html2canvas` o `canvas` nativo
- **Complejidad**: Media-Alta. Dependencia externa o implementación custom.

### [ ] Importar a Google/Apple Calendar
- Generar archivo `.ics` (iCalendar) con eventos recurrentes para cada cursada
- Botón "Exportar a calendario" en Materias Actuales
- **Complejidad**: Media. Formato `.ics` es text-based, factible sin libs.

### [ ] Atajos de teclado
- Estilo Gmail: `g e` → Estado, `g x` → Exámenes, `g p` → Plan, `g h` → Horarios
- `/` → focus en el search input
- `?` → modal con lista de shortcuts
- **Complejidad**: Baja-Media.

---

## 🟢 Tier 3 — Polish y experimental

Detalles que suman pero no son críticos.

### [ ] Notification bell para exámenes
- Browser Notifications API
- Pedir permiso al usuario, programar recordatorios (1 día antes, 1 hora antes)
- Persistencia en localStorage
- **Complejidad**: Media. Service worker para notifs cuando el browser está cerrado.

### [ ] Modo "estudiante zen"
- Vista minimalista: solo "tu próxima clase" + "tu próximo examen"
- Toggle desde un FAB extra
- Oculta todo lo no urgente
- **Complejidad**: Media. Lógica de "qué es próximo" + UI dedicada.

### [ ] Reporte semanal de lunes
- Detectar primer login del lunes (timestamp en localStorage)
- Mostrar card resumen: *"Esta semana: 4 cursadas, 1 parcial el viernes, 0 exámenes"*
- **Complejidad**: Baja-Media.

### [ ] Modo presentación
- Oculta nombre/legajo del top-nav, sustituye por placeholders
- Para mostrar el horario en clase / presentación sin filtrar info personal
- Toggle persistente
- **Complejidad**: Baja.

### [ ] Tema custom
- Selector de accent color: UTN azul / verde / naranja / morado
- Aplicar vía CSS variables
- Persistir en localStorage
- **Complejidad**: Baja.

### [ ] Persistir estado del sidebar
- Si lo dejaste abierto o cerrado en la última visita
- Ya lo hace FRT en su `content.js` original, portear el patrón
- **Complejidad**: Baja.

### [ ] Modo daltónico para la grilla de horarios
- Variantes de paleta (`SCHEDULE_COLORS`) para deuteranopia/protanopia/tritanopia
- Selector en el popup de créditos o en un setting nuevo
- **Complejidad**: Baja.

### [ ] Multi-idioma
- Strings de la UI en español / inglés / portugués
- Para alumnos de intercambio
- **Complejidad**: Media. Sistema de traducciones, todos los strings hardcodeados a `t('clave')`.

---

## 💡 Outside-the-box

Ideas más ambiciosas / experimentales que charlamos.

### [ ] "What if" calculator interactiva
- Card donde podés arrastrar una nota imaginaria a una materia que no diste
- En vivo, el promedio se actualiza
- Visualización tipo simulación
- **Complejidad**: Media-Alta. UI + cálculo en tiempo real.

### [ ] Comparativa de planes
- % completado por año de la carrera, con barra de progreso por cada año
- Detalle "tenés X de Y materias de 3° año"
- **Complejidad**: Media. Requiere data del plan + estado por año.

### [ ] Feriados nacionales en la grilla
- Marcar días feriados de Argentina como bloqueados/grises en la grilla semanal
- API de feriados o lista estática anual
- **Complejidad**: Baja. Lista hardcodeada.

### [ ] Cache offline (read-only)
- Persistir snapshots de las páginas en localStorage / IndexedDB
- Si SYSACAD está caído, mostrar la última versión cacheada con badge "Offline"
- **Complejidad**: Alta. IndexedDB + manejo de estado de conexión.

### [ ] Multi-cuenta
- Si alguien comparte computadora con familiar (también UTN), permitir switch rápido entre 2 perfiles
- **Complejidad**: Alta. Manejo de sesiones múltiples.

---

## 🧪 Ideas técnicas / refactor

### [ ] Modularizar `frre.js`
- Hoy es un solo archivo grande
- Separar en: `frre/icons.js`, `frre/components.js`, `frre/pages/estado.js`, etc.
- Pero los content scripts no soportan ES modules natively → habría que bundlear (Vite/Rollup)
- **Complejidad**: Alta. Setup de bundler + cambios en manifest.

### [ ] Tests automatizados
- Vitest o Jest para los helpers puros (`parseHorarios`, `normalizeText`, `animateValue`)
- HTML fixtures para los page handlers
- **Complejidad**: Alta. Setup completo de testing.

### [ ] Backport de mejoras al FRT
- El usuario original (Iñaki) podría querer que el design system de FRRe también se aplique a FRT
- Migrar las animaciones, view transitions, design tokens
- **Complejidad**: Media. Requiere conocer el DOM de FRT y adaptar selectores.

### [ ] Soportar nuevas regionales (otras facultades UTN)
- Cada regional tiene su propia variante de SYSACAD
- Agregar archivos `<regional>.js` + `<regional>.css` y entradas en manifest
- Buena oportunidad para extraer un módulo `shared.js` con los helpers comunes (dark mode, FABs, animateValue)
- **Complejidad**: Variable según la regional.

---

## 📝 Notas

- Mantener todas las mejoras **respetando `prefers-reduced-motion`**
- Cada feature debería tener su sección en el README al mergearse
- Si una feature requiere fetch a páginas adicionales, **siempre con `credentials: 'same-origin'`** y fallback silencioso
- **No tocar nunca** la variante FRT (`content.js`, `style.css`) en commits que sean solo de FRRe
