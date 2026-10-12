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

## Decisión y alcance

- **Se retira** `docs/HALLAZGOS_JET_6.md`. El contenido no se reescribe, no se
  traduce y no se enseña a recuperar.
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
  `odd/tasks/templ-poc.md` y `odd/tasks/devops-pulse.md`, señalando la retirada.
- [x] RJD-03 — Verificar: el archivo no existe y `grep` no devuelve referencias
  colgantes sin marcar.
- [x] RJD-04 — Commit de unidad de trabajo. Autorizado por el usuario y creado en
  la rama `docs/retire-jet-findings-doc`:
  `docs: retire the jet 6 findings document`, con `320ceed` como padre.
- [x] RJD-05 — Integración en `main`, autorizada por el usuario. Avance rápido de
  `320ceed` a `1ae8f4c`; la rama local se conserva. Sin `fetch` para integrar,
  etiqueta ni publicación por parte del agente; el `push` lo ejecutó el usuario
  después (ver «Cierre»).

## Verificación aplicada (RJD-03)

| Comprobación | Comando | Resultado |
| --- | --- | --- |
| Documento ausente | `test -e docs/HALLAZGOS_JET_6.md` | Falso (`docs/` queda con cuatro documentos) |
| Sin referencias colgantes | `grep -rn "HALLAZGOS_JET" --exclude-dir=node_modules --exclude-dir=.git .` | Las coincidencias restantes son la anotación de retirada o el registro de esta tarea |
| Sin enlaces Markdown rotos | `grep -rn "](.*HALLAZGOS_JET" .` | Sin coincidencias: todas las menciones eran código en línea, no enlaces |

**Verificación no aplicable, con motivo:** no se ejecutó `go test`, `go vet` ni
`npm run build`, porque ningún archivo de código, manifiesto o asset cambió; el
diff son cuatro documentos y el borrado de un quinto. Este repositorio no tiene
lint ni suite de documentación (`AGENTS.md`), así que la comprobación proporcional
es la tabla anterior.

## Límites declarados

- El borrado elimina la justificación local de dos guardas de prueba que siguen
  en el árbol (`TestViewEscapesHTMLMetacharacters` y
  `TestAlpineJSLiteralInterpolationsStaySafe`, en
  `devops-pulse/views_test.go`). Las guardas se conservan, pero su razonamiento
  ya no está escrito en el árbol.
- No se verificó el contenido del documento contra `v6.3.3` en esta tarea: no
  se reescribe, se retira.
- **Revisión nativa (RDD):** el interruptor está apagado (`gentle-ai review mode
  status` → `receipt-driven development: off (decided by global)`, clon sin
  valor propio), así que este candidato no tiene ciclo de revisión nativa. Es
  coherente con el tipo de cambio: solo documentación, sin comportamiento
  ejecutable. El candidato revisable sería el commit `1ae8f4c`, a decisión del
  usuario si reactiva el interruptor.

## Cierre (2026-10-12)

- **Resultado:** `docs/` ya no describe un motor que el stack no usa y el
  documento retirado no dejó ninguna referencia colgante.
- **Integración:** `docs/retire-jet-findings-doc` → `main` por avance rápido
  (`320ceed` → `1ae8f4c`), autorizado por el usuario. La rama se conserva, igual
  que `feature/jet6-devops-pulse` y `feature/templ-poc`.
- **Carga de revisión:** 5 archivos, 115 inserciones y 140 borrados; el grueso de
  los borrados es el documento retirado (138 líneas) y el grueso de las
  inserciones es el registro de la decisión. No hay código ejecutable en el
  diff.
- **Publicación:** el usuario ejecutó `git push` el 2026-10-12. Verificado
  después por tres vías coincidentes —`main` local, la ref de seguimiento
  `origin/main` y `git ls-remote origin refs/heads/main`— en `59e90ba`: la
  retirada del documento (`1ae8f4c`) y este registro (`59e90ba`) están
  publicados.
- **Pendiente, no bloqueante:** el commit que corrige este mismo apartado
  (`docs: correct the publication state in the retirement record`) queda sin
  publicar hasta que se ejecute otro `push`. Se creó porque el texto anterior
  afirmaba que el `push` no se había hecho y contaba mal la distancia frente a
  `origin/main`, un error del agente al redactar el estado antes de que su propio
  commit existiera.
