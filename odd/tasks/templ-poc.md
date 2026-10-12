# templ-poc — Evaluar Templ como sustituto de Jet 6 en `devops-pulse`

## Objetivo

Sustituir Jet 6 por Templ en `devops-pulse/` conservando la lógica y el
comportamiento de la aplicación y las pruebas que sigan siendo aplicables, y
medir el efecto de la sustitución sobre la fiabilidad, la verificación y la
mantenibilidad del desarrollo con agentes.

## Alcance autorizado

- Rama local `feature/templ-poc` creada desde `main`.
- Portar las 9 vistas `.jet` a componentes `.templ` en el paquete Go
  `devops-pulse/web/views`.
- Adaptar `main.go` y las pruebas aplicables.
- No actualizar los golden originales hasta comprobar que las diferencias no son
  una regresión; la propuesta de actualización se presenta al usuario.
- Sin commits, sin `push` y sin integrar ramas.

## Hechos verificados antes de empezar

Sonda desechable en `/tmp/templ-probe` con `templ v0.3.1070`, las fuentes del
módulo en el caché de Go y <https://templ.guide/>:

- Templ minifica en la generación (descarta el espaciado entre elementos y
  colapsa el salto de línea a un espacio entre nodos inline); los bytes servidos
  no pueden coincidir con los golden de Jet.
- El contenido de `<script>`/`<style>` se emite verbatim, indentación incluida.
- Los atributos con expresión se escapan con `&#34;`/`&#39;`; los constantes no.
- `style={ templ.SafeCSS(...) }` añade un `;` final.
- El escapado sigue sin ser contextual para JavaScript: la limitación de Jet con
  los literales de Alpine permanece.

## Tareas

- [x] T1 Rama y andamiaje: `feature/templ-poc` desde `main`, `github.com/a-h/templ
      v0.3.1070` y CLI reproducible en el directorio `tool` de `go.mod`.
- [x] T2 Porte de las 9 vistas al paquete `views` (`layout.templ`, `page.templ`,
      `fragments.templ`), con el mismo marcado y los mismos ganchos HTMX/Alpine.
- [x] T3 `main.go` sin `viewLoader`, `embed` ni `newApplicationFromViews`; el
      render sigue en buffer (`renderComponent`).
- [x] T4 Pruebas: adaptadas las de guarda y determinismo; retirada la de sintaxis
      de vista (ahora es error de compilación) y reducida la de include ausente.
- [x] T5 Oráculo de paridad temporal (`parity_jet_test.go`).
- [x] T6 Verificación: generación, build, vet, `go test`, SSE/toggle por HTTP y
      navegador con Chromium 1440x900.
- [x] T7 Informe comparativo entregado al usuario.

## Evidencia

- `go tool templ generate`, `go build ./...` y `go vet ./...`: correctos.
- `go test ./...`: falla solo `TestRenderedOutputMatchesFrozenBaseline`, por
  formato, con seis diferencias conocidas (byte 15 y byte 338 según el caso).
- `TestTemplOutputMatchesJetBaselineAfterNormalization`: pasa en los seis casos
  del golden, lo que prueba que la salida de Templ es equivalente a la de Jet tras
  normalizar espaciado, entidades, comillas de atributo, el `;` del `style` y la
  expansión de elementos autocerrados.
- Navegador (Chromium 1440x900, servidor real): SSE conectado, 4 tarjetas, anillo
  de 6 líneas que avanza, filtro Alpine, toast y cambio de tarjeta con insignia
  coherente, ausencia de identificadores duplicados, dos diálogos, tema oscuro con
  persistencia tras recarga y navegación a inglés; 0 errores de consola, 0 errores
  de página y 0 peticiones fallidas.
- A/B Jet contra Templ del mismo toggle: idéntico estado intermedio de ~20 ms
  mientras htmx aplica el parche de DOM, por lo que no es una diferencia del motor.
- Peso servido de la página inicial: 22 072 bytes con Jet, 20 851 con Templ
  (−5,5 %). Binario: 13 944 701 bytes con Jet, 11 215 498 con Templ.
- Grafo de módulos: 4 módulos y 4 líneas de `go.sum` con Jet; 28 módulos y 42
  líneas con Templ. Código generado: 1 323 líneas (62,8 KB) para 202 líneas
  (10,8 KB) de fuentes `.templ`.

## Defectos reales encontrados

1. **Regresión de transcripción en un icono SVG.** La primera versión del porte
   cambió `a1 1 0 0 0` por `a1 1 0 0 1` en la ruta del icono de búsqueda. Ni la
   compilación ni las pruebas de comportamiento la detectan: solo la comparación
   contra la salida congelada. Corregido y verificado por el oráculo.
2. **`templ fmt -fail` escribe.** El comando reformateó los tres `.templ` del
   árbol (`<!DOCTYPE html>`, tabulación, `<meta .../>`) antes de informar. Tras
   regenerar, los bytes servidos son idénticos a los de antes del formateo
   (mismos tamaños y mismos desplazamientos en el golden).
3. **La limpieza de archivos no la hizo el escritor delegado.** Las 9 vistas
   `.jet` quedaron en el árbol y las eliminó la sesión principal.

## Cierre de la migración

Autorizado el 2026-10-12: se adopta templ como motor definitivo y se retira Jet.

- `testdata/` regenerado con la salida de templ que ya había sido validada contra
  la línea base de Jet; los seis golden nuevos pesan 56 806 bytes en total y
  `TestRenderedOutputMatchesFrozenBaseline` los congela byte a byte.
- `parity_jet_test.go` eliminado: el oráculo temporal ya había cumplido su
  función (seis casos equivalentes tras normalizar) antes de re-congelar.
- Pruebas conservadas: guarda de literales JavaScript de Alpine, escapado de
  metacaracteres, propagación de errores de render y determinismo concurrente,
  además de las de comportamiento, SSE y toggle.
- Documentación actualizada: `devops-pulse/README.md`, las skills locales
  (`web-stack-architecture`, `go-htmx-server`, `htmx-interactions`,
  `alpinejs-interactivity`, `README.md` de skills), y una nota de registro
  histórico en `docs/HALLAZGOS_JET_6.md`. Retirada la skill
  `jet-template-engine`.
- Estado Git: rama `feature/templ-poc`, árbol con cambios sin commitear y sin
  integración.

## Pendiente de decisión del usuario

- Autorización para crear los commits de la rama y para cerrar Git.
- Valorar si la skill retirada necesita un equivalente de templ (no se ha
  creado ninguno para no añadir documentación no solicitada).
