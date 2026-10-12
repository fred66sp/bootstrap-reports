# Criterios de documentación aplicados al repositorio

## Petición del usuario

«Sí lo apruebo»: aplicar como criterio, en la próxima revisión de documentación
de `docs/`, la nota propia del usuario
`IDEAS/__LIMBO/Cómo escribir documentación útil (y cuándo no hacerlo).md`
(basada en Diátaxis), y ejecutar la propuesta en el orden aceptado.

## Criterio adoptado (de la nota, con sus secciones)

- **Cuatro tipos sin mezclar** (§3, «El consejo central»): tutorial, guía
  práctica, referencia y explicación. El `README` reparte: qué es, cómo
  arrancar, dónde está la documentación y a quién preguntar (§4).
- **Un lugar principal por dato**; los demás documentos enlazan (§5.2, §8.5).
- **Lo incorrecto es peor que lo ausente**: se corrige en el mismo cambio que lo
  vuelve falso (§6.1–§6.2).
- **No documentar** lo que el código ya dice, lo que nadie mantendrá ni lo que
  una prueba puede verificar; ni crear estructuras vacías por adelantado
  (§8.1, §8.5).
- **Decisiones difíciles de revertir → ADR** numerado con contexto, decisión y
  consecuencias; un ADR no se reescribe, se reemplaza (§5.2, §10).
- **Dueño y fecha de última revisión** en cada documento; las reglas
  innegociables, respaldadas por pruebas o permisos, no solo por texto (§10).

Límite declarado: se leyeron íntegras §8.5, §9 y §10 de la nota y se verificó su
estructura completa; §3–§5 se conocen por un resumen citado, no línea a línea.

## Hallazgos verificados en el repositorio

| # | Hallazgo | Evidencia |
| --- | --- | --- |
| F1 | Duplicación entre `AGENTS.md` y `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md`: cuatro hechos en dos sitios | `AGENTS.md:29-33` frente a `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md:5,19,22,43,48,69` |
| F2 | Ningún documento de `docs/` tiene dueño ni fecha de revisión: causa raíz de la deriva corregida en la tarea anterior | `rg -i 'fecha\|última revisión\|dueño' docs/*.md` → sin coincidencias propias |
| F3 | No hay ADR para las decisiones difíciles de revertir: alpha fijada, ESM y el motor de vistas (revertido dos veces) | No existe `docs/decisions/`; el motivo del cambio de motor solo vive en `odd/tasks/` |
| F4 | `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md` mezcla guía, referencia y explicación | Secciones 17-24, 26-74 y 82-139 |
| F5 | `devops-pulse/README.md` mezcla cuatro tipos en 12 secciones | `rg -c '^#{1,3} '` → 12 |
| F6 | Regla innegociable sin respaldo automático: «no usar el global `window.bootstrap`» | `rg 'window.bootstrap' devops-pulse/*_test.go` → sin coincidencias |

Documentos correctos según el criterio: `docs/CONTRATO_FLUJO_GIT_VERSIONADO.md`,
`docs/HALLAZGOS_BOOTSTRAP_6_ALPHA.md`, `docs/inference-protocol.md`,
`README.md` y `docengine-docs/README.md`.

**Contrapunto:** no se propone crear un tutorial ni un árbol de documentación
por adelantado; el repositorio no tiene producto que enseñar y §8.1 prohíbe las
estructuras vacías.

## Plan aceptado, por partes

- [x] DC-01 — F2 y F1: pie de dueño y fechas en los cuatro documentos de `docs/`;
  `AGENTS.md` declara el criterio de documentación y cuál es el lugar principal
  de cada dato, y `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md` enlaza en vez de
  repetir. Verificado: `rg -n 'Dueño:' docs/*.md` → cuatro coincidencias.
- [x] DC-02 — F3: `docs/decisions/0001-motor-de-vistas-templ.md` con contexto,
  decisión, consecuencias buenas y malas, alternativas descartadas y una sección
  de lo que no se afirma, más el índice `docs/decisions/README.md` y su fila en
  el `README.md` raíz. Se registra **solo** la decisión del motor: fijar la alpha
  y usar ESM se revierten sin coste alto y se quedan como restricciones.
- [x] DC-03 — F4 y F5: separado por tipos. La guía de Bootstrap baja de 154 a
  58 líneas y aparece `docs/REFERENCIA_BOOTSTRAP_6_ALPHA.md` (77); el cartel de
  `devops-pulse` baja de 235 a 63 líneas y aparecen
  `docs/devops-pulse/ARQUITECTURA.md` (24) y `docs/devops-pulse/REFERENCIA.md`
  (118). Delegado a un writer acotado y verificado después (tabla siguiente).
- [x] DC-04 — F6: `devops-pulse/assets_test.go` con
  `TestClientCodeNeverReachesTheBootstrapGlobal`. Recorre `web/views` y
  `web/static`, salta `web/static/vendor` (código de terceros) y falla con
  `ruta:línea` si la cadena aparece; exige haber leído algún archivo, así que no
  puede pasar en vacío tras un cambio de rutas. La comprobación es literal a
  propósito: una mención en un comentario también la hace fallar, porque analizar
  JavaScript para excluir comentarios volvería frágil la guarda y cualquier
  aparición nueva merece una revisión humana.

## Cierre

Los cuatro pasos están hechos y verificados. El criterio queda escrito en
`AGENTS.md` y respaldado donde el propio criterio lo pide: la regla innegociable
del global `window.bootstrap` tiene prueba automática, y cada documento de `docs/`
declara dueño y caducidad.

**Verificación de DC-04, por mutación y no por inspección:** verde antes de tocar
nada; rojo al añadir `window.bootstrap = null` a `web/static/app.js`, señalando
`web/static/app.js:60`; archivo restaurado idéntico (`cmp`) y verde otra vez;
suite completa `ok devops-pulse 2.255s`, `go vet ./...` rc=0.

**Pendiente de decisión del usuario:** integrar en `main` las dos ramas apiladas
—`docs/align-documentation` y `docs/documentation-criteria`— y publicarlas.

## Verificación de DC-03

Verificación delegada e independiente (read-only), más re-verificación propia de
cada punto señalado con el mismo comando que lo detectó:

| Comprobación | Resultado |
| --- | --- |
| Alcance del writer | `git status --short` → solo las rutas autorizadas |
| Cifras y spans de código ausentes | Comparación multi-conjunto contra los dos originales: ninguna cifra perdida; de los spans, solo `@import` no está en el conjunto dividido, y vive en su lugar principal (`AGENTS.md:32`) |
| Bloques de código cercados | Ninguna línea original ausente |
| Líneas duplicadas de 40 caracteres o más | Solo el pie de dueño y fechas, que es convención deliberada; el resto, sin duplicados |
| Encabezados originales | Todos tienen contenido asignado a un documento |
| Enlaces relativos | Todos resuelven; el puntero al documento retirado por `git show 320ceed:…` se conserva |
| Convención de documentos nuevos | Los tres nuevos abren con la pregunta que responden y cierran con el pie de fechas |
| Pureza de tipo | Falló en la primera pasada: se corrigieron cuatro imperativos de procedimiento en `docs/devops-pulse/REFERENCIA.md` (25, 37, 45 y 109) y se retiró la descripción duplicada y la lista de exclusiones repetida de `ARQUITECTURA.md` |

**Corrección de diseño del orquestador:** el reparto inicial duplicaba las
exclusiones de alcance entre el cartel y la explicación, y dejaba procedimiento
dentro de la referencia. Las dos cosas las detectó la verificación, no el diseño
previo; la segunda pasada las confirma resueltas.

## Rama

`docs/documentation-criteria`, apilada sobre `docs/align-documentation` (que
sigue sin integrar). Si la primera se integra después, esta se apoya en ella
sin conflicto esperado, porque ambas parten de `main` en `815c454`.

## Límites declarados

- El duplicado entre `AGENTS.md` y `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md` (F1)
  queda **declarado** con un lugar principal explícito en DC-01; la poda de las
  frases repetidas se hace en DC-03, cuando ese documento se separa por tipos,
  para no editar dos veces las mismas líneas.
- La lista de comprobación de la nota (§10) pide que la referencia de API se
  genere desde el código; aquí no aplica porque el repositorio no publica API.
- No se auditó el contenido de `odd/tasks/` contra el criterio: son registros de
  trabajo, no documentación de producto.
