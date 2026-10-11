package main

import (
	"bufio"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"
	"time"
)

func TestStateRandomWalkAndToggle(t *testing.T) {
	store := newStateStore()
	for range 100 {
		store.advanceMetrics()
		for _, service := range store.snapshot() {
			if service.CPU < 2 || service.CPU > 98 || service.RAM < 2 || service.RAM > 98 {
				t.Fatalf("metrics out of bounds: %+v", service)
			}
		}
	}

	before, ok := store.toggle("api-gateway")
	if !ok || before.Status != statusOffline {
		t.Fatalf("expected api-gateway to become offline, got %+v", before)
	}
	if _, ok := store.toggle("missing"); ok {
		t.Fatal("unknown service was accepted")
	}
}

func TestIndexRendersDashboard(t *testing.T) {
	response := httptest.NewRecorder()
	newApplication().handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/", nil))
	body := response.Body.String()
	for _, want := range []string{"API Gateway", "<html lang=\"es\">", "sse-connect=\"/metrics?lang=es\"", "role=\"progressbar\"", "class=\"site-header\"", "class=\"brand__mark\"", "data-theme-option=\"light\"", "data-theme-option=\"dark\""} {
		if !strings.Contains(body, want) {
			t.Errorf("index missing %q", want)
		}
	}
	if got := strings.Count(body, `class="segmented__option`); got != 4 {
		t.Fatalf("expected four segmented options, got %d", got)
	}
	if got := regexp.MustCompile(`<a class="segmented__option[^\"]*"`).FindAllString(body, -1); len(got) != 2 {
		t.Fatalf("expected two language segmented anchors, got %d", len(got))
	}
	if got := regexp.MustCompile(`<button type="button" class="segmented__option[^\"]*"`).FindAllString(body, -1); len(got) != 2 {
		t.Fatalf("expected two theme segmented buttons, got %d", len(got))
	}
	if got := regexp.MustCompile(`<a class="segmented__option[^\"]*is-active[^\"]*"[^>]*aria-current="true"`).FindAllString(body, -1); len(got) != 1 {
		t.Fatalf("expected one active language with aria-current, got %d", len(got))
	}
	if strings.Contains(body, `hx-swap-oob="true"`) {
		t.Fatal("initial page must not contain hx-swap-oob")
	}
	for _, service := range newStateStore().snapshot() {
		for _, id := range []string{"status-" + service.ID, "metrics-" + service.ID, "logs-" + service.ID, "help-" + service.ID} {
			if !strings.Contains(body, `id="`+id+`"`) {
				t.Errorf("index missing target %q", id)
			}
		}
		if !strings.Contains(body, `data-dialog-title="`+service.Name+` · Ayuda"`) {
			t.Errorf("index missing Spanish help title for %q", service.ID)
		}
		if !strings.Contains(body, `aria-label="Ayuda sobre `+service.Name+`"`) {
			t.Errorf("index missing Spanish help label for %q", service.ID)
		}
	}
}

func TestActiveLanguageFollowsQuery(t *testing.T) {
	response := httptest.NewRecorder()
	newApplication().handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/?lang=en", nil))
	body := response.Body.String()
	if !strings.Contains(body, `<a class="segmented__option is-active" href="?lang=en" hreflang="en" aria-current="true">EN</a>`) {
		t.Fatal("English language option should be active for ?lang=en")
	}
	if strings.Contains(body, `<a class="segmented__option is-active" href="?lang=es"`) {
		t.Fatal("Spanish language option should not be active for ?lang=en")
	}
}

func TestHelpIsLocalizedInEnglish(t *testing.T) {
	response := httptest.NewRecorder()
	newApplication().handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/?lang=en", nil))
	body := response.Body.String()
	for _, service := range newStateStore().snapshot() {
		if !strings.Contains(body, `id="help-`+service.ID+`"`) || !strings.Contains(body, `data-dialog-title="`+service.Name+` · Help"`) || !strings.Contains(body, `aria-label="Help for `+service.Name+`"`) {
			t.Errorf("English help is incomplete for %q", service.ID)
		}
	}
}

func TestLanguageResolution(t *testing.T) {
	tests := []struct {
		name, target, cookie, wantLang, wantText string
	}{
		{"default", "/", "", "es", "Sala de control"},
		{"query english", "/?lang=en", "", "en", "Control room"},
		{"invalid query", "/?lang=de", "", "es", "Sala de control"},
		{"cookie english", "/", "devops-pulse-lang=en", "en", "Control room"},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodGet, test.target, nil)
			if test.cookie != "" {
				request.Header.Set("Cookie", test.cookie)
			}
			response := httptest.NewRecorder()
			newApplication().handler().ServeHTTP(response, request)
			body := response.Body.String()
			if response.Code != http.StatusOK || !strings.Contains(body, `<html lang="`+test.wantLang+`">`) || !strings.Contains(body, test.wantText) {
				t.Fatalf("unexpected language response: %d %s", response.Code, body)
			}
			if test.name == "query english" && !strings.Contains(response.Header().Get("Set-Cookie"), "devops-pulse-lang=en") {
				t.Fatal("query language must persist a cookie")
			}
			if test.name != "query english" && response.Header().Get("Set-Cookie") != "" {
				t.Fatal("cookie must not be set without a valid query")
			}
		})
	}
}

func TestIndexThemeBootstrapIsThemeNeutral(t *testing.T) {
	response := httptest.NewRecorder()
	newApplication().handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/", nil))
	body := response.Body.String()
	for _, want := range []string{"data-theme-option=\"light\"", "data-theme-option=\"dark\"", "localStorage.getItem('devops-pulse-theme')"} {
		if !strings.Contains(body, want) {
			t.Errorf("index missing theme marker %q", want)
		}
	}
	if strings.Contains(body, `data-bs-theme="dark"`) {
		t.Fatal("server-rendered index must not bake in dark theme")
	}
}

func TestCardHeaderStaysARow(t *testing.T) {
	response := httptest.NewRecorder()
	newApplication().handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/", nil))
	body := response.Body.String()
	if !strings.Contains(body, `class="card-header d-flex flex-row`) {
		t.Fatal("Bootstrap 6 makes .card-header a column flex container, so the header needs flex-row explicitly; without it the title, badge and help trigger stack and centre")
	}
}

func TestCardSurfaceIsNotTheGridColumn(t *testing.T) {
	response := httptest.NewRecorder()
	newApplication().handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/", nil))
	body := response.Body.String()
	if strings.Contains(body, `class="card service-card col-`) {
		t.Fatal("the card surface must not carry grid column classes: the column gutter would be painted inside the card and adjacent cards would touch")
	}
	if !strings.Contains(body, `<div class="col-12 md:col-6 xl:col-4" x-show=`) {
		t.Fatal("missing the column wrapper that owns the gutter")
	}
	if !strings.Contains(body, `class="row g-7"`) {
		t.Fatal("the grid must use the 1.5rem gutter of the v6 spacing scale (g-7)")
	}
}

func TestMetricsSSEUsesRequestedLanguage(t *testing.T) {
	for _, test := range []struct{ lang, want string }{{"en", "Memory"}, {"es", "Memoria"}} {
		t.Run(test.lang, func(t *testing.T) {
			application := newApplication()
			server := httptest.NewServer(application.handler())
			defer server.Close()
			response, err := http.Get(server.URL + "/metrics?lang=" + test.lang)
			if err != nil {
				t.Fatal(err)
			}
			defer response.Body.Close()
			reader := bufio.NewReader(response.Body)
			var frame strings.Builder
			for {
				line, readErr := reader.ReadString('\n')
				if readErr != nil {
					t.Fatal(readErr)
				}
				frame.WriteString(line)
				if line == "\n" {
					break
				}
			}
			if !strings.Contains(frame.String(), test.want) {
				t.Fatalf("SSE frame missing %q: %s", test.want, frame.String())
			}
		})
	}
}

func TestMetricsSSECanBeCancelledAfterInitialFrame(t *testing.T) {
	application := newApplication()
	server := httptest.NewServer(application.handler())
	defer server.Close()

	ctx, cancel := context.WithCancel(context.Background())
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL+"/metrics", nil)
	if err != nil {
		t.Fatal(err)
	}
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	if got := response.Header.Get("Content-Type"); got != "text/event-stream" {
		t.Fatalf("content type = %q", got)
	}

	reader := bufio.NewReader(response.Body)
	var frame strings.Builder
	deadline := time.After(time.Second)
	for {
		line := make(chan string, 1)
		go func() {
			value, _ := reader.ReadString('\n')
			line <- value
		}()
		select {
		case value := <-line:
			frame.WriteString(value)
			if value == "\n" {
				cancel()
				body := frame.String()
				if !strings.Contains(body, "event: metrics") || !strings.Contains(body, "data: ") {
					t.Fatal("initial SSE frame is missing event or data")
				}
				for _, service := range application.store.snapshot() {
					if strings.Contains(body, `help-`+service.ID) {
						t.Errorf("SSE frame must not contain help holder %q", service.ID)
					}
					for _, id := range []string{"status-" + service.ID, "metrics-" + service.ID, "logs-" + service.ID} {
						oobAttribute := `id="` + id + `" hx-swap-oob="true"`
						if strings.HasPrefix(id, "logs-") {
							oobAttribute = `id="` + id + `" hidden hx-swap-oob="true"`
						}
						if !strings.Contains(body, oobAttribute) {
							t.Errorf("SSE frame missing OOB target %q", id)
						}
					}
				}
				return
			}
		case <-deadline:
			cancel()
			t.Fatal("timed out waiting for initial SSE frame")
		}
	}
}

func TestToggleTriggerHeaderStaysASCII(t *testing.T) {
	application := newApplication()
	request := httptest.NewRequest(http.MethodPost, "/toggle-service?lang=es", strings.NewReader("id=api-gateway"))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	response := httptest.NewRecorder()
	application.handler().ServeHTTP(response, request)

	header := response.Header().Get("HX-Trigger")
	for index := 0; index < len(header); index++ {
		if header[index] > 0x7F {
			t.Fatalf("HX-Trigger must stay ASCII; byte %#x at offset %d in %q", header[index], index, header)
		}
	}
	var trigger map[string]map[string]string
	if err := json.Unmarshal([]byte(header), &trigger); err != nil {
		t.Fatalf("invalid HX-Trigger: %v", err)
	}
	if message := trigger["pulse-toggled"]["message"]; !strings.Contains(message, "está") {
		t.Fatalf("decoded message lost its accent: %q", message)
	}
}

func TestToggleReturnsCardAndTrigger(t *testing.T) {
	application := newApplication()
	request := httptest.NewRequest(http.MethodPost, "/toggle-service", strings.NewReader("id=api-gateway&lang=en"))
	request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	response := httptest.NewRecorder()
	application.handler().ServeHTTP(response, request)

	body := response.Body.String()
	if response.Code != http.StatusOK || !strings.Contains(body, "API Gateway") {
		t.Fatalf("unexpected toggle response: %d %s", response.Code, body)
	}
	if !strings.Contains(body, `class="card service-card`) {
		t.Fatal("toggle response must carry the card surface")
	}
	if strings.Contains(body, `class="col-12`) {
		t.Fatal("toggle response must not carry grid columns: the swap target is the card surface inside the existing column")
	}
	if strings.Contains(body, "hx-swap-oob") {
		t.Fatal("toggle response must not contain hx-swap-oob")
	}
	if !strings.Contains(body, `id="help-api-gateway"`) {
		t.Fatal("toggle response must carry the help holder")
	}
	var trigger map[string]map[string]string
	if err := json.Unmarshal([]byte(response.Header().Get("HX-Trigger")), &trigger); err != nil {
		t.Fatalf("invalid HX-Trigger: %v", err)
	}
	if trigger["pulse-toggled"]["status"] != "Offline" {
		t.Fatalf("unexpected trigger: %v", trigger)
	}
	if !strings.Contains(trigger["pulse-toggled"]["message"], "is now offline.") {
		t.Fatalf("expected English message, got %v", trigger)
	}
}
