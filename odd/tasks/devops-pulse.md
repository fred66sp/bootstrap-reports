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

- [ ] DP-13 — Interfaz bilingüe ES/EN con español por defecto: tabla de mensajes en Go, `?lang=` con cookie de persistencia, atributo `lang` del documento y `sse-connect` en el idioma activo.
- [ ] DP-14 — Tema oscuro y claro con conmutador accesible, sin destello al cargar y persistencia local.
- [ ] DP-15 — Alinear tipografía, radios, superficies y color con `docengine-docs` sin copiar su layout de documentación.
- [x] DP-16 — Corregir la separación de las tarjetas separando columna y tarjeta, y ajustar la canaleta a la escala de v6. Medición posterior: hueco horizontal 23–24 px y vertical 24 px (antes -1/0 y 12), ancho de tarjeta estable en 376 px, `nestedColumns: 0` y `columnsWithCardClass: 0` antes, después de un toggle y después de un tick SSE. La tarjeta se partió en `card-surface` (sólo la superficie, respuesta del toggle) y `server-card` (columna + superficie, rejilla inicial), porque la respuesta del toggle habría anidado una columna dentro de otra y reducido la tarjeta a un noveno.
- [ ] DP-17 — Icono de ayuda por tarjeta con diálogo explicativo bilingüe servido por el servidor y clonado sin petición.
- [ ] DP-18 — Verificación de la iteración 2: `go test`, `go vet`, `go build`, `curl` (idioma, OOB) y navegador (tema, idioma, separación medida, ayuda).
- [ ] DP-19 — Confirmar los commits de la iteración 2 (pendiente de autorización).
