# DevOps Pulse — Dashboard de monitorización en tiempo real

## Objetivo

Construir `devops-pulse/`, una aplicación autocontenida que demuestre una
integración HTML-first real: servidor HTTP nativo en Go, actualizaciones por
SSE, HTMX como capa de intercambio de HTML, Alpine.js para estado local de UI y
Bootstrap 6 Alpha 1 para la maquetación y los componentes.

## Evidencia de fuentes

- Skills oficiales locales: `.agents/skills/bootstrap-v6-install/SKILL.md`,
  `bootstrap-component/SKILL.md`, `bootstrap-component-js/SKILL.md`.
- Paquete instalado y verificable:
  `docengine-docs/node_modules/bootstrap` (`bootstrap@6.0.0-alpha.1`).
- Documentación oficial: <https://getbootstrap.com/docs/6.0/>.
- HTMX: <https://htmx.org/extensions/sse/>.
- Alpine.js: <https://alpinejs.dev/start-here>.

## Hechos verificados sobre Bootstrap 6 Alpha 1 (no inferencias)

- El JavaScript es **solo ESM**: `dist/js/bootstrap.bundle.min.js` termina en
  `export{...}` y no registra `window.bootstrap`.
- La lista de exportaciones **no incluye `Modal` ni `Offcanvas`**; incluye
  `Dialog` y `Drawer`. La ventana modal de v5 se resuelve en v6 con `Dialog`.
- No existen clases `.btn-primary`; el sistema de color usa
  `.btn-solid.theme-primary`, `.theme-*`, `.btn-subtle`, `.btn-outline`.
- El modo oscuro es nativo mediante `data-bs-theme="dark"`.
- Las versiones del frontend quedan fijadas: `bootstrap@6.0.0-alpha.1`,
  `htmx.org@2.0.11`, `htmx-ext-sse@2.2.4`, `alpinejs@3.17.4`.

## Decisiones de arquitectura

- Aplicación con identidad propia en `devops-pulse/`, con su propio módulo Go y
  su propio `package.json` (igual que `docengine-docs/`).
- Go sin frameworks: `net/http`, `html/template`, `embed`, `log/slog`,
  `math/rand/v2`.
- **Un único partial por fragmento**: la tarjeta de servidor se renderiza con la
  misma plantilla desde la página inicial, desde el tick SSE y desde el POST de
  alternancia. Es el patrón central del enfoque HTML-first.
- SSE que transporta **HTML ya renderizado**, no JSON: HTMX intercambia el grid
  completo cada 2 s y Alpine conserva el estado del buscador porque su `x-data`
  vive fuera del contenedor intercambiado.
- `Modal` de Bootstrap v5 se sustituye por `Dialog` de v6 y se abre desde
  Alpine con la instancia ESM; el servidor no participa en la animación.
- Los avisos flotantes usan `Toast` de v6 disparados por la cabecera
  `HX-Trigger` de HTMX y consumidos por Alpine.
- Los assets de terceros se copian a `web/static/vendor/` con un script de
  sincronización reproducible; no se versionan ni se cargan desde CDN.
- El servidor comprueba al arrancar que los assets existan y, si faltan, sale
  con un mensaje que indica el comando exacto a ejecutar.

## Alcance autorizado

- Crear el directorio `devops-pulse/` con la aplicación, sus plantillas, sus
  tests y su documentación.
- No ejecutar operaciones remotas de Git, ni commit, ni push: no hay remoto
  configurado y el commit queda a decisión del usuario.

## Tareas

- [x] DP-01 — Andamiaje del módulo Go y de los assets (`go.mod`, `package.json`, script de sincronización de vendor, `.gitignore`, `README.md`).
- [x] DP-02 — Núcleo de estado: servidores en memoria, tick aleatorio con `math/rand/v2` y alternancia Online/Offline (test-first: RED → GREEN).
- [x] DP-03 — Servidor HTTP: rutas, handler SSE con flush y heartbeat, y `POST /toggle-service` con cabecera `HX-Trigger`.
- [x] DP-04 — Plantillas HTML-first: `index.html` y partials de grid, tarjeta y diálogo de logs, enlazados con HTMX SSE y Alpine.
- [x] DP-05 — `app.js` y `app.css`: puente ESM de Bootstrap 6 (`Dialog`, `Toast`) y componentes Alpine (buscador, logs, avisos).
- [x] DP-06 — Verificación: `go test ./...`, `go vet ./...`, `go build`, arranque real y comprobación de `/metrics`, `/` y `/toggle-service` con `curl`.
- [x] DP-07 — Verificación en navegador del modo oscuro, el filtrado, el diálogo y los avisos.
- [x] DP-08 — Corregir los defectos de la revisión de código: eventos `htmx:sseOpen/sseClose/sseError`, clases `md:`/`xl:` de v6, `fs-4xl` en lugar de `display-5`, cierre ordenado con `signal.NotifyContext` y diagnóstico de assets con ruta absoluta.
- [x] DP-09 — Corregir la pérdida de `HX-Trigger` cuando el tick SSE reemplaza la tarjeta con una petición en vuelo (ver «Defecto corregido»).
- [ ] DP-11 — Confirmar los commits por unidad de trabajo en `feature/devops-pulse`: `03aa77e chore: ignore local pi state directory` creado y `feat: add devops pulse realtime dashboard` creado al cerrar esta tarea.

## Defecto corregido (DP-09)

Síntoma medido en Chromium: con 1,5 s de latencia simulada en `POST /toggle-service`, la cabecera `HX-Trigger` se disparaba sobre un elemento desconectado y el evento nunca llegaba a `document` (`events: []`), así que el toast no aparecía aunque el estado del servidor sí cambiaba.

Causa: el tick SSE intercambiaba `#metrics-grid` completo con `hx-swap="innerHTML"`, desprendiendo el `<form>` dueño de la petición en vuelo.

Corrección aplicada (opción A, elegida por el usuario): el tick ya no reemplaza el grid. `#metrics-grid` usa `hx-swap="none"` y cada frame SSE transporta tres fragmentos `hx-swap-oob="true"` por servicio (`status-<id>`, `metrics-<id>`, `logs-<id>`). La raíz de la tarjeta y su formulario sobreviven a todos los ticks. Un único `{{define}}` por fragmento se reutiliza desde la tarjeta inicial y desde el payload OOB, gobernado por el campo `OutOfBand` de `serviceView`. El contenedor de logs pasó de `<template>` a `<div hidden>` porque el intercambio OOB de un `<template>` no aporta garantías.

Decisión apoyada en la fuente servida: en `htmx.min.js` el manejo OOB (`_e(n,o,r)`) corre antes del swap principal y `function Ve(t,…){switch(t){case"none":return;…}` solo corta ese swap, de modo que `hx-swap="none"` no impide los OOB.

Medición posterior a la corrección, misma latencia de 1,5 s en ambos sentidos:

| Comprobación | Online → Offline | Offline → Online |
| --- | --- | --- |
| Evento en `document` | `FORM`, `connected: true` | `FORM`, `connected: true` |
| Toast | «API Gateway is now Offline.» con `theme-danger` | «API Gateway is now Online.» con `theme-success` |
| Tarjeta durante la petición | adjunta (`isConnected: true`) | adjunta |
| Métricas durante la petición | siguen actualizándose | siguen actualizándose |
| Estado final | `Offline` | `Online` |

Sin errores de consola ni de página en ninguna de las dos ejecuciones.

## Criterios de aceptación

- `GET /metrics` emite un evento SSE con nombre `metrics` cada 2 s, con CPU y RAM
  en porcentaje y estado de cada servicio.
- `POST /toggle-service` alterna Online/Offline por ID, devuelve el fragmento
  HTML actualizado de la tarjeta y no recarga la página.
- El buscador filtra las tarjetas por nombre sin contacto con el servidor.
- El diálogo de logs se abre con animación propia del componente de Bootstrap 6
  sin petición al servidor.
- El diseño usa modo oscuro nativo, `card`, barras de progreso y avisos
  flotantes.
- Ninguna afirmación del código contradice la API verificada de Bootstrap 6
  Alpha 1 (sin `Modal`, sin `btn-primary`, sin `window.bootstrap`).

## Verificación prevista

- `npm --prefix devops-pulse install` y sincronización de assets: correctos.
- `go test ./...` en `devops-pulse/`: correctos.
- `go vet ./...` y `go build ./...`: correctos.
- Arranque del servidor y `curl -N /metrics`: dos eventos en ~4 s.
- `curl -X POST /toggle-service`: cambio de estado y cabecera `HX-Trigger`.
- Comprobación de que `web/static/vendor/` no se versiona.

## Progreso

- Integración de ramas: `main` avanzó por avance rápido (`git fetch . docs/docengine:main`)
  desde `ad06c1d` hasta `a472d52`; `main` y `docs/docengine` quedaron idénticos.
  La rama de tarea `feature/devops-pulse` se creó desde `main` en `a472d52`.
- El checkout a `main` estaba bloqueado por un cambio previo sin confirmar en
  `.gitignore` (añade `.pi/`); se conservó intacto y la integración se hizo sin
  tocar el árbol de trabajo.
- Estado: implementación completa y verificada; defecto DP-09 corregido y re-verificado.
- Commits: `03aa77e chore: ignore local pi state directory` (cambio previo del usuario sobre `.gitignore`, trazado por separado) y `feat: add devops pulse realtime dashboard` (aplicación y este documento). El SHA del segundo queda registrado en Engram, en el tópico `devops-pulse/browser-verification`.
- Verificación ejecutada: `go test ./...`, `go test -count=1 ./...`, `go vet ./...`
  y `go build` correctos; `curl` sobre `/metrics` (3 frames, todas las líneas HTML
  con prefijo `data:`), `/toggle-service` (200 + `HX-Trigger` JSON + estado
  alternado), id inexistente (404), los 8 recursos estáticos y `/healthz` (200);
  comprobación de clases de plantilla contra el CSS servido sin tokens
  faltantes; sin idioms de Bootstrap 5.
- Verificación en navegador (Chromium 1248, Playwright 1.64, viewport 1280 px):
  `data-bs-theme="dark"` aplicado; insignia `Live` con `theme-success` sin
  recargar; anchos de `.progress-bar` distintos entre ticks; 3 columnas en `xl`
  y 2 en `md`; filtro Alpine con 2 visibles al buscar «worker» sobre nodos ya
  intercambiados por SSE; `<dialog>` abierto como modal real (`:modal`), con 6
  líneas de log y cierre por `data-bs-dismiss`; toast tras el toggle con detalle
  `{id, name, status}`; indicador de carga visible solo durante la petición.
- Captura de la ejecución: `/tmp/pulse-dashboard.png`.
- Gotcha: `devops-pulse/` ya existía vacío antes de esta tarea.
- Gotcha: el `go.mod` se crea dentro de `devops-pulse/`, no en la raíz; la raíz
  no debe ganar un manifiesto Go ni npm.
- Gotcha: el canal `chrome` del servidor MCP de Playwright no está instalado en
  esta máquina; la verificación se ejecutó con el Chromium del cache de
  Playwright mediante un script propio fuera del repositorio.

## Iteración 2 — bilingüe, temas, diseño de referencia y ayuda por tarjeta

Petición del usuario: interfaz bilingüe ES/EN con español por defecto, tema
oscuro y claro, diseño alineado con `docengine-docs`, corregir la separación de
las tarjetas y añadir un icono de ayuda por tarjeta que abra un diálogo con la
explicación.

### Evidencia medida de la iteración 2

- Separación horizontal entre tarjetas en el navegador: **-1 px y 0 px**;
  vertical 12 px; `--bs-gutter-x` del `.row` `.75rem`; `padding-inline` de la
  tarjeta 6 px; `margin-top` 12 px; radio 12 px; contenedor 1200 px.
- Causa 1: el mismo elemento es columna y tarjeta, así que la canaleta de la
  columna queda dentro de la caja de borde y el fondo de la tarjeta la cubre.
- Causa 2: la escala de espaciado de v6 es más densa que la de v5
  (`--bs-spacer-4: .75rem`, `g-7: 1.5rem`, `g-9: 2rem`, `--bs-spacer-12: 3rem`).
- Sistemas de diseño de referencia: `docengine-docs/` (tokens, tipografía,
  radios, superficies y mecanismo de tema).

### Tareas de la iteración 2

- [x] DP-13 — Interfaz bilingüe ES/EN con español por defecto: tabla de mensajes en Go, `?lang=` con cookie de persistencia, atributo `lang` del documento y `sse-connect` en el idioma activo. Verificado: `/` sin consulta responde en español y **no** fija cookie; `/?lang=en` responde en inglés y fija `devops-pulse-lang`; con solo la cookie la página sigue en inglés; `?lang=de` cae a español sin error; el frame SSE contiene `Memory` en inglés y `Memoria` en español dentro de las líneas `data:`; el toggle devuelve `message` localizado manteniendo `status` como token de máquina; el título del diálogo y el aviso salen del servidor. En Chromium: cabecera, tarjetas, insignia, buscador y `sse-connect` cambian de idioma, y el flujo completo funciona también tras recargar. Nota: el propio stream `/metrics?lang=xx` fija la cookie porque lleva la consulta; es coherente con el idioma de la página y no se considera defecto.
- [x] DP-14 — Tema oscuro y claro con conmutador accesible, sin destello al cargar y persistencia local. Medición en Chromium: con `prefers-color-scheme: dark` y sin nada guardado la página aplica `dark`; con `light`, `light`; al pulsar Oscuro se guarda `devops-pulse-theme` y **sobrevive a una recarga aunque el sistema diga `light`**; `aria-pressed` acompaña al estado; el diálogo y el toast cambian de fondo con el tema (`oklch(0.144 0.0048 245)` en oscuro, `rgb(255,255,255)` en claro); filtro y SSE siguen funcionando en ambos modos; sin errores de consola.
- [x] DP-15 — Alinear tipografía, radios, superficies y color con `docengine-docs` sin copiar su layout de documentación. Tokens usados y verificados por grep contra el CSS servido: `--bs-body-font-family`, `--bs-heading-font-family`, `--bs-font-mono`, `--bs-fg-body`, `--bs-fg-3`, `--bs-bg-body`, `--bs-bg-1`, `--bs-bg-black`, `--bs-border-subtle`, `--bs-radius-7`, `--bs-box-shadow-sm`, `--bs-accent-bg`, `--bs-progress-bg`, `--bs-control-bg`, `--bs-dialog-bg`. La paleta oscura incrustada desapareció de `app.css`. Fuentes: el CSS de Google Fonts y los tres `woff2` devuelven 200 y la carga explícita da `true` para Roboto, Roboto Condensed y JetBrains Mono. Radio de 12 px, cabecera fija translúcida al 82 % y sin transiciones con `prefers-reduced-motion`.
- [x] DP-16 — Corregir la separación de las tarjetas separando columna y tarjeta, y ajustar la canaleta a la escala de v6. Medición posterior: hueco horizontal 23–24 px y vertical 24 px (antes -1/0 y 12), ancho de tarjeta estable en 376 px, `nestedColumns: 0` y `columnsWithCardClass: 0` antes, después de un toggle y después de un tick SSE. La tarjeta se partió en `card-surface` (sólo la superficie, respuesta del toggle) y `server-card` (columna + superficie, rejilla inicial), porque la respuesta del toggle habría anidado una columna dentro de otra y reducido la tarjeta a un noveno.
- [x] DP-17 — Icono de ayuda por tarjeta con diálogo explicativo bilingüe servido por el servidor y clonado sin petición. Verificado en Chromium en las cuatro combinaciones idioma × tema: el disparador lleva nombre accesible localizado («Ayuda sobre API Gateway» / «Help for API Gateway»), el diálogo abre como modal real con el título «API Gateway · Ayuda» / «API Gateway · Help», tres elementos de lista, el texto dice que las métricas son simuladas y el descargo «no consulta ningún sistema real» / «does not query any real system», y cierra con `data-bs-dismiss`. Hay cuatro contenedores de ayuda en la página y **cero** en el payload SSE.
- [ ] DP-18 — Verificación de la iteración 2: `go test`, `go vet`, `go build`, `curl` (idioma, OOB) y navegador (tema, idioma, separación medida, ayuda).
- [ ] DP-19 — Confirmar los commits de la iteración 2 (pendiente de autorización).

## Defectos corregidos (ayuda y acentos del aviso)

1. **Título compartido entre diálogos.** El disparador de ayuda y el de registros compartían `data-dialog-title` y `data-service-id`, y `querySelector` devolvía el primero del DOM, que es el de ayuda: el diálogo de registros mostraba «API Gateway · Ayuda». Ahora ambos disparadores pasan el elemento pulsado (`@click="openLogs($el, …)"`) y el título sale de ese elemento, sin búsqueda ambigua. Verificado: «API Gateway · Registros» y «API Gateway · Ayuda» conviven.
2. **Acentos rotos en el aviso.** La cabecera `HX-Trigger` llevaba UTF-8 y el navegador expone las cabeceras como Latin-1, así que el aviso llegaba como «ahora estÃ¡ desconectado». El servidor serializa ahora el JSON con escapes `\uXXXX` (`asciiJSON`), de modo que la cabecera es ASCII puro y `JSON.parse` recupera el texto original. Verificado con `grep -c` de bytes altos en la cabecera (0) y en el navegador: «API Gateway ahora está desconectado.». Hay test de regresión en `main_test.go`.

## Defecto corregido (tipografía)

Síntoma reportado por el usuario: toda la interfaz se veía en serif. Causa: en
`app.css` las pilas de fuentes estaban entrecomilladas englobando la lista
completa (`--bs-body-font-family: "Roboto, system-ui, sans-serif"`), lo que en
una propiedad personalizada define **una sola familia** llamada
`Roboto, system-ui, sans-serif` con comas dentro del nombre. No resuelve, así que
el navegador usa su fuente por defecto, que es serif.

Prueba de la corrección, medida con métricas de canvas resueltas por elemento y
comparadas contra el serif:

| Elemento | Familia declarada | Resuelve a | ¿Cae al serif? |
| --- | --- | --- | --- |
| Subtítulo | `Roboto, system-ui, sans-serif` | Roboto | No |
| Encabezado principal | `"Roboto Condensed", …` | Roboto Condensed | No |
| Título de tarjeta | `"Roboto Condensed", …` | Roboto Condensed | No |
| Línea de registro | `"JetBrains Mono", …` | JetBrains Mono | No |
| Campo de búsqueda | `Roboto, system-ui, sans-serif` | Roboto | No |

Lección: el valor declarado y el valor resuelto se ven igual en el código; hay
que medir el resuelto. Una comprobación previa mía (`document.fonts.check`) dio un
falso negativo y otra midió la caja del bloque en lugar del texto, así que la
conclusión válida es la de la tabla.

## Iteración 3 — cabecera de la referencia, iconos y robustez de v6

Peticiones del usuario: el rediseño debía parecerse a la cabecera y a los selectores
de `docengine-docs`, los iconos de ayuda no se veían y debían quedar en la esquina
superior derecha.

### Defectos corregidos

1. **Icono de ayuda de 0 × 0 px.** El SVG solo tenía `viewBox` y las únicas reglas
   de tamaño cubrían `.input-group-text svg` y `.theme-switcher svg`. Medido: 0 × 0.
   Corregido con `.btn-icon` de v6 (control cuadrado, `aspect-ratio: 1`) más
   atributos `width`/`height` explícitos: botón de 38 × 38 con icono de 16 × 16.
   Commit `da9b090`.
2. **`.card-header` es columna en Bootstrap 6.** `flex-direction: column` está en el
   propio componente y `d-flex justify-content-between` no lo revierte, así que
   título, insignia e icono se apilaban y centraban en una cabecera de 74 px.
   Corregido con `flex-row` explícito y la insignia junto al título: cabecera de
   55 px, título en el borde izquierdo del contenido y el icono a 17 px del borde
   derecho y 9 px del superior. Commit `9bde9ef`.
3. **Cabecera y selectores genéricos.** Se sustituyó el `.btn-group` por el patrón
   real de la referencia: `site-header` fijo con `blur(14px) saturate(1.6)` y fondo
   al 82 %, marca de 34 × 34 px con degradado y radio de 10 px, y control
   segmentado con opciones de 28 px, radio de 8 px, `padding: 2px` y `gap: 2px`.
   El idioma son anclas con `aria-current` y el tema son botones de icono con
   `aria-pressed` y `is-active`.

### Medición de la iteración 3 en Chromium

| Comprobación | Resultado |
| --- | --- |
| Barra fija al hacer scroll | `position: sticky`, `top` 0 tras desplazar 500 px |
| Transparencia y desenfoque | `blur(14px) saturate(1.6)`, fondo `oklch(… / 0.82)` en oscuro y claro |
| Marca | «DP» de 34 × 34 px, radio 10 px, degradado de acento a info |
| Selectores | 2 grupos, 4 opciones de 28 px, activa con `accent-fg` sobre `accent-bg-subtle` |
| Cambio de tema | `dark` → `light`, `is-active` y `aria-pressed` coherentes, persistido |
| Foco por teclado | contorno de 3 px en cada parada de tabulación |
| Cambio de idioma | `<html lang="en">`, etiqueta de marca traducida, EN activo |
| Iconos | ayuda, tema y buscador a 16 × 16 px |
| Regresiones | diálogos, aviso, filtro, SSE y huecos 23–24 px intactos; sin errores de consola |

### Guardas añadidas

- `main_test.go`: la cabecera de tarjeta debe llevar `flex-row`, porque v6 la
  convierte en columna y el fallo es silencioso.
- `README.md`: sección «Bootstrap 6 traps found while building this app» con las
  ocho diferencias verificadas en este proyecto (columna en `.card-header`, SVG sin
  tamaño, escala de espaciado, listas de fuentes, botones y `Dialog`, ESM sin
  `window.bootstrap`, `hx-swap="none"` con OOB y cabeceras ASCII).
