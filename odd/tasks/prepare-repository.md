# Preparar el repositorio de documentación

## Objetivo

Dejar una base clara y segura para trabajar en la integración de Bootstrap 6 Alpha y producir informes y documentación trazables.

## Problema

El repositorio parte sin historial ni README y necesita separar los artefactos versionables de los estados locales de las herramientas.

## Alcance autorizado

- Revisar el estado inicial y la estructura existente.
- Ajustar `.gitignore` al uso documental y al tooling local presente.
- Crear `README.md` con propósito, estructura y flujo de entrada.
- Enlazar desde el README el contrato de flujo Git existente.
- No modificar el contenido normativo del contrato Git salvo que una inconsistencia concreta lo exija.

## Restricciones

- Mantener el contenido de `docs/CONTRATO_FLUJO_GIT_VERSIONADO.md`.
- No realizar operaciones remotas, merge, tag ni publicación.
- Los mensajes de commit, si se autorizan, estarán en inglés y seguirán Conventional Commits.

## Tareas

- [x] REP-01 — Revisar estado inicial, archivos existentes y convenciones documentales.
- [x] REP-02 — Adaptar `.gitignore` a un workspace documental con herramientas locales.
- [x] REP-03 — Crear `README.md` y enlazar el contrato de flujo Git.
- [x] REP-04 — Revisar diff, comprobar exclusiones y validar enlaces/estructura documental.

## Criterios de aceptación

- El README explica el propósito del repositorio y ofrece una ruta rápida de uso.
- El README identifica el contrato Git como referencia operativa.
- `.gitignore` excluye secretos, estados locales y artefactos generados sin ocultar documentos fuente.
- Los archivos existentes del usuario se conservan.
- La verificación queda registrada y cualquier commit queda pendiente de la confirmación prevista por el contrato Git.

## Ruta de implementación

- REP-01: directa, ya completada mediante inspección inicial.
- REP-02 y REP-03: se intentó delegar a un único escritor, pero el proveedor no pudo iniciar el trabajo por falta de fondos; se completó inline como degradación explícita.
- REP-04: verificación acotada posterior a la escritura.

## Verificación

- `git diff --check`: sin errores observables.
- `git check-ignore -v`: `.env`, `.codegraph/codegraph.db` y `.atl/skill-registry.md` quedan ignorados; `README.md` y el contrato Git no quedan ignorados.
- Los archivos requeridos existen y el contenido final de `.gitignore` y `README.md` fue revisado.
- El contrato Git permanece sin modificaciones.

## Progreso

- Rama: `chore/prepare-repository`
- Estado: implementación, verificación y commit completados.
- Resultado: aproximadamente 128 líneas fuente nuevas entre `.gitignore` y `README.md`, sin contar archivos generados.
- Estrategia de entrega: `ask-on-risk`; un único work unit previsto.
- Commit: `chore: prepare documentation workspace` (commit raíz de `chore/prepare-repository`).

## Siguiente paso

Definir el alcance técnico de la integración de Bootstrap 6 Alpha.
