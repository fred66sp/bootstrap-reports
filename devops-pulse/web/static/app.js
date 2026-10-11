import Alpine from './vendor/alpine.module.esm.js'
import { Dialog, Toast } from './vendor/bootstrap.bundle.min.js'

window.Alpine = Alpine
Alpine.data('pulseDashboard', () => ({
  query: '',
  connected: false,
  theme: 'light',
  init() {
    const current = document.documentElement.getAttribute('data-bs-theme')
    this.theme = current === 'dark' ? 'dark' : 'light'
    document.addEventListener('htmx:sseOpen', () => { this.connected = true })
    document.addEventListener('htmx:sseClose', () => { this.connected = false })
    document.addEventListener('htmx:sseError', () => { this.connected = false })
  },
  match(name) {
    return name.toLowerCase().includes(this.query.trim().toLowerCase())
  },
  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return
    this.theme = theme
    document.documentElement.setAttribute('data-bs-theme', theme)
    try { localStorage.setItem('devops-pulse-theme', theme) } catch (e) { /* ignore */ }
  },
  openLogs(id) {
    const holder = document.getElementById(`logs-${id}`)
    const body = document.getElementById('logs-body')
    const dialog = document.getElementById('logs-dialog')
    if (!holder || !body || !dialog) return
    const trigger = document.querySelector(`[data-dialog-title][data-service-id="${CSS.escape(id)}"]`)
    document.getElementById('logs-title').textContent = trigger?.dataset.dialogTitle || document.getElementById('logs-title').textContent
    body.replaceChildren(...[...holder.children].map(node => node.cloneNode(true)))
    Dialog.getOrCreateInstance(dialog).show()
  },
  notify(detail) {
    const status = detail?.status || 'Offline'
    const toast = document.getElementById('pulse-toast')
    const body = document.getElementById('pulse-toast-body')
    if (!toast || !body) return
    toast.classList.toggle('theme-success', status === 'Online')
    toast.classList.toggle('theme-danger', status !== 'Online')
    body.textContent = detail?.message || ''
    Toast.getOrCreateInstance(toast, { delay: 4000 }).show()
  }
}))
Alpine.start()
