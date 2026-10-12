# Alineación de la documentación con el estado real

## Petición del usuario

«Revisa que la documentación está al día y es coherente.» Autorizado el
2026-10-12: corregir **todo lo confirmado** (los ocho hallazgos), **traducir**
`devops-pulse/README.md` al español y **añadir** un `README.md` a
`docengine-docs/`.

## Método

Barrido delegado a un explorador acotado (read-only) y verificación propia de
**cada** hallazgo con `rg` 15.2.0 y `git`, porque el modo de fallo que motivó la
petición es afirmar sin comprobar. El explorador produjo una supuesta
contradicción del interruptor RDD y un UNVERIFIED que se descartaron al
comprobarlos (ver «Descartados»).

## Hallazgos confirmados

| # | Ubicación | Afirmación | Evidencia de que es falsa |
| --- | --- | --- | --- |
| 1 | `docs/HALLAZGOS_BOOTSTRAP_6_ALPHA.md:112` | «Esas copias locales no se versionan» | `git ls-files .agents/skills/ \| rg -c bootstrap` → 7 archivos versionados; `.agents/skills/README.md` dice «**Se versionan**»; `README.md:46` también |
| 2 | `odd/tasks/templ-poc.md:113` | «(no se ha creado ninguno)» [equivalente templ] | `git log --diff-filter=A -- .agents/skills/templ-template-engine/SKILL.md` → `5563675`, el mismo commit que borró `jet-template-engine` (−46 / +62) |
| 3 | `odd/tasks/devops-pulse.md:341` | «la rama `feature/devops-pulse` se conserva» | `git branch -a` → solo `docs/docengine`, `docs/retire-jet-findings-doc`, `feature/jet6-devops-pulse`, `feature/templ-poc`, `main` |
| 4 | `README.md:39-48` | Tabla «Estructura actual» completa | Omite `devops-pulse/` y `docs/inference-protocol.md`: `ls -d */` muestra las dos aplicaciones; `rg -n inference-protocol README.md` → 0 coincidencias |
| 5 | `AGENTS.md:4` y «Comandos de trabajo» | «aplicaciones… actualmente `docengine-docs/`» | `rg -n devops AGENTS.md README.md` → 0 coincidencias; `devops-pulse/` tiene `go.mod` y `package.json` propios |
| 6 | `odd/tasks/devops-pulse.md:71` | DP-11 sin marcar: «Confirmar los commits…» | `git log --all \| rg "realtime dashboard"` → `e7434ca` ya existe; la línea 124 declara la implementación completa |
| 7 | `devops-pulse/README.md:186` | «re-verified after the move to **Jet 6**» | El motor actual es templ (`devops-pulse/go.mod`); el mismo README registra la reverificación con templ |
| 8 | `odd/tasks/devops-pulse.md:36` | «Go sin frameworks: `net/http`, **`html/template`**…» | `5563675` sustituyó `html/template` por templ; las vistas son `web/views/*.templ` |
| 9 | `odd/tasks/templ-poc.md:106` | «árbol con cambios sin commitear y **sin integración**» | `git merge-base --is-ancestor feature/templ-poc main` → sí; `320ceed` la fusiona (`parents=565b069 5563675`) |

## Descartados con evidencia

- `odd/tasks/templ-poc.md:99-104` «referencia colgante»: falso positivo; el texto
  declara la retirada y da la ruta de recuperación por historial.
- `odd/tasks/retire-jet-findings-doc.md:89-96` «UNVERIFIED»: verificado;
  `main`, `origin/main` y `git ls-remote origin refs/heads/main` coinciden en
  `815c454`.
- «Contradicción» del interruptor RDD: son estados de fechas distintas
  (iteración 5 lo activó; el registro nuevo lee `off` hoy).
- `odd/tasks/devops-pulse.md:79` (`{{define}}` en la corrección DP-09): historia
  de la iteración 1, y el mecanismo descrito (`serviceView.OutOfBand`) sigue
  vigente en el código. No se toca.

## Decisiones del usuario

- Alcance: **todo lo confirmado** (ocho hallazgos).
- `devops-pulse/README.md`: **traducir al español** (la regla declarada en
  `AGENTS.md:49` y `README.md:56` es documentación en español).
- `docengine-docs/`: **añadir** un `README.md` propio, en español.

## Tareas

- [x] AD-01 — Corregir el versionado de las skills en `docs/HALLAZGOS_BOOTSTRAP_6_ALPHA.md` (hallazgo 1).
- [x] AD-02 — Corregir el pendiente falso del equivalente templ y el estado Git en `odd/tasks/templ-poc.md` (hallazgos 2 y 9).
- [x] AD-03 — Corregir `odd/tasks/devops-pulse.md`: DP-11 entregado (6), rama `feature/devops-pulse` inexistente (3) y motor `html/template` en el Objetivo (8).
- [x] AD-04 — Actualizar índices: tabla del `README.md` (4) y `AGENTS.md` con `devops-pulse/` (5), incluidas las órdenes Go verificadas.
- [x] AD-05 — Traducir `devops-pulse/README.md` al español y corregir la secuencia de verificación «Jet 6» (7). Delegado a un writer acotado: 258 → 235 líneas.
- [x] AD-06 — Crear `docengine-docs/README.md` en español. Delegado al mismo writer: 71 líneas.
- [x] AD-07 — Verificar y commitear por unidad. Verificación en la tabla siguiente; los commits se autorizaron en tres unidades y quedan identificados al final de este registro.

## Verificación aplicada (AD-07)

| Comprobación | Método | Resultado |
| --- | --- | --- |
| Paridad estructural de la traducción | `git show HEAD:devops-pulse/README.md` frente al archivo traducido: encabezados, bloques de código, cifras y spans de código en línea | 12/12 encabezados con el mismo nivel y orden; 5/5 bloques con contenido idéntico; multiset de cifras idéntico; 138/138 spans, sin altas ni bajas |
| Idioma | Búsqueda de oraciones en inglés y de formas voseo en el archivo traducido | Sin restos de inglés ni voseo |
| Registro (hallazgo propio, no reportado por el writer) | Búsqueda de imperativos en usted dentro de un documento de registro impersonal | 2 casos, líneas 230 y 235, normalizados a impersonal |
| Alcance del writer | `git status --short` frente a las superficies autorizadas | El writer escribió solo en sus dos rutas; las otras seis son las ediciones en línea del orquestador |
| Hechos de `docengine-docs/README.md` | `package.json`, `vite.config.js` y árbol real | Scripts, versión fijada, `dist/` y dependencias confirmados; sin comandos inventados |
| Secuencia del motor | Todas las menciones de Jet en el README traducido, una a una | Todas históricas; la verificación del navegador termina ahora en templ |
| Órdenes documentadas en `AGENTS.md` | `go version`, `go -C devops-pulse tool templ --help`, `vet`, `test` | `go1.27.1`; `vet` rc=0; `test` → `ok devops-pulse 2.263s` |
| Estilos | `git diff --check` | Sin errores de espacio en blanco |

**Falsos positivos descartados:** la verificación delegada marcó como fallo de alcance las seis rutas que el orquestador editó en línea (AGENTS.md, README.md, HALLAZGOS_BOOTSTRAP, devops-pulse.md, templ-poc.md y esta tarea), y como enlace roto el puntero intencional a `docs/HALLAZGOS_JET_6.md`, que en ese momento declaraba su propia retirada. Ambos se comprobaron y no eran defectos entonces; después se retiró ese puntero y otros análogos, por decisión del usuario.

## Carga de revisión declarada

- Traducción: 258 líneas reescritas íntegras en `devops-pulse/README.md`; el diff
  es grande aunque el riesgo sea bajo (prosa, sin comportamiento).
- README nuevo: ~70-90 líneas en `docengine-docs/README.md`.
- Correcciones quirúrgicas: ~20 líneas en cuatro documentos.
- Se separan en commits por unidad para que cada revisión tenga un foco.

## Límites declarados

- Los cuerpos de las 13 `SKILL.md`, `docs/CONTRATO_FLUJO_GIT_VERSIONADO.md`,
  `docs/inference-protocol.md` y las tres tareas ODD antiguas quedaron
  **spot-checked**, no auditadas línea a línea.
- No existe lint, typecheck ni suite de documentación en el repositorio; la
  verificación es estructural (paridad de bloques de código, cifras y rutas) más
  comprobación directa de cada afirmación corregida.
- `npx skills list --agent opencode` (`AGENTS.md`) no se ejecutó: no se verificó
  si «opencode» sigue siendo el agente destinatario de las skills.
- La rama `docs/align-documentation` se integró en `main` por avance rápido,
  junto con `docs/documentation-criteria`, y se publicó: la ref remota y la local
  coincidían en `8d25b3d` al hacerlo.

## Commits de la tarea

- `a4a05fd` — `docs: align the documentation with the repository state`:
  los nueve hallazgos confirmados en cinco documentos.
- `64eabc7` — `docs: translate the devops-pulse readme and add the docengine-docs
  one`: la traducción y el README nuevo.
- El commit de este registro es la punta de la rama `docs/align-documentation`;
  su identidad se resuelve con `git log --oneline docs/align-documentation`, y no
  se escribe aquí porque un commit no puede contener su propio hash.
