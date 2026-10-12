# Bootstrap 6 Alpha — Workspace

Workspace para investigar e integrar Bootstrap 6 Alpha, preparar ejemplos y
redactar informes y documentación técnica trazables.

> Este repositorio es un espacio de trabajo independiente. No es el sitio ni
> la documentación oficial de Bootstrap.

## Ruta rápida

1. Consulta el [contrato de flujo Git](docs/CONTRATO_FLUJO_GIT_VERSIONADO.md)
   antes de crear ramas, commits o integrar cambios.
2. Mantén cada informe o documento dentro de `docs/` hasta que una estructura
   específica justifique separar `reports/` o `examples/`.
3. Revisa el estado del árbol con `git status --short --branch` antes de
   empezar una tarea.
4. Verifica los cambios y deja constancia del resultado antes de proponer un
   commit.
5. Arranca la documentación web local de docengine desde `docengine-docs/`
   con `npm run dev` cuando quieras revisar el sitio.

## Objetivo del repositorio

El trabajo se organizará alrededor de cuatro objetivos:

- estudiar las novedades de Bootstrap 6 Alpha;
- validar su integración en ejemplos reproducibles;
- documentar decisiones, límites y resultados;
- producir informes que puedan revisarse y recuperarse con facilidad.

La referencia inicial del trabajo es el anuncio oficial:

[Bootstrap 6 Alpha — anuncio oficial](https://blog.getbootstrap.com/2026/10/08/bootstrap-6-alpha/)

## Estructura actual

| Ruta | Uso |
| --- | --- |
| `docs/` | Contratos, documentación e informes del proyecto. |
| `docs/CONTRATO_FLUJO_GIT_VERSIONADO.md` | Referencia operativa para Git, commits, versionado e integración. |
| `docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md` | Instalación, decisiones y fuentes para Bootstrap 6 Alpha. |
| `docs/HALLAZGOS_BOOTSTRAP_6_ALPHA.md` | Diferencias verificadas de Bootstrap 6 Alpha 1 que fallan en silencio, con la comprobación reproducible de cada una. |
| `docs/inference-protocol.md` | Protocolo obligatorio de evidencia, inferencia y trazabilidad. |
| `docs/decisions/` | Registros de decisión (ADR) de las decisiones difíciles de revertir. |
| `docengine-docs/` | Aplicación web de documentación de docengine, autocontenida (Vite + Bootstrap). |
| `devops-pulse/` | Panel de servicios en tiempo real de ejemplo: Go con templ y SSE, HTMX, Alpine y Bootstrap 6 sobre el CSS y el bundle que publica `docengine-docs/`. |
| `odd/tasks/` | Tareas de trabajo recuperables del flujo ODD. |
| `skills-lock.json` | Selección y hashes de las skills oficiales instaladas para el proyecto. |
| `.agents/skills/` | Skills del agente para este proyecto, versionadas; las de origen remoto se fijan en `skills-lock.json`. |
| `.gitattributes` | Normalización de finales de línea y ficheros binarios concretos. |
| `.gitignore` | Exclusiones de secretos, estado local y artefactos generados. |

Cada aplicación o informe con identidad propia vive en su propio directorio
hermano (por ejemplo `docengine-docs/`); el resto de directorios de este
workspace son documentación y tareas compartidas.

## Convenciones

- La documentación del proyecto se redacta en español, salvo que el contexto
  técnico requiera conservar terminología original.
- Los mensajes de commit se redactan en inglés y siguen Conventional Commits,
  según el contrato Git.
- No se realizan operaciones remotas, publicaciones, etiquetas ni fusiones en
  `main` sin autorización explícita.
- No se versionan secretos, dependencias instaladas, cachés ni salidas
  generadas.
- Las skills de origen remoto se recuperan desde `skills-lock.json`; no se
  editan a mano dentro de `.agents/skills/`. Las skills locales del proyecto sí
  se versionan aquí y se editan en su sitio; la procedencia de cada una está en
  `.agents/skills/README.md`.

## Estado

Bootstrap `6.0.0-alpha.1` ya está fijado como dependencia npm dentro de la
aplicación `docengine-docs/`. La integración de la documentación web de
docengine está implementada en `docengine-docs/src/`, con Sass compilado por
Vite, tema claro/oscuro y cambio de idioma ES/EN con español por defecto. Las
decisiones y límites de Bootstrap están documentados en
[`docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md`](docs/INTEGRACION_BOOTSTRAP_6_ALPHA.md).

Para revisarla localmente, desde `docengine-docs/`:

```sh
npm install
npm run dev
```

El build de producción se comprueba con `npm run build` y escribe la salida
generada en `docengine-docs/dist/`, que no se versiona.

## Próximos pasos

- ampliar la cobertura visual o dividir el sitio en páginas cuando exista una
  necesidad documental comprobada;
- mantener las afirmaciones del sitio alineadas con la documentación fuente de
  `docengine`;
- registrar nuevos hallazgos y decisiones en documentos versionados;
- crear informes a medida que existan resultados verificables.
