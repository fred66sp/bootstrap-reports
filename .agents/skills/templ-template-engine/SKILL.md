---
name: templ-template-engine
description: Diseña, mantiene y prueba vistas templ en aplicaciones Go, incluyendo componentes tipados, composición, fragmentos HTMX, seguridad y generación de código; úsala cuando se creen o modifiquen archivos .templ.
---

# templ — vistas Go compiladas

## Alcance

- Motor de vistas (páginas y fragmentos HTML) del stack Go + HTMX + Alpine.js + Bootstrap 6; es el motor del proyecto: no introducir Jet ni `html/template` para vistas nuevas sin decisión explícita.
- No reemplaza handlers, validación, lógica de negocio ni autorización, que siguen en Go.
- Rige el contrato común de las demás skills del proyecto (inspeccionar antes de escribir, cambios mínimos, sin operaciones Git ni dependencias sin autorización, informar lo verificado).

## Procedimiento

1. Inspeccionar `go.mod` (dependencia y directiva `tool`), la versión de la CLI, el paquete de vistas, el modelo y los tests; marcar UNKNOWN lo no comprobable.
2. Definir el contrato del componente o fragmento: datos tipados, elemento raíz e `id`, contexto HTTP, escapado y errores.
3. Escribir el `.templ`, regenerar y compilar antes de dar nada por terminado.
4. Separar página completa y fragmento: el fragmento debe poder renderizarse de forma autónoma desde Go, además de componerse dentro de la página.
5. Renderizar en buffer cuando el endpoint escribe cabeceras, para no servir medio documento si falla un componente.
6. Probar con datos reales: caracteres especiales y XSS, listas vacías, página completa, fragmento, fallo de render y atributos Alpine.

## Componentes y composición

- Cada directorio es un paquete Go: `templ Nombre(args...)` genera una función que devuelve un `templ.Component` (`Render(ctx, io.Writer)`).
- Componer con `@Componente(args)` y envolver con `{ children... }`; no existen `extends`, `yield` ni `include`.
- Reutilizar el componente del fragmento dentro de la tarjeta o la página en lugar de duplicar marcado.
- Mantener el modelo de vista en el paquete de vistas y mapear desde el dominio en `main`; sin capas ni DSL propias sobre templ.

## Fragmentos HTMX

- Un solo elemento raíz con `id` estable, o el swap no encuentra destino.
- Usar `hx-swap-oob` en los fragmentos que reemplazan nodos ya presentes (insignia, barras) durante un frame SSE.
- No enviar el layout completo en un swap parcial ni asumir que el estado del cliente sobrevive a un reemplazo de nodo.
- El contrato de fragmentos, historial y navegación está en la skill `htmx-interactions`.

## Seguridad

- templ escapa por defecto, pero **no es contextual**: un valor dentro de un literal JavaScript entre comillas simples se decodifica en el atributo y llega a Alpine como comilla suelta. No interpolar datos no confiables en expresiones Alpine o JS; si el proyecto mantiene ese punto, fijar con una prueba los valores permitidos.
- No usar `templ.Raw`, `templ.SafeURL` ni `templ.SafeCSS` con datos no confiables, ni marcar HTML de usuario como seguro.
- `on*` y `hx-on:*` exigen `templ.ComponentScript`; no se admiten variables en `<script>` ni `<style>`; el `style` dinámico va por expresión tipada.
- Validar entradas, permisos y CSRF en Go: la vista solo presenta datos ya decididos por el servidor.

## Generación y verificación

- Compilar con `go tool templ generate`, con la CLI fijada en el directorio `tool` de `go.mod` para que la generación sea reproducible.
- Versionar los `*_templ.go` y mantenerlos sincronizados: regenerar no debe cambiar hashes y debe informar `updates=0`.
- Verificación mínima: `go tool templ generate`, `go build ./...`, `go vet ./...`, `go test ./...` y comprobación en navegador de los fragmentos afectados.
- Los golden congelan la salida de templ. Como se minifica, un cambio de motor se valida comparando de forma normalizada (espaciado, entidades, comillas de atributo) antes de re-congelar, nunca actualizando el golden a ciegas.
- Antipatrones que rompen lo anterior: mezclar `html/template` o Jet con templ, envolver templ en un framework propio, o duplicar el marcado del fragmento entre página y respuesta.

## Comportamientos medidos (v0.3.1070)

- Minifica: quita el espaciado entre elementos y colapsa el salto entre nodos inline a un espacio. Mismo DOM, distintos bytes.
- Expande los autocerrados no vacíos (`<path/>` → `<path></path>`) y `style={ templ.SafeCSS(...) }` añade un `;` final; una cadena normal se sanea y pierde espacios.
- `<script>` y `<style>` se emiten verbatim con la indentación del fuente; los atributos constantes tal cual y los de expresión con `&#34;` y `&#39;`.
- `templ fmt` reescribe el marcado y `templ fmt -fail` formatea antes de informar: no es de solo lectura.

## Referencias oficiales

- Guía (sintaxis, CLI, seguridad, HTMX, testing): https://templ.guide/
- API Go: https://pkg.go.dev/github.com/a-h/templ
