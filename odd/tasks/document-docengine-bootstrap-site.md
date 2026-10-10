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

## Siguiente paso

La implementación y la verificación local están completas. El siguiente paso
es preparar el informe del work unit y solicitar la confirmación explícita para
crear el commit, sin ejecutar todavía ninguna operación Git irreversible.
