package main

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"maps"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"testing"

	"devops-pulse/web/views"
	"github.com/a-h/templ"
)

var jsContextAttribute = regexp.MustCompile(`(?:[:@][A-Za-z0-9*.-]+|x-text|x-show|x-model|hx-vals|x-bind:[A-Za-z0-9-]+)\s*=\{`)

func readEmbeddedViews(t *testing.T) map[string]string {
	t.Helper()
	result := make(map[string]string)
	err := fs.WalkDir(os.DirFS("web/views"), ".", func(path string, entry fs.DirEntry, walkErr error) error {
		if walkErr != nil || entry.IsDir() || !strings.HasSuffix(path, ".templ") {
			return walkErr
		}
		content, err := os.ReadFile(filepath.Join("web/views", path))
		if err != nil {
			return err
		}
		result[path] = string(content)
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(result) == 0 {
		t.Fatal("no templ views found on disk")
	}
	return result
}

func TestAlpineJSLiteralInterpolationsStaySafe(t *testing.T) {
	found := map[string]bool{}
	for _, content := range readEmbeddedViews(t) {
		for _, match := range jsContextAttribute.FindAllString(content, -1) {
			found[strings.TrimSpace(strings.Split(match, "=")[0])] = true
		}
	}
	expected := map[string]bool{"x-text": true, "x-show": true, "@click": true, "hx-vals": true}
	if !maps.Equal(found, expected) {
		t.Fatalf("JavaScript-context expression attributes changed: got %v, want %v", found, expected)
	}

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
			t.Errorf("%s = %q contains a character that would break out of the single-quoted Alpine JavaScript literal", origin, value)
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
	hostile := views.ServiceView{ID: `x"><img src=x onerror=alert(1)>`, Name: `<script>alert('xss')</script>`, Status: "Online", CPU: 40, RAM: 50, Logs: []string{`</li><script>alert("log")</script>&`}, Messages: views.Messages(messageTable[languageEnglish]), Language: "en", StatusLabel: "Online", LogsTitle: `<script>alert('xss')</script> · Logs`, HelpTitle: `<script>alert('xss')</script> · Help`, HelpLabel: `Help for <script>alert('xss')</script>`}
	app := newApplication()
	render := func(component templ.Component) string {
		output, err := app.renderComponent(component)
		if err != nil {
			t.Fatalf("render: %v", err)
		}
		return output.String()
	}
	rendered := map[string]string{"card": render(views.CardSurface(hostile)), "metrics": render(views.Metrics(hostile)), "logs": render(views.Logs(hostile)), "status": render(views.Status(hostile)), "card-wrapper": render(views.ServerCard(hostile))}
	for viewPath, output := range rendered {
		for _, raw := range []string{"<script>", "</script>", "<img"} {
			if strings.Contains(output, raw) {
				t.Errorf("%s leaked %q from interpolated data", viewPath, raw)
			}
		}
	}
	if !strings.Contains(rendered["logs"], "&lt;script&gt;alert(&#34;log&#34;)&lt;/script&gt;&amp;") {
		t.Errorf("log line not escaped: %q", rendered["logs"])
	}
	if !strings.Contains(rendered["card"], "data-dialog-title=\"&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt; · Help\"") {
		t.Errorf("service name not escaped inside an attribute: %q", rendered["card"])
	}
	if !strings.Contains(rendered["card"], "data-service-id=\"x&#34;&gt;&lt;img src=x onerror=alert(1)&gt;\"") {
		t.Errorf("service id not escaped inside an attribute: %q", rendered["card"])
	}
	if !strings.Contains(rendered["card-wrapper"], `x-show="match(&#39;&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;&#39;)"`) {
		t.Errorf("column x-show no longer escapes the service name as expected: %q", rendered["card-wrapper"])
	}
}

// TestRenderComponentPropagatesErrors replaces the old runtime-view-loading case:
// templ resolves composition at compile time, so the only remaining render failure
// is a component that returns an error. Handlers write the buffer only after the
// error check, so a failure never reaches the client as partial HTML.
func TestRenderComponentPropagatesErrors(t *testing.T) {
	app := newApplication()
	component := templ.ComponentFunc(func(_ context.Context, _ io.Writer) error { return fmt.Errorf("render failed") })
	output, err := app.renderComponent(component)
	if err == nil {
		t.Fatal("expected component render error")
	}
	if output.Len() != 0 {
		t.Fatalf("output = %q, want no partial HTML", output.String())
	}
}

// The frozen golden bytes in testdata/ are the rendering contract; this test only
// asserts that concurrent rendering is stable.
func TestConcurrentRenderingIsDeterministic(t *testing.T) {
	app := newApplication()
	services := app.store.snapshot()
	pageOutput, err := app.renderComponent(views.Index("es", views.Messages(messageTable[languageSpanish]), serviceViews(services, false, languageSpanish)))
	if err != nil {
		t.Fatal(err)
	}
	fillLogRing(services)
	lastStatus := make(map[string]serviceStatus, len(services))
	for _, current := range services {
		lastStatus[current.ID] = current.Status
	}
	tickReference, err := app.renderTick(languageSpanish, services, lastStatus)
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
				page, renderErr := app.renderComponent(views.Index("es", views.Messages(messageTable[languageSpanish]), serviceViews(app.store.snapshot(), false, languageSpanish)))
				if renderErr != nil {
					mismatches <- "page render: " + renderErr.Error()
					return
				}
				if page.String() != pageOutput.String() {
					mismatches <- "page: " + describeFirstDifference(pageOutput.String(), page.String())
					return
				}
				frame, renderErr := app.renderTick(languageSpanish, services, lastStatus)
				if renderErr != nil {
					mismatches <- "tick render: " + renderErr.Error()
					return
				}
				if frame != tickReference {
					mismatches <- "tick: " + describeFirstDifference(tickReference, frame)
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
