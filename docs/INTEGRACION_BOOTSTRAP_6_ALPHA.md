# Integración de Bootstrap 6 Alpha

¿Qué pasos permiten integrar Bootstrap 6 Alpha en las aplicaciones del workspace?

## Estado actual

La aplicación `docengine-docs/` usa Bootstrap `6.0.0-alpha.1` como dependencia npm exacta y Vite como bundler. El workspace raíz conserva documentación, informes y tareas compartidas para futuros proyectos.

```sh
npm --prefix docengine-docs install
```

La dependencia está declarada y fijada en `docengine-docs/package.json` y `docengine-docs/package-lock.json`. `node_modules/` permanece excluido por `.gitignore`.

Consulte [`AGENTS.md`](../AGENTS.md) para las restricciones no negociables de esta integración.

## Ruta recomendada

1. Mantener la versión exacta `6.0.0-alpha.1` mientras se evalúa la alpha.
2. Mantener Vite para `docengine-docs/` y elegir de forma independiente el bundler de futuras aplicaciones según el tipo de ejemplo que se documente.
3. Verificar el resultado en navegadores compatibles antes de publicar un informe.

## Integración JavaScript

Bootstrap 6 usa módulos ES exclusivamente. En una aplicación con bundler se importa el paquete explícitamente:

```js
import * as bootstrap from 'bootstrap'
```

Para reducir el tamaño del bundle, se pueden importar solo los plugins necesarios:

```js
import { Tooltip, Toast, Popover } from 'bootstrap'
```

En una página cargada directamente desde CDN, el script debe usar `type="module"`.

## Integración Sass

Bootstrap 6 requiere el sistema moderno de módulos Sass. La personalización usa `@use` y mapas de tokens:

```scss
@use "bootstrap/scss/bootstrap" with (
  $root-tokens: (
    --spacer: 1.5rem,
  )
);
```

Las personalizaciones visuales se expresan mediante tokens CSS. Las variables se escriben sin prefijo en Sass; el CSS distribuido añade el prefijo `--bs-` durante su proceso oficial de PostCSS.

## Verificación

Verifique el resultado en navegadores compatibles antes de publicar un informe. Consulte la [referencia de Bootstrap 6 Alpha](REFERENCIA_BOOTSTRAP_6_ALPHA.md) para los datos, dependencias, compatibilidad y fuentes; consulte también los [hallazgos verificados](HALLAZGOS_BOOTSTRAP_6_ALPHA.md) para la evidencia reproducible de cada diferencia encontrada.

---

**Dueño:** Alfredo González P. · **Última revisión:** 2026-10-12 · **Próxima revisión:** 2027-04-12