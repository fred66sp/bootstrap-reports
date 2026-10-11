---
name: alpinejs-interactivity
description: Añade estado efímero y comportamientos locales con Alpine.js, evitando conflictos con HTMX y Bootstrap JavaScript.
---

# Alpine.js: estado local
## Procedimiento
1. Comprobar versión y si Alpine está cargado una sola vez.
2. Utilizar Alpine solo para estado local efímero: x-data, x-show, x-model, x-bind, x-on, x-cloak cuando correspondan.
3. Mantener expresiones simples; extraer comportamiento solo si mejora legibilidad. No replicar lógica de negocio ni autorización.
4. Revisar interacción con HTMX: un swap que reemplaza nodos destruye su estado; comprobar inicialización automática en nodos nuevos y comportamiento real de la versión instalada. No forzar Alpine.initTree indiscriminadamente.
5. Si Bootstrap JS controla modal, collapse, tooltip o dropdown, Alpine no debe controlar el mismo estado salvo contrato explícito.
6. Accesibilidad: teclado, aria-expanded, aria-controls, foco, reduced-motion; no confiar solo en x-show.
7. Probar abrir/cerrar, swaps sucesivos, pérdida de foco, fuga de listeners y navegación atrás.
## Evitar
- Grandes almacenes globales para pantallas sencillas.
- x-html con contenido no confiable.
- Reimplementar en Alpine componentes ya resueltos por Bootstrap.

## Principios obligatorios
- Primero inspeccionar el repositorio, versiones, convenciones y pruebas. No inventar hechos: si no es verificable, indicar UNKNOWN.
- Cambios mínimos, DRY y sin capas, dependencias, APIs o herramientas de build innecesarias.
- No modificar Git, crear commits ni introducir dependencias sin autorización del usuario.
- Verificar con pruebas reproducibles y comunicar qué se ha ejecutado y qué no.
- Consultar documentación oficial de la versión instalada ante dudas; no mezclar APIs de versiones mayores.

## Referencias oficiales
- Go: https://go.dev/doc/ y https://pkg.go.dev/net/http y https://pkg.go.dev/html/template
- HTMX: https://htmx.org/docs/ y https://htmx.org/reference/
- Alpine.js: https://alpinejs.dev/start-here y https://alpinejs.dev/directives/data
- Bootstrap 6: https://getbootstrap.com/docs/6.0/getting-started/ai/
