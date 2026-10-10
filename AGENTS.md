# Instrucciones del repositorio

Este repositorio es un workspace de informes, documentación y ejemplos de integración; todavía no contiene una aplicación ejecutable.

## Leer antes de trabajar

- `README.md` — propósito, estructura y ruta rápida.
- `docs/CONTRATO_FLUJO_GIT_VERSIONADO.md` — reglas de ramas, commits, verificación y operaciones remotas.
- `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md` — decisiones y límites de Bootstrap.
- `docs/inference-protocol.md` — protocolo obligatorio de evidencia, inferencia y trazabilidad.
- `package.json`, `package-lock.json` y `skills-lock.json` — dependencias y skills reproducibles.
- `odd/tasks/` — tarea ODD activa y evidencia recuperable.

## Comandos de trabajo

```sh
npm install
npm ci
npm ls bootstrap --depth=0
npm audit
npx skills experimental_install
npx skills list --agent opencode
```

- `bootstrap@6.0.0-alpha.1` está fijado exactamente; no actualizarlo implícitamente.
- El paquete usa ESM (`"type": "module"`); Bootstrap 6 no debe integrarse mediante el global `window.bootstrap`.
- Para Sass, usar `@use` y mapas de tokens; no iniciar código nuevo con `@import`.
- Añadir `@floating-ui/dom` o `vanilla-calendar-pro` solo cuando el ejemplo use las capacidades que requieren esos peer dependencies.
- Para cualquier decisión o cambio de Bootstrap, apoyarse siempre en la documentación oficial: <https://getbootstrap.com/docs/6.0/> y en la `SKILL.md` oficial aplicable; no usar resúmenes como única fuente.
- No existen scripts npm, aplicación, servidor, CI, lint, typecheck ni suite de tests en este momento. No inventar comandos: documentar cualquier verificación no disponible.

## Evidencia y no inferencia

- Antes de analizar, decidir, modificar o informar, identificar las fuentes realmente disponibles.
- Separar siempre estado declarado de estado comprobado; no presentar inferencias, hipótesis o propuestas como hechos.
- Para afirmaciones que afecten a decisiones, cambios, riesgos o validaciones, conservar clasificación, fuente/localización, justificación y evidencia pendiente cuando aplique.
- Si las fuentes discrepan o falta evidencia, conservar la discrepancia y declarar el límite; consultar el protocolo completo en `docs/inference-protocol.md`.

## Skills del agente

- Las skills oficiales seleccionadas están en `.agents/skills/` y su selección/hash está en `skills-lock.json`.
- `.agents/` está ignorado; no editar sus copias manualmente. Restaurar desde el lockfile con `npx skills experimental_install`.
- Antes de cambiar integración, componentes, JavaScript, color o utilities, leer la `SKILL.md` oficial aplicable y la documentación enlazada desde `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md`.

## Flujo del repositorio

- Ejecutar `git status --short --branch` antes de empezar y conservar cambios previos.
- Mantener documentos e informes en `docs/`; registrar trabajo coordinado en `odd/tasks/`.
- La documentación del proyecto está en español; los mensajes de commit usan inglés y Conventional Commits.
- No hacer `push`, `fetch` para integrar, merge, tag, publicación ni operaciones destructivas sin autorización explícita.
- `CHANGELOG.md` solo se añade o actualiza cuando exista valor para usuarios, una versión publicada o mantenimiento futuro; no por cada cambio interno.

## Gotcha importante

Crear o comprobar primero el `package.json` del repositorio antes de ejecutar npm. Sin un manifiesto local, npm puede subir al `package.json` de un directorio padre e instalar dependencias fuera de este workspace.
