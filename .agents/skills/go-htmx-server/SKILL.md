---
name: go-htmx-server
description: Implementa y prueba handlers Go que renderizan páginas completas y fragmentos HTML para HTMX mediante net/http y templ.
---

# Go HTTP + HTMX
## Procedimiento
1. Inspeccionar router, templates, versión Go, middleware, estructura de handlers y tests existentes.
2. Preferir net/http y templ; mantener el escapado; no introducir HTML sin escapar con datos no confiables y revisar los contextos JavaScript, donde el escapado de atributos no es contextual.
3. Definir contrato por endpoint: verbo, entrada, permisos, respuesta normal, respuesta HTMX, status, fragmento objetivo.
4. Para vistas compartidas, factorizar datos y componentes templ; devolver página completa a navegación normal y fragmento solo cuando corresponda. No depender exclusivamente de HX-Request si la navegación/historial necesita HTML completo.
5. Formularios: validar en servidor, errores junto a campos, tokens CSRF para mutaciones, límites de tamaño, authn/authz; aplicar PRG a formularios tradicionales cuando proceda.
6. Usar estados HTTP y cabeceras HX-* con conocimiento de la versión; no suponer que HX-Redirect/HX-Location funcionarán sobre respuestas 3xx.
7. Tests con httptest: normal vs HX-Request, HTML escapado, fallos de validación, permisos, CSRF, método incorrecto y regresiones.
## Ejemplo de contrato
GET /clientes -> HTML completo; GET /clientes?q=... con HX-Request -> fragmento de resultados. POST /clientes -> validación y respuesta documentada. Adaptar al proyecto, no crear rutas ficticias.


## Integración con templ (obligatoria cuando el proyecto adopta templ)
- templ (`github.com/a-h/templ`) es el motor de plantillas predeterminado del stack; no usar `html/template` para nuevas vistas sin una decisión explícita del proyecto, y no reintroducir Jet.
- Distinguir página completa de fragmento HTMX: el componente de fragmento debe poder renderizarse de forma autónoma; no enviar el layout entero a un swap parcial.
- Reutilizar componentes templ entre página y fragmentos; evitar duplicar el marcado y la lógica entre ambos.
- Compilar las vistas con `go tool templ generate` (CLI fijada en el directorio `tool` de `go.mod`) y mantener los `*_templ.go` sincronizados con sus fuentes.
- Preservar el escapado y los tests de contenido dinámico. No marcar HTML de usuario como seguro.

## Principios obligatorios
- Primero inspeccionar el repositorio, versiones, convenciones y pruebas. No inventar hechos: si no es verificable, indicar UNKNOWN.
- Cambios mínimos, DRY y sin capas, dependencias, APIs o herramientas de build innecesarias.
- No modificar Git, crear commits ni introducir dependencias sin autorización del usuario.
- Verificar con pruebas reproducibles y comunicar qué se ha ejecutado y qué no.
- Consultar documentación oficial de la versión instalada ante dudas; no mezclar APIs de versiones mayores.

## Referencias oficiales
- Go: https://go.dev/doc/ y https://pkg.go.dev/net/http
- HTMX: https://htmx.org/docs/ y https://htmx.org/reference/
- Alpine.js: https://alpinejs.dev/start-here y https://alpinejs.dev/directives/data
- Bootstrap 6: https://getbootstrap.com/docs/6.0/getting-started/ai/

- templ: https://templ.guide/ y https://pkg.go.dev/github.com/a-h/templ
