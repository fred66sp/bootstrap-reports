# Documentar docengine con Bootstrap

## Objetivo

Crear una documentación web estática, cuidada y navegable para el proyecto
hermano `../docengine`, construida con Bootstrap 6 Alpha 1 y Vite, con modo
claro/oscuro, interfaz bilingüe ES/EN y español como idioma inicial.

## Problema

`docengine` ya dispone de documentación Markdown extensa y una landing estática
propia, pero el workspace Bootstrap todavía no contiene una experiencia web
unificada que explique el producto, su flujo, sus contratos y su uso rápido.

## Decisiones y límites

- El sitio se implementará en este workspace, en `docengine-docs/src/`, sin modificar el
  checkout hermano `../docengine`.
- La fuente de verdad del contenido será la documentación comprobada de
  `../docengine`: `README.md`, `docs/README.md`, `docs/installation.md`,
  `reference/cli.md`, `DESIGN.md` y las referencias de perfil e informe.
- Bootstrap se integrará mediante Vite, Sass moderno (`@use`) y ESM; no se
  usará `window.bootstrap`.
- Se usarán tokens de Bootstrap y el atributo `data-bs-theme` para los modos de
  color; no se crearán dos hojas de estilo paralelas.
- No se añadirá `@floating-ui/dom` ni `vanilla-calendar-pro`: el sitio no usa
  menús, popovers, tooltips ni datepicker que los requieran.
- El sitio será de una sola página para esta unidad; la organización del
  contenido seguirá una lectura progresiva: propuesta, flujo, quick start,
  contratos, capacidades y rutas Diátaxis.

## Alcance autorizado

- Añadir la aplicación Vite en `docengine-docs/` y su configuración de build.
- Actualizar `docengine-docs/package.json` y `docengine-docs/package-lock.json` con los scripts y dev tools
  estrictamente necesarios.
- Mantener el `README.md` del workspace alineado con la aplicación web
  disponible y su ruta de verificación.
- Crear el contenido bilingüe y el comportamiento de idioma, tema, navegación,
  copiado de comandos y accesibilidad básica.
- Mantener los documentos normativos existentes sin reescribirlos.
- No ejecutar operaciones remotas ni crear todavía el commit del work unit.

## Tareas

- [x] DOC-01 — Preparar Vite, Sass y la entrada Bootstrap con estructura de
  aplicación mantenible.
- [x] DOC-02 — Implementar la landing documental bilingüe, responsive y con
  modo claro/oscuro.
- [x] DOC-03 — Verificar build, resolución de Bootstrap, diff y estructura del
  sitio; registrar límites de verificación.
- [x] DOC-04 — Rehacer la composición visual tomando como referencia la landing
  existente de `../docengine`, sin abandonar Bootstrap.
- [x] DOC-05 — Recomponer las secciones densas en columnas y paneles de lectura
  rápida, especialmente los códigos de findings deterministas.
- [x] DOC-06 — Sustituir el menú básico por una navegación Bootstrap responsive
  con enlaces inline y drawer accesible.
- [x] DOC-07 — Replantear la navegación desktop como TOC sticky y convertir las
  secuencias lineales en composiciones de columnas.
- [x] DOC-08 — Refinar tipografía, ritmo de espaciado y añadir control Back to
  top accesible.
- [x] DOC-09 — Corregir la escala tipográfica, equilibrar Quickstart en dos
  columnas y convertir las notas custom en alerts semánticos de Bootstrap.
- [x] DOC-10 — Reubicar la aplicación completa en `docengine-docs/` para
  mantener la raíz disponible para futuros proyectos.
- [x] DOC-11 — Reconstruir la interfaz con Bootstrap como sistema visual
  principal y reducir la capa custom a identidad y composición específica.
- [x] DOC-12 — Reequilibrar la escala tipográfica sobre los tokens `--font-size-*`
  de Bootstrap: hero como display de un solo gesto, corrección de la inversión de
  jerarquía del flujo y unificación de los títulos de tarjeta.
- [x] DOC-13 — Auditoría cartográfica de las afirmaciones del sitio contra las
  fuentes reales de `../docengine` y corrección del encuadre falso de publicación
  y de las descripciones desactualizadas de Git impact y BM25.
- [x] DOC-14 — Rediseñar la sección «Contratos deterministas»: introducción en
  lenguaje llano, bloques del perfil visibles en tarjetas (título humano + clave
  JSON) en lugar de pestañas de jerga, explicación de qué es un finding y rebaja
  de jerga en las descripciones de códigos.
- [x] DOC-15 — Simplificar «Capacidades», «Salidas» y «Perfil/informe»: quitar
  «opt-in»/badges redundantes, explicar las comprobaciones opcionales en llano,
  aclarar el sentido de los códigos de salida y separar campos obligatorios y
  opcionales del perfil.
- [x] DOC-16 — Corregir el perfil mínimo de «Perfil/informe» (faltaba
  `strict_confirmation`) y reemplazar el informe vacío por un ejemplo con un
  finding, tomado de la landing oficial de `../docengine`.
- [x] DOC-17 — Rehacer «Perfil/informe» como referencia completa de opciones:
  explicar cada campo de nivel superior del perfil (con sus sub-campos) y cada
  campo del informe, en lugar de un párrafo corrido.
- [x] DOC-18 — Añadir un ejemplo de perfil completo en JSONC con comentarios
  (además del mínimo) y comentar el ejemplo de informe; los comentarios cambian
  con el idioma vía i18n.
- [x] DOC-19 — Resaltado de sintaxis con Prism en los bloques de código y
  ventana tipo macOS: los tres puntos pasan a rojo/ámbar/verde en todos los
  bloques.
- [x] DOC-20 — Subir un paso el tamaño del TOC: enlaces de `sm` (14) a `md` (16)
  y el contador de `xs` (12) a `sm` (14).
- [x] DOC-21 — Explicar mejor Diátaxis: qué es la técnica, los dos ejes, por qué
  el motor la adopta, y mostrar la carpeta de cada tipo en las tarjetas.
- [x] DOC-22 — Rediseñar los selectores del head: idioma y tema como controles
  segmentados (píldora con segmento activo) en lugar de botones de icono sueltos.
- [x] DOC-23 — Rehacer el footer con una ilustración pixelart (documento) de
  fondo suave, marca, navegación de secciones y fila base.

## Criterios de aceptación

- `npm --prefix docengine-docs run build` produce un build Vite reproducible sin errores de Sass ni
  resolución de módulos.
- La página comienza en español y permite cambiar a inglés sin recargar.
- El selector de tema permite claro y oscuro, conserva la preferencia y evita
  un destello de tema incorrecto durante la carga.
- El layout es usable en móvil y escritorio, con navegación semántica, foco
  visible, labels accesibles y `prefers-reduced-motion` respetado.
- El contenido distingue hechos del producto, flujo de adopción, quick start,
  capacidades opt-in, códigos de salida, perfil, informe y rutas Diátaxis.
- La composición mantiene una navegación de contexto visible en escritorio,
  una jerarquía hero con estado verificable, una medida de lectura consistente,
  ritmo visual entre secciones y divulgación progresiva para las zonas densas.
- Las listas de códigos y conceptos no se presentan como una única tira de
  elementos: cada grupo tiene contexto, columnas y una relación visual clara
  entre categoría, detalle y evidencia.
- La navegación responde a la anchura real: enlaces inline cuando caben,
  drawer lateral en móvil/tablet, foco atrapado, cierre por Escape y cierre al
  seleccionar una sección.
- La documentación no afirma como publicado o verificado nada que las fuentes
  disponibles no sostengan.

## Verificación prevista

- `npm run build`
- `git diff --check`
- Inspección estructural de `docengine-docs/src/index.html`,
  `docengine-docs/src/js/main.js` y `docengine-docs/src/scss/styles.scss`.
- Si no existe lint o test aplicable en este workspace, declararlo como no
  disponible en vez de inventar un comando.

## Ruta de implementación

- DOC-01, DOC-02, DOC-04 y DOC-05: delegado directo a un único escritor porque la preparación
  de la escritura y la implementación abarcan varios archivos no triviales.
- DOC-03: verificación delegada y spot check del orquestador.

## Progreso

- Rama: `docs/docengine`.
- Estado: implementación, rediseño y verificación local completados; commit
  pendiente de confirmación explícita.
- Estrategia de entrega: `ask-on-risk`; un work unit previsto, con commit
  pendiente de confirmación explícita según el contrato Git.
- Fuentes comprobadas: documentación local de `../docengine` y documentación
  oficial de Bootstrap 6 Alpha 1 para Vite, Sass y color modes.

## Evidencia de implementación

- `docengine-docs/package.json`: scripts `dev`, `build` y `preview`; Bootstrap permanece fijado
  en `6.0.0-alpha.1`; Sass y Vite quedan como dev dependencies.
- `docengine-docs/vite.config.js`: raíz `src/`, salida `dist/` y servidor local en el puerto
  8080, con `strictPort` para no cambiar silenciosamente de URL si el puerto
  está ocupado.
- `docengine-docs/src/index.html`: landing responsive con navegación, hero, flujo, quick
  start, adopción, contratos, capacidades, códigos, perfil/informe, Diátaxis y
  evidencia/limitaciones.
- `docengine-docs/src/js/main.js`: claves HTML cubiertas por los diccionarios ES y EN, idioma
  persistente, tema persistente, drawer responsive, scrollspy y copiado de
  comandos.
- `docengine-docs/src/scss/styles.scss`: Bootstrap compilado mediante `@use`, tokens de color
  adaptativos y capa custom accesible.
- `README.md`: ruta de entrada y comandos locales del sitio, sin afirmar una
  publicación remota.
- Rediseño DOC-04: TOC sticky desde `lg`, hero con status strip, measure de
  lectura reutilizable, encabezados numerados, ritmo por divisores/superficies,
  tabs Bootstrap para contratos y perfil/informe, catálogos en columnas para
  findings y plugins ESM `Tab`, `Drawer` y `ScrollSpy`.

## Verificación observada

- `npm run build`: correcto; Vite genera `dist/index.html`, CSS y JS sin errores
  de Sass o resolución de módulos.
- Tras el rediseño, el build transforma 15 módulos y conserva Bootstrap JS sin
  incluir `@floating-ui/dom`, `vanilla-calendar-pro` ni `window.bootstrap`.
- Comprobación estructural: no quedan hacks de `max-width` inline para prose;
  `--doc-measure` y `.measure` gobiernan la lectura larga.
- Arranque local: correcto en `http://127.0.0.1:8080/`; se corrigió el cambio
  automático a otros puertos porque podía hacer que el navegador mostrara otra
  instancia y pareciera que faltaba el CSS.
- `git diff --check`: correcto.
- Tras DOC-06, `npm run build`: correcto; Bootstrap 6 Alpha 1 resolvió el plugin
  ESM `Drawer` y la navegación usa un `<dialog class="drawer drawer-xl">` que
  se convierte en enlaces inline a partir de xl.
- Tras DOC-06, `git diff --check`: correcto.
- DOC-07: la navegación desktop queda delegada al TOC sticky lateral; el drawer
  permanece solo para anchuras menores que `lg`. Overview, flujo, findings y
  grupos de códigos usan composiciones explícitas de columnas en escritorio.
- Hallazgo visual corregido con Playwright: Bootstrap 6 Alpha 1 usa la sintaxis
  responsive `lg:col-3`, `md:col-6`, `xl:col-4`, `md:g-4`, etc.; las clases
  heredadas `col-lg-3` y similares no generaban reglas responsive y dejaban el
  layout apilado.
- Tras DOC-07, `npm run build`: correcto y `git diff --check`: correcto.
- Playwright visual: correcto a 1440 px y 390 px; el TOC aparece solo en
  desktop, el drawer solo en móvil, el flujo tiene dos columnas en desktop, los
  findings se distribuyen en panel principal/lateral y facts en tres columnas,
  y Escape cierra el drawer.
- Playwright overflow: corregido el scroll horizontal provocado por el Drawer
  cerrado y por líneas largas de código; `html` y `body` recortan el overflow
  horizontal sin impedir el scroll interno de los bloques `<pre>`. Verificado a
  390 px y 1440 px.
- DOC-08: Roboto se usa para el cuerpo, Roboto Condensed para títulos y
  JetBrains Mono para código; se añadió un control `Back to top` bilingüe,
  accesible y respetuoso con `prefers-reduced-motion`.
- DOC-09: la escala de lectura usa 16px para texto de apoyo, 30px para títulos
  de sección y 52px para el hero en desktop; Quickstart usa dos columnas 50/50,
  con bloques de código de igual ancho y comandos largos divididos con
  continuaciones de shell legibles.
- DOC-09: las notas de flujo, Quickstart, adopción y capacidades usan el
  componente Bootstrap 6 `.alert` con `.theme-info` o `.theme-warning`; no se
  mantiene un componente paralelo `.callout`.
- Playwright tipográfico/interactivo: las tres familias cargan correctamente,
  el control aparece tras hacer scroll y devuelve la página a `scrollY = 0`;
  con movimiento reducido vuelve de forma instantánea.
- Consola Playwright: sin errores ni avisos después de añadir el favicon local.
- Tras DOC-09, `npm run build`: correcto y `git diff --check`: correcto.
- Tras DOC-09, Playwright visual: Quickstart muestra dos bloques de 433px de
  ancho en 1440px, una columna de 351px en 390px, comandos sin recorte,
  `theme-info` con contraste visible y encabezado de alert separado del cuerpo.
- Tras DOC-09, no quedan usos de `.callout` ni de las clases v5 `.alert-info` o
  `.alert-warning`; se usan los temas Bootstrap 6 `.theme-info` y
  `.theme-warning`.
- Tras DOC-09, la consola Playwright permanece sin errores ni avisos.
- DOC-10: `src/`, `package.json`, `package-lock.json` y `vite.config.js` viven
  dentro de `docengine-docs/`; la raíz conserva solo documentación, tareas y
  configuración compartida.
- DOC-10: el `dist/` antiguo de la raíz fue eliminado; solo queda el `dist/`
  generado dentro de `docengine-docs/`, que es la salida correcta de la app.
- DOC-10: `docengine-docs/package.json` se identifica como `docengine-docs` y
  `docengine-docs/vite.config.js` resuelve `src/` y `dist/` relativos a su
  propio directorio.
- DOC-11: cards, badges, alerts, tabs, tipografía, superficies y utilidades
  principales usan componentes/tokens Bootstrap 6 Alpha 1; se eliminaron la
  escala tipográfica paralela y las superficies duplicadas de tarjetas/chips.
- DOC-11: la capa Sass custom queda limitada a fuentes de marca, medida de
  lectura, header sticky, TOC, skip link, composición hero y ventana de código.
- `npm ls bootstrap --depth=0`: correcto; resuelve exactamente
  `bootstrap@6.0.0-alpha.1`.
- Comprobación estructural de claves i18n: correcta; no quedan claves HTML sin
  traducción ES o EN.
- Comprobación de Sass: correcta; existe `@use` y no existe `@import` en el
  stylesheet del sitio.
- No existe un runner determinista de UI declarado en `package.json`; la
  verificación interactiva se ejecutó mediante el `playwright-cli` disponible en
  el entorno, con comprobaciones de layout, interacción y consola.
- `dist/` es salida generada y permanece fuera del alcance versionable.

## Verificación final adicional

- Playwright en 1440 px, 768 px y 390 px: la jerarquía tipográfica mantiene una
  progresión consistente (`52px` hero, `30px` títulos de sección, `17px` leads,
  `16px` cuerpo); el workflow usa tres columnas en desktop y una en tablet; no
  hay overflow horizontal visible.
- Interacción responsive: el drawer abre con `aria-expanded=true`, enlazar a
  `#quickstart` lo cierra y actualiza el hash; en desktop el TOC permanece
  visible y el botón del menú se oculta.
- Interacción bilingüe y de tema: el cambio a inglés actualiza el documento y
  el título de quickstart, el retorno a español funciona y el tema oscuro
  actualiza `data-bs-theme` y su label accesible.
- Copiado de comandos: el botón de quickstart alcanza el estado `Copiado` y
  `data-copied=true`.
- Consola Playwright: 0 errores y 0 avisos.
- Tras DOC-10, `npm --prefix docengine-docs run build`: correcto; genera
  `docengine-docs/dist/index.html`.
- Tras DOC-10, la raíz no contiene `src/`, `vite.config.js`, `package.json`,
  `package-lock.json` ni `dist/`; el único `dist/` está bajo
  `docengine-docs/`.
- Tras DOC-11, `npm --prefix docengine-docs run build`: correcto; Bootstrap
  resuelve desde las dependencias disponibles del workspace y genera el sitio.
- Tras DOC-11, Playwright en 1440 px, 768 px y 390 px: sin overflow; TOC solo
  en desktop; Drawer en anchuras menores que `lg`; jerarquía observada de
  hero 40px, secciones 32px, lead 20px y cuerpo 16px.
- Tras DOC-11, Playwright confirmó cambio de tema, cambio ES/EN, tabs, copia de
  código, apertura/cierre del Drawer y navegación al ancla; consola sin errores
  ni avisos.
- DOC-12, medición con Playwright de `getComputedStyle().fontSize` a 1440 px:
  antes `40 · 32 · 20 · 20 · 16 · 16 · 14 · 12` (hero, sección, lead, título de
  tarjeta, cuerpo, título de paso, apoyo, etiqueta) con el paso de 20 px
  sobrecargado y una inversión en el flujo (título de paso 16 px > descripción
  de fase 14 px); después `64 · 32 · 20 · 16 · 14 · 12`, con hero a `--font-size-5xl`
  (48–64 px), lead y títulos de tarjeta separados por rol, y el flujo en
  `20 (fase) > 16 (descripción) > 14 (paso)`.
- DOC-12: el hero usa `--font-size-5xl` y el título de sección
  `--font-size-2xl`; no se introduce ninguna escala paralela, todas las medidas
  siguen siendo tokens `--font-size-*` de Bootstrap 6 Alpha 1.
- DOC-12: los tres títulos de tarjeta de findings pasan de `.h5` a `.h4` para
  alinearse con el resto de títulos de tarjeta; las descripciones de fase suben
  de `fs-sm` a cuerpo (16 px) y los títulos de paso bajan a `fs-sm` (14 px).
- DOC-12, Playwright: 1440 px y 390 px sin overflow horizontal; el hero mide
  51.5 px en móvil y 64 px en desktop; modo claro y oscuro correctos; el
  refinamiento de tipografía no toca familias ni el sistema de color.
- Tras DOC-12, `npm --prefix docengine-docs run build`: correcto y
  `git diff --check`: correcto (el único cambio de tipos está en
  `docengine-docs/src/scss/styles.scss` y `docengine-docs/src/index.html`).
- DOC-12, segunda pasada: se retiran las diez etiquetas `eyebrow` en MAYÚSCULAS
  de `section-head` y el número de sección (badge accent, `aria-hidden`) queda
  como único marcador de secuencia; `contracts.codesCaption` pasa de `.eyebrow`
  a un subtítulo normal `.h5` en caja baja. La regla `.eyebrow` se elimina del
  SCSS por quedar sin uso (`site-menu__eyebrow` es independiente).
- DOC-12, segunda pasada: el alert de estado del hero deja de estar pegado a
  los botones; se mide con Playwright un hueco de `0px` antes y `16px` después
  (`--spacer-5`), en línea con el ritmo vertical del resto del hero.
- DOC-12, segunda pasada, Playwright: tenían 10 secciones con `section-head`
  reducido al número; cambio ES→EN correcto (`lang=en`, título "One engine, one
  contract"); consola sin errores ni avisos; 390 px sin overflow.
- Tras la segunda pasada de DOC-12, `npm --prefix docengine-docs run build`:
  correcto y `git diff --check`: correcto.
- DOC-12, tercera pasada (equilibrar prosa y alerts): medido con Playwright, la
  prosa común (descripciones de tarjetas, pasos, paneles, findings, capacidades,
  salidas, Diátaxis, evidencia) estaba a `14px` mientras los `alert` usaban
  `16px`. Invertido: la prosa común sube a cuerpo `16px` (se retira `fs-sm` de
  ~60 párrafos y de los títulos de paso) y los `alert` bajan a `--font-size-sm`
  (14px) con su título a `--font-size-md` (16px). Los `fs-sm` restantes son solo
  tokens de código, badges y pies de nota. Build correcto, sin overflow a 390px,
  consola sin errores.

## DOC-13 Auditoría cartográfica de afirmaciones

Método: skill `source-cartographer` + protocolo `docs/inference-protocol.md`.
Fuentes inventariadas: `../docengine` (git tags/remoto, `CHANGELOG.md`,
`go.mod`, `docs/installation.md`, `docs/adr/0008`, `docs/adr/0010`,
`docs/adr/0011`, `reference/cli.md`,
`skill/software-documentalist/references/profile.md` y `report.md`,
`docs/web/index.html`), `gh repo view`/`gh release list` y `git ls-remote`.

- **NO SE SOSTIENE** — «No se afirma aquí ninguna versión publicada» /
  «sin afirmaciones de publicación» / «Sin publicación». El repositorio tiene
  tags `v0.1.0`, `v0.2.0`, `v0.2.1` (locales y en `origin`), `CHANGELOG.md`
  sección `[0.2.1] - 2026-10-09`, `gh release list` devuelve `v0.2.1 (Latest)` y
  `v0.2.0`, y la propia landing del repositorio (`docs/web/index.html`) declara
  «v0.2.1 etiquetada … en GitHub». Corregido: el sitio afirma v0.2.1 etiquetada
  y con release en GitHub.
- **SE SOSTIENE (con matiz)** — La disponibilidad pública: `gh repo view` da
  `isPrivate: true`, y `proxy.golang.org` no resuelve el módulo. La instalación
  publicada (`go install @latest` o binarios) requiere acceso; la landing del
  repositorio ya usa «requiere acceso al módulo». El sitio ahora lo declara así.
- **PARCIAL / desactualizado** — `capabilities.git.text` describía Git impact
  solo como «aviso con severidad warning»; en v0.2.1 el terminal imprime
  `ADVISORY Git impact` (el JSON conserva `severity: warning`). Corregido para
  citar el prefijo.
- **PARCIAL / omisión** — `capabilities.bm25.text` omitía el prefijo
  `ADVISORY BM25` y los filtros `min_score` y `acknowledged` (añadidos en
  v0.2.1). Corregido.
- **SE SOSTIENE** — Go 1.27 (`go.mod`), «sin red ni Python» y «solo lectura»
  (`docs/installation.md`, `ADR-0002`), perfil v1 y sus campos (`profile.md`),
  los 16 códigos de finding (`docs`, `reference`, `skill`), códigos de salida
  0/1/2/3 (`reference/cli.md`), activos de `init` (`ADR-0010`,
  `docs/installation.md`), `audit` con `--profile` explícito, comando
  `go build -o docengine ./cmd/docengine`, comparador Python en incubación
  (`ADR-0011`), y `exclusions` con `reason` obligatoria (`profile.md`).
- **Discrepancia de fuentes registrada, no ocultada** — `docs/installation.md`
  y `reference/cli.md` del repositorio hermano mantienen un encuadre cauto
  («no afirma que una publicación concreta esté disponible») mientras su propia
  landing afirma v0.2.1 etiquetada. El sitio se alinea con la evidencia
  comprobada (release existe; repositorio privado).

Evidencia de corrección: se actualizaron `docengine-docs/src/js/main.js`
(diccionarios ES y EN) y los textos estáticos equivalentes en
`docengine-docs/src/index.html`; `npm --prefix docengine-docs run build`
correcto; `git diff --check` correcto; render verificado en navegador en ES y EN
y consola sin errores.

- Ajuste posterior: el fact del hero «Sin red ni Python» pasa a «Sin red». El
  «ni Python» es un anti-criterio sin valor (equivalente a «sin Rust, sin C++»);
  la mención del comparador Python se conserva solo en `evidence.point3`, donde
  es un hecho histórico pertinente.

## DOC-14 Rediseño de la sección Contratos para personas neófitas

Objetivo: que la sección se entienda sin conocer «docengine» de antemano y que la
maquetación sea más escaneable. Fuente de verdad: `profile.md` y `report.md` de
`../docengine`; no se añade ninguna afirmación nueva.

- Se sustituyen las pestañas por clave JSON (`documents`, `coverage`…) por una
  rejilla de seis tarjetas: título humano + clave JSON (accent) + una frase en
  lenguaje llano. Ventaja: los seis bloques se ven a la vez en lugar de quedar
  ocultos tras pestañas.
- Nueva frase de encuadre: «El perfil agrupa las comprobaciones en bloques; cada
  bloque es opcional…» y una reescritura del `lead` (perfil = archivo JSON que
  declaras).
- Nueva frase que explica qué es un finding antes de la lista de códigos.
- Rebajada la jerga en las descripciones de códigos con términos opacos
  (`id_pattern`, `language`, «target», «escalar», «conjunto», «token»,
  «definición de identificador coincidente») manteniendo el significado.
- i18n: nuevas claves `contracts.howto`, `contracts.block.*`,
  `contracts.findings.intro`; reescritas `contracts.lead` y
  `contracts.documents/coverage/facts/exclusions/impact/bm25`; diccionarios ES y
  EN y respaldos estáticos de `index.html` sincronizados.
- Verificación: `npm --prefix docengine-docs run build` correcto;
  `git diff --check` correcto; sin claves i18n sin traducir (ES y EN);
  6 bloques, 0 pestañas; consola sin errores.

## DOC-15 Claridad en Capacidades, Salidas y Perfil/informe

- Capacidades: título «Opt-in: Git impact y BM25» → «Capacidades opcionales»;
  lead reescrito (desactivadas por defecto, error si no pueden ejecutarse, nunca
  omisión silenciosa); retirados los badges redundantes GIT/BM25; «BM25» →
  «Búsqueda léxica (BM25)»; textos de tarjeta reordenados para empezar por el
  propósito llano y mantener los códigos.
- Salidas: lead «La CLI devuelve un código derivado del resultado…» → «Cada
  ejecución termina con un código que resume el resultado…».
- Perfil/informe: `profileText` separa Obligatorios/Opcionales y enlaza con
  Contratos; `reportText` empieza por «El informe es lo que devuelve una
  auditoría» y aclara el orden garantizado de los findings.
- Diátaxis y Evidencia no requieren cambios: ya estaban en lenguaje llano
  (Evidencia se corrigió en DOC-13).
- i18n ES y EN y respaldos estáticos sincronizados; «Búsqueda léxica (BM25)» y
  «Capacidades opcionales» como nuevas cadenas. Verificado: build correcto,
  `git diff --check` correcto, sin claves i18n sin traducir en ES/EN, consola
  sin errores.

## DOC-16 Corrección verificada del perfil mínimo y del ejemplo de informe

- **Hallazgo (NO SE SOSTENÍA):** el ejemplo «Perfil mínimo» del sitio era
  `{ "version": 1, "language": "en" }`. El código real
  (`internal/bootstrap/bootstrap.go:minimalProfile`, comentado como «the exact
  minimal valid profile») escribe **tres** campos porque el struct no usa
  `omitempty`: `version`, `language` y `strict_confirmation`. Corregido a esos
  tres valores.
  - Discrepancia registrada: `skill/.../references/profile.md` y
    `examples/profiles/minimal.json` muestran el mínimo de dos campos; el
    binario escribe tres. El sitio sigue al binario y el texto marca
    `strict_confirmation` como opcional (`true` por defecto).
- **Mejora:** el panel «Informe» mostraba un informe vacío (`findings: []`),
  poco didáctico. Sustituido por el ejemplo con un finding de la landing oficial
  del repositorio (`docs/web/index.html`): `severity`, `code`, `path`, `line`,
  `message` y `summary` con `error: 1`. Etiqueta «Resumen» → «Ejemplo de informe».
- Verificación: build correcto, `git diff --check` correcto, render comprobado en
  ES y EN, sin claves i18n sin traducir, consola sin errores.

## DOC-17 Perfil/informe como referencia de opciones

El punto 8 era «un párrafo corrido + un ejemplo» y no explicaba todas las
opciones. Rehecho con la evidencia de `skill/software-documentalist/references/profile.md`
y `report.md`:

- Título «Dos contratos JSON» → «El perfil y el informe».
- Pestaña Perfil: lista de los nueve campos de nivel superior, cada uno con su
  clave (accent), un badge `obligatorio`/`opcional` y una explicación que
  incluye los sub-campos reales: `documents` (`globs`, `id_pattern`,
  `severity`, `required_headings`, `language`, `checks`), `coverage`
  (`sources`, `targets`, `severity`), `facts` (`id`, `sources` y sus seis tipos,
  `targets` y sus tres tipos), `exclusions` (`reason` obligatoria),
  `impact_relations` (`documents`, `paths`) y `bm25` (`enabled`, `documents`,
  `capabilities`, `max_candidates`, pesos, `min_score`, `acknowledged`).
- Pestaña Informe: `findings` (`severity`, `code`, `path`, `line`, `message`),
  `summary` (`checked_files`, `counts`) y los módulos aditivos `facts`/`impact`/
  `bm25`, con badges `siempre`/`aditivo`.
- Nuevas claves i18n `profile.required/optional/always/additive`,
  `profile.field.*` y `profile.report.field.*`; reescritas `profile.title/lead/
  profileText/reportText/profileLabel`. ES y EN sincronizados.
- Verificación: build correcto, `git diff --check` correcto, sin claves i18n sin
  traducir en ES/EN, 9 campos en el perfil, sin overflow a 390 px, consola limpia.

## DOC-18 Ejemplos JSONC comentados y ejemplo de perfil completo

- El usuario pidió un ejemplo completo (no solo el mínimo) y ejemplos JSONC con
  comentarios.
- El panel Perfil muestra ahora dos bloques: «Ejemplo mínimo (init)» y «Ejemplo
  completo (comentado)». El completo se basa en `examples/profiles/full.json`
  (+`profile.md`) y cubre los seis bloques; el de informe (con un finding) se
  comentó también.
- Los comentarios cambian con el idioma: el contenido de los `<code>` se sirve
  por i18n (`profile.exampleMin`, `profile.exampleFull`, `profile.exampleReport`)
  con respaldo estático en ES. Los grupos con nombre de regex `(?P<value>…)` van
  escapados como `&lt;value&gt;` para que se muestren literales tras `innerHTML`.
- Verificación: build correcto, `git diff --check` correcto, ES y EN con
  comentarios correctos y sin claves i18n sin traducir, `(?P<value>[0-9]+)`
  renderizado literal, sin overflow a 390 px (el `<pre>` hace scroll interno),
  consola limpia.

## DOC-19 Prism + ventana tipo macOS

- Nueva dependencia: `prismjs@^1.30.0` en `docengine-docs/package.json` y su
  lockfile. Se importan `prismjs` + `components/prism-json` +
  `components/prism-bash` en `main.js`.
- Los bloques de código llevan `language-json` (perfil/informe) o
  `language-bash` (quickstart). Como el contenido de los JSON es i18n, se
  re-resalta tras cada cambio de idioma: `highlightCode()` se llama al final de
  `applyLanguage` y usa `Prism.highlightElement`.
- Colores de token propios en `styles.scss` (paleta fija pensada para la
  superficie oscura del código, en ambos modos), no un tema externo.
- Ventana macOS: `.code-block__dot:nth-child(1..3)` en rojo (`oklch(68% 0.2 27)`),
  ámbar (`83% 0.16 85`) y verde (`79% 0.19 145`); se añadieron los tres puntos a
  los headers de perfil e informe (quickstart ya los tenía).
- El botón «Copiar» sigue copiando texto plano (`innerText`), verificado con
  `data-copied=true`.
- Verificación: `npm --prefix docengine-docs run build` correcto (21 módulos);
  `git diff --check` correcto; ES y EN con tokens tras el cambio de idioma (231
  tokens), dark mode correcto, sin overflow a 390 px, consola sin errores. Hubo
  que reiniciar el dev server para que Vite reoptimizara la nueva dependencia.

## DOC-21 Diátaxis explicada

- Antes: título «Cuatro rutas de documentación», lead de una línea y cuatro
  tarjetas. No decía qué es Diátaxis ni por qué se adopta.
- Ahora: título «Diátaxis: cuatro rutas de documentación»; lead que define la
  técnica y sus dos ejes (aprender/trabajar, hacer/comprender); párrafo «por qué»
  (sin criterio la documentación mezcla propósitos; el motor la adopta porque un
  documento con un propósito claro y una carpeta asignada se puede auditar).
- Cada tarjeta añade su carpeta (`tutorials/`, `how-to/`, `reference/`,
  `explanation/`) junto al badge del tipo.
- Fuentes: `skill/diataxis/SKILL.md` (el «compass» y las reglas), `docs/README.md`
  y la landing (`docs/web/index.html`); sin inventar.
- Nuevas claves `diataxis.why`; reescritas `diataxis.title`/`diataxis.lead`; ES y
  EN. Verificado: build OK, `git diff --check` OK, sin claves i18n sin traducir,
  consola limpia.

## DOC-22 Selectores del head rediseñados

- Antes: tres botones `.control-button` sueltos (globo + «EN»; sol/luna; menú).
  El usuario los veía demasiado simples.
- Ahora: dos controles segmentados dentro de `.site-controls`:
  - idioma `ES | EN` (texto, segmento activo con `--accent-bg-subtle`);
  - tema `☀ | ☾` (iconos, segmento activo = tema efectivo).
  El botón de menú (móvil) se mantiene como `.control-button`.
- JS: `[data-language-option]` llama a `applyLanguage`; `[data-theme-option]` a
  `setTheme`; `updateLanguageUI()` y `updateThemeUI()` marcan `is-active` +
  `aria-pressed`. Se retiran `data-language-toggle`, `data-language-label`,
  `data-theme-toggle` y `data-theme-icon`.
- i18n: nuevas claves `controls.group`, `controls.language.label/es/en`,
  `controls.theme.label/light/dark`; se retiran `controls.language.toEn/toEs` y
  `controls.theme.toDark/toLight`. ES y EN sincronizados.
- Verificación: build OK, `git diff --check` OK, sin claves i18n sin traducir en
  ES/EN, cambio de idioma y de tema con segmento activo correcto, sin overflow a
  390 px, consola limpia. `.segmented__option` añadido a `prefers-reduced-motion`.

## DOC-23 Footer con ilustración pixelart

- Footer rehecho: marca + descripción (izquierda), navegación de secciones a dos
  columnas (derecha), fila base con nota y fuentes.
- Ilustración pixelart de un documento, generada como SVG desde un mapa ASCII
  (grupos `px-outline`/`px-paper`/`px-accent`), colocada como fondo en la esquina
  inferior derecha, monocroma en `--accent-fg` con opacidades y `mask-image` para
  que sea suave; `image-rendering: pixelated`. Opacidad reducida en móvil.
- `::before` con un glow de marca suave; `isolation` y `z-index` para que el
  contenido quede por encima.
- i18n: nuevas claves `footer.lead` y `footer.nav.label`; los enlaces reutilizan
  `nav.*`. ES y EN.
- Verificación: build OK, `git diff --check` OK, sin claves i18n sin traducir en
  ES/EN, sin overflow a 390 px, consola limpia.

## Siguiente paso

La implementación y la verificación local están completas. El siguiente paso
es preparar el informe del work unit y solicitar la confirmación explícita para
crear el commit, sin ejecutar todavía ninguna operación Git irreversible.
