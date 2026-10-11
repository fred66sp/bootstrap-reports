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
  store, templates, handlers, and server wiring.
- `GET /metrics` sends server-rendered `server-grid` HTML over SSE. The grid
  uses `hx-swap="none"`, so HTMX applies only the three per-service OOB
  fragments (status, metrics, and logs); no browser JSON parsing is used and
  card roots and footer forms survive every tick.
- One `serviceView` model and shared fragment templates render the initial card,
  SSE OOB elements, and toggle response. The view's `OutOfBand` flag adds
  `hx-swap-oob="true"` only to SSE output. Metrics use bounded random walks and
  each service retains six log lines.
- Alpine state wraps the toolbar and stable grid. Logs are cloned from each
  card's hidden `<div>` holder into the shared dialog without `x-html` or
  server-data `innerHTML`.
- Bootstrap 6's ESM `Dialog` and `Toast` APIs handle the dialog and toggle
  notification. The page uses `data-bs-theme` for light and dark modes; the
  choice is applied before paint and persisted in local storage.

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
- A real server smoke test showed two `event: metrics` frames from
  `curl -sN --max-time 5 .../metrics`. A POST for `api-gateway` returned `200`,
  `Content-Type: text/html; charset=utf-8`, an `HX-Trigger` JSON header with
  status `Offline`, and the updated card HTML.
- The template class check below reported no missing Bootstrap classes:

  ```sh
  python3 - <<'PY'
  import re
  from pathlib import Path
  css = Path('web/static/vendor/bootstrap.min.css').read_text()
  custom = {'pulse-heading', 'service-card', 'toolbar', 'metric-row', 'search-box', 'eyebrow', 'htmx-indicator'}
  classes = set()
  for path in Path('web/templates').rglob('*.html'):
      text = path.read_text()
      text = re.sub(r'{{.*?}}', ' ', text)
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
with a browser here: **UNPROVEN**. Check the official Bootstrap 6 Dialog and
Toast documentation at <https://getbootstrap.com/docs/6.0/> and the HTMX SSE
extension documentation before treating those behaviors as browser-verified.

## Deliberate scope exclusions

There is no database, authentication, persistence, third-party Go module,
frontend bundler, Sass customization, or production deployment configuration.
Generated `node_modules/`, vendored frontend assets, and `bin/` output are
ignored.
