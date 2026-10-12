# DevOps Pulse

DevOps Pulse es un pequeño panel de operaciones en tiempo real. Demuestra una
integración HTML-first de un servidor HTTP de la biblioteca estándar de Go, eventos
HTML enviados por el servidor, HTMX, Alpine.js y Bootstrap 6 Alpha.

## Ejecutar

```sh
npm install
npm run sync:assets
go run .
```

Abra <http://localhost:8080>. Use `go run . -addr :9090` para elegir otra
 dirección. El servidor comprueba los activos incluidos al iniciarse e informa del
 comando exacto de reparación cuando falta uno:

```text
npm install && npm run sync:assets
```

## Arquitectura

- `main.go` contiene el modelo de dominio, un almacén de estado en memoria protegido por un mutex,
  el conjunto de vistas templ, los handlers y la conexión del servidor.
- `GET /metrics` envía HTML renderizado por el servidor mediante SSE, comprimido con gzip cuando el
  cliente anuncia gzip. La cuadrícula usa `hx-swap="none"`; cada frame envía métricas completas por
  servicio y fragmentos OOB del contenedor de logs, mientras que el estado solo se envía cuando cambia
  para esa conexión. No se analiza JSON en el navegador y las raíces de las tarjetas y los formularios
  del pie sobreviven a cada tick. El español es el idioma predeterminado resuelto por el servidor; los
  valores válidos de consulta `lang` persisten en una cookie y el mismo idioma se transmite por el flujo
  SSE y el formulario de alternancia.
- Un modelo `views.ServiceView` y un fragmento templ por elemento renderizan la tarjeta inicial, los
  elementos SSE OOB y la respuesta de alternancia. El flag `OutOfBand` añade `hx-swap-oob` solo a la
  salida SSE. Las métricas usan recorridos aleatorios acotados; cada servicio conserva seis líneas de
  log simples y cada conexión SSE registra los estados que ha enviado.
- El estado de Alpine envuelve la barra de herramientas y la cuadrícula estable. Los logs se clonan
  desde el `<div>` oculto de cada tarjeta al diálogo compartido sin `x-html` ni `innerHTML` con datos del servidor.
- Las API ESM `Dialog` y `Toast` de Bootstrap 6 gestionan el diálogo y la notificación de alternancia.
  La página usa `data-bs-theme` para los modos claro y oscuro; la elección se aplica antes del pintado
  y persiste en el almacenamiento local.

## Vistas Templ

Las vistas son componentes templ del paquete Go `web/views/`:

- `layout.templ` es la envoltura del documento y recibe la página como `{ children... }`.
- `page.templ` contiene el panel y los dos diálogos.
- `fragments.templ` contiene el bucle de la cuadrícula, la columna de la tarjeta, la tarjeta y los tres
  fragmentos. `views.Metrics`, `views.Logs` y `views.Status` se renderizan de forma independiente desde Go
  (el frame SSE y la respuesta de alternancia) **y** se invocan desde el componente de tarjeta, por lo
  que un fragmento tiene una única definición.

`go tool templ generate` compila esos archivos en los `*_templ.go` generados que compila `go build`.
La CLI de templ está fijada en la directiva `tool` de `go.mod`, por lo que el código generado es
reproducible. El renderizado sigue pasando por un buffer, así que un error de renderizado nunca escribe
medio documento.

templ minimiza durante la generación: elimina los espacios entre elementos, convierte un salto de línea
entre nodos inline en un espacio y cierra explícitamente cada elemento no vacío. La línea base de
`testdata/` se regeneró a partir de esa salida validada y `TestRenderedOutputMatchesFrozenBaseline` la
fija byte por byte. Es equivalente a la línea base de la era Jet, no idéntica: el punto y coma final que
templ añade a `style`, las comillas de atributos y `<path/>` frente a `<path></path>` difieren, y el DOM
que construyen es el mismo.

## Diferencias de Bootstrap 6

Este ejemplo usa intencionadamente `.btn-solid` con `.theme-*`, `.fg-3`, `.border-subtle` y `<dialog class="dialog">` nativo. No usa `.btn-primary`, `.modal`, `.offcanvas` ni `window.bootstrap`, exclusivos de Bootstrap 5. El CSS y el bundle ESM de Bootstrap incluidos se usan tal cual; no hay ningún paso de Sass o PostCSS.

## Decisiones sobre activos de Alpine y SSE

Se usa la estrategia ESM preferida de Alpine: `alpinejs/dist/module.esm.js` se copia a
`web/static/vendor/alpine.module.esm.js`, `app.js` lo importa y se inicia después de registrar
`pulseDashboard`. El código fuente no contiene líneas de importación desnudas: `grep -nE "(^import |from ['\"]|require\\()" node_modules/alpinejs/dist/module.esm.js`
no devolvió coincidencias.

El directorio de extensión SSE contiene `sse.esm.js`, `sse.js`, `sse.min.js` y `sse.min.js.gz`
(`ls -l node_modules/htmx-ext-sse/dist`). El script de sincronización detecta y copia el `sse.min.js`
minificado como `htmx-ext-sse.min.js`.

## Verificación de tokens

Mantenga explícito el contrato de tokens de Bootstrap al cambiar `web/static/app.css`:

```sh
missing=$(for token in $(grep -oE -- '--bs-[a-z0-9-]+' web/static/app.css | sort -u); do grep -qF -- "$token" web/static/vendor/bootstrap.min.css || printf '%s\n' "$token"; done)
printf 'missing Bootstrap tokens:\n%s' "$missing"
test -z "$missing"
```

El comando termina con un estado distinto de cero si falta en el CSS de Bootstrap incluido algún token
`--bs-*` usado por la página.

## Familias tipográficas

Entrecomille solo los nombres de familia que lo necesitan, nunca la lista completa. En una propiedad
personalizada, `"Roboto, system-ui, sans-serif"` es un único nombre de familia que contiene comas: nunca
se resuelve y el navegador vuelve a su fuente predeterminada, que es serif. Escriba la lista sin comillas
y entrecomille solo los nombres de varias palabras:

```css
--bs-body-font-family: Roboto, system-ui, sans-serif;
--bs-heading-font-family: "Roboto Condensed", Arial Narrow, sans-serif;
--bs-font-mono: "JetBrains Mono", ui-monospace, monospace;
```

Compruebe la familia resuelta, no solo el valor declarado, porque ambas cosas parecen correctas en el
código fuente. En la consola del navegador, compare el ancho que un canvas informa para el `font-family`
calculado del elemento con los anchos de la familia real y de `serif`; anchos iguales para la familia y
un ancho distinto para `serif` demuestran que el texto no recurre a la alternativa.

## Estado de verificación

Observado localmente:

- `npm install`: correcto; el lockfile raíz fija `alpinejs 3.17.4`, `bootstrap 6.0.0-alpha.1`,
  `htmx-ext-sse 2.2.4` y `htmx.org 2.0.11`.
- `npm run sync:assets`: correcto. Archivos: `alpine.module.esm.js` (128289 bytes),
  `bootstrap.bundle.min.js` (219860), `bootstrap.min.css` (381199), `htmx-ext-sse.min.js` (2853) y
  `htmx.min.js` (52182).
- Antes de la implementación, `go test ./...` produjo fallos de compilación por `newStateStore`,
  `statusOffline` y `newApplication` indefinidos (RED). Después de la implementación, `go test ./...`
  devolvió `ok   devops-pulse 0.042s` (GREEN).
- `go vet ./...` fue correcto y `go build -o bin/devops-pulse .` fue correcto.
- POC Templ, ahora el motor: `go tool templ generate`, `go build ./...`, `go vet ./...` y `go test ./...`
  son correctos, y la línea base dorada en `testdata/` se regeneró a partir de la salida templ validada.
  La prueba de humo siguiente se repitió contra la compilación templ con los mismos códigos de estado,
  encabezados y frames `event: metrics`.
- POC Templ: las comprobaciones del navegador se repitieron en Chromium a 1440x900 — insignia SSE activa,
  filtro Alpine, anillo de logs de seis líneas, toast de alternancia con la insignia de estado coherente,
  ambos diálogos, tema oscuro con persistencia tras recarga y navegación en inglés — con cero errores de
  consola, errores de página o solicitudes fallidas.
- Una prueba de humo con un servidor real mostró dos frames `event: metrics` de
  `curl -sN --max-time 5 .../metrics`. Un POST para `api-gateway` devolvió `200`,
  `Content-Type: text/html; charset=utf-8`, una cabecera JSON `HX-Trigger` con estado `Offline` y el HTML
  actualizado de la tarjeta.
- Una prueba A/B de Jet frente a templ sobre esa misma tarjeta mostró el mismo estado intermedio de ~20 ms
  mientras htmx aplica el markup intercambiado (un atributo y un nodo de texto de la insignia de estado se
  estabilizan en pasos separados); por tanto, es comportamiento de htmx y no una diferencia de renderizado.
- La comprobación de clases de plantilla siguiente no informó clases de Bootstrap ausentes:

```sh
python3 - <<'PY'
import re
from pathlib import Path
css = Path('web/static/vendor/bootstrap.min.css').read_text()
custom = {'brand', 'brand__mark', 'brand__tag', 'is-active', 'pulse-heading', 'pulse-icon', 'segmented', 'segmented__icon', 'segmented__option', 'service-card', 'site-controls', 'site-header', 'site-header__bar', 'toolbar', 'metric-row', 'search-box', 'eyebrow', 'htmx-indicator'}
classes = set()
for path in Path('web/views').rglob('*.templ'):
    text = path.read_text()
    for value in re.findall(r'class=\{([^}]*)\}', text):
        value = re.sub(r'[!=]=\s*"[^"]*"', '', value)  # drop comparison operands
        for name in re.findall(r'"([^"]+)"', value):
            classes.update(name.split())
    text = re.sub(r'\{[^{}]*\}', ' ', text)
    for value in re.findall(r'(?<!:)class="([^"]*)"', text):
        classes.update(value.split())
missing = []
for name in sorted(classes - custom):
    selector = re.escape(name.replace(':', r'\:'))
    if not re.search(r'\.' + selector + r'(?:[,{: .])', css):
        missing.append(name)
print('missing Bootstrap classes:', missing)
PY
```

El diseño de actualización OOB evita específicamente reemplazar las raíces de las tarjetas mientras hay
una solicitud de alternancia en curso. El CSS de Bootstrap incluido ya proporciona una regla `[hidden]`
(`grep -q '\\[hidden\\]' web/static/vendor/bootstrap.min.css`), por lo que no se necesita una regla
hidden personalizada.

La animación, la búsqueda, el diálogo y el toast a nivel de navegador no se ejercitaron con un navegador
en la primera implementación. Más tarde se verificaron en Chromium (Playwright, 1440x900) y se volvieron
a verificar tras el cambio de Jet 6 a templ; el resultado registrado está en `odd/tasks/devops-pulse.md`, bajo la
iteración 5. Cubre la insignia activa después de conectar el flujo, el filtrado Alpine, ambos diálogos
como modales reales, el toast de alternancia localizado, la supervivencia de la raíz de la tarjeta y su
formulario a un tick SSE completo, la persistencia del tema oscuro tras una recarga y la navegación en
inglés, con cero errores de consola, cero errores de página y cero `htmx:oobErrorNoTarget`.

## Exclusiones deliberadas de alcance

No hay base de datos, autenticación, persistencia, módulo Go de terceros, bundler de frontend,
personalización de Sass ni configuración de despliegue en producción. `node_modules/`, los activos frontend
incluidos y la salida de `bin/` generada están ignorados.

## Diferencias de templ encontradas al portar esta aplicación

Cada una se midió contra templ v0.3.1070, no se supuso. El documento de hallazgos de la era Jet se retiró
el 2026-10-12, una vez que Jet 6 desapareció de la pila: ya no está en el árbol y se puede recuperar del
historial de Git con
`git show 320ceed:docs/HALLAZGOS_JET_6.md`.

- La salida generada está minimizada: desaparecen los espacios entre elementos y un salto de línea entre
  nodos inline se convierte en un espacio único. El DOM es equivalente, los bytes no.
- Los valores de atributos construidos desde una expresión se escapan con `&#34;` y `&#39;`, las mismas
  entidades que producía Jet, pero templ también escapa los literales escritos por el autor de la plantilla,
  por lo que `hx-vals='{"a":1}'` se sirve como `hx-vals="{&#34;a&#34;:1}"`. El analizador HTML decodifica
  ambos al mismo valor.
- El escape sigue sin ser contextual para JavaScript: un valor dentro de un literal Alpine entre comillas
  simples atraviesa el analizador HTML y llega a Alpine como una comilla desnuda.
  `TestAlpineJSLiteralInterpolationsStaySafe` sigue protegiendo los valores que llegan a esa posición.
- `style={ templ.SafeCSS(...) }` añade un punto y coma final; un valor de cadena simple se sanea y pierde
  sus espacios.
- Un elemento no vacío autocerrado se expande: `<path/>` se sirve como `<path></path>`.
- El contenido de `<script>` y `<style>` se emite literalmente desde el código fuente, incluida la
  indentación, por lo que el script de tema inline se escribe pegado al margen dentro del componente.
- `templ fmt` reescribe el markup en su forma canónica (`<!DOCTYPE html>`, indentación con tabuladores,
  `<meta .../>`) y `templ fmt -fail` reformatea el árbol antes de informar, de modo que una comprobación
  destinada a ser de solo lectura todavía escribe.
- Dos pruebas perdieron su objeto: un error de sintaxis ahora es un error de compilación y ya no puede
  producirse una inclusión ausente durante el renderizado.

## Trampas de Bootstrap 6 encontradas al construir esta aplicación

Cada una se observó aquí, no se supuso. Se enumeran porque todas fallan silenciosamente, de una manera que
parece un error de CSS y no una diferencia del framework.

- `.card-header` es un contenedor flex de **columna** en v6. `d-flex` más `justify-content-between` no lo
  revierte, por lo que el encabezado necesita un `flex-row` explícito o sus hijos se apilan y centran.
- Un SVG inline que solo tiene un `viewBox` y no tiene ancho ni alto colapsa a
  `0x0` y desaparece. Asígnele atributos explícitos o una regla de dimensionamiento.
- La escala de espaciado es más densa que en v5: `g-4` es `.75rem`, y el equivalente de `g-4` de v5 es
  `g-7` con `1.5rem`.
- Una pila de fuentes no debe entrecomillarse completa: `"Roboto, system-ui"` se convierte en un único
  nombre de familia que contiene comas y nunca se resuelve, por lo que el navegador vuelve a serif.
- No existe `.btn-primary` ni `Modal`. Las variantes son `.btn-solid`, `.btn-outline`, `.btn-subtle`,
  `.btn-text` y `.btn-icon`, coloreadas por una clase `.theme-*` separada, y la ventana modal es
  `<dialog class="dialog">` controlada por el plugin `Dialog`.
- JavaScript es solo ESM y nunca establece `window.bootstrap`; los plugins se importan desde el bundle incluido.
- `hx-swap="none"` sigue aplicando los swaps fuera de banda de la respuesta: el paso fuera de banda se
  ejecuta antes del swap principal y la rama `none` solo omite ese swap principal.
- Los valores de las cabeceras deben mantenerse en ASCII. Los navegadores exponen las cabeceras de respuesta
  como Latin-1, por lo que el UTF-8 sin procesar de una cabecera (por ejemplo, un mensaje de toast con
  acento) llega a JavaScript como mojibake; se escapa como `\uXXXX`.
