# Retirada del documento de hallazgos de Jet 6

## Petición del usuario

«Revisa docs porque ahora hace referencia a JET que ya no utilizamos.»
Autorizado el 2026-10-12 (opción 3 de la consulta de alcance): eliminar
`docs/HALLAZGOS_JET_6.md` y actualizar las referencias entrantes.

## Estado declarado frente a estado comprobado

| Afirmación | Clasificación | Fuente |
| --- | --- | --- |
| `docs/HALLAZGOS_JET_6.md` es el único documento de `docs/` que trata de Jet | HECHO CONFIRMADO | `grep -rn -i "jet" docs/` → solo coincidencias en ese archivo |
| Jet ya no es el motor del proyecto | HECHO CONFIRMADO | `devops-pulse/go.mod` requiere `github.com/a-h/templ v0.3.1070`; no hay archivos `*.jet`; las vistas son `devops-pulse/web/views/*.templ` |
| El documento contiene afirmaciones hoy falsas | HECHO CONFIRMADO | Cita `v6.3.3` «fijada exactamente en `devops-pulse/go.mod`»; cita como evidencia `.agents/skills/jet-template-engine/SKILL.md`, retirada y ausente del árbol; cita tres pruebas que ya no existen (`TestBrokenViewFailsAtConstruction`, `TestMissingIncludedViewDoesNotWritePartialOutput`, `TestConcurrentRenderingMatchesFrozenBaseline`) |
| Existen cuatro referencias entrantes en tres archivos | HECHO CONFIRMADO | `devops-pulse/README.md:203`, `odd/tasks/templ-poc.md:99`, `odd/tasks/devops-pulse.md:648` y `:672` |
| El contenido sigue recuperable tras el borrado | HECHO CONFIRMADO | El blob existe en el commit `320ceed` (merge de `feature/templ-poc` en `main`); `git show HEAD:docs/HALLAZGOS_JET_6.md \| sha256sum` → `ff4f166286f26c094eb3735915f2de25a839bd6448d5344931ff92d455878788` |

## Decisión y alcance

- **Se retira** `docs/HALLAZGOS_JET_6.md`. El contenido no se reescribe ni se
  traduce: queda en el historial de Git, que es la vía de recuperación
  declarada.
- **Se conservan** los guardarraíles de las skills locales («no reintroducir
  Jet»), que son instrucción vigente, no residuo.
- **Se conservan** los registros de auditoría de `odd/tasks/`: se anotan como
  referencia a un documento retirado, sin reescribir lo que se hizo en su
  momento.
- **No se toca** `devops-pulse/README.md` en sus comparaciones históricas
  «Jet-era» (líneas 66, 148, 186 y 209), que describen mediciones A/B y siguen
  siendo ciertas como historia medida.

## Tareas

- [x] RJD-01 — Retirar `docs/HALLAZGOS_JET_6.md` con `git rm`. Verificado: el
  archivo ya no existe y `docs/` conserva los cuatro documentos restantes.
- [x] RJD-02 — Actualizar las referencias entrantes en `devops-pulse/README.md`,
  `odd/tasks/templ-poc.md` y `odd/tasks/devops-pulse.md`, señalando la retirada y
  la ruta de recuperación.
- [x] RJD-03 — Verificar: el archivo no existe, `grep` no devuelve referencias
  colgantes sin marcar, y el contenido es recuperable desde el historial.
  Comprobado: `git show 320ceed:docs/HALLAZGOS_JET_6.md | sha256sum` →
  `ff4f166286f26c094eb3735915f2de25a839bd6448d5344931ff92d455878788`, idéntico al
  blob previo al borrado.
- [x] RJD-04 — Commit de unidad de trabajo. Autorizado por el usuario y creado en
  la rama `docs/retire-jet-findings-doc`:
  `docs: retire the jet 6 findings document`, con `320ceed` como padre y sin
  `push`, `fetch`, etiqueta ni merge (operaciones que quedan pendientes de una
  autorización aparte).

## Verificación aplicada (RJD-03)

| Comprobación | Comando | Resultado |
| --- | --- | --- |
| Documento ausente | `test -e docs/HALLAZGOS_JET_6.md` | Falso (`docs/` queda con cuatro documentos) |
| Sin referencias colgantes | `grep -rn "HALLAZGOS_JET" --exclude-dir=node_modules --exclude-dir=.git .` | Trece coincidencias, todas la anotación de retirada o el registro de esta tarea con su ruta de recuperación |
| Sin enlaces Markdown rotos | `grep -rn "](.*HALLAZGOS_JET" .` | Sin coincidencias: todas las menciones eran código en línea, no enlaces |
| Recuperabilidad | `git show 320ceed:docs/HALLAZGOS_JET_6.md \| sha256sum` | `ff4f1662…878788`, idéntico al blob retirado |

**Verificación no aplicable, con motivo:** no se ejecutó `go test`, `go vet` ni
`npm run build`, porque ningún archivo de código, manifiesto o asset cambió; el
diff son cuatro documentos y el borrado de un quinto. Este repositorio no tiene
lint ni suite de documentación (`AGENTS.md`), así que la comprobación proporcional
es la tabla anterior.

## Límites declarados

- El borrado elimina la justificación local de dos guardas de prueba que siguen
  en el árbol (`TestViewEscapesHTMLMetacharacters` y
  `TestAlpineJSLiteralInterpolationsStaySafe`, en
  `devops-pulse/views_test.go`). Las guardas se conservan; su razonamiento queda
  únicamente en el historial de Git.
- No se verificó el contenido del documento contra `v6.3.3` en esta tarea: no
  se reescribe, se retira.
- La «revisión nativa (RDD)» de esta unidad queda sujeta a la política
  ordinaria; el interruptor no se consultó aquí.
