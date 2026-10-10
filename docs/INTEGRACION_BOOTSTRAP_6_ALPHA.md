# Integración de Bootstrap 6 Alpha

## Estado actual

La aplicación `docengine-docs/` usa Bootstrap `6.0.0-alpha.1` como dependencia
npm exacta y Vite como bundler. El workspace raíz conserva documentación,
informes y tareas compartidas para futuros proyectos.

```sh
npm --prefix docengine-docs install
```

La dependencia está declarada y fijada en
`docengine-docs/package.json` y `docengine-docs/package-lock.json`.
`node_modules/` permanece excluido por `.gitignore`.

## Ruta recomendada

1. Mantener la versión exacta `6.0.0-alpha.1` mientras se evalúa la alpha.
2. Mantener Vite para `docengine-docs/` y elegir de forma independiente el
   bundler de futuras aplicaciones según el tipo de ejemplo que se documente.
3. Usar ESM para el JavaScript y `@use` para Sass.
4. Verificar el resultado en navegadores compatibles antes de publicar un
   informe.

## Integración JavaScript

Bootstrap 6 usa módulos ES exclusivamente. En una aplicación con bundler se
importa el paquete explícitamente:

```js
import * as bootstrap from 'bootstrap'
```

Para reducir el tamaño del bundle, se pueden importar solo los plugins
necesarios:

```js
import { Tooltip, Toast, Popover } from 'bootstrap'
```

En una página cargada directamente desde CDN, el script debe usar
`type="module"`. Ya no se debe depender de un global `window.bootstrap`.

## Integración Sass

Bootstrap 6 requiere el sistema moderno de módulos Sass. La personalización
usa `@use` y mapas de tokens; no se debe iniciar una integración nueva con
`@import`:

```scss
@use "bootstrap/scss/bootstrap" with (
  $root-tokens: (
    --spacer: 1.5rem,
  )
);
```

Las personalizaciones visuales se expresan mediante tokens CSS. Las variables
se escriben sin prefijo en Sass; el CSS distribuido añade el prefijo `--bs-`
durante su proceso oficial de PostCSS.

## Dependencias opcionales

El paquete declara estos peer dependencies:

| Paquete | Añadir cuando se use |
| --- | --- |
| `@floating-ui/dom` | Menús, popovers o tooltips con el build no empaquetado. |
| `vanilla-calendar-pro` | Datepicker. |

No se añaden porque `docengine-docs/` no utiliza esos componentes. Cada futura
aplicación deberá declarar únicamente los peer dependencies que necesite.

## Compatibilidad de navegador

La alpha requiere, como mínimo, Chrome y Edge 130, Firefox 132 o Safari 18.
La razón es el uso de APIs y funciones CSS modernas como `oklch()`,
`color-mix()`, `:has()`, container queries y `<dialog>`. Bootstrap 6 no aporta
fallbacks, prefijos ni polyfills para navegadores anteriores a ese umbral.

## Skills y documentación para agentes

Bootstrap publica documentación machine-readable en:

- [`llms.txt`](https://getbootstrap.com/llms.txt): índice curado.
- [`llms-full.txt`](https://getbootstrap.com/llms-full.txt): documentación
  concatenada.
- [Guía de uso con AI](https://getbootstrap.com/docs/6.0/getting-started/ai/):
  catálogo oficial de skills.

Las skills se mantienen en el repositorio oficial y no forman parte del
paquete npm instalado. Se han integrado en alcance de proyecto mediante el
CLI oficial para OpenCode, usando copias locales en `.agents/skills/` y un
`skills-lock.json` versionado para poder restaurarlas.

La selección integrada es:

- [`bootstrap-v6-install`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-v6-install)
- [`bootstrap-npm`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-npm)
- [`bootstrap-vite`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-vite)
- [`bootstrap-component`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-component)
- [`bootstrap-component-js`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-component-js)
- [`bootstrap-color-system`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-color-system)
- [`bootstrap-utility-api`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-utility-api)

Se han dejado fuera `bootstrap-v4-v6-migration`, `bootstrap-v5-v6-migration`,
`bootstrap-webpack` y `bootstrap-parcel`: este workspace no migra todavía una
aplicación existente ni ha elegido esos bundlers.

La documentación oficial propone instalarlas en el agente mediante:

```sh
npx skills add twbs/bootstrap
```

En este proyecto se ejecutó con alcance local, agente OpenCode, copias en vez
de enlaces y selección explícita de las siete skills anteriores. Para
restaurarlas en un clon nuevo puede usarse:

```sh
npx skills experimental_install
```

## Fuentes y límites

Esta integración se basa en la alpha publicada y en sus fuentes oficiales:

- [Anuncio de Bootstrap 6 Alpha](https://blog.getbootstrap.com/2026/10/08/bootstrap-6-alpha/)
- [Instalación](https://getbootstrap.com/docs/6.0/getting-started/install/)
- [Bootstrap con npm](https://getbootstrap.com/docs/6.0/guides/npm/)
- [Bootstrap con Vite](https://getbootstrap.com/docs/6.0/guides/vite/)
- [Migración a v6](https://getbootstrap.com/docs/6.0/guides/migration/)

Esta fase no demuestra todavía una página renderizada ni una compilación Sass:
no existe aún una aplicación de ejemplo. La siguiente tarea deberá elegir el
primer formato de ejemplo y ejecutar su verificación funcional.
