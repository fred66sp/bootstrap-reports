# DevOps Pulse

DevOps Pulse is a small real-time operations dashboard. It demonstrates an
HTML-first integration of a Go standard-library HTTP server, server-sent
HTML events, HTMX, Alpine.js, and Bootstrap 6 Alpha.

## Run

```sh
npm install
npm run sync:assets
go run .
```

Open <http://localhost:8080>. Use `go run . -addr :9090` to choose another
address. The server checks the vendored assets at startup and reports the exact
repair command when one is missing:

```text
npm install && npm run sync:assets
```

## Architecture

- `main.go` contains the domain model, one mutex-protected in-memory state
  store, the templ view set, handlers, and server wiring.
- `GET /metrics` sends server-rendered HTML over SSE, gzip-compressed when the
  client advertises gzip. The grid uses `hx-swap="none"`; every frame sends
  complete per-service metrics and log-holder OOB fragments, while status is
  sent only when it changed for that connection. No browser JSON parsing is used and card roots and footer forms
  survive every tick. Spanish is the default server-resolved language; valid
  `lang` query values persist in a cookie and the same language is carried by
  the SSE stream and toggle form.
- One `views.ServiceView` model and one templ fragment per element render the
  initial card, SSE OOB elements, and toggle response. The view's `OutOfBand` flag adds
  `hx-swap-oob` only to SSE output. Metrics use bounded random walks; each
  service retains six plain log lines, and each SSE connection tracks the
  statuses it has sent.
- Alpine state wraps the toolbar and stable grid. Logs are cloned from each
  card's hidden `<div>` holder into the shared dialog without `x-html` or
  server-data `innerHTML`.
- Bootstrap 6's ESM `Dialog` and `Toast` APIs handle the dialog and toggle
  notification. The page uses `data-bs-theme` for light and dark modes; the
  choice is applied before paint and persisted in local storage.

## Templ views

Views are templ components in the Go package `web/views/`:

- `layout.templ` is the document shell and takes the page as `{ children... }`.
- `page.templ` holds the dashboard and the two dialogs.
- `fragments.templ` holds the grid loop, the card column, the card and the three
  fragments. `views.Metrics`, `views.Logs` and `views.Status` are rendered
  standalone by Go (the SSE frame and the toggle response) **and** called from the
  card component, so a fragment has a single definition.

`go tool templ generate` compiles those files into the generated `*_templ.go`
that `go build` compiles. The templ CLI is pinned in the `tool` directive of
`go.mod`, so the generated code is reproducible. Rendering still goes through a
buffer, so a render error never writes half a document.

templ minifies during generation: it drops the whitespace between elements,
collapses a line break between inline nodes to one space and closes every
non-void element explicitly. The `testdata/` baseline was regenerated from that
validated output and `TestRenderedOutputMatchesFrozenBaseline` freezes it byte
for byte. It is equivalent to the Jet-era baseline, not identical: the trailing
semicolon templ appends to `style`, the attribute quoting and `<path/>` versus
`<path></path>` differ, and the DOM both build is the same.

## Bootstrap 6 differences

This example intentionally uses `.btn-solid` with `.theme-*`, `.fg-3`,
`.border-subtle`, and native `<dialog class="dialog">`. It does not use the
Bootstrap 5-only `.btn-primary`, `.modal`, `.offcanvas`, or `window.bootstrap`.
The vendored Bootstrap CSS and ESM bundle are used as-is; there is no Sass or
PostCSS step.

## Alpine and SSE asset decisions

The preferred Alpine ESM strategy is used: `alpinejs/dist/module.esm.js` is
copied to `web/static/vendor/alpine.module.esm.js`, imported by `app.js`, and
started after registering `pulseDashboard`. The source contains no bare import
lines: `grep -nE "(^import |from ['\"]|require\\()" node_modules/alpinejs/dist/module.esm.js`
returned no matches.

The SSE extension directory contains `sse.esm.js`, `sse.js`, `sse.min.js`, and
`sse.min.js.gz` (`ls -l node_modules/htmx-ext-sse/dist`). The sync script detects
and copies the minified `sse.min.js` as `htmx-ext-sse.min.js`.

## Token verification

Keep the Bootstrap token contract explicit when changing `web/static/app.css`:

```sh
missing=$(for token in $(grep -oE -- '--bs-[a-z0-9-]+' web/static/app.css | sort -u); do grep -qF -- "$token" web/static/vendor/bootstrap.min.css || printf '%s\n' "$token"; done)
printf 'missing Bootstrap tokens:\n%s' "$missing"
test -z "$missing"
```

The command exits non-zero if any `--bs-*` token used by the page is absent from
vendored Bootstrap CSS.

## Font stacks

Quote only the family names that need it, never the whole list. In a custom
property, `"Roboto, system-ui, sans-serif"` is a single family name containing
commas: it never resolves, and the browser falls back to its default font, which
is serif. Write the list unquoted and quote only multi-word names:

```css
--bs-body-font-family: Roboto, system-ui, sans-serif;
--bs-heading-font-family: "Roboto Condensed", Arial Narrow, sans-serif;
--bs-font-mono: "JetBrains Mono", ui-monospace, monospace;
```

Check the resolved family, not only the declared value, because both look right
in the source. In the browser console, compare the width a canvas reports for the
element's computed `font-family` against the widths of the real family and of
`serif`; equal widths for the family and a different width for `serif` prove the
text is not falling back.

## Verification status

Observed locally:

- `npm install`: succeeded; the root lockfile pins `alpinejs 3.17.4`,
  `bootstrap 6.0.0-alpha.1`, `htmx-ext-sse 2.2.4`, and `htmx.org 2.0.11`.
- `npm run sync:assets`: succeeded. Files: `alpine.module.esm.js` (128289
  bytes), `bootstrap.bundle.min.js` (219860), `bootstrap.min.css` (381199),
  `htmx-ext-sse.min.js` (2853), and `htmx.min.js` (52182).
- Before implementation, `go test ./...` produced build failures for undefined
  `newStateStore`, `statusOffline`, and `newApplication` (RED). After
  implementation, `go test ./...` returned `ok   devops-pulse 0.042s` (GREEN).
- `go vet ./...` succeeded, and `go build -o bin/devops-pulse .` succeeded.
- POC Templ, now the engine: `go tool templ generate`, `go build ./...`,
  `go vet ./...` and `go test ./...` succeed, and the golden baseline in
  `testdata/` was regenerated from the validated templ output. The smoke test
  below was repeated against the templ build with the same status codes, headers
  and `event: metrics` frames.
- POC Templ: the browser checks were repeated on Chromium at 1440x900 — live SSE
  badge, Alpine filter, the six-line log ring, the toggle toast with the status
  badge consistent, both dialogs, dark theme plus reload persistence and English
  navigation — with zero console errors, page errors and failed requests.
- A real server smoke test showed two `event: metrics` frames from
  `curl -sN --max-time 5 .../metrics`. A POST for `api-gateway` returned `200`,
  `Content-Type: text/html; charset=utf-8`, an `HX-Trigger` JSON header with
  status `Offline`, and the updated card HTML.
- A Jet-versus-templ A/B on that same card showed the identical ~20 ms
  intermediate DOM state while htmx applies the swapped markup (one attribute
  and one text node of the status badge settle in separate steps), so it is htmx
  behaviour and not a rendering difference.
- The template class check below reported no missing Bootstrap classes:

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

The OOB update design specifically avoids replacing card roots while a toggle
request is in flight. Bootstrap's vendored CSS already provides a `[hidden]`
rule (`grep -q '\\[hidden\\]' web/static/vendor/bootstrap.min.css`), so no
custom hidden rule is needed.

Browser-level animation, search, dialog, and toast behavior was not exercised
with a browser in the first implementation. It was verified later on Chromium
(Playwright, 1440x900) and re-verified after the move to Jet 6; the recorded
result is in `odd/tasks/devops-pulse.md` under iteration 5. It covers the live
badge after the stream connects, Alpine filtering, both dialogs as real modals,
the localised toggle toast, the card root and its form surviving a full SSE tick,
dark theme persistence across a reload, and the English navigation, with zero
console errors, zero page errors, and zero `htmx:oobErrorNoTarget`.

## Deliberate scope exclusions

There is no database, authentication, persistence, third-party Go module,
frontend bundler, Sass customization, or production deployment configuration.
Generated `node_modules/`, vendored frontend assets, and `bin/` output are
ignored.

## Templ differences found while porting this app

Each one was measured against templ v0.3.1070, not assumed. The Jet-era record
is in `docs/HALLAZGOS_JET_6.md`.

- The generated output is minified: inter-element whitespace disappears and a
  line break between inline nodes becomes a single space. The DOM is equivalent,
  the bytes are not.
- Attribute values built from an expression are escaped with `&#34;` and
  `&#39;`, the same entities Jet produced, but templ escapes the literals the
  template author wrote as well, so `hx-vals='{"a":1}'` is served as
  `hx-vals="{&#34;a&#34;:1}"`. The HTML parser decodes both to the same value.
- Escaping is still not contextual for JavaScript: a value inside a
  single-quoted Alpine literal round-trips through the HTML parser and reaches
  Alpine as a bare quote. `TestAlpineJSLiteralInterpolationsStaySafe` keeps
  guarding the values that reach that position.
- `style={ templ.SafeCSS(...) }` appends a trailing semicolon; a plain string
  value is sanitized and loses its spaces.
- A self-closing non-void element is expanded: `<path/>` is served as
  `<path></path>`.
- The content of `<script>` and `<style>` is emitted verbatim from the source,
  indentation included, so the inline theme script is written flush-left inside
  the component.
- `templ fmt` rewrites the markup into its canonical form (`<!DOCTYPE html>`,
  tab indentation, `<meta .../>`), and `templ fmt -fail` reformats the tree
  before reporting, so a check meant to be read-only still writes.
- Two tests lost their subject: a syntax error is now a compile error, and a
  missing include can no longer happen at render time.

## Bootstrap 6 traps found while building this app

Each one was observed here, not assumed. They are listed because every one of
them fails silently, in a way that looks like a CSS mistake rather than a
framework difference.

- `.card-header` is a **column** flex container in v6. `d-flex` plus
  `justify-content-between` does not revert it, so the header needs an explicit
  `flex-row` or its children stack and centre.
- An inline SVG with only a `viewBox` and no width or height collapses to
  `0x0` and disappears. Give it explicit attributes or a sizing rule.
- The spacing scale is denser than v5: `g-4` is `.75rem`, and the v5 `g-4`
  equivalent is `g-7` at `1.5rem`.
- A font stack must not be quoted as a whole: `"Roboto, system-ui"` becomes a
  single family name containing commas and never resolves, so the browser falls
  back to serif.
- There is no `.btn-primary` and no `Modal`. Variants are `.btn-solid`,
  `.btn-outline`, `.btn-subtle`, `.btn-text` and `.btn-icon`, coloured by a
  separate `.theme-*` class, and the modal window is `<dialog class="dialog">`
  driven by the `Dialog` plugin.
- The JavaScript is ESM-only and never sets `window.bootstrap`; import the
  plugins from the vendored bundle instead.
- `hx-swap="none"` still applies the out-of-band swaps of the response: the
  out-of-band pass runs before the main swap and the `none` branch only skips
  that main swap.
- Header values must stay ASCII. Browsers expose response headers as Latin-1,
  so raw UTF-8 in a header (an accented toast message, for instance) reaches
  JavaScript as mojibake; escape it as `\uXXXX` instead.
