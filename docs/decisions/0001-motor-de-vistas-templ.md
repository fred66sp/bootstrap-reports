# ADR 0001 — templ como motor de vistas de `devops-pulse`

- **Estado:** aceptado
- **Fecha de la decisión:** 2026-10-12
- **Fecha de este registro:** 2026-10-12 (**registro diferido**: la decisión se
  tomó y se ejecutó antes de existir esta carpeta)
- **Decidido por:** el propietario del repositorio, a propuesta del orquestador

## Contexto

`devops-pulse` cambió de motor de vistas dos veces, y cada cambio dejó rastro en
el repositorio:

1. **`html/template`** (iteración 1): el motor inicial. Vistas como cadenas con
   `{{define}}`, escapado contextual de la biblioteca estándar y salida sin
   compilar.
2. **Jet 6 (`github.com/CloudyKit/jet/v6 v6.3.3`, iteración 5)**: se adoptó por
   coste de render medido (2,7–3,3 veces menos tiempo y 4,8–8,5 veces menos
   asignaciones sobre la misma salida byte a byte). Se retiró después.
3. **templ (`github.com/a-h/templ v0.3.1070`)**: motor actual desde que Jet se
   retiró.

La evidencia de cada paso está repartida y conviene saber dónde:

- La iteración 5 de la migración, con la baseline congelada y la tabla de coste
  medida: `odd/tasks/devops-pulse.md`.
- Migración a templ, oracle temporal y golden regenerados: `odd/tasks/templ-poc.md`.
- Diferencias observadas al portar: `docs/devops-pulse/REFERENCIA.md`.

## Decisión

**templ es el motor de vistas del proyecto.** En la práctica:

- Versión fijada `v0.3.1070`, con la CLI en la directiva `tool` de
  `devops-pulse/go.mod`, de modo que el código generado es reproducible.
- Las vistas son componentes Go en `devops-pulse/web/views/` (`.templ`), y
  `go tool templ generate` produce los `*_templ.go` que consume `go build`.
- Un único componente por fragmento, reutilizado por la página inicial y por la
  respuesta HTMX, mediante el campo `OutOfBand` del modelo.
- No se introduce Jet ni `html/template` para vistas nuevas sin una decisión
  explícita que reemplace este registro.

## Consecuencias

**Buenas**

- Vistas tipadas y compiladas: un error de plantilla aparece al compilar, no en
  un render real.
- Una sola definición por fragmento, sin marcado duplicado entre página y
  respuesta.
- Salida minificada y determinista, congelada byte a byte en
  `devops-pulse/testdata/` y comprobada por
  `TestRenderedOutputMatchesFrozenBaseline`.
- Ecosistema de skills coherente: `templ-template-engine` sustituyó a
  `jet-template-engine` en el mismo commit, sin periodo sin sustituto.

**Malas y costes aceptados**

- **El escapado sigue sin ser contextual para JavaScript**: un valor dentro de un
  literal de comilla simple de Alpine atraviesa el analizador HTML y llega a
  Alpine como comilla suelta. Se compensa con la guarda
  `TestAlpineJSLiteralInterpolationsStaySafe`, que fija qué valores pueden llegar
  ahí. Es la misma brecha que introdujo Jet, no una regresión de templ.
- La salida **no** es byte-idéntica a la de la era Jet: cambian el `;` final de
  `style`, el entrecomillado de atributos y `<path/>` frente a `<path></path>`.
  Los seis golden se regeneraron y el DOM es equivalente.
- Aparece un paso de generación obligatorio antes de compilar: `go build` no
  basta si un `.templ` cambió.
- Las restricciones de Bootstrap del panel (`window.bootstrap` solo ESM, diálogo
  como `<dialog class="dialog">`) conviven con el marcado generado, así que la
  regla se comprueba en las vistas, no en el motor.

**Lo que no se afirma**

- No hay medición registrada de templ frente a Jet. La tabla de coste existente
  compara `html/template` con Jet 6, y la prueba A/B registrada entre Jet y templ
  mide el estado intermedio del DOM al aplicar el swap (un comportamiento de
  htmx), no el render. No se extrapola rendimiento.

## Alternativas consideradas

| Alternativa | Motivo para no elegirla |
| --- | --- |
| Mantener Jet 6 | Escapado no contextual, vistas como cadenas sin tipar y una skill propia que mantener; el motor se retiró. |
| Volver a `html/template` | Se perderían el tipado, la definición única por fragmento y la reproducción por CLI; además el proyecto ya había medido una mejora de coste al salir de él. |
| `html/template` o Jet para las vistas nuevas y templ para el resto | Dos motores en el mismo panel: exactamente el antipatrón que la skill `templ-template-engine` prohíbe. |

---

**Dueño:** Alfredo González P. · **Última revisión:** 2026-10-12 · **Próxima revisión:** 2027-04-12
