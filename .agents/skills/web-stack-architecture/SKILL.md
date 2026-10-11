---
name: web-stack-architecture
description: Diseña o revisa arquitectura y reparto de responsabilidades en proyectos Go, HTMX, Alpine.js y Bootstrap 6; úsala para decisiones transversales, nuevas pantallas y revisiones de complejidad.
---

# Arquitectura del stack web
## Procedimiento
1. Identificar objetivo, versión real de Go/HTMX/Alpine/Bootstrap y estructura existente.
2. Clasificar cada interacción: persistencia y reglas -> Go; navegación/actualización remota -> HTMX; estado efímero -> Alpine; estilos y componentes visuales -> Bootstrap.
3. Priorizar enlaces y formularios HTML nativos; HTMX solo donde mejore experiencia.
4. Definir contratos de rutas, métodos, estado HTTP, HTML completo/fragmentos y errores; respetar accesibilidad y navegación sin JS cuando sea viable.
5. Elegir UN propietario por comportamiento: no mezclar Alpine y Bootstrap JS para abrir el mismo modal, ni duplicar estado servidor en cliente.
6. Evaluar riesgos de reemplazos HTMX sobre componentes Alpine y widgets Bootstrap: probar inicialización y destrucción; no añadir reinit global a ciegas.
7. Entregar decisión mínima, alternativas descartadas y criterios verificables.
## Antipatrones
- SPA o API JSON por defecto para vistas HTML.
- Estado duplicado en Alpine y Go sin sincronización definida.
- Componentes re-renderizados que pierden foco, listeners o accesibilidad.
- Arquitecturas hexagonales o abstracciones sin necesidad demostrada.


## Integración con Jet 6 (obligatoria cuando el proyecto adopta Jet)
- Jet 6 (`github.com/CloudyKit/jet/v6`) es el motor de plantillas predeterminado del stack; no usar `html/template` para nuevas vistas sin una decisión explícita del proyecto.
- Distinguir página completa (layout Jet) de fragmento HTMX (template Jet autónomo); no enviar el layout entero a un swap parcial.
- Reutilizar includes/bloques de Jet; evitar duplicar el marcado y la lógica entre páginas y fragmentos.
- Verificar API de Jet v6 en la documentación oficial antes de escribir código: no copiar ejemplos antiguos de Jet v3/v4/v5.
- Preservar autoescaping, contexto HTML y tests de contenido dinámico. No marcar HTML de usuario como seguro.

## Principios obligatorios
- Primero inspeccionar el repositorio, versiones, convenciones y pruebas. No inventar hechos: si no es verificable, indicar UNKNOWN.
- Cambios mínimos, DRY y sin capas, dependencias, APIs o herramientas de build innecesarias.
- No modificar Git, crear commits ni introducir dependencias sin autorización del usuario.
- Verificar con pruebas reproducibles y comunicar qué se ha ejecutado y qué no.
- Consultar documentación oficial de la versión instalada ante dudas; no mezclar APIs de versiones mayores.

## Referencias oficiales
- Go: https://go.dev/doc/ y https://pkg.go.dev/net/http y https://pkg.go.dev/github.com/CloudyKit/jet/v6
- HTMX: https://htmx.org/docs/ y https://htmx.org/reference/
- Alpine.js: https://alpinejs.dev/start-here y https://alpinejs.dev/directives/data
- Bootstrap 6: https://getbootstrap.com/docs/6.0/getting-started/ai/
