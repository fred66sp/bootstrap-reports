---
name: htmx-interactions
description: Diseña interacciones HTMX basadas en HTML del servidor, swaps, formularios, indicadores y navegación sin SPA.
---

# HTMX: interacciones hipermedia
## Procedimiento
1. Confirmar versión instalada (especialmente diferencias HTMX 2/4) y consultar documentación correspondiente.
2. Usar hx-get/hx-post, hx-trigger, hx-target, hx-swap cuando simplifiquen la interacción; priorizar atributos declarativos.
3. Para cada swap documentar: elemento origen, selector destino, forma exacta del HTML devuelto, foco, estado vacío y error.
4. Evitar búsquedas que saturen el servidor: delay, changed y política de concurrencia cuando proceda.
5. Mantener URLs navegables e historial coherente (hx-push-url cuando sea útil); no sustituir semántica de enlaces y botones.
6. No asumir swaps de 4xx/5xx ni gestión de redirects sin revisar la configuración y versión.
7. Probar con navegador: peticiones, target inexistente, duplicación de IDs, respuesta vacía, accesibilidad, historial y sin JS.
## Seguridad
- CSRF para mutaciones, escape HTML, autorización por endpoint, no confiar en atributos del cliente.
- No incluir HTML de origen no confiable; revisar CSP.

## Contrato de fragmentos Jet 6
- Los endpoints HTMX renderizan templates Jet de fragmentos sin documento HTML completo.
- Si una vista sirve ambos tipos de solicitud, comprobar navegación normal, historial y peticiones parciales en tests.
- No duplicar fragmentos entre rutas: extraer includes Jet cuando resulte útil.

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
