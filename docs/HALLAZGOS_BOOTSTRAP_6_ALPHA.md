# Hallazgos verificados de Bootstrap 6 Alpha 1

Diferencias de la versión `6.0.0-alpha.1` que rompen en silencio: no dan error
de consola, no avisan en la documentación de migración y suelen interpretarse
como un fallo propio de CSS. Este documento las recoge con la comprobación
exacta que permite reproducirlas.

## Alcance y método

- **Versión verificada:** `bootstrap@6.0.0-alpha.1`, fijada exactamente en
  `docengine-docs/package.json` y en `devops-pulse/package.json`. Los hallazgos
  están ligados a esa versión; una versión posterior puede cambiarlos.
- **Evidencia primaria:** el paquete instalado. El CSS y el JS consultados son
  `devops-pulse/web/static/vendor/bootstrap.min.css` y
  `bootstrap.bundle.min.js`, copias del `dist` publicados por el script
  `devops-pulse/scripts/sync-assets.mjs`, y el código fuente en
  `docengine-docs/node_modules/bootstrap/`.
- **Evidencia secundaria:** documentación oficial en <https://getbootstrap.com/docs/6.0/>
  y las skills oficiales de `.agents/skills/bootstrap-*/SKILL.md`.
- **Clasificación de afirmaciones:** según `docs/inference-protocol.md`. En este
  documento todas las filas de la tabla son `HECHO CONFIRMADO` con
  `SE SOSTIENE`, porque cada una se comprobó ejecutando el comando indicado. Lo
  que no se pudo comprobar se recoge en «Límites y lo no verificado».
- **Cómo reproducir:** los comandos se ejecutan desde
  `devops-pulse/web/static/vendor/`, con `C=bootstrap.min.css`.

## Diez diferencias que fallan en silencio

| # | Hallazgo | Síntoma observable | Comprobación reproducible | Alternativa correcta |
| --- | --- | --- | --- | --- |
| 1 | `.card-header` es un contenedor flex **en columna** | Título, insignia y botones se apilan y se centran dentro de una cabecera alta, aunque el HTML diga `d-flex justify-content-between` | `grep -o '\.card-header{[^}]*}' $C` → contiene `flex-direction:column;…display:flex` | Añadir `flex-row` explícito en la cabecera |
| 2 | Un SVG inline con solo `viewBox` mide **0 × 0** | El icono desaparece sin más; no hay error | `grep -o '[^{};]\{0,30\}>svg{[^}]*}' $C` → solo hay tamaños para `.form-adorn-icon > svg`, `.chip-icon > svg` y `.chip-dismiss > svg` | Dar `width`/`height` al SVG o una regla propia |
| 3 | `.card-title` no existe | El título de tarjeta pierde el estilo y hereda el del encabezado | `grep -c '\.card-title' $C` → `0` | Usar `<h2 class="h5">` o la escala `.fs-*` |
| 4 | Utilidades de color renombradas | Texto secundario y fondos terciarios sin estilo | `grep -c '\.text-body-secondary' $C` → `0`; `grep -c '\.bg-body-tertiary' $C` → `0` | `.fg-3` para texto atenuado y `.bg-1`…`.bg-4` para capas de fondo |
| 5 | La escala de espaciado es más densa que en v5 | Todo queda pegado: `g-4` ya no son 1,5 rem | `grep -o -e '--bs-spacer-4:[^;}]*' $C` → `.75rem`; `grep -o '\.g-7,.gx-7{[^}]*}' $C` → `1.5rem` | El equivalente al `g-4` de v5 es `g-7`; la escala llega a `--bs-spacer-12: 3rem` |
| 6 | No hay `.btn-primary` | Botones sin color de variante | `grep -c '\.btn-primary[{, ]' $C` → `0` | Variante (`.btn-solid`, `.btn-outline`, `.btn-subtle`, `.btn-text`, `.btn-icon`) más una clase `.theme-*` |
| 7 | No hay clase `Modal` | `new bootstrap.Modal(...)` no existe; la ventana modal no abre | El bundle no exporta `Modal`; la cadena aparece solo en identificadores internos de `Dialog` (`showModal`, `_openedAsModal`) | `<dialog class="dialog">` con `Dialog.getOrCreateInstance(el).show()` o `data-bs-toggle="dialog"` |
| 8 | El JavaScript es solo ESM y no crea global | `window.bootstrap` es `undefined` y los componentes no se inicializan | `grep -c 'window\.bootstrap' bootstrap.bundle.min.js` → `0`; el archivo termina en `export{…}` | Importar los plugins desde el bundle en un `<script type="module">` |
| 9 | `.focus-ring` no existe como clase | Se copia la clase de la documentación y no pasa nada | `grep -c '\.focus-ring[{,]' $C` → `0`; sí existen `--bs-focus-ring`, `--bs-focus-ring-color`, `--bs-focus-ring-width`, `--bs-focus-ring-offset` | Consumir esas propiedades en una regla `:focus-visible` propia |
| 10 | Una pila de fuentes entrecomillada entera cae a serif | Toda la interfaz se ve en serif y el CSS parece correcto | En una propiedad personalizada, `"Roboto, system-ui, sans-serif"` es **una** familia con comas dentro del nombre; no resuelve y el navegador usa su fuente por defecto | Escribir la lista sin comillas y entrecomillar solo los nombres de varias palabras: `Roboto, system-ui, sans-serif` |

Dos matices que conviene conocer y no son evidentes:

- `--bs-heading-font-family` **se consume pero no se declara**:
  `grep -c -e '--bs-heading-font-family:' $C` → `0`, mientras la regla de
  encabezados usa `font-family:var(--bs-heading-font-family)`. Definirla en
  `:root` sí surte efecto, porque la propiedad se hereda.
- Las clases responsivas no usan el mismo mecanismo entre sí: `.md\:col-6`
  aparece dentro de `@media (width>=768px)`, mientras que las utilidades de
  rejilla `.md\:g-col-6` aparecen dentro de `@container`, y el contenedor lo
  aporta `.grid{container-type:inline-size}`. Los puntos de ruptura observados
  son 576, 768, 1024, 1280 y 1536 px (`sm`, `md`, `lg`, `xl`, `2xl`).

## Componentes: marcado verificado

- **Diálogo.** Elemento nativo con clases del componente:
  `<dialog class="dialog" id="…">` con `.dialog-header`, `.dialog-title`,
  `.dialog-body` y `.dialog-footer`; cierre con `data-bs-dismiss="dialog"`.
  Animaciones disponibles: `dialog-slide-up`, `dialog-slide-down`,
  `dialog-instant`; tamaño con `dialog-sm|lg|xl` y desplazamiento interno con
  `dialog-scrollable`.
- **Aviso flotante.** `.toast` está oculto por defecto
  (`.toast{…display:none}`) y aparece con `.toast.show{opacity:1;display:flex}`,
  así que **requiere JavaScript**: `Toast.getOrCreateInstance(el, {delay}).show()`.
  El contenedor es `.toast-container` y el color se da con `.theme-*`.
- **Progreso.** El contenedor lleva `role="progressbar"` con nombre accesible y
  `aria-valuenow/min/max`; el ancho se pone en el `.progress-bar` interno
  (`style="width: N%"` o una utilidad `w-*`). El color, con `.theme-*`.
- **Botones.** Base `.btn` compartida con las variantes; `.btn-icon` es el
  control cuadrado de solo icono (`aspect-ratio:1`, `padding:0`, centrado).
- **Control segmentado.** No es un componente de Bootstrap: es un patrón del
  proyecto de referencia (`.segmented` con `padding:2px`, `gap:2px`, opciones de
  `1.75rem` de alto y estado activo con `accent-fg` sobre `accent-bg-subtle`), y
  se reproduce con tokens `--bs-*`.

## Mediciones de coste (HTML por SSE)

Aplicación de referencia: `devops-pulse`, un panel que envía HTML renderizado
por el servidor cada 2 segundos sobre Server-Sent Events.

| Estado del tick | Bytes por tick sin comprimir | Bytes por tick en el cable | Por hora y pestaña |
| --- | --- | --- | --- |
| Primera versión: rejilla completa | 5.625 | — | 9,65 MiB |
| Actualización por fragmentos fuera de banda | 4.450 | — | ~7,6 MiB |
| Fragmentos fuera de banda con gzip | 4.259 | **276** | **0,47 MiB** |

Conclusión medida: comprimir aportó un 93,5 % de ahorro y un protocolo
incremental por línea de registro, un 11 % adicional a cambio de estado por
conexión y de tres defectos reales en el navegador. Se descartó. El detalle está
en `odd/tasks/devops-pulse.md`.

## Límites y lo no verificado

- **Sin compilación de Sass aquí.** `devops-pulse` sirve el CSS publicado, así
  que los tokens se sobrescriben desde CSS propio con nombres `--bs-*`. Con Sass
  se podrían cambiar mapas como `$root-tokens` y recortar el CSS generado; aquí
  no se hizo y no se puede deducir su comportamiento.
- **`g-col-*` sin contenedor.** Que una utilidad de rejilla `@container` caiga al
  tamaño del viewport cuando ningún ancestro declara `container-type` es
  comportamiento del estándar, no verificado en este repositorio. Evidencia
  pendiente: medirlo en un navegador con y sin ancestro contenedor.
- **Navegadores.** Las mediciones se hicieron con Chromium 1248 (Playwright
  1.64) a 1280×900 y 900×900. No se verificó Firefox ni WebKit.
- **Paquetes opcionales.** `@floating-ui/dom` y `vanilla-calendar-pro` no se
  ejercieron, así que no hay hallazgos sobre menús, popovers, tooltips ni
  selector de fecha.

## Fuentes

- Paquete instalado: `docengine-docs/node_modules/bootstrap/` (`dist/css`, `dist/js`, `scss/`, `js/src/`).
- Copia servida: `devops-pulse/web/static/vendor/bootstrap.min.css` y `bootstrap.bundle.min.js`.
- Skills oficiales: `.agents/skills/bootstrap-v6-install/SKILL.md`, `bootstrap-component/SKILL.md`, `bootstrap-component-js/SKILL.md`, `bootstrap-color-system/SKILL.md`.
- Documentación oficial: <https://getbootstrap.com/docs/6.0/components/dialog/>, <https://getbootstrap.com/docs/6.0/components/progress/>, <https://getbootstrap.com/docs/6.0/components/toast/>, <https://getbootstrap.com/docs/6.0/getting-started/javascript/>.
- Integración previa del workspace: `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md`.
- Aplicación donde se observaron: `devops-pulse/`, con su registro en `odd/tasks/devops-pulse.md`.

## Registro de evidencia

### No existen `.btn-primary` ni una clase `Modal`

- **Clasificación:** SE SOSTIENE
- **Categoría:** HECHO CONFIRMADO
- **Fuente:** CSS y bundle publicados (`bootstrap.min.css`, `bootstrap.bundle.min.js`)
- **Localización:** `grep -c '\.btn-primary[{, ]'` → `0`; el bundle exporta `Dialog` y no `Modal`; `grep -c 'window\.bootstrap'` → `0`
- **Justificación:** la lista de exportaciones del bundle se leyó completa y la cadena `Modal` solo aparece en identificadores internos del diálogo
- **Evidencia pendiente:** ninguna

### La cabecera de tarjeta necesita `flex-row`

- **Clasificación:** SE SOSTIENE
- **Categoría:** HECHO CONFIRMADO
- **Fuente:** CSS publicado y medición en Chromium
- **Localización:** `grep -o '\.card-header{[^}]*}'` → `flex-direction:column`; medición: 74 px de alto y contenido centrado sin `flex-row`, 55 px con él
- **Justificación:** el componente fija la dirección y las utilidades del HTML no la revierten
- **Evidencia pendiente:** ninguna

### El coste del tick SSE bajó un 93,5 %

- **Clasificación:** SE SOSTIENE
- **Categoría:** HECHO CONFIRMADO
- **Fuente:** ejecución real con `curl -sN` y `curl -sN -H 'Accept-Encoding: gzip'` sobre la misma ventana de tiempo
- **Localización:** 4.259 B por frame sin comprimir frente a 276 B en el cable; verificación en Chromium sin errores de consola
- **Justificación:** medido sobre frames completos, contando frames por separador de evento
- **Evidencia pendiente:** ninguna
