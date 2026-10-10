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
| `odd/tasks/` | Tareas de trabajo recuperables del flujo ODD. |
| `.gitattributes` | Normalización de finales de línea y ficheros binarios concretos. |
| `.gitignore` | Exclusiones de secretos, estado local y artefactos generados. |

## Convenciones

- La documentación del proyecto se redacta en español, salvo que el contexto
  técnico requiera conservar terminología original.
- Los mensajes de commit se redactan en inglés y siguen Conventional Commits,
  según el contrato Git.
- No se realizan operaciones remotas, publicaciones, etiquetas ni fusiones en
  `main` sin autorización explícita.
- No se versionan secretos, dependencias instaladas, cachés ni salidas
  generadas.

## Estado

La integración de Bootstrap 6 Alpha todavía está en preparación. Este README
define el punto de entrada del workspace; los resultados técnicos se añadirán
junto con la documentación y los ejemplos que se validen.

## Próximos pasos

- fijar el alcance de la integración y las preguntas técnicas;
- preparar un primer ejemplo reproducible;
- registrar hallazgos y decisiones en documentos versionados;
- crear informes a medida que existan resultados verificables.
