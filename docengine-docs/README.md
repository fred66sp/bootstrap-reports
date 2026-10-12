# docengine Docs

Sitio de documentación de docengine, un motor determinista en Go que evalúa y mantiene la documentación de un repositorio a partir de un perfil versionado. La página está construida con Bootstrap 6 Alpha y Vite.

## Requisitos e instalación

Se necesita Node y npm. Instale las dependencias desde la raíz del workspace:

```sh
npm --prefix docengine-docs install
```

El paquete es ESM y fija `bootstrap` exactamente en `6.0.0-alpha.1`. También declara `prismjs` como dependencia, y `sass` y `vite` como dependencias de desarrollo.

## Ejecutar

Los scripts disponibles están definidos en `docengine-docs/package.json`:

```sh
npm --prefix docengine-docs run dev
npm --prefix docengine-docs run build
npm --prefix docengine-docs run preview
```

- `dev` inicia el servidor de desarrollo de Vite.
- `build` genera la salida de producción en `docengine-docs/dist/`.
- `preview` sirve localmente la salida generada para previsualizarla.

`docengine-docs/dist/` no está versionado.

## Estructura de `src/`

- `src/index.html` es el punto de entrada HTML. Define la página, la navegación, los controles de idioma y tema, y el contenido de la documentación.
- `src/js/main.js` contiene el comportamiento de la página: traducciones, tema, navegación, revelado y copia. Importa los plugins de Bootstrap y Prism.js como ESM.
- `src/scss/styles.scss` contiene los estilos propios y la configuración Sass de Bootstrap. Usa mapas de tokens para integrar la tipografía y los tokens de la página.

Vite usa `src/` como raíz y escribe el resultado de `build` en `../dist/`.

El HTML carga `src/js/main.js` como módulo. La hoja de estilos se importa desde ese módulo y se compila desde `src/scss/styles.scss`. La página incluye controles para cambiar el idioma y el tema.

## Decisiones y límites

- Bootstrap permanece fijado exactamente en `6.0.0-alpha.1`; no se actualiza implícitamente.
- El paquete usa ESM mediante `"type": "module"`.
- Sass usa `@use` y mapas de tokens; el código nuevo no inicia con `@import`.
- Los plugins de Bootstrap se importan individualmente. La aplicación no usa el global `window.bootstrap`.
- La aplicación utiliza Vite para el desarrollo y la compilación, y Prism.js para el resaltado de código.

Para el contexto de integración, consulte [`docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md`](../docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md) y [`docs/HALLAZGOS_BOOTSTRAP_6_ALPHA.md`](../docs/HALLAZGOS_BOOTSTRAP_6_ALPHA.md).

El punto de entrada HTML también declara la descripción de la documentación, las fuentes tipográficas externas y el script que aplica el tema persistido antes del primer pintado.

## Contenido de la página

La interfaz presenta la documentación de docengine en una sola página HTML.
`src/js/main.js` mantiene las cadenas en español e inglés y aplica la traducción
según el idioma seleccionado. También conserva la preferencia de tema y registra
los controles de la página.

La hoja Sass añade la composición específica de la documentación sobre Bootstrap,
incluidos la cabecera fija, el índice y la ventana de código.

## Verificación disponible

El proyecto no declara scripts de lint, typecheck ni una suite de tests. La verificación disponible es ejecutar el build:

```sh
npm --prefix docengine-docs run build
```

Ese comando comprueba la compilación de la aplicación y genera `docengine-docs/dist/`. No se documentan comandos adicionales de verificación porque no están declarados por este paquete.
