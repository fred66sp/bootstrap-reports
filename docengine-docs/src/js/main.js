// docengine documentation site — behavior: i18n, theme, disclosure, copy.
// Bootstrap plugins are imported individually (ESM) so only the pieces used for
// interactive disclosure/navigation are bundled. Never use `window.bootstrap`.
import '../scss/styles.scss'
import Tab from 'bootstrap/js/dist/tab.js'
import Drawer from 'bootstrap/js/dist/drawer.js'
import ScrollSpy from 'bootstrap/js/dist/scrollspy.js'
import Prism from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'

// Kept in scope so the plugins' data-attribute behavior stays registered even
// though they are initialized declaratively in the markup.
void Tab
void ScrollSpy

const THEME_KEY = 'docengine-theme'
const LANG_KEY = 'docengine-lang'

// ---------------------------------------------------------------------------
// Bilingual strings. Keys match the `data-i18n` / `data-i18n-aria-label`
// attributes in index.html. Spanish is the default; English is complete.
// ---------------------------------------------------------------------------
const I18N = {
  es: {
    'meta.title': 'docengine — Documentación determinista',
    'skip.toContent': 'Saltar al contenido',
    'brand.tag': 'documentación',
    'nav.overview': 'Qué es',
    'nav.workflow': 'Flujo',
    'nav.quickstart': 'Inicio rápido',
    'nav.adoption': 'Adopción',
    'nav.contracts': 'Contratos',
    'nav.capabilities': 'Capacidades',
    'nav.exitcodes': 'Salidas',
    'nav.profile': 'Perfil',
    'nav.diataxis': 'Diátaxis',
    'nav.evidence': 'Evidencia',
    'nav.menuEyebrow': 'Navegación',
    'nav.menuTitle': 'Explorar la documentación',
    'controls.copy': 'Copiar',
    'controls.copied': 'Copiado',
    'controls.group': 'Ajustes de la página',
    'controls.language.label': 'Idioma',
    'controls.language.es': 'Español',
    'controls.language.en': 'English',
    'controls.theme.label': 'Tema',
    'controls.theme.light': 'Tema claro',
    'controls.theme.dark': 'Tema oscuro',
    'controls.menuOpen': 'Abrir menú',
    'controls.menuClose': 'Cerrar menú',
    'controls.backToTop': 'Volver arriba',
    'hero.pill': 'Motor determinista · evidencia comprobable',
    'hero.eyebrow': 'Documentación determinista',
    'hero.title.lead': 'Documentación',
    'hero.title.accent': 'determinista',
    'hero.title.rest': 'para tu repositorio',
    'hero.lead': 'docengine evalúa y mantiene la documentación a partir de un perfil versionado: comprueba contratos, referencias y cobertura, contrasta hechos contra fuentes declaradas y, opcionalmente, analiza el impacto de cambios Git y la recuperación léxica BM25.',
    'hero.cta.primary': 'Inicio rápido',
    'hero.cta.secondary': 'Ver los contratos',
    'hero.status.title': 'v0.2.1 etiquetada',
    'hero.status.desc': 'docengine está en la versión v0.2.1: integrada en <code>main</code>, etiquetada y con release en GitHub. La instalación publicada (<code>go install @latest</code> o binarios de release) requiere acceso al módulo; compilar desde el código fuente está disponible.',
    'hero.fact1': 'Sin red',
    'hero.fact2': 'Solo lectura',
    'hero.fact3': 'Go 1.27',
    'hero.fact4': 'Git y BM25 opt-in',
    'toc.title': 'En esta página',
    'overview.eyebrow': 'Propuesta',
    'overview.title': 'Un motor, un contrato',
    'overview.lead': 'docengine es un motor determinista en Go que evalúa y mantiene la documentación de un repositorio a partir de un perfil versionado. Cada comprobación parte de un contrato explícito, nunca de inferencias.',
    'overview.card1.title': 'Contratos documentales',
    'overview.card1.text': 'Comprueba identificadores, referencias [[ID]], encabezados y cobertura sobre los documentos gobernados.',
    'overview.card2.title': 'Hechos contrastados',
    'overview.card2.text': 'Extrae valores de fuentes declaradas y contrasta cada afirmación del documento contra esas fuentes.',
    'overview.card3.title': 'Capacidades opcionales',
    'overview.card3.text': 'Impacto de cambios Git y recuperación léxica BM25, ambos desactivables por ejecución.',
    'overview.card4.title': 'Solo lectura',
    'overview.card4.text': 'La auditoría no escribe archivos, no modifica el índice Git y nunca accede a la red.',
    'workflow.eyebrow': 'Flujo',
    'workflow.title': 'Cómo audita docengine',
    'workflow.lead': 'Una auditoría recorre fases secuenciales y deterministas. El núcleo no importa paquetes de CLI, Git ni skill; los adaptadores dependen del núcleo, nunca al revés.',
    'workflow.note.title': 'Arquitectura hexagonal ligera',
    'workflow.note.text': 'El núcleo recibe datos normalizados y produce resultados; la CLI, el sistema de archivos, Git y la salida son adaptadores.',
    'workflow.phase1.title': 'Preparar',
    'workflow.phase1.text': 'Define el alcance y reúne solo la documentación autorizada.',
    'workflow.phase2.title': 'Comprobar',
    'workflow.phase2.text': 'Aplica contratos deterministas y contrasta los hechos declarados.',
    'workflow.phase3.title': 'Emitir',
    'workflow.phase3.text': 'Agrega capacidades opcionales y produce el informe final.',
    'workflow.step1.title': 'Cargar y validar el perfil',
    'workflow.step1.text': 'Rechaza campos desconocidos y normaliza las rutas relativas antes de leer el corpus.',
    'workflow.step2.title': 'Resolver los documentos',
    'workflow.step2.text': 'Selecciona los documentos en orden de ruta y lee solo Markdown dentro de la raíz autorizada.',
    'workflow.step3.title': 'Aplicar reglas deterministas',
    'workflow.step3.text': 'Identificadores, referencias, cobertura y secciones, en el orden definido por el contrato.',
    'workflow.step4.title': 'Evaluar hechos',
    'workflow.step4.text': 'Resuelve cada fact, exige concordancia entre fuentes y evalúa los targets configurados.',
    'workflow.step5.title': 'Agregar capacidades opt-in',
    'workflow.step5.text': 'Git impact y BM25 añaden resultados sin cambiar la semántica de los findings deterministas.',
    'workflow.step6.title': 'Serializar y salir',
    'workflow.step6.text': 'Emite el informe en terminal o JSON y devuelve el código de salida derivado del resultado.',
    'quickstart.eyebrow': 'Inicio rápido',
    'quickstart.title': 'Tu primera auditoría',
    'quickstart.lead': 'Construye la CLI, prepara el proyecto y ejecuta una comprobación completa con el perfil explícito.',
    'quickstart.buildLabel': 'Compilar',
    'quickstart.initLabel': 'Inicializar y auditar',
    'quickstart.applyLabel': 'Planificar y aplicar',
    'quickstart.versionLabel': 'Versión',
    'quickstart.primaryLabel': 'Primera auditoría',
    'quickstart.followupLabel': 'Después de la primera auditoría',
    'quickstart.note.title': 'Importante',
    'quickstart.note.text': '<code>audit</code> recibe siempre <code>--profile</code> de forma explícita; el perfil mínimo que propone <code>init</code> no declara documentos y audita cero archivos. Añade reglas para que el motor compruebe contratos.',
    'adoption.eyebrow': 'Adopción',
    'adoption.title': 'Activos que genera <code>init</code>',
    'adoption.lead': '<code>init</code> prepara el proyecto para la adopción dirigida por el agente y no sobrescribe archivos existentes sin autorización explícita.',
    'adoption.item1.code': '.docengine/profile.json',
    'adoption.item1.text': 'Perfil mínimo con el <code>language</code> elegido.',
    'adoption.item2.code': '.docengine/manifest.json',
    'adoption.item2.text': 'Manifiesto y <code>rules.md</code>.',
    'adoption.item3.code': 'tutorials/ how-to/ reference/ explanation/',
    'adoption.item3.text': 'Directorios de documentación Diátaxis.',
    'adoption.item4.code': 'templates/',
    'adoption.item4.text': 'Cuatro plantillas de documentación.',
    'adoption.item5.code': 'Skills integradas',
    'adoption.item5.text': '<code>software-documentalist</code>, <code>diataxis</code> y <code>commit-preparation</code>.',
    'adoption.item6.code': '.docengine/README.md',
    'adoption.item6.text': 'Guía para la persona y bloque puntero idempotente en <code>AGENTS.md</code>.',
    'adoption.hook.title': 'Hook de pre-commit',
    'adoption.hook.text': 'Opcional y solo tras autorización explícita (No por defecto). <code>init</code> no instala CI.',
    'contracts.eyebrow': 'Contratos',
    'contracts.title': 'Contratos deterministas',
    'contracts.lead': 'El perfil es el contrato del proyecto: un archivo JSON donde declaras qué documentos gobiernas y qué debe comprobar docengine. Sus campos se validan antes de leer el corpus.',
    'contracts.howto': 'El perfil agrupa las comprobaciones en bloques. Cada bloque es opcional: si no aparece, esa comprobación no se ejecuta, así que puedes empezar con un perfil mínimo y añadir reglas.',
    'contracts.tabs.label': 'Campos del contrato',
    'contracts.block.documents': 'Documentos',
    'contracts.documents': 'Reglas que cada documento gobernado debe cumplir: identificadores, referencias, encabezados e idioma.',
    'contracts.block.coverage': 'Cobertura',
    'contracts.coverage': 'Cada identificador definido en un documento origen debe estar referenciado por un documento destino.',
    'contracts.block.facts': 'Hechos',
    'contracts.facts': 'Afirmaciones del documento contrastadas contra valores leídos de fuentes declaradas.',
    'contracts.block.exclusions': 'Exclusiones',
    'contracts.exclusions': 'Rutas fuera de toda comprobación, cada una con un motivo declarado.',
    'contracts.block.impact': 'Impacto Git',
    'contracts.impact': 'Relaciona cambios de código con documentos para recomendar su revisión; requiere <code>--base-ref</code>.',
    'contracts.block.bm25': 'BM25',
    'contracts.bm25': 'Búsqueda léxica advisory que propone posibles duplicados o cobertura; nunca crea findings.',
    'contracts.findings.intro': 'Cuando una comprobación no se cumple, docengine emite un finding: un aviso con un código estable, su ubicación y su mensaje.',
    'contracts.severity': 'La severidad es <code>error</code>, <code>warning</code> o <code>info</code>; solo los findings <code>error</code> cambian el código de salida.',
    'contracts.codesCaption': 'Códigos de finding deterministas',
    'contracts.codes.docs.title': 'Reglas de documento',
    'contracts.codes.docs.desc': 'Identificadores, referencias, encabezados e idioma sobre el Markdown gobernado.',
    'contracts.codes.docs.ID_MISSING': 'Un encabezado gobernado no tiene su identificador.',
    'contracts.codes.docs.ID_MALFORMED': 'El identificador no sigue el patrón (<code>id_pattern</code>) que exige la regla.',
    'contracts.codes.docs.ID_DUPLICATE': 'El mismo identificador está definido en más de un lugar.',
    'contracts.codes.docs.REFERENCE_MALFORMED': 'Un token <code>[[…]]</code> no es una referencia <code>[[ID]]</code> válida.',
    'contracts.codes.docs.REFERENCE_TARGET_MISSING': 'Una referencia apunta a un identificador que no existe en ningún documento.',
    'contracts.codes.docs.SECTION_MISSING': 'Falta un encabezado requerido declarado por la regla.',
    'contracts.codes.docs.LANGUAGE_MISMATCH': 'El idioma detectado no es el que declara el perfil (<code>language</code>).',
    'contracts.codes.docs.LANGUAGE_UNDETERMINED': 'El idioma detectado no es concluyente, así que no puede comprobarse.',
    'contracts.codes.coverage.title': 'Cobertura',
    'contracts.codes.coverage.desc': 'Relaciones fuente→destino, independientes del contrato de documento.',
    'contracts.codes.coverage.COVERAGE_MISSING': 'Ningún documento destino menciona un identificador definido en el origen.',
    'contracts.codes.facts.title': 'Hechos',
    'contracts.codes.facts.desc': 'Hechos contrastados contra fuentes declaradas; los fallos de fuente son siempre <code>error</code>.',
    'contracts.codes.facts.FACT_SOURCE_MISSING': 'Una ruta o glob de fuente no coincidió con nada.',
    'contracts.codes.facts.FACT_SOURCE_INVALID': 'Una fuente no pudo leerse ni analizarse.',
    'contracts.codes.facts.FACT_SOURCE_MISMATCH': 'Las fuentes produjeron valores en desacuerdo.',
    'contracts.codes.facts.FACT_CLAIM_MISSING': 'El documento no contiene la afirmación esperada para el hecho.',
    'contracts.codes.facts.FACT_CLAIM_AMBIGUOUS': 'Un target contiene afirmaciones distintas repetidas para un hecho.',
    'contracts.codes.facts.FACT_VALUE_MISMATCH': 'El valor afirmado no coincide con el de la fuente.',
    'contracts.codes.facts.FACT_SET_MISMATCH': 'La lista afirmada no coincide con la de la fuente.',
    'capabilities.eyebrow': 'Capacidades',
    'capabilities.title': 'Capacidades opcionales',
    'capabilities.lead': 'Estas dos comprobaciones están desactivadas por defecto: solo se ejecutan si las habilitas en el perfil. Si las habilitas pero no pueden ejecutarse, docengine devuelve un error operativo; nunca las omite en silencio.',
    'capabilities.git.title': 'Impacto Git',
    'capabilities.git.text': 'Recomienda revisar los documentos que tocan las rutas cambiadas. Requiere <code>--base-ref</code> y nunca cambia el código de salida: es una recomendación, no un error. En el informe el código es <code>GIT_IMPACT</code> (severidad <code>warning</code>) y en terminal se imprime con el prefijo <code>ADVISORY Git impact</code>.',
    'capabilities.bm25.title': 'Búsqueda léxica (BM25)',
    'capabilities.bm25.text': 'Propone documentos candidatos a revisar por parecido léxico: posibles duplicados (<code>possible_duplicate</code>), cobertura (<code>potential_coverage</code>) o impacto (<code>potential_impact</code>). Cada candidato llega con estado <code>needs_review</code> y en terminal se imprime con el prefijo <code>ADVISORY BM25</code>. El perfil puede filtrarlos con <code>min_score</code> y <code>acknowledged</code>. Nunca crea findings ni cambia el código de salida.',
    'capabilities.note': '<code>exit 0</code> no equivale a ausencia de findings: revisa el informe completo y conserva visibles todos los findings con su severidad, ubicación, código y mensaje.',
    'exitcodes.eyebrow': 'Códigos de salida',
    'exitcodes.title': 'Códigos de salida estables',
    'exitcodes.lead': 'Cada ejecución termina con un código que resume el resultado: los scripts y los hooks deciden con él si continuar o detenerse.',
    'exitcodes.0': 'Sin findings deterministas de severidad <code>error</code>; puede incluir <code>warning</code>. No significa ausencia de findings.',
    'exitcodes.1': 'Existe al menos un finding determinista de severidad <code>error</code>.',
    'exitcodes.2': 'Uso o configuración inválidos: flags, JSON, rutas, versión de perfil o colisión no autorizada de <code>init</code>.',
    'exitcodes.3': 'Fallo operativo no representable: I/O, Git solicitado no disponible o un módulo opcional fallido.',
    'exitcodes.0.title': 'Sin errores deterministas',
    'exitcodes.1.title': 'Hallazgos de error',
    'exitcodes.2.title': 'Uso o configuración inválidos',
    'exitcodes.3.title': 'Fallo operativo',
    'exitcodes.note': 'Un fallo nunca devuelve <code>0</code>. Los códigos <code>2</code> y <code>3</code> no se mezclan con findings del repositorio.',
    'profile.eyebrow': 'Perfil e informe',
    'profile.title': 'El perfil y el informe',
    'profile.lead': 'El perfil declara qué se comprueba; el informe declara qué se encontró. Son los dos JSON estables con los que trabajas.',
    'profile.tabs.label': 'Perfil e informe',
    'profile.profileTitle': 'Perfil (v1)',
    'profile.profileText': 'El perfil es el contrato que viste en Contratos. Estos son todos sus campos.',
    'profile.required': 'obligatorio',
    'profile.optional': 'opcional',
    'profile.always': 'siempre',
    'profile.additive': 'aditivo',
    'profile.field.version': 'Siempre <code>1</code>; identifica la versión del contrato.',
    'profile.field.language': 'Idioma de la prosa gobernada: <code>en</code> o <code>es</code>. Las reglas sin <code>language</code> propio lo heredan.',
    'profile.field.strict': 'Si es <code>true</code> (valor por defecto), la skill pide confirmar antes de cada commit.',
    'profile.field.documents': 'Reglas por documento. Cada regla lleva <code>globs</code> (qué archivos), <code>id_pattern</code> (patrón del identificador), <code>severity</code> (<code>error</code> por defecto), <code>required_headings</code>, <code>language</code> y <code>checks</code> (<code>ids</code>, <code>references</code>, <code>headings</code>, <code>language</code>).',
    'profile.field.coverage': 'Relaciones <code>sources</code> → <code>targets</code> con <code>severity</code>: cada identificador del origen debe estar referenciado en el destino, o el motor emite <code>COVERAGE_MISSING</code>.',
    'profile.field.facts': 'Hechos a contrastar. Cada hecho lleva <code>id</code>, <code>sources</code> (tipos <code>path_count</code>, <code>path_set</code>, <code>directory_set</code>, <code>frontmatter_set</code>, <code>text_value</code>, <code>json_count</code>) y <code>targets</code> (<code>value</code>, <code>set</code>, <code>contains_source_set</code>).',
    'profile.field.exclusions': 'Globs excluidos de toda comprobación. La <code>reason</code> es obligatoria.',
    'profile.field.impact': 'Relaciona <code>documents</code> con <code>paths</code> cambiadas para recomendar su revisión. Requiere <code>--base-ref</code>.',
    'profile.field.bm25': 'Avisos léxicos. Campos: <code>enabled</code>, <code>documents</code>, <code>capabilities</code> (<code>duplicates</code>, <code>coverage</code>, <code>impact</code>), <code>max_candidates</code>, <code>title_weight</code>, <code>body_weight</code>, <code>min_score</code> y <code>acknowledged</code>.',
    'profile.report.field.findings': 'Lista de resultados. Cada finding lleva <code>severity</code> (<code>error</code>, <code>warning</code> o <code>info</code>), <code>code</code>, <code>path</code>, <code>line</code> y <code>message</code>. Solo <code>error</code> cambia el código de salida.',
    'profile.report.field.summary': 'Recuentos: <code>checked_files</code> (documentos revisados) y <code>counts</code> por severidad (<code>info</code>, <code>warning</code>, <code>error</code>).',
    'profile.report.field.additive': 'Aparecen solo si su módulo está activo; nunca cambian <code>findings</code> ni <code>summary</code>.',
    'profile.profileLabel': 'Ejemplo mínimo (init)',
    'profile.reportTitle': 'Informe',
    'profile.reportText': 'El informe es lo que devuelve una auditoría. Estos son sus campos.',
    'profile.reportLabel': 'Ejemplo de informe',
    'profile.fullLabel': 'Ejemplo completo (comentado)',
    'profile.exampleMin': `{
  "version": 1,               // versión del contrato: siempre 1
  "language": "en",           // idioma de la prosa: "en" o "es"
  "strict_confirmation": true  // confirmar antes de cada commit (true por defecto)
}`,
    'profile.exampleFull': `{
  // Obligatorios.
  "version": 1,
  "language": "en",
  // Confirmar antes de cada commit (true por defecto).
  "strict_confirmation": true,

  // Reglas por documento.
  "documents": [
    {
      "globs": ["docs/**/*.md"],                // archivos que gobierna
      "id_pattern": "^[A-Z][A-Z0-9]*-[0-9]+$",  // patrón del identificador
      "required_headings": ["Overview"],         // encabezados obligatorios
      "language": "en",
      "severity": "error"                        // error | warning | info
    }
  ],

  // Cada identificador del origen debe estar referenciado en el destino.
  "coverage": [
    { "sources": ["docs/specs/**/*.md"], "targets": ["docs/index.md"], "severity": "warning" }
  ],

  // Afirmaciones contrastadas contra fuentes declaradas.
  "facts": [
    {
      "id": "catalog.count",
      "sources": [
        { "kind": "path_count", "glob": ["catalog/*.md"] },
        { "kind": "json_count", "path": "data/manifest.json", "field": "entries" }
      ],
      "targets": [
        { "paths": ["README.md"], "pattern": "Catalog count: (?P&lt;value&gt;[0-9]+)", "value_type": "integer" }
      ]
    }
  ],

  // Rutas fuera de toda comprobación; "reason" es obligatoria.
  "exclusions": [
    { "globs": ["vendor/**"], "reason": "documentación de terceros, fuera de este contrato" }
  ],

  // Relaciona cambios de código con documentos (requiere --base-ref).
  "impact_relations": [
    { "documents": ["docs/**/*.md"], "paths": ["internal/**", "cmd/**"], "reason": "el código puede invalidar lo documentado" }
  ],

  // Avisos léxicos advisory: nunca crean findings.
  "bm25": {
    "enabled": true,
    "documents": ["docs/**/*.md"],
    "capabilities": ["duplicates", "coverage", "impact"],
    "max_candidates": 10,
    "min_score": 50,
    "acknowledged": [
      { "relation": "possible_duplicate", "pair": ["docs/a.md", "docs/b.md"], "reason": "revisado y aceptado" }
    ]
  }
}`,
    'profile.exampleReport': `{
  // Cada comprobación fallida es un finding.
  "findings": [
    {
      "severity": "error",   // error | warning | info (solo "error" cambia la salida)
      "code": "ID_MISSING",  // código estable
      "path": "docs/guide.md",
      "line": 1,
      "message": "governed heading has no document identifier"
    }
  ],
  // Recuentos del resumen.
  "summary": {
    "checked_files": 1,
    "counts": { "info": 0, "warning": 0, "error": 1 }
  }
}`,
    'diataxis.eyebrow': 'Diátaxis',
    'diataxis.title': 'Diátaxis: cuatro rutas de documentación',
    'diataxis.lead': 'Diátaxis es la técnica que clasifica la documentación por lo que necesita quien la consulta. La ordenan dos ejes —aprender o trabajar, hacer o comprender— y cada documento sirve a una sola.',
    'diataxis.why': 'Sin un criterio así, la documentación mezcla instrucciones, datos y explicaciones en un mismo texto y cuesta usarla. Diátaxis separa esas necesidades y obliga a que cada documento tenga un único propósito. El motor lo adopta por eso: un documento con un propósito claro y una carpeta asignada puede auditarse como el resto de contratos (cobertura, encabezados, idioma).',
    'diataxis.tutorials.tag': 'Tutoriales',
    'diataxis.tutorials.title': 'Aprender haciendo',
    'diataxis.tutorials.text': 'Primera auditoría local satisfactoria: compila docengine y ejecuta su auditoría sobre el repositorio.',
    'diataxis.howto.tag': 'Guías prácticas',
    'diataxis.howto.title': 'Lograr un objetivo',
    'diataxis.howto.text': 'Configurar un perfil: selecciona las comprobaciones admitidas y verifica el alcance resultante.',
    'diataxis.reference.tag': 'Referencia',
    'diataxis.reference.title': 'Consultar detalles',
    'diataxis.reference.text': 'Referencia de la CLI, del perfil v1 y del informe: sintaxis, campos y códigos de salida.',
    'diataxis.explain.tag': 'Explicación',
    'diataxis.explain.title': 'Comprender el contexto',
    'diataxis.explain.text': 'Arquitectura y límites de la evidencia: lo que una auditoría demuestra y lo que no.',
    'evidence.eyebrow': 'Evidencia y límites',
    'evidence.title': 'Qué sostiene este sitio',
    'evidence.lead': 'El contenido de esta página describe la versión etiquetada v0.2.1 del repositorio de docengine, integrada en <code>main</code>.',
    'evidence.point1.title': 'Fuente local',
    'evidence.point1.text': 'Las afirmaciones provienen de <code>README.md</code>, <code>docs/</code>, <code>reference/cli.md</code>, <code>DESIGN.md</code> y las referencias de perfil e informe del repositorio hermano.',
    'evidence.point2.title': 'Versionado y acceso',
    'evidence.point2.text': 'docengine sigue SemVer: la versión v0.2.1 está integrada en <code>main</code>, etiquetada y con release en GitHub. La instalación publicada (<code>go install github.com/fred66sp/docengine/cmd/docengine@latest</code> o binarios de release) requiere acceso al módulo; la compilación desde el código fuente está disponible.',
    'evidence.point3.title': 'Historial de incubación',
    'evidence.point3.text': 'El comparador Python y el corpus diferencial pertenecen al historial de incubación, no a este repositorio independiente.',
    'evidence.sources': 'Fuentes comprobadas: <code>README.md</code> · <code>docs/README.md</code> · <code>docs/installation.md</code> · <code>reference/cli.md</code> · <code>DESIGN.md</code> · <code>skill/software-documentalist/references/profile.md</code> · <code>report.md</code>',
    'footer.lead': 'Documentación determinista para tu repositorio.',
    'footer.nav.label': 'Secciones',
    'footer.note': 'Sitio de documentación construido con Bootstrap 6 Alpha 1 y Vite. Bilingüe ES/EN; modo claro y oscuro.',
    'footer.sources': 'Contenido basado en la versión etiquetada v0.2.1 del repositorio de docengine.'
  },

  en: {
    'meta.title': 'docengine — Deterministic documentation',
    'skip.toContent': 'Skip to content',
    'brand.tag': 'documentation',
    'nav.overview': 'Overview',
    'nav.workflow': 'Workflow',
    'nav.quickstart': 'Quick start',
    'nav.adoption': 'Adoption',
    'nav.contracts': 'Contracts',
    'nav.capabilities': 'Capabilities',
    'nav.exitcodes': 'Exit codes',
    'nav.profile': 'Profile',
    'nav.diataxis': 'Diátaxis',
    'nav.evidence': 'Evidence',
    'nav.menuEyebrow': 'Navigation',
    'nav.menuTitle': 'Explore the documentation',
    'controls.copy': 'Copy',
    'controls.copied': 'Copied',
    'controls.group': 'Page settings',
    'controls.language.label': 'Language',
    'controls.language.es': 'Spanish',
    'controls.language.en': 'English',
    'controls.theme.label': 'Theme',
    'controls.theme.light': 'Light theme',
    'controls.theme.dark': 'Dark theme',
    'controls.menuOpen': 'Open menu',
    'controls.menuClose': 'Close menu',
    'controls.backToTop': 'Back to top',
    'hero.pill': 'Deterministic engine · verifiable evidence',
    'hero.eyebrow': 'Deterministic documentation',
    'hero.title.lead': 'Documentation',
    'hero.title.accent': 'deterministic',
    'hero.title.rest': 'for your repository',
    'hero.lead': 'docengine evaluates and maintains documentation from a versioned profile: it checks contracts, references and coverage, compares facts against declared sources and, optionally, analyses Git change impact and BM25 lexical retrieval.',
    'hero.cta.primary': 'Quick start',
    'hero.cta.secondary': 'Read the contracts',
    'hero.status.title': 'v0.2.1 tagged',
    'hero.status.desc': 'docengine is at v0.2.1: merged into <code>main</code>, tagged and released on GitHub. Published installation (<code>go install @latest</code> or release binaries) requires module access; building from source is available.',
    'hero.fact1': 'Offline',
    'hero.fact2': 'Read-only',
    'hero.fact3': 'Go 1.27',
    'hero.fact4': 'Git & BM25 opt-in',
    'toc.title': 'On this page',
    'overview.eyebrow': 'Overview',
    'overview.title': 'One engine, one contract',
    'overview.lead': 'docengine is a deterministic Go engine that evaluates and maintains a repository\'s documentation from a versioned profile. Every check starts from an explicit contract, never from inference.',
    'overview.card1.title': 'Document contracts',
    'overview.card1.text': 'Checks identifiers, [[ID]] references, headings and coverage over the governed documents.',
    'overview.card2.title': 'Facts checked against sources',
    'overview.card2.text': 'Extracts values from declared sources and checks each claim in the document against them.',
    'overview.card3.title': 'Optional capabilities',
    'overview.card3.text': 'Git change impact and BM25 lexical retrieval, both opt-in per run.',
    'overview.card4.title': 'Read-only',
    'overview.card4.text': 'The audit writes no files, does not modify the Git index and never touches the network.',
    'workflow.eyebrow': 'Workflow',
    'workflow.title': 'How docengine audits',
    'workflow.lead': 'An audit runs through sequential, deterministic phases. The core imports no CLI, Git or skill packages; adapters depend on the core, never the reverse.',
    'workflow.note.title': 'Lightweight hexagonal architecture',
    'workflow.note.text': 'The core receives normalised data and produces results; the CLI, the filesystem, Git and the output are adapters.',
    'workflow.phase1.title': 'Prepare',
    'workflow.phase1.text': 'Define the scope and gather only the authorised documentation.',
    'workflow.phase2.title': 'Check',
    'workflow.phase2.text': 'Apply deterministic contracts and compare declared facts.',
    'workflow.phase3.title': 'Emit',
    'workflow.phase3.text': 'Add optional capabilities and produce the final report.',
    'workflow.step1.title': 'Load and validate the profile',
    'workflow.step1.text': 'Rejects unknown fields and normalises relative paths before reading the corpus.',
    'workflow.step2.title': 'Resolve the documents',
    'workflow.step2.text': 'Selects documents in path order and reads only Markdown inside the authorised root.',
    'workflow.step3.title': 'Apply deterministic rules',
    'workflow.step3.text': 'Identifiers, references, coverage and sections, in the order defined by the contract.',
    'workflow.step4.title': 'Evaluate facts',
    'workflow.step4.text': 'Resolves each fact, requires agreement between sources and evaluates the configured targets.',
    'workflow.step5.title': 'Add opt-in capabilities',
    'workflow.step5.text': 'Git impact and BM25 add results without changing the semantics of the deterministic findings.',
    'workflow.step6.title': 'Serialise and exit',
    'workflow.step6.text': 'Emits the report in terminal or JSON and returns the exit code derived from the result.',
    'quickstart.eyebrow': 'Quick start',
    'quickstart.title': 'Your first audit',
    'quickstart.lead': 'Build the CLI, prepare the project and run a complete check with an explicit profile.',
    'quickstart.buildLabel': 'Build',
    'quickstart.initLabel': 'Initialise and audit',
    'quickstart.applyLabel': 'Plan and apply',
    'quickstart.versionLabel': 'Version',
    'quickstart.primaryLabel': 'First audit',
    'quickstart.followupLabel': 'After the first audit',
    'quickstart.note.title': 'Important',
    'quickstart.note.text': '<code>audit</code> always receives <code>--profile</code> explicitly; the minimal profile <code>init</code> proposes declares no documents and audits zero files. Add rules so the engine checks contracts.',
    'adoption.eyebrow': 'Adoption',
    'adoption.title': 'Assets <code>init</code> generates',
    'adoption.lead': '<code>init</code> prepares the project for agent-driven adoption and does not overwrite existing files without explicit authorisation.',
    'adoption.item1.code': '.docengine/profile.json',
    'adoption.item1.text': 'Minimal profile with the chosen <code>language</code>.',
    'adoption.item2.code': '.docengine/manifest.json',
    'adoption.item2.text': 'Manifest and <code>rules.md</code>.',
    'adoption.item3.code': 'tutorials/ how-to/ reference/ explanation/',
    'adoption.item3.text': 'Diátaxis documentation directories.',
    'adoption.item4.code': 'templates/',
    'adoption.item4.text': 'Four documentation templates.',
    'adoption.item5.code': 'Integrated skills',
    'adoption.item5.text': '<code>software-documentalist</code>, <code>diataxis</code> and <code>commit-preparation</code>.',
    'adoption.item6.code': '.docengine/README.md',
    'adoption.item6.text': 'A guide for the person and an idempotent pointer block in <code>AGENTS.md</code>.',
    'adoption.hook.title': 'Pre-commit hook',
    'adoption.hook.text': 'Optional and only after explicit authorisation (No by default). <code>init</code> does not install CI.',
    'contracts.eyebrow': 'Contracts',
    'contracts.title': 'Deterministic contracts',
    'contracts.lead': 'The profile is the project\'s contract: a JSON file where you declare which documents you govern and what docengine must check. Its fields are validated before the corpus is read.',
    'contracts.howto': 'The profile groups the checks into blocks. Every block is optional: if it is absent, that check does not run, so you can start minimal and add rules.',
    'contracts.tabs.label': 'Contract fields',
    'contracts.block.documents': 'Documents',
    'contracts.documents': 'Rules every governed document must meet: identifiers, references, headings and language.',
    'contracts.block.coverage': 'Coverage',
    'contracts.coverage': 'Every identifier defined in a source document must be referenced by a target document.',
    'contracts.block.facts': 'Facts',
    'contracts.facts': 'Claims in the document checked against values read from declared sources.',
    'contracts.block.exclusions': 'Exclusions',
    'contracts.exclusions': 'Paths kept out of every check, each with a declared reason.',
    'contracts.block.impact': 'Git impact',
    'contracts.impact': 'Relates code changes to documents to recommend their review; requires <code>--base-ref</code>.',
    'contracts.block.bm25': 'BM25',
    'contracts.bm25': 'Advisory lexical search that proposes possible duplicates or coverage; it never creates findings.',
    'contracts.findings.intro': 'When a check fails, docengine emits a finding: an alert with a stable code, its location and its message.',
    'contracts.severity': 'Severity is <code>error</code>, <code>warning</code> or <code>info</code>; only <code>error</code> findings change the exit code.',
    'contracts.codesCaption': 'Deterministic finding codes',
    'contracts.codes.docs.title': 'Document rules',
    'contracts.codes.docs.desc': 'Identifiers, references, headings and language over the governed Markdown.',
    'contracts.codes.docs.ID_MISSING': 'A governed heading has no identifier.',
    'contracts.codes.docs.ID_MALFORMED': 'The identifier does not follow the pattern (<code>id_pattern</code>) the rule requires.',
    'contracts.codes.docs.ID_DUPLICATE': 'The same identifier is defined in more than one place.',
    'contracts.codes.docs.REFERENCE_MALFORMED': 'A <code>[[…]]</code> token is not a valid <code>[[ID]]</code> reference.',
    'contracts.codes.docs.REFERENCE_TARGET_MISSING': 'A reference points to an identifier that exists in no document.',
    'contracts.codes.docs.SECTION_MISSING': 'A required heading declared by the rule is absent.',
    'contracts.codes.docs.LANGUAGE_MISMATCH': 'The detected language is not the one the profile declares (<code>language</code>).',
    'contracts.codes.docs.LANGUAGE_UNDETERMINED': 'The detected language is not conclusive, so it cannot be checked.',
    'contracts.codes.coverage.title': 'Coverage',
    'contracts.codes.coverage.desc': 'Source-to-target relations, independent of the document contract.',
    'contracts.codes.coverage.COVERAGE_MISSING': 'No target document mentions an identifier defined in the source.',
    'contracts.codes.facts.title': 'Facts',
    'contracts.codes.facts.desc': 'Facts checked against declared sources; source failures are always <code>error</code>.',
    'contracts.codes.facts.FACT_SOURCE_MISSING': 'A fact source path or glob matched nothing.',
    'contracts.codes.facts.FACT_SOURCE_INVALID': 'A fact source could not be read or parsed.',
    'contracts.codes.facts.FACT_SOURCE_MISMATCH': 'The fact sources produced disagreeing values.',
    'contracts.codes.facts.FACT_CLAIM_MISSING': 'The document does not contain the claim expected for the fact.',
    'contracts.codes.facts.FACT_CLAIM_AMBIGUOUS': 'A target contains repeated different claims for one fact.',
    'contracts.codes.facts.FACT_VALUE_MISMATCH': 'The claimed value does not match the source value.',
    'contracts.codes.facts.FACT_SET_MISMATCH': 'The claimed list does not match the source list.',
    'capabilities.eyebrow': 'Capabilities',
    'capabilities.title': 'Optional capabilities',
    'capabilities.lead': 'Both checks are off by default: they run only when you enable them in the profile. If you enable them but they cannot run, docengine returns an operational error; it never skips them silently.',
    'capabilities.git.title': 'Git impact',
    'capabilities.git.text': 'Recommends reviewing the documents that touch the changed paths. It requires <code>--base-ref</code> and never changes the exit code: it is a recommendation, not an error. In the report the code is <code>GIT_IMPACT</code> (severity <code>warning</code>) and in the terminal it prints with the <code>ADVISORY Git impact</code> prefix.',
    'capabilities.bm25.title': 'Lexical search (BM25)',
    'capabilities.bm25.text': 'Proposes candidate documents to review by lexical similarity: possible duplicates (<code>possible_duplicate</code>), coverage (<code>potential_coverage</code>) or impact (<code>potential_impact</code>). Each candidate arrives with <code>needs_review</code> status and in the terminal prints with the <code>ADVISORY BM25</code> prefix. The profile can filter them with <code>min_score</code> and <code>acknowledged</code>. It never creates findings or changes the exit code.',
    'capabilities.note': '<code>exit 0</code> does not mean there are no findings: review the full report and keep every finding visible with its severity, location, code and message.',
    'exitcodes.eyebrow': 'Exit codes',
    'exitcodes.title': 'Stable exit codes',
    'exitcodes.lead': 'Every run ends with a code that summarises the result: scripts and hooks use it to decide whether to continue or stop.',
    'exitcodes.0': 'No deterministic <code>error</code> findings; may include <code>warning</code>. Does not mean there are no findings.',
    'exitcodes.1': 'At least one deterministic <code>error</code> finding exists.',
    'exitcodes.2': 'Invalid usage or configuration: flags, JSON, paths, profile version or an unauthorised <code>init</code> collision.',
    'exitcodes.3': 'Operational failure not representable as a valid result: I/O, requested Git unavailable or a failed optional module.',
    'exitcodes.0.title': 'No deterministic errors',
    'exitcodes.1.title': 'Error findings',
    'exitcodes.2.title': 'Invalid usage or configuration',
    'exitcodes.3.title': 'Operational failure',
    'exitcodes.note': 'A failure never returns <code>0</code>. Codes <code>2</code> and <code>3</code> never mix with repository findings.',
    'profile.eyebrow': 'Profile & report',
    'profile.title': 'The profile and the report',
    'profile.lead': 'The profile declares what is checked; the report declares what was found. These are the two stable JSON files you work with.',
    'profile.tabs.label': 'Profile and report',
    'profile.profileTitle': 'Profile (v1)',
    'profile.profileText': 'The profile is the contract you saw under Contracts. These are all its fields.',
    'profile.required': 'required',
    'profile.optional': 'optional',
    'profile.always': 'always',
    'profile.additive': 'additive',
    'profile.field.version': 'Always <code>1</code>; identifies the contract version.',
    'profile.field.language': 'Prose language of the governed documents: <code>en</code> or <code>es</code>. Rules without their own <code>language</code> inherit it.',
    'profile.field.strict': 'When <code>true</code> (the default), the skill asks for confirmation before each commit.',
    'profile.field.documents': 'Per-document rules. Each rule carries <code>globs</code> (which files), <code>id_pattern</code> (identifier pattern), <code>severity</code> (<code>error</code> by default), <code>required_headings</code>, <code>language</code> and <code>checks</code> (<code>ids</code>, <code>references</code>, <code>headings</code>, <code>language</code>).',
    'profile.field.coverage': '<code>sources</code> → <code>targets</code> relations with <code>severity</code>: every identifier in the source must be referenced in the target, or the engine emits <code>COVERAGE_MISSING</code>.',
    'profile.field.facts': 'Facts to check. Each fact carries <code>id</code>, <code>sources</code> (kinds <code>path_count</code>, <code>path_set</code>, <code>directory_set</code>, <code>frontmatter_set</code>, <code>text_value</code>, <code>json_count</code>) and <code>targets</code> (<code>value</code>, <code>set</code>, <code>contains_source_set</code>).',
    'profile.field.exclusions': 'Globs excluded from every check. The <code>reason</code> is required.',
    'profile.field.impact': 'Relates <code>documents</code> to changed <code>paths</code> to recommend their review. Requires <code>--base-ref</code>.',
    'profile.field.bm25': 'Lexical advisories. Fields: <code>enabled</code>, <code>documents</code>, <code>capabilities</code> (<code>duplicates</code>, <code>coverage</code>, <code>impact</code>), <code>max_candidates</code>, <code>title_weight</code>, <code>body_weight</code>, <code>min_score</code> and <code>acknowledged</code>.',
    'profile.report.field.findings': 'List of results. Each finding carries <code>severity</code> (<code>error</code>, <code>warning</code> or <code>info</code>), <code>code</code>, <code>path</code>, <code>line</code> and <code>message</code>. Only <code>error</code> changes the exit code.',
    'profile.report.field.summary': 'Counts: <code>checked_files</code> (documents checked) and <code>counts</code> per severity (<code>info</code>, <code>warning</code>, <code>error</code>).',
    'profile.report.field.additive': 'They appear only when their module is enabled; they never change <code>findings</code> or <code>summary</code>.',
    'profile.profileLabel': 'Minimal example (init)',
    'profile.reportTitle': 'Report',
    'profile.reportText': 'The report is what an audit returns. These are its fields.',
    'profile.reportLabel': 'Example report',
    'profile.fullLabel': 'Full example (commented)',
    'profile.exampleMin': `{
  "version": 1,               // contract version: always 1
  "language": "en",           // prose language: "en" or "es"
  "strict_confirmation": true  // confirm before each commit (default true)
}`,
    'profile.exampleFull': `{
  // Required.
  "version": 1,
  "language": "en",
  // Ask for confirmation before each commit (defaults to true).
  "strict_confirmation": true,

  // Per-document rules.
  "documents": [
    {
      "globs": ["docs/**/*.md"],                // files it governs
      "id_pattern": "^[A-Z][A-Z0-9]*-[0-9]+$",  // identifier pattern
      "required_headings": ["Overview"],         // required headings
      "language": "en",
      "severity": "error"                        // error | warning | info
    }
  ],

  // Every identifier in the source must be referenced in the target.
  "coverage": [
    { "sources": ["docs/specs/**/*.md"], "targets": ["docs/index.md"], "severity": "warning" }
  ],

  // Claims checked against declared sources.
  "facts": [
    {
      "id": "catalog.count",
      "sources": [
        { "kind": "path_count", "glob": ["catalog/*.md"] },
        { "kind": "json_count", "path": "data/manifest.json", "field": "entries" }
      ],
      "targets": [
        { "paths": ["README.md"], "pattern": "Catalog count: (?P&lt;value&gt;[0-9]+)", "value_type": "integer" }
      ]
    }
  ],

  // Paths kept out of every check; "reason" is required.
  "exclusions": [
    { "globs": ["vendor/**"], "reason": "third-party docs, outside this contract" }
  ],

  // Relates code changes to documents (requires --base-ref).
  "impact_relations": [
    { "documents": ["docs/**/*.md"], "paths": ["internal/**", "cmd/**"], "reason": "code changes can invalidate docs" }
  ],

  // Advisory lexical warnings: they never create findings.
  "bm25": {
    "enabled": true,
    "documents": ["docs/**/*.md"],
    "capabilities": ["duplicates", "coverage", "impact"],
    "max_candidates": 10,
    "min_score": 50,
    "acknowledged": [
      { "relation": "possible_duplicate", "pair": ["docs/a.md", "docs/b.md"], "reason": "reviewed and accepted" }
    ]
  }
}`,
    'profile.exampleReport': `{
  // Each failed check is a finding.
  "findings": [
    {
      "severity": "error",   // error | warning | info (only "error" changes the exit code)
      "code": "ID_MISSING",  // stable code
      "path": "docs/guide.md",
      "line": 1,
      "message": "governed heading has no document identifier"
    }
  ],
  // Summary counts.
  "summary": {
    "checked_files": 1,
    "counts": { "info": 0, "warning": 0, "error": 1 }
  }
}`,
    'diataxis.eyebrow': 'Diátaxis',
    'diataxis.title': 'Diátaxis: four documentation routes',
    'diataxis.lead': 'Diátaxis is the technique that classifies documentation by what the reader needs. Two axes order it —learning or working, doing or understanding— and each document serves a single one.',
    'diataxis.why': 'Without such a criterion, documentation mixes instructions, facts and explanations in the same text and becomes hard to use. Diátaxis separates those needs and forces every document to have a single purpose. The engine adopts it for that reason: a document with a clear purpose and an assigned folder can be audited like any other contract (coverage, headings, language).',
    'diataxis.tutorials.tag': 'Tutorials',
    'diataxis.tutorials.title': 'Learn by doing',
    'diataxis.tutorials.text': 'A successful first local audit: build docengine and run its audit over the repository.',
    'diataxis.howto.tag': 'How-to guides',
    'diataxis.howto.title': 'Achieve a goal',
    'diataxis.howto.text': 'Configure a profile: select the supported checks and verify the resulting scope.',
    'diataxis.reference.tag': 'Reference',
    'diataxis.reference.title': 'Look up details',
    'diataxis.reference.text': 'Reference for the CLI, profile v1 and report: syntax, fields and exit codes.',
    'diataxis.explain.tag': 'Explanation',
    'diataxis.explain.title': 'Understand the context',
    'diataxis.explain.text': 'Architecture and evidence limits: what an audit proves and what it does not.',
    'evidence.eyebrow': 'Evidence & limits',
    'evidence.title': 'What grounds this site',
    'evidence.lead': 'The content of this page describes the tagged version v0.2.1 of the docengine repository, merged into <code>main</code>.',
    'evidence.point1.title': 'Local source',
    'evidence.point1.text': 'Claims come from <code>README.md</code>, <code>docs/</code>, <code>reference/cli.md</code>, <code>DESIGN.md</code> and the profile and report references in the sibling repository.',
    'evidence.point2.title': 'Versioning and access',
    'evidence.point2.text': 'docengine follows SemVer: v0.2.1 is merged into <code>main</code>, tagged and released on GitHub. Published installation (<code>go install github.com/fred66sp/docengine/cmd/docengine@latest</code> or release binaries) requires module access; building from source is available.',
    'evidence.point3.title': 'Incubation history',
    'evidence.point3.text': 'The Python comparator and the differential corpus belong to the incubation history, not to this standalone repository.',
    'evidence.sources': 'Verified sources: <code>README.md</code> · <code>docs/README.md</code> · <code>docs/installation.md</code> · <code>reference/cli.md</code> · <code>DESIGN.md</code> · <code>skill/software-documentalist/references/profile.md</code> · <code>report.md</code>',
    'footer.lead': 'Deterministic documentation for your repository.',
    'footer.nav.label': 'Sections',
    'footer.note': 'Documentation site built with Bootstrap 6 Alpha 1 and Vite. Bilingual ES/EN; light and dark mode.',
    'footer.sources': 'Content based on the tagged version v0.2.1 of the docengine repository.'
  }
}

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------
function getStoredLang () {
  try {
    const value = localStorage.getItem(LANG_KEY)
    return value === 'en' || value === 'es' ? value : null
  } catch (e) {
    return null
  }
}

function currentLang () {
  return getStoredLang() || 'es'
}

function t (key) {
  return I18N[currentLang()][key] ?? I18N.es[key] ?? ''
}

function getStoredTheme () {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch (e) {
    return null
  }
}

function effectiveTheme () {
  const attr = document.documentElement.getAttribute('data-bs-theme')
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------
function applyLanguage (lang) {
  document.documentElement.setAttribute('lang', lang)
  try { localStorage.setItem(LANG_KEY, lang) } catch (e) { /* ignore */ }

  const strings = I18N[lang] || I18N.es

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')
    if (strings[key] !== undefined) {
      el.innerHTML = strings[key]
    }
  })

  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label')
    if (strings[key] !== undefined) {
      el.setAttribute('aria-label', strings[key])
    }
  })

  document.title = strings['meta.title']

  // Reflect the active language in the segmented control.
  updateLanguageUI()

  // Theme + menu labels are language-sensitive; refresh them.
  updateThemeUI()
  updateMenuLabel()

  // The code blocks are i18n-driven, so their text was just reset; re-highlight.
  highlightCode()
}

// ---------------------------------------------------------------------------
// Language control
// ---------------------------------------------------------------------------
function updateLanguageUI () {
  const lang = currentLang()
  document.querySelectorAll('[data-language-option]').forEach((option) => {
    const on = option.getAttribute('data-language-option') === lang
    option.classList.toggle('is-active', on)
    option.setAttribute('aria-pressed', String(on))
  })
}

// ---------------------------------------------------------------------------
// Syntax highlighting (Prism)
// ---------------------------------------------------------------------------
function highlightCode () {
  document.querySelectorAll('.code-block code').forEach((block) => {
    if (block.textContent.trim()) Prism.highlightElement(block)
  })
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
function setTheme (theme) {
  document.documentElement.setAttribute('data-bs-theme', theme)
  try { localStorage.setItem(THEME_KEY, theme) } catch (e) { /* ignore */ }
  updateThemeUI()
}

function updateThemeUI () {
  const current = effectiveTheme()
  document.querySelectorAll('[data-theme-option]').forEach((option) => {
    const on = option.getAttribute('data-theme-option') === current
    option.classList.toggle('is-active', on)
    option.setAttribute('aria-pressed', String(on))
  })
}

// ---------------------------------------------------------------------------
// Back to top
// ---------------------------------------------------------------------------
function updateBackToTop () {
  const button = document.getElementById('back-to-top')
  if (!button) return
  button.hidden = window.scrollY < 640
}

// ---------------------------------------------------------------------------
// Responsive menu (Bootstrap Drawer)
// ---------------------------------------------------------------------------
function updateMenuLabel () {
  const toggle = document.getElementById('menu-toggle')
  const menu = document.getElementById('site-menu')
  if (!toggle || !menu) return
  const open = menu.open
  toggle.setAttribute('aria-label', open ? t('controls.menuClose') : t('controls.menuOpen'))
  toggle.setAttribute('aria-expanded', String(open))
}

// ---------------------------------------------------------------------------
// Copy to clipboard
// ---------------------------------------------------------------------------
async function copyCode (button) {
  const block = button.closest('[data-code-block]')
  if (!block) return
  const code = block.querySelector('code')
  if (!code) return
  const text = code.innerText

  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    // Fallback for contexts where the Clipboard API is unavailable.
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    try { document.execCommand('copy') } catch (err) { /* ignore */ }
    document.body.removeChild(textarea)
  }

  const label = button.querySelector('[data-i18n="controls.copy"]')
  const copiedText = t('controls.copied')
  button.setAttribute('data-copied', 'true')
  if (label) label.textContent = copiedText
  window.clearTimeout(button.__copyTimeout)
  button.__copyTimeout = window.setTimeout(() => {
    button.removeAttribute('data-copied')
    if (label) label.textContent = t('controls.copy')
  }, 2000)
}

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------
function init () {
  applyLanguage(currentLang())
  updateThemeUI()
  updateBackToTop()

  document.querySelectorAll('[data-theme-option]').forEach((option) => {
    option.addEventListener('click', () => setTheme(option.getAttribute('data-theme-option')))
  })

  document.querySelectorAll('[data-language-option]').forEach((option) => {
    option.addEventListener('click', () => applyLanguage(option.getAttribute('data-language-option')))
  })

  document.getElementById('back-to-top')?.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    })
  })

  window.addEventListener('scroll', updateBackToTop, { passive: true })

  // Responsive menu (Bootstrap Drawer data API handles the toggle click).
  const menu = document.getElementById('site-menu')
  if (menu) {
    menu.addEventListener('shown.bs.drawer', () => updateMenuLabel())
    menu.addEventListener('hidden.bs.drawer', () => updateMenuLabel())

    // Close the menu after navigating to a section.
    document.querySelectorAll('.site-menu__link').forEach((link) => {
      link.addEventListener('click', () => Drawer.getOrCreateInstance(menu).hide())
    })

    // Close the menu on Escape.
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.open) Drawer.getOrCreateInstance(menu).hide()
    })
  }

  // Mirror the ScrollSpy active state into `aria-current` for assistive tech.
  document.body.addEventListener('activate.bs.scrollspy', (event) => {
    document.querySelectorAll('.toc__link').forEach((link) => link.removeAttribute('aria-current'))
    document.querySelectorAll('.site-menu__link').forEach((link) => {
      link.classList.remove('active')
      link.removeAttribute('aria-current')
    })

    if (event.relatedTarget) {
      event.relatedTarget.setAttribute('aria-current', 'true')
      const target = event.relatedTarget.getAttribute('href')
      const menuLink = target ? document.querySelector(`.site-menu__link[href="${target}"]`) : null
      menuLink?.classList.add('active')
      menuLink?.setAttribute('aria-current', 'true')
    }
  })

  document.querySelectorAll('[data-copy-button]').forEach((button) => {
    button.addEventListener('click', () => copyCode(button))
  })
}

init()
