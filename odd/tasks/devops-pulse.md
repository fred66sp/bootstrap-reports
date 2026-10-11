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
- [x] DP-19 — Confirmar los commits de la iteración 2: `c3a7cbb`, `7c6a08a`, `f9147f4`, `2d9e0fe` y `62f4d53`.

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

## Criterio de coste (regla permanente de este proyecto)

Antes de escribir código, cada unidad declara su presupuesto y el diseño más
barato que cumple el requisito. No se codifica y luego se optimiza.

**Por qué está aquí.** En la primera versión del stream no se midió el coste por
tick hasta que el usuario lo pidió: la línea base era de 5.625 B por tick y nadie
lo sabía. Esa medición tardía es la causa de las tres vueltas siguientes
(OOB por tarjeta, deltas por línea, reversión de los deltas).

**Qué se declara antes de implementar:**

- el presupuesto: bytes por tick y por hora, latencia, número de peticiones y de
  nodos del DOM que se sustituyen;
- la alternativa más barata que cumple el requisito, y por qué se descarta si no
  se elige;
- la medición exacta que demostrará el cumplimiento al cerrar la unidad.

**Orden de preferencia aprendido aquí:**

1. Comprimir antes de estructurar. La redundancia que un delta intenta eliminar
   es justo lo que gzip ya reduce: el delta prometía 50 % y midió 11 %.
2. Un protocolo con estado por conexión solo si la medición posterior a comprimir
   lo justifica, nunca por intuición.
3. Decidir la propiedad del estado en el diseño: el ritmo de los datos no puede
   depender de cuántos clientes miren ni de conexiones que quedan abiertas.
4. Toda afirmación de rendimiento se mide; ninguna se estima.

**Cifras de referencia de esta aplicación:**

| Estado | Bytes por tick | Por hora y pestaña |
| --- | --- | --- |
| Primera versión (grid completo, sin comprimir) | 5.625 | 9,65 MiB |
| Con OOB por tarjeta y deltas, sin comprimir | ~4.450 | ~7,6 MiB |
| Con gzip sobre el frame completo | ~322 | ~0,55 MiB |

**Verificación que vale para protocolos DOM:** `curl` no verifica un cambio de
`hx-swap-oob`, ids o swaps; hay que abrir el navegador y contar nodos, además de
contar eventos `htmx:oobErrorNoTarget`, que htmx no escribe en consola.

## Iteración 4 — coste del tick SSE (medido antes y después)

Presupuesto declarado antes de implementar: ~322 B por tick con gzip, sin estado
por conexión para los logs y con un único testigo global. Cumplido y mejorado.

| Estado | Bytes por tick sin comprimir | Bytes por tick en el cable | Por hora y pestaña |
| --- | --- | --- | --- |
| Primera versión | 5.625 | — | 9,65 MiB |
| OOB por tarjeta con deltas por línea | 4.450 | — | ~7,6 MiB |
| **OOB por tarjeta con gzip, sin deltas** | **4.259** | **276** | **0,47 MiB** |

Ahorro en el cable: 93,5 % (unas 20 veces). Medido con `curl -sN` y
`curl -sN -H 'Accept-Encoding: gzip'` sobre la misma ventana de tiempo.

Decisiones y defectos de esta iteración:

- **Los deltas por línea se revierten.** Medidos, ahorraban 14 % sin comprimir y
  solo 11 % después de comprimir, porque el markup repetido es justo lo que gzip
  elimina. En el navegador produjeron tres defectos: el latido corrompía el gzip
  (`ERR_CONTENT_DECODING_FAILED`), 36 eventos `htmx:oobErrorNoTarget` por borrados
  de líneas inexistentes y el vaciado de la lista de logs a cero líneas.
- **Latido corregido:** el comentario `: keep-alive` debe escribirse por el mismo
  escritor que los frames, no en el `ResponseWriter` crudo.
- **Un único testigo global:** antes avanzaba el ticker de cada conexión, así que
  dos pestañas duplicaban el avance y una conexión muerta sin cerrar lo seguía
  acelerando. Ahora los tests son deterministas y el ritmo no depende de cuántos
  miren.

Verificación de cierre en Chromium, cruzando el latido de los 15 s: cero errores
de consola, cero `htmx:oobErrorNoTarget`, seis líneas de log por servicio en los
tres muestreos, sin identificadores duplicados, barras actualizándose, diálogo de
registros con seis líneas y aviso tras el cambio de estado. Commit `5d84882`.

## Producto duradero del POC

Los hallazgos transversales de esta aplicación se elevaron a
`docs/HALLAZGOS_BOOTSTRAP_6_ALPHA.md`, para que sobrevivan a `devops-pulse` y
sirvan a cualquier aplicación del workspace: diez diferencias de Bootstrap 6
Alpha 1 con su comprobación reproducible, el marcado verificado de diálogo,
aviso, progreso, botones y control segmentado, la tabla de coste del tick SSE y
una sección explícita de límites y comprobaciones pendientes.

## Cierre

- **Integración:** `main` avanzó por avance rápido desde `a472d52` hasta
  `f5a6455`, con los 16 commits de la rama. `main` y `feature/devops-pulse`
  quedaron idénticos, y la rama se conserva para revisión o para retomar el POC.
- **Comprobación previa:** árbol limpio, `main` ancestro de la rama, ninguna ruta
  generada en el diff, y `go test ./...`, `go vet ./...` y `go build` correctos.
  Tras integrar se repitió `go test -count=1 ./...` sobre `main`, sin caché, con
  resultado correcto.
- **Producto duradero:** `docs/HALLAZGOS_BOOTSTRAP_6_ALPHA.md` con los hallazgos
  verificados, y las skills del proyecto versionadas con su procedencia descrita
  en `.agents/skills/README.md`.
- **Alcance:** no hubo operaciones remotas. El repositorio no tiene remoto
  configurado y no se hizo `push`, etiqueta ni publicación.
- **Criterio de coste aplicado:** en la última unidad el presupuesto se declaró
  antes de implementar (~322 B por tick con gzip) y se cerró midiendo 276 B.
- **Pendiente menor, sin causa atribuida:** quedaron tres sockets TCP en estado
  establecido cuyo extremo cliente no muestra proceso dueño. Se comprobó que un
  cliente muerto de golpe se libera en 4 s y que, con el testigo global, esas
  conexiones ya no alteran el ritmo de los datos. Desaparecen al reiniciar el
  servidor.

## Iteración 5 — Integración del motor de plantillas Jet 6

Petición del usuario: integrar en `devops-pulse` el motor de plantillas Jet 6,
sobre la actualización de skills que ya declara Jet como motor predeterminado
del stack Go + HTMX del proyecto.

### Decisiones del usuario

- **Forma de la migración: idiomática completa.** `web/views/` con layout de
documento (`extends`/`block`/`yield`), páginas y fragmentos HTMX autónomos; un
solo archivo por fragmento, reutilizado desde la página, la respuesta del
toggle y el frame SSE. Se descarta el porte mecánico 1:1.
- **Cierre de Git:** rama de tarea `feature/jet6-devops-pulse` con un commit por
unidad de trabajo. Sin `push`, sin `merge`, sin etiquetas.

### Evidencia de fuentes comprobada antes de escribir código

| Hecho | Fuente |
| --- | --- |
| API v6: `NewSet(loader, opts...)`, `NewOSFileSystemLoader`, `NewInMemLoader`, `GetTemplate`, `Template.Execute(w, VarMap, data)` | pkg.go.dev `github.com/CloudyKit/jet/v6` |
| `Loader` = `Exists(string) bool` + `Open(string) (io.ReadCloser, error)`; las rutas se resuelven a rutas absolutas con `/` y relativas al archivo que contiene `extends`/`include`/`import` | `loader.go` del repositorio oficial |
| El escaping está activado por defecto (`escapee: template.HTMLEscape`) y es escape HTML **genérico**, no contextual como `html/template` | `set.go` del repositorio oficial |
| `Template.Execute` es seguro en concurrencia: cada ejecución toma un `*Runtime` de un `sync.Pool` | `eval.go` del repositorio oficial |
| Sintaxis: `extends` al inicio, `block`/`yield`/`content`, `import`, `include` con contexto como último argumento, `{{ try }}`, ternario, *pipelines*, comentarios `{* *}` | `docs/syntax.md` oficial |
| Versión a fijar: `v6.3.3`, la última de la línea v6 | `go list -m -versions github.com/CloudyKit/jet/v6` |
| El escape de `text/template.HTMLEscape` cubre NUL, `"`, `'`, `&`, `<`, `>`; el de `html/template` cubre además `+` | `$GOROOT/src/text/template/funcs.go:600-621` y `$GOROOT/src/html/template/html.go` |
| `html/template` solo se usa en `devops-pulse/main.go`; `docengine-docs/` es Vite/JS | búsqueda en el árbol |
| RDD está apagado (`global: off`), así que no hay ciclo de revisión nativa para este candidato | `gentle-ai review mode status` |

### Defectos detectados en la exploración (no corregidos aún)

1. **Referencia rota en la skill actualizada.** `web-stack-architecture/SKILL.md`
   quedó con `https://pkg.go.dev/Jet 6`, que no es una URL válida; las otras
   skills apuntan a `https://pkg.go.dev/github.com/CloudyKit/jet/v6`.
2. **La skill nueva no está registrada.** `.agents/skills/README.md` no lista
   `jet-template-engine` en su tabla de procedencia, y el archivo es la única
   fuente de procedencia que el propio README declara obligatoria.
3. **Código muerto.** `renderGrid` no se llama desde ningún punto de `main.go`
   ni de `main_test.go` (solo su definición, `main.go:254`). Con ella quedan sin
   ejercitar el `{{define "service-oob"}}` y la rama `OutOfBand` de
   `server-grid`: portarlos a Jet sería mantener vistas que ninguna prueba
   cubre.

### Criterio de coste — presupuesto declarado antes de implementar

- **Presupuesto:** salida byte a byte idéntica a la baseline congelada (diff de
  0 líneas) en la página ES/EN, la tarjeta del toggle y los tres frames SSE
  deterministas; ≤ 5.215 B por tick estacionario sin comprimir y ≤ 276 B por
  tick en el cable con gzip; coste de render por tick no peor que la baseline medida
  (`go test -bench`, ns/op y B/op); sin goroutines nuevas ni estado por conexión.
- **Alternativa más barata que cumple el requisito y por qué se descarta:**
  conservar `html/template` (cero dependencias nuevas, cero riesgo). Se
  descarta porque la skill del proyecto ya declara Jet 6 como motor
  predeterminado del stack y el propósito del POC es validar esa integración.
- **Medición que demostrará el cumplimiento:** diff byte a byte contra los
  golden files congelados antes de migrar, comparación de los números de
  `-bench` registrados antes y después, y contador de bytes sobre una conexión
  SSE real con y sin gzip.

### Baseline congelada y medida antes de migrar (JET-21)

Golden files deterministas en `devops-pulse/testdata/`, generados con
`go test -run TestRenderedOutputMatchesFrozenBaseline -update` contra el motor
`html/template` todavía en uso:

| Caso | Bytes | Qué cubre |
| --- | --- | --- |
| `page-es` | 19.931 | documento completo en español |
| `page-en` | 19.534 | documento completo en inglés |
| `toggle-es` | 3.297 | `card-surface` devuelta por `POST /toggle-service` |
| `tick-first-es` | 5.601 | primer frame SSE: métricas, logs y los cuatro estados |
| `tick-steady-es` | 5.178 | frame SSE estacionario: métricas y logs, sin estados |
| `tick-status-change-es` | 5.283 | frame SSE con el estado de `checkout` cambiado |

Los casos SSE usan un anillo de logs determinista de seis líneas por servicio
(`fillLogRing`), porque `advanceMetrics` marca las líneas con reloj de pared y el
anillo sembrado tiene una sola línea: sin ese fixture el baseline describiría un
frame irreal.

Coste medido con `html/template`, `go test -run XXX -bench . -benchmem -count=5`:

| Escenario | ns/op | B/op | allocs/op |
| --- | --- | --- | --- |
| `BenchmarkPageRender` (documento `/`) | ~271.500 | 140.990 | 2.167 |
| `BenchmarkTickFrameRender` (frame de 5.178 B) | ~105.800 | 58.892 | 801 |

Coste medido en el cable, servidor real tras 12 s de calentamiento (anillo
completo, 24 elementos `<li>` por frame) con `curl -sN`:

| Métrica | Valor |
| --- | --- |
| Frame estacionario sin comprimir | 5.211–5.231 B en el cable (HTML 5.190–5.210 B) |
| Primer frame de una conexión nueva | 5.634 B (incluye los cuatro fragmentos de estado) |
| Frame estacionario con gzip | 271,0 B de media por frame |

**Discrepancia detectada y conservada.** La tabla de la iteración 4 registra
4.259 B por tick sin comprimir y esa cifra no se reproduce. La medición se hizo
entonces sobre una conexión recién abierta, con el anillo de logs a media carga
(12 elementos `<li>` por frame en lugar de 24), así que subestimaba el estado
estacionario en unos 900 B. La cifra de gzip de la iteración 4 (276 B) sí se
reproduce (271 B). No se reescribe la tabla histórica: se conserva y se corrige
el presupuesto de esta iteración con la medición nueva.

### Resultado de la migración a Jet 6 (JET-22)

Dependencia fijada: `github.com/CloudyKit/jet/v6 v6.3.3`, con
`github.com/CloudyKit/fastprinter` como indirecta. Diez vistas en
`devops-pulse/web/views/`, y `web/templates/` eliminado:

| Vista | Bytes |
| --- | --- |
| `layouts/base.jet` | 1.599 |
| `pages/index.jet` | 4.289 |
| `partials/server-grid.jet` | 155 |
| `partials/server-card.jet` | 127 |
| `partials/logs-dialog.jet` | 1.480 |
| `fragments/card-surface.jet` | 2.119 |
| `fragments/metrics.jet` | 914 |
| `fragments/logs.jet` | 232 |
| `fragments/status.jet` | 216 |
| `fragments/service-oob.jet` | 118 |

Contrato de render: `viewLoader` implementando `jet.Loader` sobre
`fs.Sub(embed.FS, "web/views")`; `jet.NewSet` con
`WithTemplateNameExtensions{"", ".jet"}`; y `newApplicationFromViews`, que
**parsea todas las vistas al construir** la aplicación, de modo que una vista
rota falla al arrancar nombrando su ruta en lugar de fallar en la primera
petición. `newApplication()` conserva su firma y entra en pánico, como hacía
`template.Must`; `run()` devuelve el error. Cada fragmento es un archivo
renderizable por separado y a la vez incluible con
`{{ include "/fragments/x.jet" . }}`, sin marcado duplicado.

Identidad byte a byte comprobada por dos vías independientes:

| Comprobación | Resultado |
| --- | --- |
| Seis golden files | 0 bytes de diferencia |
| Cinco frames SSE consecutivos en el cable | idénticos a la baseline: 5.634 / 5.219 / 5.231 / 5.223 / 5.211 B |

Coste medido después de migrar con `go test -run XXX -bench . -benchmem -count=5`:

| Escenario | `html/template` | Jet 6 | Cambio |
| --- | --- | --- | --- |
| Página `/` | ~271.500 ns/op · 140.990 B/op · 2.167 allocs | ~82.700 ns/op · 70.730 B/op · 254 allocs | 3,3× menos tiempo, 8,5× menos asignaciones |
| Frame SSE de 5.178 B | ~105.800 ns/op · 58.892 B/op · 801 allocs | ~39.500 ns/op · 44.130 B/op · 166 allocs | 2,7× menos tiempo, 4,8× menos asignaciones |

Coste en el cable sobre ventanas equivalentes de diez frames, con 24 `<li>` en
cada frame:

| Motor | Sin comprimir (diez frames) | gzip por frame | Media estacionaria |
| --- | --- | --- | --- |
| `html/template` | 52.675 B | 263,6 B | 5.222,6 B |
| Jet 6 | 52.667 B | 265,3 B | 5.221,7 B |

Desviación declarada, no ocultada: el umbral presupuestado era 5.215 B por tick
estacionario y la media medida es 5.221,7 B, 6,7 B por encima. Está dentro del
rango que la propia baseline mostraba (5.211–5.231 B) y la causa es el texto de
las líneas de log según la fase del testigo, no el motor: el payload sin
comprimir difiere en 8 B sobre diez frames (0,015 %) y los seis golden files
coinciden con 0 bytes de diferencia, que es el criterio exacto y el que se
declara cumplido. La diferencia de gzip (0,6 %) tiene la misma causa y el camino
de compresión no cambió.

### Hallazgos verificados de Jet 6 en esta migración

1. **Los comentarios JavaScript de un `<script>` en línea desaparecen con
   `html/template` y reaparecen con Jet.** El escapador contextual sustituye un
   comentario de bloque JS por **un solo espacio** —o por un salto de línea si el
   comentario contiene un terminador de línea—: `$GOROOT/src/html/template/escape.go:781-795`,
   «Comments behave like white space and are discarded». El comentario original
   `/* storage unavailable */`, rodeado de dos espacios literales, se sirvió como
   tres espacios. Verificado en el golden: `page-es` contiene `catch (e) {   }` y
   ninguna aparición de «storage unavailable». Jet emite el texto literal, así
   que la vista conserva esos tres espacios y un comentario Jet `{* *}` —que no
   emite nada— explica por qué no deben «arreglarse».
2. **El contenido de un archivo incluido se emite literal, incluido su salto de
   línea final.** En `html/template` todo el texto fuera de `{{define}}` se
   descarta, de modo que los archivos podían terminar en salto de línea sin
afectar a la salida. En Jet, no: `fragments/` y `partials/` tienen que cerrar sin
   salto de línea. Comprobado con `tail -c 1` sobre las diez vistas (último byte
   `>` o `}`) y con la identidad byte a byte.
3. **El parseo ocurre en `GetTemplate`**, no en la primera ejecución: recorrer
   las vistas al construir la aplicación convierte un error de sintaxis en un
   fallo de arranque con la ruta de la vista.
4. **La indirección por nombre desaparece**: `extends`/`block`/`yield` para el
   documento, `include` con contexto explícito para los componentes.

### Tareas de la iteración 5

- [x] JET-20 — Registrar la actualización de skills: alta de `jet-template-engine`
  en `.agents/skills/README.md`, corrección de la referencia rota en
  `web-stack-architecture/SKILL.md` y regeneración del índice no versionado.
  **Cerrada** en `48c64e5`. El índice `.atl/skill-registry.md` ya listaba la
  skill nueva (lo genera la extensión) y no se versiona.
- [x] JET-21 — Crear `feature/jet6-devops-pulse` y congelar la baseline de
  render de `html/template` como golden files deterministas, con la medición
  previa de coste por tick. **Cerrada.** RED observado con los golden ausentes,
  GREEN tras `-update`, `gofmt` y `go vet` limpios, seis cifras de coste
  registradas y una discrepancia encontrada en la tabla histórica.
- [x] JET-22 — Migrar `devops-pulse` a Jet 6 `v6.3.3`: dependencia, loader sobre
  `embed.FS`, `Set` con compilación de todas las vistas al arrancar, vistas en
  `web/views/` y `main.go` enlazado, con los golden files byte-idénticos.
  **Cerrada.** Unidad delegada a `gentle-ai-worker` y verificada después por el
  orquestador: `gofmt`, `go vet`, `go test -count=1 ./...`, `-race` y el golden
  forzado, todos correctos. El writer no podía borrar `web/templates/`, así que
  el borrado y la eliminación de la indirección por nombre en `renderFragment`
  los hizo el orquestador, con la identidad byte a byte re-verificada después.
- [ ] JET-23 — Añadir guardas: escaping de metacaracteres HTML, invariante de
  los literales JS de Alpine, paridad de claves ES/EN, ruta de fallo de render
  sin escritura parcial y ejecución concurrente bajo `-race`.
- [ ] JET-25 — Eliminar la ruta muerta `renderGrid` / `service-oob` con su
  justificación.
- [ ] JET-24 — Verificar: `go test`, `go vet`, `go build`, `-race`, benchmark,
  bytes por tick antes y después, `curl` sobre las rutas reales y comprobación
  en navegador.
- [ ] JET-26 — Documentar los hallazgos de Jet en `devops-pulse/README.md` y
  cerrar la tarea.

### Progreso de la iteración 5

- Exploración completada sin haber modificado ningún archivo del proyecto.
  Los cambios previos sin confirmar del usuario (cuatro `SKILL.md` y la skill
  nueva) se conservan intactos.
- El toque de atención operativo de la unidad delegada: el writer reportó dos
  afirmaciones que parecían contradictorias («comentario JavaScript sustituido
  por espacios» junto con «salida byte-idéntica»). La verificación del
  orquestador las confirmó ambas y encontró el mecanismo en la fuente de Go: no
eran contradictorias, eran el hallazgo 1 de la lista anterior.
