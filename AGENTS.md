# Instrucciones del repositorio

Este repositorio es un workspace de informes, documentación y ejemplos de integración. Las aplicaciones con identidad propia viven en subdirectorios, actualmente `docengine-docs/` (Vite + Bootstrap) y `devops-pulse/` (Go + templ + HTMX + Alpine con SSE).

## Leer antes de trabajar

- `README.md` — propósito, estructura y ruta rápida.
- `docs/CONTRATO_FLUJO_GIT_VERSIONADO.md` — reglas de ramas, commits, verificación y operaciones remotas.
- `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md` — decisiones y límites de Bootstrap.
- `docs/inference-protocol.md` — protocolo obligatorio de evidencia, inferencia y trazabilidad.
- `docengine-docs/package.json`, `docengine-docs/package-lock.json` y `skills-lock.json` — dependencias de la aplicación y skills reproducibles.
- `devops-pulse/go.mod`, `devops-pulse/package.json` y `devops-pulse/README.md` — módulo Go con templ, assets del panel y su funcionamiento verificado.
- `odd/tasks/` — tarea ODD activa y evidencia recuperable.

## Comandos de trabajo

```sh
npm --prefix docengine-docs install
npm --prefix docengine-docs ci
npm --prefix docengine-docs ls bootstrap --depth=0
npm --prefix docengine-docs audit
go -C devops-pulse tool templ generate
go -C devops-pulse test ./...
go -C devops-pulse vet ./...
go -C devops-pulse build ./...
npx skills experimental_install
npx skills list --agent opencode
```

- `bootstrap@6.0.0-alpha.1` está fijado exactamente; no actualizarlo implícitamente.
- El paquete usa ESM (`"type": "module"`); Bootstrap 6 no debe integrarse mediante el global `window.bootstrap`. Lo comprueba `TestClientCodeNeverReachesTheBootstrapGlobal` en `devops-pulse/assets_test.go`, que falla si la cadena aparece en el código de cliente (el bundle incluido en `web/static/vendor/` queda fuera).
- Para Sass, usar `@use` y mapas de tokens; no iniciar código nuevo con `@import`.
- Añadir `@floating-ui/dom` o `vanilla-calendar-pro` solo cuando el ejemplo use las capacidades que requieren esos peer dependencies.
- Para cualquier decisión o cambio de Bootstrap, apoyarse siempre en la documentación oficial: <https://getbootstrap.com/docs/6.0/> y en la `SKILL.md` oficial aplicable; no usar resúmenes como única fuente.
- `docengine-docs/` tiene scripts `dev`, `build` y `preview`; no existe lint, typecheck ni suite de tests.
- `devops-pulse/` es un módulo Go con vistas templ: `go -C devops-pulse tool templ generate` compila los `*.templ` a los `*_templ.go` que consume `go build`. Su `package.json` solo aporta `sync:assets`, y no hay lint ni CI en el repositorio, así que `test`, `vet` y `build` son la verificación disponible. No inventar comandos: documentar cualquier verificación no disponible.

## Evidencia y no inferencia

- Antes de analizar, decidir, modificar o informar, identificar las fuentes realmente disponibles.
- Separar siempre estado declarado de estado comprobado; no presentar inferencias, hipótesis o propuestas como hechos.
- Para afirmaciones que afecten a decisiones, cambios, riesgos o validaciones, conservar clasificación, fuente/localización, justificación y evidencia pendiente cuando aplique.
- Si las fuentes discrepan o falta evidencia, conservar la discrepancia y declarar el límite; consultar el protocolo completo en `docs/inference-protocol.md`.

## Documentación

- Cuatro tipos que no se mezclan en un documento: **tutorial** (enseñar),
  **guía práctica** (resolver una tarea), **referencia** (el dato exacto) y
  **explicación** (el porqué). El `README` reparte y enlaza.
- **Un lugar principal por dato.** Las restricciones innegociables de Bootstrap
  viven aquí, en `AGENTS.md`, y el procedimiento con su evidencia en
  `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md`; los demás documentos enlazan.
- Todo documento de `docs/` cierra con **dueño**, **última revisión** y **próxima
  revisión**; si caduca, se revisa o se retira.
- Un documento que deja de decir la verdad se corrige en el mismo cambio que lo
  vuelve falso.
- Una decisión difícil de revertir se registra como ADR numerado en
  `docs/decisions/`; un ADR no se reescribe, se reemplaza por uno nuevo.
- No se documenta lo que el código ya dice, lo que nadie mantendrá ni lo que una
  prueba puede verificar.
- La documentación **no se ancla a fuentes externas mutables** (una bóveda
  personal, una ruta local, un servicio de terceros): lo que gobierna el
  repositorio vive dentro del repositorio. Las fuentes oficiales se citan como
  referencia, nunca como dependencia.
- En los documentos de `docs/` no se conservan punteros a documentos retirados, a
  números de commit ni a secciones por su título: un dato que importa está en el
  árbol, y lo que se retira, se retira, sin recetas para recuperarlo. El rastro
  de lo que se hizo pertenece a `odd/tasks/`, que sí es un registro histórico.

## Skills del agente

- Las skills del proyecto están en `.agents/skills/` y se versionan con el repositorio; las de origen remoto se fijan además en `skills-lock.json` con su origen y su hash. La procedencia de cada una está en `.agents/skills/README.md`.
- No editar a mano las copias de origen remoto (`bootstrap-*`): se restauran desde el lockfile con `npx skills experimental_install`. Las skills locales del proyecto sí se editan en su sitio.
- Antes de cambiar integración, componentes, JavaScript, color o utilities, leer la `SKILL.md` oficial aplicable y la documentación enlazada desde `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md`.

## Flujo del repositorio

- Ejecutar `git status --short --branch` antes de empezar y conservar cambios previos.
- Mantener documentos e informes en `docs/`; registrar trabajo coordinado en `odd/tasks/`.
- La documentación del proyecto está en español; los mensajes de commit usan inglés y Conventional Commits.
- No hacer `push`, `fetch` para integrar, merge, tag, publicación ni operaciones destructivas sin autorización explícita.
- `CHANGELOG.md` solo se añade o actualiza cuando exista valor para usuarios, una versión publicada o mantenimiento futuro; no por cada cambio interno.

## Gotcha importante

Crear o comprobar primero `docengine-docs/package.json` antes de ejecutar npm para esa aplicación. El workspace raíz no tiene un manifiesto npm intencionadamente; usar `npm --prefix docengine-docs ...` para evitar que npm suba a un `package.json` de un directorio padre. Lo mismo vale para `devops-pulse/package.json`, que solo declara `sync:assets`.
