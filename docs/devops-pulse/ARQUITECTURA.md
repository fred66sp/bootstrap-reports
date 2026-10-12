# Arquitectura de DevOps Pulse

¿Por qué DevOps Pulse está construido con un servidor Go HTML-first, HTMX, Alpine.js, SSE y Bootstrap 6?

Esta explicación amplía el [README de DevOps Pulse](../../devops-pulse/README.md) y se complementa con la [referencia técnica](REFERENCIA.md).

## Arquitectura

El reparto de responsabilidades es este:

- `main.go` contiene el modelo de dominio, un almacén de estado en memoria protegido por un mutex, el conjunto de vistas templ, los handlers y la conexión del servidor.
- `GET /metrics` envía HTML renderizado por el servidor mediante SSE, comprimido con gzip cuando el cliente anuncia gzip. La cuadrícula usa `hx-swap="none"`; cada frame envía métricas completas por servicio y fragmentos OOB del contenedor de logs, mientras que el estado solo se envía cuando cambia para esa conexión. No se analiza JSON en el navegador y las raíces de las tarjetas y los formularios del pie sobreviven a cada tick. El español es el idioma predeterminado resuelto por el servidor; los valores válidos de consulta `lang` persisten en una cookie y el mismo idioma se transmite por el flujo SSE y el formulario de alternancia.
- Un modelo `views.ServiceView` y un fragmento templ por elemento renderizan la tarjeta inicial, los elementos SSE OOB y la respuesta de alternancia. El flag `OutOfBand` añade `hx-swap-oob` solo a la salida SSE. Las métricas usan recorridos aleatorios acotados; cada servicio conserva seis líneas de log simples y cada conexión SSE registra los estados que ha enviado.
- El estado de Alpine envuelve la barra de herramientas y la cuadrícula estable. Los logs se clonan desde el `<div>` oculto de cada tarjeta al diálogo compartido sin `x-html` ni `innerHTML` con datos del servidor.
- Las API ESM `Dialog` y `Toast` de Bootstrap 6 gestionan el diálogo y la notificación de alternancia. La página usa `data-bs-theme` para los modos claro y oscuro; la elección se aplica antes del pintado y persiste en el almacenamiento local.

## Decisiones sobre activos de Alpine y SSE

Se usa la estrategia ESM preferida de Alpine: `alpinejs/dist/module.esm.js` se copia a `web/static/vendor/alpine.module.esm.js`, `app.js` lo importa y se inicia después de registrar `pulseDashboard`. El código fuente no contiene líneas de importación desnudas: `grep -nE "(^import |from ['\"]|require\\()" node_modules/alpinejs/dist/module.esm.js` no devolvió coincidencias.

El directorio de extensión SSE contiene `sse.esm.js`, `sse.js`, `sse.min.js` y `sse.min.js.gz` (`ls -l node_modules/htmx-ext-sse/dist`). El script de sincronización detecta y copia el `sse.min.js` minificado como `htmx-ext-sse.min.js`.

---

**Dueño:** Alfredo González P. · **Última revisión:** 2026-10-12 · **Próxima revisión:** 2027-04-12