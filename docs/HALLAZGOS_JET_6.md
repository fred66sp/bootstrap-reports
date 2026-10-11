# Hallazgos verificados de Jet 6

Notas sobre `github.com/CloudyKit/jet/v6` recogidas al migrar `devops-pulse`
desde `html/template`. La mayoría de estas diferencias no producen error: el
motor compila, la página se sirve y el fallo aparece más tarde, como un byte de
diferencia, una posición insegura o una plantilla que no se encuentra. Por eso
cada afirmación va con la comprobación que la sostiene y no con un resumen.

## Alcance y método

- **Versión verificada:** `v6.3.3`, la última de la línea v6, fijada exactamente
  en `devops-pulse/go.mod`.
- **Evidencia primaria:** el código fuente del módulo en el caché de módulos de
  Go (`github.com/CloudyKit/jet/v6@v6.3.3`, archivos `loader.go`, `set.go` y
  `eval.go`) y las fuentes de la biblioteca estándar en `$GOROOT`
  (`text/template/funcs.go`, `html/template/html.go`,
  `html/template/escape.go`).
- **Evidencia secundaria:** documentación oficial
  (<https://github.com/CloudyKit/jet/blob/master/docs/syntax.md>,
  <https://pkg.go.dev/github.com/CloudyKit/jet/v6>) y
  `.agents/skills/jet-template-engine/SKILL.md`.
- **Cómo reproducir:** `devops-pulse` es el caso de estudio. Las pruebas citadas
  están en `devops-pulse/render_test.go` y `devops-pulse/views_test.go`, y los
  golden congelados en `devops-pulse/testdata/`.
- **Clasificación:** según `docs/inference-protocol.md`. Las filas de tabla son
  `HECHO CONFIRMADO` con `SE SOSTIENE` cuando se comprobaron ejecutando el
  comando indicado; lo que no se pudo comprobar está en «Límites y lo no
  verificado».

## API mínima y contrato de carga

| Hecho | Comprobación |
| --- | --- |
| `NewSet(loader, opts...)` construye el conjunto; `Set.GetTemplate(path)` carga, parsea y cachea; `Template.Execute(w, jet.VarMap, data)` renderiza | `loader.go` y `set.go` de `v6.3.3`; uso en `devops-pulse/main.go` |
| `Loader` son exactamente dos métodos: `Exists(templatePath string) bool` y `Open(templatePath string) (io.ReadCloser, error)` | `loader.go`, declaración de la interfaz |
| Las rutas se resuelven a rutas absolutas con `/`, relativas al archivo que contiene `extends`/`include`/`import` | comentario de documentación de `Loader` en `loader.go`, con ejemplos de `../` y `./` |
| `GetTemplate` prueba las extensiones en orden; por defecto `""`, `".jet"`, `".html.jet"`, `".jet.html"` | `set.go`, `NewSet` y `getTemplateFromLoader` |
| `NewSet` entra en pánico si el `Loader` es `nil`; `WithTemplateNameExtensions` entra en pánico con una lista vacía | `set.go` |
| Alternativas útiles: `WithTemplateNameExtensions`, `WithDelims`, `WithCommentDelims`, `WithCache`, `InDevelopmentMode`, `WithSafeWriter` | `set.go` |

## Escapado: la diferencia que más consecuencias tiene

| Hecho | Comprobación |
| --- | --- |
| Jet escapa por defecto con `text/template.HTMLEscape` | `set.go`: `escapee: template.HTMLEscape` |
| Ese escapador cubre exactamente NUL, `"`, `'`, `&`, `<` y `>` | `$GOROOT/src/text/template/funcs.go:596-636`, tabla `htmlQuot`/`htmlApos`/`htmlAmp`/`htmlLt`/`htmlGt`/`htmlNull` |
| `html/template` escapa además `+` como `&#43;` | `$GOROOT/src/html/template/html.go`, `htmlReplacementTable` |
| El escapado de Jet **no es contextual**: no distingue texto, atributo, URL, CSS ni JavaScript | comparación directa de las dos tablas anteriores y ausencia de análisis de contexto en el escapador de Jet |
| Consecuencia: un valor interpolado dentro de un literal JavaScript de Alpine pierde la garantía que daba `html/template`. Jet convierte `'` en `&#39;`, pero el analizador HTML lo decodifica de nuevo a `'` antes de que Alpine evalúe la expresión: el atributo HTML no se rompe, el literal sí | `TestViewEscapesHTMLMetacharacters` fija el comportamiento observado; `TestAlpineJSLiteralInterpolationsStaySafe` compensa con una guarda sobre los valores |
| Consecuencia menor: un `+` en un valor interpolado se sirve como `+` en lugar de `&#43;`. Ningún texto de esta aplicación contiene `+`, así que la identidad byte a byte se mantiene | comparación de las dos tablas; los seis golden congelados coinciden byte a byte |

**Cómo se cerró esa brecha en `devops-pulse`,** sin tocar el marcado: dos
pruebas. Una fija el conjunto exacto de interpolaciones que viven dentro de un
literal de comilla simple de Alpine, de modo que añadir otra obliga a revisar el
valor; la otra comprueba que ninguno de los valores que llegan ahí (los
identificadores y nombres de servicio y los mensajes `live` y `reconnecting`)
contiene comilla simple, barra invertida ni salto de línea. Ambas se verificaron
por mutación, no por inspección.

## Los comentarios JavaScript de un `<script>` en línea

| Hecho | Comprobación |
| --- | --- |
| `html/template` sustituye un comentario de bloque de JavaScript por **un solo espacio**, y por un salto de línea si el comentario contiene un terminador de línea | `$GOROOT/src/html/template/escape.go:781-795`, que cita la especificación: «Comments behave like white space and are discarded» |
| Efecto observable en este proyecto: ` /* storage unavailable */ ` se sirvió como tres espacios | el golden `page-es` contiene `catch (e) {   }` y **ninguna** aparición de `storage unavailable` |
| Jet emite el texto literal, así que el comentario habría reaparecido y la salida ya no sería idéntica | comparación del golden con la primera versión de la vista |

La vista conserva los tres espacios y un comentario Jet `{* … *}` —que no emite
nada— explica por qué no deben «arreglarse». Es el caso más claro de por qué una
migración de motor de plantillas necesita una baseline byte a byte: el cambio
correcto en apariencia (restaurar el comentario) rompe la salida.

## Texto literal de un archivo incluido

| Hecho | Comprobación |
| --- | --- |
| Jet emite el contenido de un archivo incluido de forma literal, **incluido su salto de línea final** | identidad byte a byte de los golden; `tail -c 1` sobre las diez vistas da `>` o `}` |
| `html/template` descartaba todo el texto fuera de `{{define}}`, de modo que los archivos podían terminar en salto de línea sin afectar a la salida | mismo contraste, medido en la migración |

Regla práctica: **ningún archivo de fragmento o partial termina en salto de
línea.** No basta con recortarlo en el punto de inclusión, porque el salto forma
parte del contenido del archivo incluido.

## Parseo, inclusión y errores

| Hecho | Comprobación |
| --- | --- |
| `GetTemplate` parsea además de cargar, así que un error de sintaxis aparece al pedir la plantilla, no en la primera ejecución | `TestBrokenViewFailsAtConstruction`: el error nombra la vista |
| `include` se resuelve al **ejecutar**, no al parsear | `TestMissingIncludedViewDoesNotWritePartialOutput`: construir la aplicación tiene éxito y el fallo llega al renderizar |
| Por eso conviene renderizar en búfer: así un fallo de render devuelve 500 sin escribir media página | esa misma prueba exige un cuerpo con el texto de error y nada de HTML |
| Recorrer las vistas al construir la aplicación convierte un error de sintaxis en un fallo de arranque con la ruta afectada | `newApplicationFromViews` en `devops-pulse/main.go` |

## Concurrencia

| Hecho | Comprobación |
| --- | --- |
| `Template.Execute` es seguro en concurrencia: cada ejecución toma un `*Runtime` de un `sync.Pool` | `eval.go`: `pool_State = sync.Pool{…}` y su uso en `(*Runtime).recover` |
| En la práctica, un `Set` compartido sirve a muchos clientes SSE a la vez sin corrupción de la salida | `TestConcurrentRenderingMatchesFrozenBaseline`: 16 goroutines × 20 rondas contra la baseline congelada, en verde bajo `-race` |

## Coste medido

`devops-pulse`, Go 1.27, AMD Ryzen 7 5825U, `-benchmem -count=5`, con la misma
carga y la misma salida byte a byte en ambos motores:

| Escenario | `html/template` | Jet 6 | Cambio |
| --- | --- | --- | --- |
| Página `/` | ~271.500 ns/op · 140.990 B/op · 2.167 allocs | ~82.700 ns/op · 70.730 B/op · 254 allocs | 3,3× menos tiempo, 8,5× menos asignaciones |
| Frame SSE de 5.178 B | ~105.800 ns/op · 58.892 B/op · 801 allocs | ~39.500 ns/op · 44.130 B/op · 166 allocs | 2,7× menos tiempo, 4,8× menos asignaciones |
| Diez frames SSE estacionarios, sin comprimir | 52.675 B | 52.667 B | dentro del ruido de contenido (0,015 %) |
| Por frame con gzip | 263,6 B | 265,3 B | misma causa: el texto de las líneas de log |

Jet compila la plantilla al cargarla y la cachea, así que el coste por render es
el de ejecutar un árbol ya parseado. Este es un caso concreto, no una promesa
general: mide tu propia carga antes de extrapolar.

## Límites y lo no verificado

- **No verificado:** el comportamiento del escapado fuera de los contextos que
  usa esta aplicación. Todo el marcado interpola en texto de elemento y en
  atributos entre comillas; los valores numéricos son enteros y las URL son
  literales. Un atributo sin comillas, una URL construida con datos o un cuerpo
  `<script>` interpolado no se probaron aquí y **no** deben darse por seguros con
  el escapador genérico de Jet.
- **No verificado:** el detalle interno de la caché de plantillas de `Set`. La
  seguridad en concurrencia se comprobó por comportamiento bajo `-race`, no
  leyendo esa implementación.
- **No verificado:** el modo de desarrollo (`InDevelopmentMode`), las
  alternativas de delimitadores, `import`, `try`/`catch` y los bloques con
  parámetros. Aparecen en la sintaxis oficial y se citan aquí como disponibles,
  pero no se usaron ni se probaron en este proyecto.
- **Fuera de alcance:** el rendimiento de Jet con plantillas grandes o con
  muchas inclusiones anidadas. La medición anterior es de una vista de documento
  y de un fragmento, no de una jerarquía profunda.
