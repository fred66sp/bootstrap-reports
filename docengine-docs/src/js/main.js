// docengine documentation site — behavior: i18n, theme, disclosure, copy.
// Bootstrap plugins are imported individually (ESM) so only the pieces used for
// interactive disclosure/navigation are bundled. Never use `window.bootstrap`.
import '../scss/styles.scss'
import Tab from 'bootstrap/js/dist/tab.js'
import Drawer from 'bootstrap/js/dist/drawer.js'
import ScrollSpy from 'bootstrap/js/dist/scrollspy.js'

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
    'controls.language.toEn': 'Cambiar a inglés',
    'controls.language.toEs': 'Cambiar a español',
    'controls.theme.toDark': 'Cambiar a tema oscuro',
    'controls.theme.toLight': 'Cambiar a tema claro',
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
    'hero.status.title': 'Fuentes locales comprobadas',
    'hero.status.desc': 'El contenido de esta página se basa en la documentación comprobada del repositorio local de docengine. No se afirma aquí ninguna versión publicada.',
    'hero.fact1': 'Sin red ni Python',
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
    'contracts.lead': 'El perfil es el contrato del proyecto: acepta la semántica v1 y todos sus campos se validan antes de leer el corpus.',
    'contracts.tabs.label': 'Campos del contrato',
    'contracts.documents': 'Reglas sobre Markdown seleccionado por globs: <code>id_pattern</code>, <code>severity</code>, <code>required_headings</code>, <code>language</code> y <code>checks</code>.',
    'contracts.coverage': 'Relaciones fuente→target; un identificador sin referencia produce <code>COVERAGE_MISSING</code>.',
    'contracts.facts': 'Fuentes (<code>path_count</code>, <code>path_set</code>, <code>directory_set</code>, <code>frontmatter_set</code>, <code>text_value</code>, <code>json_count</code>) y targets (<code>value</code>, <code>set</code>, <code>contains_source_set</code>).',
    'contracts.exclusions': 'Globs excluidos de toda comprobación, con una razón declarada.',
    'contracts.impact': 'Relaciones de impacto Git; requieren <code>--base-ref</code> para ejecutarse.',
    'contracts.bm25': 'Capacidades léxicas advisory y sus parámetros versionados.',
    'contracts.severity': 'La severidad es <code>error</code>, <code>warning</code> o <code>info</code>; solo los findings <code>error</code> cambian el código de salida.',
    'contracts.codesCaption': 'Códigos de finding deterministas',
    'contracts.codes.docs.title': 'Reglas de documento',
    'contracts.codes.docs.desc': 'Identificadores, referencias, encabezados e idioma sobre el Markdown gobernado.',
    'contracts.codes.docs.ID_MISSING': 'Un encabezado gobernado no tiene token de identificador.',
    'contracts.codes.docs.ID_MALFORMED': 'El token de identificador no coincide con el <code>id_pattern</code> de la regla.',
    'contracts.codes.docs.ID_DUPLICATE': 'El mismo identificador está definido en más de un lugar.',
    'contracts.codes.docs.REFERENCE_MALFORMED': 'Un token <code>[[…]]</code> no es una referencia <code>[[ID]]</code> válida.',
    'contracts.codes.docs.REFERENCE_TARGET_MISSING': 'Una referencia válida no tiene definición de identificador coincidente.',
    'contracts.codes.docs.SECTION_MISSING': 'Falta un encabezado requerido declarado por la regla.',
    'contracts.codes.docs.LANGUAGE_MISMATCH': 'La prosa detectada difiere del <code>language</code> configurado.',
    'contracts.codes.docs.LANGUAGE_UNDETERMINED': 'La prosa no tiene señal de idioma decisiva; el <code>language</code> no puede comprobarse.',
    'contracts.codes.coverage.title': 'Cobertura',
    'contracts.codes.coverage.desc': 'Relaciones fuente→destino, independientes del contrato de documento.',
    'contracts.codes.coverage.COVERAGE_MISSING': 'Un identificador de origen no es referenciado por ningún documento destino.',
    'contracts.codes.facts.title': 'Hechos',
    'contracts.codes.facts.desc': 'Hechos contrastados contra fuentes declaradas; los fallos de fuente son siempre <code>error</code>.',
    'contracts.codes.facts.FACT_SOURCE_MISSING': 'Una ruta o glob de fuente no coincidió con nada.',
    'contracts.codes.facts.FACT_SOURCE_INVALID': 'Una fuente no pudo leerse ni analizarse.',
    'contracts.codes.facts.FACT_SOURCE_MISMATCH': 'Las fuentes produjeron valores en desacuerdo.',
    'contracts.codes.facts.FACT_CLAIM_MISSING': 'Un target de hecho no tiene afirmación coincidente.',
    'contracts.codes.facts.FACT_CLAIM_AMBIGUOUS': 'Un target contiene afirmaciones distintas repetidas para un hecho.',
    'contracts.codes.facts.FACT_VALUE_MISMATCH': 'Una afirmación escalar difiere del valor de la fuente.',
    'contracts.codes.facts.FACT_SET_MISMATCH': 'Una afirmación de conjunto difiere del conjunto de la fuente.',
    'capabilities.eyebrow': 'Capacidades',
    'capabilities.title': 'Opt-in: Git impact y BM25',
    'capabilities.lead': 'Un módulo opcional no se ejecuta si no está habilitado; si está habilitado pero no puede ejecutarse, devuelve un error operativo, nunca se omite silenciosamente.',
    'capabilities.git.title': 'Impacto Git',
    'capabilities.git.text': 'Con <code>--base-ref</code>, marca los documentos relacionados con rutas cambiadas con un aviso <code>GIT_IMPACT</code> (severidad <code>warning</code>). Es una recomendación de revisión: nunca cambia el código de salida.',
    'capabilities.bm25.title': 'BM25',
    'capabilities.bm25.text': 'Recuperación léxica advisory: relaciones <code>possible_duplicate</code>, <code>potential_coverage</code> y <code>potential_impact</code>, todas con estado <code>needs_review</code>. Nunca crea findings ni cambia el código de salida.',
    'capabilities.note': '<code>exit 0</code> no equivale a ausencia de findings: revisa el informe completo y conserva visibles todos los findings con su severidad, ubicación, código y mensaje.',
    'exitcodes.eyebrow': 'Códigos de salida',
    'exitcodes.title': 'Códigos de salida estables',
    'exitcodes.lead': 'La CLI devuelve un código derivado del resultado, nunca una mera ausencia de error malinterpretada.',
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
    'profile.title': 'Dos contratos JSON',
    'profile.lead': 'El perfil define qué se comprueba; el informe declara qué se encontró. Ambos son contratos estables y versionados.',
    'profile.tabs.label': 'Perfil e informe',
    'profile.profileTitle': 'Perfil (v1)',
    'profile.profileText': 'Campos de nivel superior: <code>version</code> (obligatorio, <code>1</code>), <code>language</code> (obligatorio, <code>en</code> o <code>es</code>), <code>strict_confirmation</code> (opcional), más <code>documents</code>, <code>coverage</code>, <code>facts</code>, <code>exclusions</code>, <code>impact_relations</code> y <code>bm25</code>.',
    'profile.profileLabel': 'Perfil mínimo',
    'profile.reportTitle': 'Informe',
    'profile.reportText': '<code>findings</code> y <code>summary</code> siempre están presentes; <code>facts</code>, <code>impact</code> y <code>bm25</code> son aditivos. El orden es contractual: por ruta, luego línea y luego código.',
    'profile.reportLabel': 'Resumen',
    'diataxis.eyebrow': 'Diátaxis',
    'diataxis.title': 'Cuatro rutas de documentación',
    'diataxis.lead': 'La documentación se organiza en cuatro categorías, cada una con un propósito distinto de lectura.',
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
    'evidence.lead': 'El contenido de esta página se basa en la documentación comprobada del repositorio local de docengine. No se afirma aquí ninguna versión publicada.',
    'evidence.point1.title': 'Fuente local',
    'evidence.point1.text': 'Las afirmaciones provienen de <code>README.md</code>, <code>docs/</code>, <code>reference/cli.md</code>, <code>DESIGN.md</code> y las referencias de perfil e informe del repositorio hermano.',
    'evidence.point2.title': 'Sin publicación',
    'evidence.point2.text': 'El uso local desde el código fuente está disponible; las descargas publicadas y <code>go install @latest</code> dependen de que exista una versión publicada, que este sitio no afirma.',
    'evidence.point3.title': 'Historial de incubación',
    'evidence.point3.text': 'El comparador Python y el corpus diferencial pertenecen al historial de incubación, no a este repositorio independiente.',
    'evidence.sources': 'Fuentes locales comprobadas: <code>README.md</code> · <code>docs/README.md</code> · <code>docs/installation.md</code> · <code>reference/cli.md</code> · <code>DESIGN.md</code> · <code>skill/software-documentalist/references/profile.md</code> · <code>report.md</code>',
    'footer.note': 'Sitio de documentación construido con Bootstrap 6 Alpha 1 y Vite. Bilingüe ES/EN; modo claro y oscuro.',
    'footer.sources': 'Contenido basado en fuentes locales comprobadas, sin afirmaciones de publicación.'
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
    'controls.language.toEn': 'Switch to English',
    'controls.language.toEs': 'Switch to Spanish',
    'controls.theme.toDark': 'Switch to dark theme',
    'controls.theme.toLight': 'Switch to light theme',
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
    'hero.status.title': 'Verified local sources',
    'hero.status.desc': 'The content of this page is based on the verified documentation in the local docengine repository. No published version is claimed here.',
    'hero.fact1': 'Offline, no Python',
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
    'contracts.lead': 'The profile is the project\'s contract: it accepts v1 semantics and every field is validated before the corpus is read.',
    'contracts.tabs.label': 'Contract fields',
    'contracts.documents': 'Rules over glob-selected Markdown: <code>id_pattern</code>, <code>severity</code>, <code>required_headings</code>, <code>language</code> and <code>checks</code>.',
    'contracts.coverage': 'Source-to-target relations; an identifier with no reference produces <code>COVERAGE_MISSING</code>.',
    'contracts.facts': 'Sources (<code>path_count</code>, <code>path_set</code>, <code>directory_set</code>, <code>frontmatter_set</code>, <code>text_value</code>, <code>json_count</code>) and targets (<code>value</code>, <code>set</code>, <code>contains_source_set</code>).',
    'contracts.exclusions': 'Globs excluded from every check, with a declared reason.',
    'contracts.impact': 'Git impact relations; require <code>--base-ref</code> to run.',
    'contracts.bm25': 'Advisory lexical capabilities and their versioned parameters.',
    'contracts.severity': 'Severity is <code>error</code>, <code>warning</code> or <code>info</code>; only <code>error</code> findings change the exit code.',
    'contracts.codesCaption': 'Deterministic finding codes',
    'contracts.codes.docs.title': 'Document rules',
    'contracts.codes.docs.desc': 'Identifiers, references, headings and language over the governed Markdown.',
    'contracts.codes.docs.ID_MISSING': 'A governed heading has no identifier token.',
    'contracts.codes.docs.ID_MALFORMED': 'The identifier token does not match the rule\'s <code>id_pattern</code>.',
    'contracts.codes.docs.ID_DUPLICATE': 'The same identifier is defined in more than one place.',
    'contracts.codes.docs.REFERENCE_MALFORMED': 'A <code>[[…]]</code> token is not a valid <code>[[ID]]</code> reference.',
    'contracts.codes.docs.REFERENCE_TARGET_MISSING': 'A valid reference has no matching identifier definition.',
    'contracts.codes.docs.SECTION_MISSING': 'A required heading declared by the rule is absent.',
    'contracts.codes.docs.LANGUAGE_MISMATCH': 'Detected prose differs from the configured <code>language</code>.',
    'contracts.codes.docs.LANGUAGE_UNDETERMINED': 'Prose has no decisive language signal, so the configured <code>language</code> cannot be checked.',
    'contracts.codes.coverage.title': 'Coverage',
    'contracts.codes.coverage.desc': 'Source-to-target relations, independent of the document contract.',
    'contracts.codes.coverage.COVERAGE_MISSING': 'A source identifier is not referenced by any target document.',
    'contracts.codes.facts.title': 'Facts',
    'contracts.codes.facts.desc': 'Facts checked against declared sources; source failures are always <code>error</code>.',
    'contracts.codes.facts.FACT_SOURCE_MISSING': 'A fact source path or glob matched nothing.',
    'contracts.codes.facts.FACT_SOURCE_INVALID': 'A fact source could not be read or parsed.',
    'contracts.codes.facts.FACT_SOURCE_MISMATCH': 'The fact sources produced disagreeing values.',
    'contracts.codes.facts.FACT_CLAIM_MISSING': 'A fact target has no matching claim.',
    'contracts.codes.facts.FACT_CLAIM_AMBIGUOUS': 'A target contains repeated different claims for one fact.',
    'contracts.codes.facts.FACT_VALUE_MISMATCH': 'A scalar claim differs from the source value.',
    'contracts.codes.facts.FACT_SET_MISMATCH': 'A set claim differs from the source set.',
    'capabilities.eyebrow': 'Capabilities',
    'capabilities.title': 'Opt-in: Git impact and BM25',
    'capabilities.lead': 'An optional module does not run unless enabled; if enabled but unable to run, it returns an operational error, never silently skipped.',
    'capabilities.git.title': 'Git impact',
    'capabilities.git.text': 'With <code>--base-ref</code>, it marks documents related to changed paths with a <code>GIT_IMPACT</code> warning. It is a review recommendation: it never changes the exit code.',
    'capabilities.bm25.title': 'BM25',
    'capabilities.bm25.text': 'Advisory lexical retrieval: <code>possible_duplicate</code>, <code>potential_coverage</code> and <code>potential_impact</code> relations, all with <code>needs_review</code> status. It never creates findings or changes the exit code.',
    'capabilities.note': '<code>exit 0</code> does not mean there are no findings: review the full report and keep every finding visible with its severity, location, code and message.',
    'exitcodes.eyebrow': 'Exit codes',
    'exitcodes.title': 'Stable exit codes',
    'exitcodes.lead': 'The CLI returns a code derived from the result, never a misread mere absence of errors.',
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
    'profile.title': 'Two JSON contracts',
    'profile.lead': 'The profile defines what is checked; the report declares what was found. Both are stable, versioned contracts.',
    'profile.tabs.label': 'Profile and report',
    'profile.profileTitle': 'Profile (v1)',
    'profile.profileText': 'Top-level fields: <code>version</code> (required, <code>1</code>), <code>language</code> (required, <code>en</code> or <code>es</code>), <code>strict_confirmation</code> (optional), plus <code>documents</code>, <code>coverage</code>, <code>facts</code>, <code>exclusions</code>, <code>impact_relations</code> and <code>bm25</code>.',
    'profile.profileLabel': 'Minimal profile',
    'profile.reportTitle': 'Report',
    'profile.reportText': '<code>findings</code> and <code>summary</code> are always present; <code>facts</code>, <code>impact</code> and <code>bm25</code> are additive. The order is contractual: by path, then line, then code.',
    'profile.reportLabel': 'Summary',
    'diataxis.eyebrow': 'Diátaxis',
    'diataxis.title': 'Four documentation routes',
    'diataxis.lead': 'Documentation is organised into four categories, each with a distinct reading purpose.',
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
    'evidence.lead': 'The content of this page is based on the verified documentation in the local docengine repository. No published version is claimed here.',
    'evidence.point1.title': 'Local source',
    'evidence.point1.text': 'Claims come from <code>README.md</code>, <code>docs/</code>, <code>reference/cli.md</code>, <code>DESIGN.md</code> and the profile and report references in the sibling repository.',
    'evidence.point2.title': 'No publication',
    'evidence.point2.text': 'Local use from source is available; published downloads and <code>go install @latest</code> depend on a released version, which this site does not claim exists.',
    'evidence.point3.title': 'Incubation history',
    'evidence.point3.text': 'The Python comparator and the differential corpus belong to the incubation history, not to this standalone repository.',
    'evidence.sources': 'Verified local sources: <code>README.md</code> · <code>docs/README.md</code> · <code>docs/installation.md</code> · <code>reference/cli.md</code> · <code>DESIGN.md</code> · <code>skill/software-documentalist/references/profile.md</code> · <code>report.md</code>',
    'footer.note': 'Documentation site built with Bootstrap 6 Alpha 1 and Vite. Bilingual ES/EN; light and dark mode.',
    'footer.sources': 'Content based on verified local sources, with no publication claims.'
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

  // Language toggle shows the target language and announces the action.
  const label = document.querySelector('[data-language-label]')
  if (label) label.textContent = lang === 'es' ? 'EN' : 'ES'
  const toggle = document.querySelector('[data-language-toggle]')
  if (toggle) toggle.setAttribute('aria-label', lang === 'es' ? strings['controls.language.toEn'] : strings['controls.language.toEs'])

  // Theme + menu labels are language-sensitive; refresh them.
  updateThemeUI()
  updateMenuLabel()
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
  document.querySelectorAll('[data-theme-icon]').forEach((icon) => {
    icon.hidden = icon.getAttribute('data-theme-icon') === current
  })
  const toggle = document.querySelector('[data-theme-toggle]')
  if (toggle) {
    toggle.setAttribute('aria-label', current === 'light' ? t('controls.theme.toDark') : t('controls.theme.toLight'))
  }
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

  document.querySelector('[data-theme-toggle]')?.addEventListener('click', () => {
    setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark')
  })

  document.querySelector('[data-language-toggle]')?.addEventListener('click', () => {
    applyLanguage(currentLang() === 'es' ? 'en' : 'es')
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
