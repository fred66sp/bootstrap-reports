# Resincronización de docengine-docs con docengine

## Petición del usuario

«docengine-docs está desactualizado, hicimos cambios en el proyecto docengine.»

Decisiones tomadas por el usuario el 2026-10-12:

1. **Alcance:** auditoría completa del contenido del sitio contra las fuentes de
   `docengine` y después corrección, en unidades revisables. No se corrige solo
   el delta ya detectado.
2. **Estado afirmado:** el sitio declara lo **publicado (`v0.2.1`)** y marca las
   capacidades todavía **sin publicar** como «en preparación», siguiendo la
   convención que la propia landing de `docengine` ya aplicó en `61183d6`.

## Vínculo entre los dos repositorios

`/home/alfredo/PROJECTS/docengine` es un **repositorio independiente** y es el
dueño de los hechos que este sitio afirma. La tarea original
(`odd/tasks/document-docengine-bootstrap-site.md`) fijó como fuente de verdad su
documentación comprobada, no su landing: `README.md`, `docs/README.md`,
`docs/installation.md`, `reference/cli.md` y las referencias normativas de
`skill/software-documentalist/references/`.

El sitio no se ancla a esas fuentes por ruta en tiempo de ejecución: es una
**copia de contenido** que hay que resincronizar a mano cuando `docengine`
avanza. Este registro es el de la resincronización, no un cambio de ese vínculo.

## Estado del origen al iniciar (comprobado)

| Dato | Valor | Evidencia |
| --- | --- | --- |
| Rama del origen | `feature/link-integrity-check`, árbol limpio | `git status --short --branch` |
| Commits por delante de `main` | 13 | `git log --oneline main..HEAD \| wc -l` |
| Última etiqueta publicada | `v0.2.1` | `git tag` |
| Cambios sin publicar | `CHANGELOG.md` → `DOCENGINE-552 [Sin publicar]` | 5 entradas |

## Hallazgos de deriva (DR-01, DR-02)

Fuentes de verdad usadas: `README.md`, `docs/README.md`, `reference/cli.md` y
las referencias normativas `skill/software-documentalist/references/{cli,
profile,report,degradation}.md` de `/home/alfredo/PROJECTS/docengine`. Cada
hallazgo se comprobó además contra la etiqueta publicada `v0.2.1`, porque la
marca de estado depende de si el hecho está publicado o no.

| # | El sitio afirma | La fuente dice | ¿En `v0.2.1`? | Corrección |
| --- | --- | --- | --- | --- |
| D1 | `checks` admite 4 contratos: `ids`, `references`, `headings`, `language` (`docengine-docs/src/index.html:674`) | 5: `language`, `ids`, `references`, `headings`, `links` (`profile.md:64`) | No | Añadir `links` y marcarlo en preparación |
| D2 | 17 códigos de finding, ninguno de enlace (`src/index.html:477-548`) | 19: faltan `LINK_TARGET_MISSING`, `LINK_ANCHOR_MISSING`, `LINK_SCHEME_INVALID` (`profile.md:96-100`, `report.md:60-62`) | No | Añadir los tres, en preparación |
| D3 | `severity` solo a nivel de regla (`src/index.html:674`) | `severity` por check con forma objeto `{"name":"links","severity":"error"}`; el informe resuelve la severidad por check (`profile.md:66-69`, `report.md:25`) | No | Documentar la forma objeto y su consecuencia de enumeración, en preparación |
| D4 | 6 kinds de fuente de hechos (`src/index.html:682`) | 7: falta `regex_set` (`profile.md:198`) | No | Añadir `regex_set`, en preparación |
| D5 | 6 comandos: `init`, `status`, `audit`, `plan`, `apply`, `version` (`src/index.html:336-355`) | 8: faltan `context` y `help` (`README.md:201`, `reference/cli.md:14-16`) | Sí | Añadir los dos como hechos vigentes |
| D6 | `bm25` con 8 campos, sin `algorithm_version` (`src/index.html:694`) | 9 campos, `algorithm_version` por defecto `1` (`profile.md:235`, `report.md:110`) | Sí | Añadir el campo como hecho vigente |
| D7 | «integrada en `main`, etiquetada y **con release en GitHub**» (`src/index.html:117`) | «v0.2.1 está integrada en la rama principal y etiquetada en GitHub»; las descargas publicadas «podrían no estar disponibles» (`docs/README.md:15`, `reference/cli.md:35`) | — | Alinear la redacción al origen y declarar el límite |

### Verificado sin deriva

Se comprobó afirmación por afirmación y **coinciden** con la fuente: códigos de
salida `0`-`3` incluido el matiz «`0` no equivale a ausencia de findings`
(`reference/cli.md:18-33`); `strict_confirmation` con `true` por defecto
(`profile.md:21`); cuatro plantillas (`docs/installation.md:43`); tres skills
integradas (`README.md:201`); herencia del `language` de la regla desde el perfil
(`profile.md:20`); `exclusions` con `reason` obligatorio (`profile.md:217-221`);
`impact_relations` que emite `GIT_IMPACT` como aviso sin cambiar el código de
salida (`profile.md:223-229`); BM25 advisory que nunca crea findings
(`profile.md:243`); y el comparador Python como historial de incubación
(`README.md:206-208`).

### Fuera de alcance, declarado

- **N1** — El sitio no muestra los flags de `init` `--lang`, `--dry-run` ni
  `--non-interactive` (`skill/software-documentalist/references/cli.md:70`,
  `degradation.md:44-56`). No es una afirmación falsa: el sitio no declara ser
  exhaustivo. Queda como mejora opcional, no como deriva.
- **N2** — El sitio no nombra los códigos de error operativo `EXECUTION_IO`,
  `EXECUTION_GIT` ni `EXECUTION_BM25` (`cli.md:139`). Tampoco es falso: describe
  correctamente sus causas. No son findings y no figuran en la tabla de
  `report.md`, así que no son códigos que el sitio deba listar entre los suyos.
- **N3** — `exit_code` **no** es un kind de fuente de hechos. Aparece en el
  perfil propio de `docengine` (`internal/config/config_test.go:64`) como id de
  un fact. No se añade a la lista de kinds.

## Tareas

- [x] DR-01 — Auditar el contenido del sitio contra las fuentes de `docengine`.
  Delegado a un explorador acotado (solo lectura) y re-verificado punto por
  punto por el orquestador.
- [x] DR-02 — Consolidar el informe de deriva con evidencia `archivo:línea` en
  este registro.
- [x] DR-03 — Corregir los hallazgos D1-D8, en dos unidades de revisión.
  Delegado a un writer acotado por unidad y verificado por el orquestador.
- [x] DR-04 — Marcar D1-D4 como «en preparación»; D5 y D6 son hechos publicados
  en `v0.2.1` y se afirman como vigentes. Alcance de la marca, coincidente con
  el que declara la landing del origen: `links`, la severidad por check,
  `regex_set` y sus códigos.
- [x] DR-05 — Verificar y commitear por unidad.

### Reparto en unidades de revisión

- **U1 — capacidades sin publicar:** D1, D2, D3, D4 y su marca de estado.
- **U2 — omisiones ya publicadas y afirmación sin respaldo:** D5, D6, D7.

El reparto es secuencial y no simultáneo: D1, D3, D4 y D6 caen en el mismo bloque
del perfil (`src/index.html:674-694`), así que dos escrituras concurrentes
obligarían a preparar el índice a mano sin ganar nada en la revisión.

### Hallazgo propio de la verificación (D8)

No lo produjo la auditoría delegada: lo encontró el orquestador al verificar la
unidad U1. La marca de «en preparación» volvió falsas dos afirmaciones de
procedencia que antes eran ciertas.

| # | El sitio afirmaba | Por qué dejó de ser cierto |
| --- | --- | --- |
| D8 | «El contenido de esta página describe la versión etiquetada v0.2.1» y «Contenido basado en la versión etiquetada v0.2.1» (`docengine-docs/src/index.html:921`, `:1000`, y sus pares en `src/js/main.js:326`, `:337`, `:641`, `:652`) | U1 añadió cuatro capacidades que **no** están en `v0.2.1`; decir que la página describe solo esa versión pasa a ser falso |

Corregido en U2: las seis cadenas, en los dos idiomas, declaran ahora que lo que
la versión publicada todavía no incluye se marca como en preparación. Se anota
porque es el modo de fallo que este registro persigue: una afirmación verdadera
que otro cambio del mismo trabajo volvió falsa.

## Verificación aplicada (DR-05)

| Comprobación | Método | Resultado |
| --- | --- | --- |
| Alcance del writer | `git status --short` frente a las superficies autorizadas | Solo los dos archivos autorizados; ninguna escritura en `scss`, en el origen ni en otro sitio |
| Existencia real de la marca de advertencia | `theme-warning` no aparece en `src/scss/styles.scss`; se inspeccionó el CSS compilado | `.theme-warning` y `.badge-subtle` existen en `dist/assets/*.css` y resuelven a los tokens `--warning-*` de Bootstrap: la alerta no queda sin estilo |
| Paridad de idioma | Conteo por clave nueva en `main.js` y en `index.html` | Las 8 claves nuevas aparecen dos veces en `main.js` (ES y EN) y con respaldo en `index.html` |
| Ausencia de la afirmación sin respaldo | `grep -n 'released on GitHub\|release en GitHub'` | Sin coincidencias |
| Ninguna afirmación de recuento quedó mintiendo | Búsqueda de prosa con recuentos de códigos o de comprobaciones | No existe ninguna afirmación de recuento que la inserción pudiera invalidar |
| Compilación | `npm --prefix docengine-docs run build` | `✓ built`, 21 módulos; `dist/index.html` 83,45 kB |
| Estilo | `git diff --check` | Sin errores de espacio en blanco |
| Defecto introducido por el writer | Lectura del diff, no del informe | Un espacio suelto antes de una coma en `main.js`; corregido antes del commit |
| Artefacto compilado | `grep` sobre `dist/index.html` y `dist/assets/*.js` | Los nueve elementos nuevos están presentes en el build, y la afirmación sin respaldo no aparece en ninguno de los dos |
| Comprobación en navegador | Chrome for Testing de la caché de Playwright (`chromium-1248`) sobre `preview` en el puerto 4173, con captura | **Ejecutada.** La alerta de advertencia se ve y se distingue del fondo, en tema claro (`oklch(0.975995 0.0480398 88)` sobre blanco) y en oscuro (`oklch(0.3168 0.0864 88)` sobre `oklch(0.144 0.0048 245)`); los tres códigos `LINK_*` y los cinco badges son visibles; el conmutador ES/EN traduce la marca a «In preparation» e «in preparation»; la frase sin respaldo no aparece en el texto renderizado; `context` y `help` se muestran; sin errores de consola ni de página |

**Defecto de proceso registrado:** el writer de U2 declaró «sin dudas ni
desviaciones» e introdujo un espacio suelto antes de una coma. Lo encontró la
lectura del diff por el orquestador, no el informe del writer. Refuerza la regla
de no aceptar estado declarado como verificación.

## Superficie de escritura prevista

- `docengine-docs/src/index.html`
- `docengine-docs/src/js/main.js`
- `docengine-docs/README.md`, solo si sus propias afirmaciones resultan falsas.
- Este registro.

Fuera de alcance: `docengine-docs/src/scss/styles.scss` (estilos), salvo que una
corrección de contenido necesite una clase nueva, y el checkout
`/home/alfredo/PROJECTS/docengine`, que **no se modifica** en ningún caso.

## Restricción de idioma

El sitio mantiene dos idiomas (ES/EN) y el español es el inicial. Toda
corrección de contenido debe aplicarse a **los dos** idiomas, o queda una
afirmación falsa en el otro.

## Límites declarados

- `docengine-docs/` no tiene lint, typecheck ni suite de tests: su verificación
  disponible es `npm --prefix docengine-docs run build`.
- El sitio no está cubierto por `scripts/check-docs.mjs`, que solo mira
  documentación de este repositorio; la comprobación de sus afirmaciones es
  contra las fuentes del origen y no automática.
- No se modifica `docengine`: si la auditoría revela una fuente del origen
  incorrecta, se informa como hallazgo ajeno y no se toca.
- **D7 se resolvió alineando la redacción, no comprobando un hecho.** No hubo
  acceso a la red ni al estado de releases de GitHub, así que **no se sabe** si
  existe un release publicado de `v0.2.1`. Se conserva la discrepancia como
  límite declarado en lugar de afirmar cualquiera de las dos cosas.
- La auditoría cubrió las afirmaciones factuales sobre `docengine`. No auditó la
  calidad de la composición visual ni el texto de la sección Diátaxis, que no
  afirman hechos del producto.
- **La verificación en navegador se ejecutó con el Chrome for Testing de la caché
  de Playwright**, no con el servidor MCP: este último está configurado para el
  canal `chrome` del sistema y busca `/opt/google/chrome/chrome`, que no existe.
  Se condujo `playwright-core` directamente con `executablePath` apuntando a
  `~/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome`. Es un límite de
  herramienta, no de verificación: la página renderizada **sí** se observó, en
  tema claro y oscuro y en los dos idiomas.

## Rama, commits y límites de publicación

Rama `docs/docengine-docs-resync`, creada desde `main` en `14450b2`. Dos commits
de unidad de trabajo:

- `fc17ef4` — `docs(docengine-docs): mark the unreleased links capabilities`
  (U1: D1-D4).
- `2183f09` — `docs(docengine-docs): correct published omissions and an
  unsupported claim` (U2: D5-D7 y D8).

Los commits son locales. **No se ha hecho `push`, ni fusión, ni PR:** eso sigue
siendo decisión del usuario.

## Dueño y revisiones

Dueño: Alfredo. Última revisión: 2026-10-12. Próxima revisión: cuando `docengine`
publique una versión que incluya `links`, la severidad por check o `regex_set`,
para retirar la marca de «en preparación»; y antes de cualquier cambio en la
rama `feature/link-integrity-check` que altere lo ya documentado.
