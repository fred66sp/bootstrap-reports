---
name: jet-template-engine
description: Diseña, mantiene y prueba vistas Jet 6 en aplicaciones Go, incluyendo layouts, bloques, includes, autoescaping y fragmentos HTMX; usar cuando se creen o modifiquen templates .jet.
---

# Jet 6 — templates Go

## Alcance
- Motor de vistas para páginas y fragmentos HTML en el stack Go + HTMX + Alpine.js + Bootstrap.
- No reemplaza handlers, validación, lógica de negocio ni autorización de Go.
- Usar exclusivamente documentación de Jet v6; no trasladar APIs de versiones anteriores sin comprobarlas.

## Procedimiento
1. Inspeccionar `go.mod`, versión exacta de Jet, loader, estructura de vistas, layouts, datos y tests. Si no puede comprobarse, marcar UNKNOWN.
2. Definir contrato de render: nombre de vista, contexto tipado, layout o fragmento, código HTTP, escaping y errores.
3. Reutilizar layouts mediante `extends` y `block`/`yield`; usar `include` para fragmentos y `import` para bloques compartidos. Evitar abstracciones genéricas innecesarias.
4. Separar templates de documento completo y de fragmento HTMX. Compartir componentes cuando tenga sentido, sin duplicar marcado.
5. Mantener HTML semántico y accesible; Bootstrap para presentación, Alpine para estado local, HTMX para operaciones con servidor.
6. Escapar datos por defecto; no permitir HTML arbitrario de usuario ni construir código JS a partir de interpolaciones inseguras. Validar entradas y permisos en Go.
7. Gestionar errores de carga y render sin respuestas parciales accidentales; evaluar render en buffer antes de escribir cabeceras y cuerpo si el endpoint lo requiere.
8. Probar con casos reales: herencia, includes, datos vacíos, caracteres especiales, XSS, páginas completas, swaps HTMX, fallos de render y atributos Alpine.
9. Documentar solamente decisiones que afecten al mantenimiento; no crear frameworks propios de componentes ni DSLs sobre Jet.

## Ejemplo mínimo de composición (sintaxis Jet, no aplicación completa)
`layouts/base.jet`:
```jet
<!doctype html>
<html lang="es"><body>{{ yield body() }}</body></html>
```
`pages/index.jet`:
```jet
{{ extends "../layouts/base.jet" }}
{{ block body() }}<main><h1>Inicio</h1></main>{{ end }}
```
Comprobar resolución de rutas del loader configurado en el proyecto antes de adoptar el ejemplo.

## Reglas para agentes
- No inventar API, versiones ni rutas. UNKNOWN cuando no verificable.
- DRY y cambios mínimos; respetar arquitectura existente y no migrar automáticamente.
- No instalar dependencias, hacer commits ni modificar Git sin permiso.
- Informar pruebas realmente ejecutadas y limitaciones.

## Referencias oficiales
- Repositorio: https://github.com/CloudyKit/jet
- Sintaxis actual: https://github.com/CloudyKit/jet/blob/master/docs/syntax.md
- API Go v6: https://pkg.go.dev/github.com/CloudyKit/jet/v6
