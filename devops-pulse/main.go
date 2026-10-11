package main

import (
	"bytes"
	"context"
	"embed"
	"encoding/json"
	"flag"
	"fmt"
	"html/template"
	"log/slog"
	"math/rand/v2"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"sync"
	"syscall"
	"time"
)

//go:embed web/templates
var templateFiles embed.FS

type serviceStatus string

const (
	statusOnline  serviceStatus = "Online"
	statusOffline serviceStatus = "Offline"
)

type language string

const (
	languageSpanish language = "es"
	languageEnglish language = "en"
)

type messages map[string]string

var messageTable = map[language]messages{
	languageSpanish: {
		"title": "DevOps Pulse · Panel de servicios", "tagline": "operaciones / telemetría en vivo", "theme group label": "Tema de color", "theme light": "Claro", "theme light label": "Usar tema claro", "theme dark": "Oscuro", "theme dark label": "Usar tema oscuro", "language group label": "Idioma", "eyebrow": "Sala de control", "heading": "Salud de los servicios, sin ruido.", "subtitle": "Una vista en vivo de los sistemas que sostienen tu entrega.", "search label": "Filtrar servicios", "updates": "Se actualiza cada 2 segundos", "live": "En vivo", "reconnecting": "Reconectando", "cpu": "CPU", "ram": "Memoria", "view logs": "Ver registros", "toggle": "Cambiar estado", "logs fallback title": "Registros del servicio", "logs title": "%s · Registros", "close": "Cerrar", "toast header": "Actualización del servicio", "status online": "En línea", "status offline": "Desconectado", "toast message": "%s ahora está %s.",
	},
	languageEnglish: {
		"title": "DevOps Pulse · Service dashboard", "tagline": "operations / live telemetry", "theme group label": "Color theme", "theme light": "Light", "theme light label": "Use light theme", "theme dark": "Dark", "theme dark label": "Use dark theme", "language group label": "Language", "eyebrow": "Control room", "heading": "Service health, without the noise.", "subtitle": "A live view of the systems keeping your delivery moving.", "search label": "Filter services", "updates": "Updates every 2 seconds", "live": "Live", "reconnecting": "Reconnecting", "cpu": "CPU", "ram": "Memory", "view logs": "View logs", "toggle": "Toggle", "logs fallback title": "Service logs", "logs title": "%s · Logs", "close": "Close", "toast header": "Service update", "status online": "Online", "status offline": "Offline", "toast message": "%s is now %s.",
	},
}

func resolveLanguage(r *http.Request) (language, bool) {
	if value := r.URL.Query().Get("lang"); value == string(languageSpanish) || value == string(languageEnglish) {
		return language(value), true
	}
	if cookie, err := r.Cookie("devops-pulse-lang"); err == nil && (cookie.Value == string(languageSpanish) || cookie.Value == string(languageEnglish)) {
		return language(cookie.Value), false
	}
	return languageSpanish, false
}

func persistLanguageCookie(w http.ResponseWriter, lang language) {
	http.SetCookie(w, &http.Cookie{Name: "devops-pulse-lang", Value: string(lang), Path: "/", MaxAge: 365 * 24 * 60 * 60, SameSite: http.SameSiteLaxMode})
}

func localizedStatus(status serviceStatus, lang language) string {
	if status == statusOnline {
		return messageTable[lang]["status online"]
	}
	return messageTable[lang]["status offline"]
}

type service struct {
	ID      string
	Name    string
	Status  serviceStatus
	CPU     int
	RAM     int
	Logs    []string
	logTick int
}

type stateStore struct {
	mu       sync.RWMutex
	services []service
}

func newStateStore() *stateStore {
	return &stateStore{services: []service{
		{ID: "api-gateway", Name: "API Gateway", Status: statusOnline, CPU: 34, RAM: 48, Logs: []string{"09:41:02 request router ready"}},
		{ID: "checkout", Name: "Checkout API", Status: statusOnline, CPU: 62, RAM: 57, Logs: []string{"09:41:02 payment queue healthy"}},
		{ID: "worker-east", Name: "Worker East", Status: statusOnline, CPU: 27, RAM: 39, Logs: []string{"09:41:02 job runner waiting"}},
		{ID: "worker-west", Name: "Worker West", Status: statusOffline, CPU: 8, RAM: 31, Logs: []string{"09:41:02 deployment paused"}},
	}}
}

func (s *stateStore) snapshot() []service {
	s.mu.RLock()
	defer s.mu.RUnlock()
	services := make([]service, len(s.services))
	for i, current := range s.services {
		services[i] = current
		services[i].Logs = append([]string(nil), current.Logs...)
	}
	return services
}

func (s *stateStore) advanceMetrics() {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.services {
		service := &s.services[i]
		service.CPU = clamp(service.CPU + jitter(9))
		service.RAM = clamp(service.RAM + jitter(7))
		service.logTick++
		messages := []string{"health probe acknowledged", "latency sample recorded", "metrics window rotated", "worker heartbeat received"}
		line := fmt.Sprintf("%s %s", time.Now().Format("15:04:05"), messages[service.logTick%len(messages)])
		service.Logs = append(service.Logs, line)
		if len(service.Logs) > 6 {
			service.Logs = service.Logs[len(service.Logs)-6:]
		}
	}
}

func (s *stateStore) toggle(id string) (service, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for i := range s.services {
		if s.services[i].ID != id {
			continue
		}
		if s.services[i].Status == statusOnline {
			s.services[i].Status = statusOffline
		} else {
			s.services[i].Status = statusOnline
		}
		return s.services[i], true
	}
	return service{}, false
}

func clamp(value int) int {
	if value < 2 {
		return 2
	}
	if value > 98 {
		return 98
	}
	return value
}

func jitter(span int) int {
	return rand.IntN(span) - span/2
}

type serviceView struct {
	Service     service
	OutOfBand   bool
	Messages    messages
	Language    language
	StatusLabel string
	LogsTitle   string
}

type pageView struct {
	Language language
	Messages messages
	Services []serviceView
}

type application struct {
	store     *stateStore
	templates *template.Template
}

func newApplication() *application {
	templates := template.Must(template.New("index.html").ParseFS(templateFiles, "web/templates/*.html", "web/templates/partials/*.html"))
	return &application{store: newStateStore(), templates: templates}
}

func (a *application) render(name string, data any) (bytes.Buffer, error) {
	var output bytes.Buffer
	err := a.templates.ExecuteTemplate(&output, name, data)
	return output, err
}

func (a *application) handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /", a.index)
	mux.HandleFunc("GET /metrics", a.metrics)
	mux.HandleFunc("POST /toggle-service", a.toggleService)
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { _, _ = w.Write([]byte("ok")) })
	mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServer(http.Dir(filepath.Join("web", "static")))))
	return mux
}

func serviceViews(services []service, outOfBand bool, lang language) []serviceView {
	localized := messageTable[lang]
	views := make([]serviceView, len(services))
	for i, current := range services {
		views[i] = serviceView{Service: current, OutOfBand: outOfBand, Messages: localized, Language: lang, StatusLabel: localizedStatus(current.Status, lang), LogsTitle: fmt.Sprintf(localized["logs title"], current.Name)}
	}
	return views
}

func (a *application) index(w http.ResponseWriter, r *http.Request) {
	lang, fromQuery := resolveLanguage(r)
	if fromQuery {
		persistLanguageCookie(w, lang)
	}
	localized := messageTable[lang]
	output, err := a.render("index.html", pageView{Language: lang, Messages: localized, Services: serviceViews(a.store.snapshot(), false, lang)})
	if err != nil {
		http.Error(w, "template rendering failed", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write(output.Bytes())
}

func (a *application) renderGrid(lang language) (string, error) {
	output, err := a.render("server-grid", pageView{Language: lang, Messages: messageTable[lang], Services: serviceViews(a.store.snapshot(), true, lang)})
	return output.String(), err
}

func writeSSEFrame(w http.ResponseWriter, html string) error {
	if _, err := fmt.Fprint(w, "event: metrics\n"); err != nil {
		return err
	}
	for _, line := range bytes.Split([]byte(html), []byte("\n")) {
		if _, err := fmt.Fprintf(w, "data: %s\n", line); err != nil {
			return err
		}
	}
	_, err := fmt.Fprint(w, "\n")
	return err
}

func (a *application) metrics(w http.ResponseWriter, r *http.Request) {
	lang, fromQuery := resolveLanguage(r)
	if fromQuery {
		persistLanguageCookie(w, lang)
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}
	writeFrame := func() bool {
		html, err := a.renderGrid(lang)
		if err != nil || writeSSEFrame(w, html) != nil {
			return false
		}
		flusher.Flush()
		return true
	}
	if !writeFrame() {
		return
	}
	tick := time.NewTicker(2 * time.Second)
	defer tick.Stop()
	heartbeat := time.NewTicker(15 * time.Second)
	defer heartbeat.Stop()
	for {
		select {
		case <-r.Context().Done():
			return
		case <-tick.C:
			a.store.advanceMetrics()
			if !writeFrame() {
				return
			}
		case <-heartbeat.C:
			if _, err := fmt.Fprint(w, ": keep-alive\n\n"); err != nil {
				return
			}
			flusher.Flush()
		}
	}
}

func (a *application) toggleService(w http.ResponseWriter, r *http.Request) {
	lang, fromQuery := resolveLanguage(r)
	if fromQuery {
		persistLanguageCookie(w, lang)
	}
	if value := r.FormValue("lang"); value == string(languageSpanish) || value == string(languageEnglish) {
		if r.URL.Query().Get("lang") == "" {
			lang = language(value)
		}
	}
	localized := messageTable[lang]
	current, ok := a.store.toggle(r.FormValue("id"))
	if !ok {
		http.Error(w, "unknown service", http.StatusNotFound)
		return
	}
	statusLabel := localizedStatus(current.Status, lang)
	adverbialStatus := map[serviceStatus]string{statusOnline: "online", statusOffline: "offline"}[current.Status]
	if lang == languageSpanish {
		adverbialStatus = map[serviceStatus]string{statusOnline: "en línea", statusOffline: "desconectado"}[current.Status]
	}
	trigger, _ := json.Marshal(map[string]map[string]string{"pulse-toggled": {
		"id": current.ID, "name": current.Name, "status": string(current.Status), "message": fmt.Sprintf(localized["toast message"], current.Name, adverbialStatus), "statusLabel": statusLabel,
	}})
	w.Header().Set("HX-Trigger", string(trigger))
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	output, err := a.render("card-surface", serviceViews([]service{current}, false, lang)[0])
	if err != nil {
		http.Error(w, "template rendering failed", http.StatusInternalServerError)
		return
	}
	_, _ = w.Write(output.Bytes())
}

func expectedAssets() []string {
	return []string{"bootstrap.min.css", "bootstrap.bundle.min.js", "htmx.min.js", "htmx-ext-sse.min.js", "alpine.module.esm.js"}
}

func verifyAssets(staticDir string) error {
	cwd, _ := os.Getwd()
	for _, name := range expectedAssets() {
		assetPath := filepath.Join(staticDir, "vendor", name)
		if _, err := os.Stat(assetPath); err != nil {
			resolvedPath, absErr := filepath.Abs(assetPath)
			if absErr != nil {
				resolvedPath = assetPath
			}
			return fmt.Errorf("missing vendor asset %s at %s (working directory %s); run npm install && npm run sync:assets", name, resolvedPath, cwd)
		}
	}
	return nil
}

func run(ctx context.Context, addr string) error {
	staticDir := filepath.Join("web", "static")
	if err := verifyAssets(staticDir); err != nil {
		return err
	}
	server := &http.Server{Addr: addr, Handler: newApplication().handler()}
	go func() {
		<-ctx.Done()
		_ = server.Shutdown(context.Background())
	}()
	slog.Info("devops-pulse listening", "addr", addr)
	return server.ListenAndServe()
}

func main() {
	addr := flag.String("addr", ":8080", "HTTP listen address")
	flag.Parse()
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()
	if err := run(ctx, *addr); err != nil && err != http.ErrServerClosed {
		slog.Error("server stopped", "error", err)
		os.Exit(1)
	}
}
