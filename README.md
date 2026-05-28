# ModernSysacad

Un Sysacad moderno, limpio y con modo oscuro.

---

## Características
* 🌗 **Modo Oscuro**
* 🎨 **Diseño Moderno**
* ⚡ **Ligero**

---

## Regionales soportadas

* **FRT** (Tucumán) — `sysacad.frt.utn.edu.ar`
* **FRRe** (Resistencia) — `sysacadweb.frre.utn.edu.ar` *(adaptación por Tomás Kobluk, Gonzalo Fidanza y Lorenzo Arduino)*

Cada regional usa sus propios archivos (`content.js`/`style.css` para FRT, `frre.js`/`frre.css` para FRRe) y el manifest los inyecta sólo en el dominio correspondiente.

---

## Cómo instalarlo para desarrollo (Local)

Si querés probar los últimos cambios o colaborar con el código, podés instalar la extensión localmente siguiendo estos pasos:

### 1. Preparación del Manifiesto
Como el repositorio soporta múltiples navegadores, lo primero que tenés que hacer tras clonar el proyecto es renombrar el archivo correspondiente a tu navegador:

* **Si usás Chrome / Edge / Brave:** Renombrá `manifest.chrome.json` a `manifest.json`.
* **Si usás Firefox:** Renombrá `manifest.firefox.json` a `manifest.json`.

---

### 2. Cargar la extensión en el navegador

#### En Google Chrome / Chromium (Edge, Brave, Opera, etc.):
1. Abrí el navegador y navegá a `chrome://extensions/`.
2. Activá el **"Modo de desarrollador"** (el switch que está arriba a la derecha).
3. Hacé clic en el botón **"Cargar descomprimida"** (Load unpacked).
4. Seleccioná la carpeta raíz de este proyecto.

#### En Firefox:
1. Abrí el navegador y navegá a `about:debugging`.
2. Hacé clic en **"Este Firefox"** (This Firefox) en el menú lateral.
3. Buscá el botón **"Cargar complemento temporal..."** (Load Temporary Add-on...).
4. Seleccioná el archivo `manifest.json` que renombraste dentro de la carpeta del proyecto.

¡Listo! Entrá al Sysacad de la FRT y vas a ver los cambios aplicados en tiempo real.

---

## Cómo colaborar (Pull Requests)

Cualquier mejora en los estilos CSS o nuevas funcionalidades en JS son más que bienvenidas. El proyecto mantiene una sola rama principal (`main`) para ambos navegadores.

1. Hacé un **Fork** de este repositorio.
2. Creá una rama para tu modificación: `git checkout -b feature/MejoraVisual`.
3. Realizá tus cambios en `style.css` o `content.js` (no modifiques los archivos `.json` a menos que sea necesario).
4. Subí tus cambios: `git commit -m 'Agrega mejoras en la tabla de horarios'`.
5. Hacé el push: `git push origin feature/MejoraVisual`.
6. Abrí un **Pull Request** directo a la rama `main` de este repo.

---

## ☕ Apoyá el proyecto
Este proyecto es 100% gratuito y de código abierto. Si te ahorró un dolor de cabeza (o de ojos), podés invitarme un cafecito para bancar el mantenimiento y las futuras actualizaciones:

[![Cafecito](https://img.shields.io/badge/Invitame%20un-Cafecito-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://cafecito.app/inakigarcia)

---

## 📄 Licencia
Este proyecto está bajo la Licencia MIT. Podés ver el archivo `LICENSE` para más detalles.
