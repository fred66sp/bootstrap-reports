# Referencia de Bootstrap 6 Alpha

¿Qué datos consultables definen la integración, compatibilidad, dependencias y fuentes de Bootstrap 6 Alpha?

Esta referencia complementa la [guía de integración](INTEGRACION_BOOTSTRAP_6_ALPHA.md) y el [README del workspace](../README.md).

## Dependencias opcionales

El paquete declara estos peer dependencies:

| Paquete | Añadir cuando se use |
| --- | --- |
| `@floating-ui/dom` | Menús, popovers o tooltips con el build no empaquetado. |
| `vanilla-calendar-pro` | Datepicker. |

`docengine-docs/` no utiliza esos componentes. Cada futura aplicación deberá declarar únicamente los peer dependencies que necesite.

## Compatibilidad de navegador

La alpha requiere, como mínimo, Chrome y Edge 130, Firefox 132 o Safari 18. La razón es el uso de APIs y funciones CSS modernas como `oklch()`, `color-mix()`, `:has()`, container queries y `<dialog>`. Bootstrap 6 no aporta fallbacks, prefijos ni polyfills para navegadores anteriores a ese umbral.

## Skills y documentación para agentes

Bootstrap publica documentación machine-readable en:

- [`llms.txt`](https://getbootstrap.com/llms.txt): índice curado.
- [`llms-full.txt`](https://getbootstrap.com/llms-full.txt): documentación concatenada.
- [Guía de uso con AI](https://getbootstrap.com/docs/6.0/getting-started/ai/): catálogo oficial de skills.

Las skills se mantienen en el repositorio oficial y no forman parte del paquete npm instalado. Se han integrado en alcance de proyecto mediante el CLI oficial para OpenCode, usando copias locales en `.agents/skills/` y un `skills-lock.json` versionado para poder restaurarlas.

La selección integrada es:

- [`bootstrap-v6-install`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-v6-install)
- [`bootstrap-npm`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-npm)
- [`bootstrap-vite`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-vite)
- [`bootstrap-component`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-component)
- [`bootstrap-component-js`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-component-js)
- [`bootstrap-color-system`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-color-system)
- [`bootstrap-utility-api`](https://github.com/twbs/bootstrap/tree/v6.0.0-alpha.1/skills/bootstrap-utility-api)

Se han dejado fuera `bootstrap-v4-v6-migration`, `bootstrap-v5-v6-migration`, `bootstrap-webpack` y `bootstrap-parcel`: este workspace no migra todavía una aplicación existente ni ha elegido esos bundlers.

La documentación oficial propone instalarlas en el agente mediante:

```sh
npx skills add twbs/bootstrap
```

En este proyecto se ejecutó con alcance local, agente OpenCode, copias en vez de enlaces y selección explícita de las siete skills anteriores. Para restaurarlas en un clon nuevo puede usarse:

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
- [Hallazgos verificados de Bootstrap 6 Alpha 1](HALLAZGOS_BOOTSTRAP_6_ALPHA.md), con la comprobación reproducible de cada diferencia encontrada al construir las aplicaciones de este workspace.

El workspace ya cuenta con aplicaciones sobre esta alpha:

- `docengine-docs/`: sitio de documentación con Vite que compila el Sass de Bootstrap desde el código fuente.
- `devops-pulse/`: panel en tiempo real que sirve el CSS y el bundle publicados sin paso de compilación, con sincronización reproducible de los artefactos y verificación en Go, HTTP y navegador.

**No verificado:** el comportamiento en Firefox y WebKit, los paquetes opcionales (`@floating-ui/dom`, `vanilla-calendar-pro`) y la sobrescritura de tokens por Sass dentro de `devops-pulse`, que al servir el `dist` sobrescribe tokens desde CSS propio.

La guía operativa está en [Integración de Bootstrap 6 Alpha](INTEGRACION_BOOTSTRAP_6_ALPHA.md).

---

**Dueño:** Alfredo González P. · **Última revisión:** 2026-10-12 · **Próxima revisión:** 2027-04-12