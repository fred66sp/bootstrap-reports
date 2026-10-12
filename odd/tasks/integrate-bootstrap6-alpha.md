# Integrar Bootstrap 6 Alpha

## Objetivo

Instalar Bootstrap 6 Alpha 1 de forma reproducible y dejar documentada una integración inicial correcta para este workspace.

## Evidencia de fuentes

- Anuncio oficial: <https://blog.getbootstrap.com/2026/10/08/bootstrap-6-alpha/>
- Guía oficial de npm: <https://getbootstrap.com/docs/6.0/guides/npm/>
- Guía oficial de Vite: <https://getbootstrap.com/docs/6.0/guides/vite/>
- Documentación para agentes: <https://getbootstrap.com/docs/6.0/getting-started/ai/>
- Skills oficiales: <https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills>

## Decisión de integración

- Usar npm con la versión exacta `bootstrap@6.0.0-alpha.1`.
- Mantener una integración inicial sin elegir todavía un bundler de aplicación.
- Integrar en alcance de proyecto las skills oficiales aplicables para OpenCode,
  con copias locales y `skills-lock.json`.
- Incluir un smoke test local de resolución del paquete y sus artefactos publicados.

## Alcance autorizado

- Crear `package.json` y `package-lock.json` mediante npm.
- Instalar Bootstrap 6 Alpha 1 como dependencia exacta.
- Crear documentación de integración y fuentes oficiales.
- No crear todavía una aplicación Vite/Parcel/Webpack ni ejecutar operaciones remotas de Git.

## Tareas

- [x] BSA-01 — Instalar `bootstrap@6.0.0-alpha.1` con npm.
- [x] BSA-02 — Documentar e integrar instalación, ESM, Sass, peer dependencies, navegador y skills oficiales.
- [x] BSA-03 — Verificar la dependencia, artefactos publicados y consistencia del lockfile.
- [x] BSA-04 — Proponer el commit de integración según el contrato Git. Creado: `ad06c1d feat: add Bootstrap 6 alpha workspace baseline`.

## Criterios de aceptación

- La dependencia exacta aparece en `package.json` y `package-lock.json`.
- La documentación diferencia hechos verificados, recomendaciones y decisiones aún pendientes.
- No se afirma que las skills estén incluidas en el paquete npm si no lo están.
- La verificación demuestra que npm puede resolver Bootstrap 6 Alpha 1 y sus metadatos.

## Verificación prevista

- `npm ci --dry-run --ignore-scripts`: correcto.
- `npm ls bootstrap --depth=0`: `bootstrap@6.0.0-alpha.1` correcto.
- Resolución de `bootstrap/package.json` y comprobación de `dist/css` y `dist/js`: correctas.
- Auditoría npm del workspace: 0 vulnerabilidades.
- `npx skills list --agent opencode`: 7 skills locales instaladas y disponibles.
- Comprobación de espacios y revisión documental: correctas.

## Progreso

- Rama: `chore/prepare-repository`.
- Estado: instalación, documentación y verificación completadas; commit de integración creado (`ad06c1d`).
- Gotcha: al no existir inicialmente un `package.json` local, npm detectó el proyecto ascendente de `/home/alfredo`; la instalación accidental se deshizo y se repitió con un `package.json` propio en este repositorio.
- Skills integradas: `bootstrap-v6-install`, `bootstrap-npm`, `bootstrap-vite`, `bootstrap-component`, `bootstrap-component-js`, `bootstrap-color-system` y `bootstrap-utility-api`.
- Estrategia: un work unit de integración, creado como `ad06c1d`.
