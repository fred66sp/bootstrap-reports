package main

import (
	"fmt"
	"io/fs"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"testing"
	"testing/fstest"
)

// jet escapes interpolated values with text/template.HTMLEscape, which is a
// generic HTML escaper: it covers NUL, `"`, `'`, `&`, `<` and `>`, and it is not
// contextual like html/template's escaper. That difference is only safe while
// the data actually interpolated into a JavaScript context cannot break out of
// it, so both halves of that condition are guarded below.
var jsLiteralInterpolation = regexp.MustCompile(`'\s*(\{\{[^{}]*\}\})\s*'`)

// The single-quoted Alpine expressions that receive server data today. Adding
// another one must be a deliberate decision: it widens the surface where Jet's
// HTML-only escaping is the only protection.
var jsLiteralExpressions = []string{
	`{{ .Messages["live"] }}`,
	`{{ .Messages["reconnecting"] }}`,
	`{{ .Service.ID }}`,
	`{{ .Service.Name }}`,
}

func readEmbeddedViews(t *testing.T) map[string]string {
	t.Helper()
	views := make(map[string]string)
	err := fs.WalkDir(viewFiles, "web/views", func(viewPath string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil || entry.IsDir() {
			return walkErr
		}
		content, readErr := fs.ReadFile(viewFiles, viewPath)
		if readErr != nil {
			return readErr
		}
		views[viewPath] = string(content)
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(views) == 0 {
		t.Fatal("no views found in the embedded file system")
	}
	return views
}

func TestAlpineJSLiteralInterpolationsStaySafe(t *testing.T) {
	found := make(map[string]int)
	for viewPath, content := range readEmbeddedViews(t) {
		for _, match := range jsLiteralInterpolation.FindAllStringSubmatch(content, -1) {
			found[strings.TrimSpace(match[1])]++
		}
		if strings.Contains(content, ".jetjet") {
			t.Errorf("%s looks corrupted", viewPath)
		}
	}

	expected := make(map[string]bool, len(jsLiteralExpressions))
	for _, expression := range jsLiteralExpressions {
		expected[expression] = true
	}
	for expression, count := range found {
		if !expected[expression] {
			t.Errorf("new interpolation %s wrapped in single quotes: it sends server data into a JavaScript literal, where Jet only guarantees HTML escaping; review the value and extend jsLiteralExpressions", expression)
		} else if count > 1 && expression != `{{ .Service.ID }}` {
			t.Errorf("interpolation %s appears %d times", expression, count)
		}
	}
	for expression := range expected {
		if found[expression] == 0 {
			t.Errorf("expected interpolation %s is no longer used; update jsLiteralExpressions", expression)
		}
	}

	// A single quote, a backslash or a line break inside any of these values
	// would terminate the JavaScript literal that Jet escapes as HTML only.
	guarded := make(map[string]string)
	for lang, table := range messageTable {
		for _, key := range []string{"live", "reconnecting"} {
			guarded[fmt.Sprintf("messageTable[%s][%q]", lang, key)] = table[key]
		}
	}
	for _, current := range newStateStore().snapshot() {
		guarded["service ID "+current.ID] = current.ID
		guarded["service name "+current.Name] = current.Name
	}
	for origin, value := range guarded {
		if strings.ContainsAny(value, "'\\\n\r") {
			t.Errorf("%s = %q contains a character that would break out of the single-quoted Alpine JavaScript literal it is interpolated into", origin, value)
		}
	}
}

func TestMessageTablesKeepTheSameKeys(t *testing.T) {
	spanish, english := messageTable[languageSpanish], messageTable[languageEnglish]
	if len(spanish) == 0 {
		t.Fatal("the Spanish table is empty")
	}
	if len(spanish) != len(english) {
		t.Errorf("table sizes differ: %d Spanish keys, %d English keys", len(spanish), len(english))
	}
	for key := range spanish {
		if _, ok := english[key]; !ok {
			t.Errorf("key %q exists in Spanish but not in English", key)
		}
	}
	for key := range english {
		if _, ok := spanish[key]; !ok {
			t.Errorf("key %q exists in English but not in Spanish", key)
		}
	}
	for lang, table := range messageTable {
		for key, value := range table {
			if strings.TrimSpace(value) == "" {
				t.Errorf("messageTable[%s][%q] is empty", lang, key)
			}
		}
	}
}

func TestViewEscapesHTMLMetacharacters(t *testing.T) {
	hostile := service{
		ID:     `x"><img src=x onerror=alert(1)>`,
		Name:   `<script>alert('xss')</script>`,
		Status: statusOnline,
		CPU:    40,
		RAM:    50,
		Logs:   []string{`</li><script>alert("log")</script>&`},
	}
	app := newApplication()
	view := serviceViews([]service{hostile}, false, languageEnglish)[0]

	rendered := make(map[string]string)
	for _, viewPath := range []string{"fragments/card-surface.jet", "fragments/metrics.jet", "fragments/logs.jet", "fragments/status.jet", "partials/server-card.jet"} {
		output, err := app.render(viewPath, view)
		if err != nil {
			t.Fatalf("render %s: %v", viewPath, err)
		}
		rendered[viewPath] = output.String()
	}

	for viewPath, output := range rendered {
		for _, raw := range []string{"<script>", "</script>", "<img"} {
			if strings.Contains(output, raw) {
				t.Errorf("%s leaked %q from interpolated data", viewPath, raw)
			}
		}
	}
	if !strings.Contains(rendered["fragments/logs.jet"], "&lt;script&gt;alert(&#34;log&#34;)&lt;/script&gt;&amp;") {
		t.Errorf("log line not escaped: %q", rendered["fragments/logs.jet"])
	}
	card := rendered["fragments/card-surface.jet"]
	if !strings.Contains(card, "data-dialog-title=\"&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt; · Help\"") {
		t.Errorf("service name not escaped inside an attribute: %q", card)
	}
	if !strings.Contains(card, "data-service-id=\"x&#34;&gt;&lt;img src=x onerror=alert(1)&gt;\"") {
		t.Errorf("service id not escaped inside an attribute: %q", card)
	}

	// Documented limitation, asserted so it cannot change silently: inside the
	// single-quoted JavaScript literal of an Alpine expression, Jet's HTML
	// escaping is not a JavaScript guarantee. The escape round-trips through the
	// HTML parser (&#39; decodes back to a bare quote) before Alpine evaluates the
	// expression. Escaping still keeps the value inside the HTML attribute, and
	// the safety of these slots rests on the value guard in
	// TestAlpineJSLiteralInterpolationsStaySafe.
	column := rendered["partials/server-card.jet"]
	if !strings.Contains(column, `x-show="match('&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;')"`) {
		t.Errorf("column x-show no longer HTML-escapes the service name as expected: %q", column)
	}
}

func TestBrokenViewFailsAtConstruction(t *testing.T) {
	files := fstest.MapFS{
		"pages/index.jet":  {Data: []byte(`<!doctype html><html><body>ok</body></html>`)},
		"pages/broken.jet": {Data: []byte(`<html>{{ if }}unclosed`)},
	}
	_, err := newApplicationFromViews(files)
	if err == nil {
		t.Fatal("a view with a syntax error must fail at construction, not on the first request")
	}
	if !strings.Contains(err.Error(), "pages/broken.jet") {
		t.Fatalf("construction error must name the failing view, got: %v", err)
	}
}

func TestMissingIncludedViewDoesNotWritePartialOutput(t *testing.T) {
	// Jet resolves include paths at render time, so this case cannot be caught
	// at construction: the handler has to fail without leaking half a document.
	files := fstest.MapFS{
		"pages/index.jet": {Data: []byte(`<!doctype html><html><body><h1>leaked</h1>{{ include "/fragments/missing.jet" . }}</body></html>`)},
	}
	app, err := newApplicationFromViews(files)
	if err != nil {
		t.Fatalf("construction must succeed for a missing include: %v", err)
	}
	response := httptest.NewRecorder()
	app.handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/", nil))
	if response.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500", response.Code)
	}
	if body := response.Body.String(); body != "template rendering failed\n" {
		t.Fatalf("body = %q, want only the error text: rendering is buffered and must not write partial HTML", body)
	}
}

func TestConcurrentRenderingMatchesFrozenBaseline(t *testing.T) {
	app := newApplication()
	pageFrozen, err := os.ReadFile(filepath.Join("testdata", "page-es.golden"))
	if err != nil {
		t.Fatal(err)
	}
	tickFrozen, err := os.ReadFile(filepath.Join("testdata", "tick-steady-es.golden"))
	if err != nil {
		t.Fatal(err)
	}

	const workers, rounds = 16, 20
	mismatches := make(chan string, workers*rounds)
	var group sync.WaitGroup
	for range workers {
		group.Add(1)
		go func() {
			defer group.Done()
			for range rounds {
				response := httptest.NewRecorder()
				app.handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/", nil))
				if got := response.Body.String(); got != string(pageFrozen) {
					mismatches <- "page: " + describeFirstDifference(string(pageFrozen), got)
					return
				}

				services := app.store.snapshot()
				fillLogRing(services)
				lastStatus := make(map[string]serviceStatus, len(services))
				for _, current := range services {
					lastStatus[current.ID] = current.Status
				}
				// The shared template set must also survive concurrent lookups
				// and executions, because every open SSE connection renders.
				frame, renderErr := app.renderTick(languageSpanish, services, lastStatus)
				if renderErr != nil {
					mismatches <- "tick render: " + renderErr.Error()
					return
				}
				if frame != string(tickFrozen) {
					mismatches <- "tick: " + describeFirstDifference(string(tickFrozen), frame)
					return
				}
			}
		}()
	}
	group.Wait()
	close(mismatches)
	for mismatch := range mismatches {
		t.Error(mismatch)
	}
}
