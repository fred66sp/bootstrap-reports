# DevOps Pulse

¿Qué es DevOps Pulse y dónde se encuentran sus instrucciones y datos técnicos?

DevOps Pulse es un pequeño panel de operaciones en tiempo real. Demuestra una integración HTML-first de un servidor HTTP de la biblioteca estándar de Go, eventos HTML enviados por el servidor, HTMX, Alpine.js y Bootstrap 6 Alpha.

## Requisitos

- Go con la CLI de templ fijada en la directiva `tool` de `go.mod`.
- Node.js y npm.

## Ejecutar

```sh
npm install
npm run sync:assets
go run .
```

Abra <http://localhost:8080>. Use `go run . -addr :9090` para elegir otra dirección. El servidor comprueba los activos incluidos al iniciarse e informa del comando exacto de reparación cuando falta uno:

```text
npm install && npm run sync:assets
```

## Verificar

```sh
go tool templ generate
go test ./...
go vet ./...
go build ./...
```

La verificación detallada, los comandos de tokens, las mediciones y los resultados están en [`docs/devops-pulse/REFERENCIA.md`](../docs/devops-pulse/REFERENCIA.md).

## Estructura

- `main.go`: modelo de dominio, estado en memoria, vistas templ, handlers y servidor.
- `web/views/`: componentes templ del layout, la página y los fragmentos.
- `web/static/`: CSS, JavaScript y activos sincronizados de frontend.
- `bin/`: salida generada, ignorada por Git.

## Alcance deliberadamente excluido

No hay base de datos ni autenticación.

No hay persistencia ni módulo Go de terceros.

No hay bundler de frontend ni personalización de Sass.

No hay configuración de despliegue en producción.

`node_modules/`, los activos frontend incluidos y la salida de `bin/` generada están ignorados.

## Documentación

| Documento | Tipo | Consulta |
| --- | --- | --- |
| [`ARQUITECTURA.md`](../docs/devops-pulse/ARQUITECTURA.md) | Explicación | Por qué está construido así. |
| [`REFERENCIA.md`](../docs/devops-pulse/REFERENCIA.md) | Referencia | Datos, mediciones, comandos y resultados. |

La [arquitectura](../docs/devops-pulse/ARQUITECTURA.md) explica el reparto entre Go, templ, HTMX, Alpine.js, SSE y Bootstrap 6. La [referencia](../docs/devops-pulse/REFERENCIA.md) conserva las vistas, diferencias, trampas y evidencias consultables.
