# tk — gestor de tareas local

Reglas de esta carpeta. El gestor ya funciona: aquí no se desarrolla, se usa.

## Arrancar

```sh
npm run server
```

Interfaz: <http://localhost:8890/task-manager/app-vue.html>

- Node.js 22.5 o superior (usa `node:sqlite`, nativo). Sin dependencias.
- Variables opcionales: `PORT` (por defecto 8890), `TACKS_DB`, `DATA_DIR`, `TK_TIMEOUT_MS`, `DISABLE_TK=1`.

## Qué hay

| Ruta | Qué es |
|---|---|
| `tk` | Binario Linux de tacks 0.2.4. Es de terceros (MIT): no se toca ni se parchea. |
| `.tacks/tacks.db` | Base de **tareas**. La posee `tk` y no se versiona. |
| `data/task-manager.db` | Catálogo de **etiquetas** (nombre, descripción, color). Es nuestro. |
| `server/` | Servidor Node sin dependencias. `tk.js` es la única frontera con el binario. |
| `public/` | La página y el Vue vendorizado. `app-vue.js` y `app-vue.css` son generados: no se editan a mano (aquí no está `src/`, así que no hay `npm run build`). |
| `.agents/skills/tk/SKILL.md` | La skill de agentes para usar `tk` (fuera de esta carpeta, en el proyecto). |

Falta el binario de Windows (`tk.exe`): desde Windows este servidor no arrancaría.

## Reglas

- Tareas siempre con `--json` y con `--db` explícito, desde esta carpeta:
  `./tk --db .tacks/tacks.db --json list`.
- La base de tareas pertenece a `tk`: se escribe por su CLI, nunca con SQL
  nuestro. El catálogo de etiquetas sí es nuestro.
- `tk` no borra ni reabre: se cierra con motivo; reabrir es `update <id> -s open`.
- Una sola instancia del servidor sobre la misma base.
- El cierre de una tarea lo decide el usuario, no el agente.
- Commit en inglés, documentación en español. Sin `push` sin autorización.
