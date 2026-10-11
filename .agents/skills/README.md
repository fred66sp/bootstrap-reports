# Skills del proyecto

Esta carpeta contiene las skills del agente que usa este repositorio. **Se
versionan**, a diferencia del resto de `.agents/`, porque forman parte del
material del proyecto y tienen que sobrevivir a un clon.

## Procedencia

| Skill | Origen | Cómo se mantiene |
| --- | --- | --- |
| `alpinejs-interactivity` | Local, escrita para este proyecto | Se edita en su sitio |
| `go-htmx-server` | Local, escrita para este proyecto | Se edita en su sitio |
| `htmx-interactions` | Local, escrita para este proyecto | Se edita en su sitio |
| `web-stack-architecture` | Local, escrita para este proyecto | Se edita en su sitio |
| `bootstrap-color-system` | `twbs/bootstrap`, MIT | Se restaura desde `skills-lock.json` |
| `bootstrap-component` | `twbs/bootstrap`, MIT | Se restaura desde `skills-lock.json` |
| `bootstrap-component-js` | `twbs/bootstrap`, MIT | Se restaura desde `skills-lock.json` |
| `bootstrap-npm` | `twbs/bootstrap`, MIT | Se restaura desde `skills-lock.json` |
| `bootstrap-utility-api` | `twbs/bootstrap`, MIT | Se restaura desde `skills-lock.json` |
| `bootstrap-v6-install` | `twbs/bootstrap`, MIT | Se restaura desde `skills-lock.json` |
| `bootstrap-vite` | `twbs/bootstrap`, MIT | Se restaura desde `skills-lock.json` |
| `frontend-design` | Local | Se edita en su sitio; no declara licencia |

## Reglas

- Las siete skills `bootstrap-*` se corresponden con las entradas de
  `skills-lock.json`, que fija su origen, su ruta y su hash. **No se editan a
  mano**: se restauran con `npx skills experimental_install`.
- Las skills locales se editan aquí directamente. Cualquier cambio entra en el
  historial como un commit propio.
- El índice que usan los subagentes es `.atl/skill-registry.md`, generado
  automáticamente y no versionado. Se regenera tras añadir, quitar, mover o
  renombrar una skill.

## Atribución pendiente

- Las copias de `bootstrap-*` provienen de `twbs/bootstrap`, publicado bajo
  licencia MIT, pero los `SKILL.md` copiados **no incluyen el texto de la
  licencia**. Si el repositorio se publica, conviene añadirlo o enlazar el
  original.
- `frontend-design` no declara licencia. Su frontmatter citaba un
  `LICENSE.txt` que nunca existió en esta carpeta: era un error y se retiró.
