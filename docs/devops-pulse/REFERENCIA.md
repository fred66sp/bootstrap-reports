# Referencia de DevOps Pulse

¿Qué datos, mediciones, comandos y resultados verificables definen DevOps Pulse?

Consulte también el [README de DevOps Pulse](../../devops-pulse/README.md) y la [explicación de arquitectura](ARQUITECTURA.md).

## Vistas Templ

Las vistas son componentes templ del paquete Go `web/views/`:

- `layout.templ` es la envoltura del documento y recibe la página como `{ children... }`.
- `page.templ` contiene el panel y los dos diálogos.
- `fragments.templ` contiene el bucle de la cuadrícula, la columna de la tarjeta, la tarjeta y los tres fragmentos. `views.Metrics`, `views.Logs` y `views.Status` se renderizan de forma independiente desde Go (el frame SSE y la respuesta de alternancia) **y** se invocan desde el componente de tarjeta, por lo que un fragmento tiene una única definición.

`go tool templ generate` compila esos archivos en los `*_templ.go` generados que compila `go build`. La CLI de templ está fijada en la directiva `tool` de `go.mod`, por lo que el código generado es reproducible. El renderizado sigue pasando por un buffer, así que un error de renderizado nunca escribe medio documento.

templ minimiza durante la generación: elimina los espacios entre elementos, convierte un salto de línea entre nodos inline en un espacio y cierra explícitamente cada elemento no vacío. La línea base de `testdata/` se regeneró a partir de esa salida validada y `TestRenderedOutputMatchesFrozenBaseline` la fija byte por byte. Es equivalente a la línea base de la era Jet, no idéntica: el punto y coma final que templ añade a `style`, las comillas de atributos y `<path/>` frente a `<path></path>` difieren, y el DOM que construyen es el mismo.

## Diferencias de Bootstrap 6

Este ejemplo usa intencionadamente `.btn-solid` con `.theme-*`, `.fg-3`, `.border-subtle` y `<dialog class="dialog">` nativo. No usa `.btn-primary`, `.modal`, `.offcanvas` ni `window.bootstrap`, exclusivos de Bootstrap 5. El CSS y el bundle ESM de Bootstrap incluidos se usan tal cual; no hay ningún paso de Sass o PostCSS.

## Verificación de tokens

El contrato de tokens de Bootstrap se comprueba con este comando al cambiar `web/static/app.css`:

```sh
missing=$(for token in $(grep -oE -- '--bs-[a-z0-9-]+' web/static/app.css | sort -u); do grep -qF -- "$token" web/static/vendor/bootstrap.min.css || printf '%s\n' "$token"; done)
printf 'missing Bootstrap tokens:\n%s' "$missing"
test -z "$missing"
```

El comando termina con un estado distinto de cero si falta en el CSS de Bootstrap incluido algún token `--bs-*` usado por la página.

## Familias tipográficas

En una propiedad personalizada, `"Roboto, system-ui, sans-serif"` es un único nombre de familia que contiene comas: nunca se resuelve y el navegador vuelve a su fuente predeterminada, que es serif. La lista se escribe sin comillas y solo los nombres de varias palabras van entrecomillados:

```css
--bs-body-font-family: Roboto, system-ui, sans-serif;
--bs-heading-font-family: "Roboto Condensed", Arial Narrow, sans-serif;
--bs-font-mono: "JetBrains Mono", ui-monospace, monospace;
```

El valor declarado puede parecer correcto y no serlo: la comprobación válida es la familia resuelta. En la consola del navegador se compara el ancho que un canvas informa para el `font-family` calculado del elemento con los anchos de la familia real y de `serif`; anchos iguales para la familia y un ancho distinto para `serif` demuestran que el texto no recurre a la alternativa.

## Estado de verificación

Observado localmente:

- `npm install`: correcto; el lockfile raíz fija `alpinejs 3.17.4`, `bootstrap 6.0.0-alpha.1`, `htmx-ext-sse 2.2.4` y `htmx.org 2.0.11`.
- `npm run sync:assets`: correcto. Archivos: `alpine.module.esm.js` (128289 bytes), `bootstrap.bundle.min.js` (219860), `bootstrap.min.css` (381199), `htmx-ext-sse.min.js` (2853) y `htmx.min.js` (52182).
- Antes de la implementación, `go test ./...` produjo fallos de compilación por `newStateStore`, `statusOffline` y `newApplication` indefinidos (RED). Después de la implementación, `go test ./...` devolvió `ok   devops-pulse 0.042s` (GREEN).
- `go vet ./...` fue correcto y `go build -o bin/devops-pulse .` fue correcto.
- POC Templ, ahora el motor: `go tool templ generate`, `go build ./...`, `go vet ./...` y `go test ./...` son correctos, y la línea base dorada en `testdata/` se regeneró a partir de la salida templ validada. La prueba de humo siguiente se repitió contra la compilación templ con los mismos códigos de estado, encabezados y frames `event: metrics`.
- POC Templ: las comprobaciones del navegador se repitieron en Chromium a 1440x900 — insignia SSE activa, filtro Alpine, anillo de logs de seis líneas, toast de alternancia con la insignia de estado coherente, ambos diálogos, tema oscuro con persistencia tras recarga y navegación en inglés — con cero errores de consola, errores de página o solicitudes fallidas.
- Una prueba de humo con un servidor real mostró dos frames `event: metrics` de `curl -sN --max-time 5 .../metrics`. Un POST para `api-gateway` devolvió `200`, `Content-Type: text/html; charset=utf-8`, una cabecera JSON `HX-Trigger` con estado `Offline` y el HTML actualizado de la tarjeta.
- Una prueba A/B de Jet frente a templ sobre esa misma tarjeta mostró el mismo estado intermedio de ~20 ms mientras htmx aplica el markup intercambiado (un atributo y un nodo de texto de la insignia de estado se estabilizan en pasos separados); por tanto, es comportamiento de htmx y no una diferencia de renderizado.

La comprobación de clases de plantilla siguiente no informó clases de Bootstrap ausentes:

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

El diseño de actualización OOB evita específicamente reemplazar las raíces de las tarjetas mientras hay una solicitud de alternancia en curso. El CSS de Bootstrap incluido ya proporciona una regla `[hidden]` (`grep -q '\\[hidden\\]' web/static/vendor/bootstrap.min.css`), por lo que no se necesita una regla hidden personalizada.

La animación, la búsqueda, el diálogo y el toast a nivel de navegador no se ejercitaron con un navegador en la primera implementación. Más tarde se verificaron en Chromium (Playwright, 1440x900) y se volvieron a verificar tras el cambio de Jet 6 a templ; el resultado registrado está en `odd/tasks/devops-pulse.md`, bajo la iteración 5. Cubre la insignia activa después de conectar el flujo, el filtrado Alpine, ambos diálogos como modales reales, el toast de alternancia localizado, la supervivencia de la raíz de la tarjeta y su formulario a un tick SSE completo, la persistencia del tema oscuro tras una recarga y la navegación en inglés, con cero errores de consola, cero errores de página y cero `htmx:oobErrorNoTarget`.

## Diferencias de templ encontradas al portar esta aplicación

Cada una se midió contra templ v0.3.1070, no se supuso.

- La salida generada está minimizada: desaparecen los espacios entre elementos y un salto de línea entre nodos inline se convierte en un espacio único. El DOM es equivalente, los bytes no.
- Los valores de atributos construidos desde una expresión se escapan con `&#34;` y `&#39;`, las mismas entidades que producía Jet, pero templ también escapa los literales escritos por el autor de la plantilla, por lo que `hx-vals='{"a":1}'` se sirve como `hx-vals="{&#34;a&#34;:1}"`. El analizador HTML decodifica ambos al mismo valor.
- El escape sigue sin ser contextual para JavaScript: un valor dentro de un literal Alpine entre comillas simples atraviesa el analizador HTML y llega a Alpine como una comilla desnuda. `TestAlpineJSLiteralInterpolationsStaySafe` sigue protegiendo los valores que llegan a esa posición.
- `style={ templ.SafeCSS(...) }` añade un punto y coma final; un valor de cadena simple se sanea y pierde sus espacios.
- Un elemento no vacío autocerrado se expande: `<path/>` se sirve como `<path></path>`.
- El contenido de `<script>` y `<style>` se emite literalmente desde el código fuente, incluida la indentación, por lo que el script de tema inline se escribe pegado al margen dentro del componente.
- `templ fmt` reescribe el markup en su forma canónica (`<!DOCTYPE html>`, indentación con tabuladores, `<meta .../>`) y `templ fmt -fail` reformatea el árbol antes de informar, de modo que una comprobación destinada a ser de solo lectura todavía escribe.
- Dos pruebas perdieron su objeto: un error de sintaxis ahora es un error de compilación y ya no puede producirse una inclusión ausente durante el renderizado.

## Trampas de Bootstrap 6 encontradas al construir esta aplicación

Cada una se observó aquí, no se supuso. Se enumeran porque todas fallan silenciosamente, de una manera que parece un error de CSS y no una diferencia del framework.

- `.card-header` es un contenedor flex de **columna** en v6. `d-flex` más `justify-content-between` no lo revierte, por lo que el encabezado necesita un `flex-row` explícito o sus hijos se apilan y centran.
- Un SVG inline que solo tiene un `viewBox` y no tiene ancho ni alto colapsa a `0x0` y desaparece: necesita atributos explícitos o una regla de dimensionamiento.
- La escala de espaciado es más densa que en v5: `g-4` es `.75rem`, y el equivalente de `g-4` de v5 es `g-7` con `1.5rem`.
- Una pila de fuentes no debe entrecomillarse completa: `"Roboto, system-ui"` se convierte en un único nombre de familia que contiene comas y nunca se resuelve, por lo que el navegador vuelve a serif.
- No existe `.btn-primary` ni `Modal`. Las variantes son `.btn-solid`, `.btn-outline`, `.btn-subtle`, `.btn-text` y `.btn-icon`, coloreadas por una clase `.theme-*` separada, y la ventana modal es `<dialog class="dialog">` controlada por el plugin `Dialog`.
- JavaScript es solo ESM y nunca establece `window.bootstrap`; los plugins se importan desde el bundle incluido.
- `hx-swap="none"` sigue aplicando los swaps fuera de banda de la respuesta: el paso fuera de banda se ejecuta antes del swap principal y la rama `none` solo omite ese swap principal.
- Los valores de las cabeceras deben mantenerse en ASCII. Los navegadores exponen las cabeceras de respuesta como Latin-1, por lo que el UTF-8 sin procesar de una cabecera (por ejemplo, un mensaje de toast con acento) llega a JavaScript como mojibake; se escapa como `\uXXXX`.

---

**Dueño:** Alfredo González P. · **Última revisión:** 2026-10-12 · **Próxima revisión:** 2027-04-12