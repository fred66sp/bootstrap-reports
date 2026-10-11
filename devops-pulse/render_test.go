package main

import (
	"flag"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

var updateGolden = flag.Bool("update", false, "rewrite the frozen rendering baseline under testdata/")

// The rendered output is frozen as golden files so that swapping the template
// engine is verifiable: the HTML the browser receives must not change. Every
// case goes through an HTTP entry point or a render helper, never through a
// template name, so the baseline stays valid after the engine changes.
//
// All cases are deterministic: they use the seeded store and never call
// advanceMetrics, whose log lines carry a wall-clock timestamp.
func baselineCases(t *testing.T) map[string]func() string {
	t.Helper()

	getBody := func(target string) string {
		response := httptest.NewRecorder()
		newApplication().handler().ServeHTTP(response, httptest.NewRequest(http.MethodGet, target, nil))
		if response.Code != http.StatusOK {
			t.Fatalf("GET %s = %d", target, response.Code)
		}
		return response.Body.String()
	}

	toggleBody := func(form string) string {
		request := httptest.NewRequest(http.MethodPost, "/toggle-service", strings.NewReader(form))
		request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		response := httptest.NewRecorder()
		newApplication().handler().ServeHTTP(response, request)
		if response.Code != http.StatusOK {
			t.Fatalf("POST /toggle-service = %d", response.Code)
		}
		return response.Body.String()
	}

	tick := func(prepare func(services []service)) string {
		app := newApplication()
		services := app.store.snapshot()
		lastStatus := make(map[string]serviceStatus)
		for _, current := range services {
			lastStatus[current.ID] = current.Status
		}
		fillLogRing(services)
		if prepare != nil {
			prepare(services)
		}
		frame, err := app.renderTick(languageSpanish, services, lastStatus)
		if err != nil {
			t.Fatalf("render tick: %v", err)
		}
		return frame
	}

	return map[string]func() string{
		"page-es": func() string { return getBody("/") },
		"page-en": func() string { return getBody("/?lang=en") },
		"toggle-es": func() string {
			return toggleBody("id=api-gateway&lang=es")
		},
		"tick-first-es": func() string {
			app := newApplication()
			services := app.store.snapshot()
			fillLogRing(services)
			frame, err := app.renderTick(languageSpanish, services, map[string]serviceStatus{})
			if err != nil {
				t.Fatalf("render tick: %v", err)
			}
			return frame
		},
		"tick-steady-es": func() string { return tick(nil) },
		"tick-status-change-es": func() string {
			return tick(func(services []service) {
				for i := range services {
					if services[i].ID == "checkout" {
						services[i].Status = statusOffline
					}
				}
			})
		},
	}
}

// fillLogRing rebuilds the log ring the way advanceMetrics leaves it after five
// seconds, but with fixed timestamps. Tests and benchmarks share it so the
// frozen baseline and the measured cost describe the same payload.
func fillLogRing(services []service) {
	lines := []string{"health probe acknowledged", "latency sample recorded", "metrics window rotated", "worker heartbeat received"}
	for i := range services {
		ring := append([]string(nil), services[i].Logs...)
		for n := 1; n < 6; n++ {
			ring = append(ring, fmt.Sprintf("09:41:%02d %s", 2+2*n, lines[n%len(lines)]))
		}
		services[i].Logs = ring
	}
}

func TestRenderedOutputMatchesFrozenBaseline(t *testing.T) {
	for name, render := range baselineCases(t) {
		t.Run(name, func(t *testing.T) {
			path := filepath.Join("testdata", name+".golden")
			got := render()
			if *updateGolden {
				if err := os.MkdirAll("testdata", 0o755); err != nil {
					t.Fatal(err)
				}
				if err := os.WriteFile(path, []byte(got), 0o644); err != nil {
					t.Fatal(err)
				}
				return
			}
			frozen, err := os.ReadFile(path)
			if err != nil {
				t.Fatalf("read frozen baseline %s: %v\nregenerate with: go test -run TestRenderedOutputMatchesFrozenBaseline -update", path, err)
			}
			if got != string(frozen) {
				t.Errorf("rendered %s differs from the frozen baseline\n%s", name, describeFirstDifference(string(frozen), got))
			}
		})
	}
}

// describeFirstDifference turns a byte-level mismatch into something a reviewer
// can act on: the offset, both lengths, and a window around the first change.
func describeFirstDifference(want, got string) string {
	limit := min(len(want), len(got))
	at := 0
	for at < limit && want[at] == got[at] {
		at++
	}
	window := func(value string) string {
		start := max(0, at-70)
		end := min(len(value), at+90)
		return fmt.Sprintf("[%d:%d] %q", start, end, value[start:end])
	}
	kind := "changed"
	switch {
	case at == limit && len(want) < len(got):
		kind = "baseline is a prefix, output has trailing content"
	case at == limit && len(want) > len(got):
		kind = "output is a prefix, baseline has trailing content"
	}
	return fmt.Sprintf("first difference at byte %d (%s); baseline %d bytes, output %d bytes\n  baseline %s\n  output   %s",
		at, kind, len(want), len(got), window(want), window(got))
}

func BenchmarkPageRender(b *testing.B) {
	handler := newApplication().handler()
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	b.ReportAllocs()
	for b.Loop() {
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
	}
}

func BenchmarkTickFrameRender(b *testing.B) {
	app := newApplication()
	lastStatus := make(map[string]serviceStatus)
	services := app.store.snapshot()
	fillLogRing(services)
	for _, current := range services {
		lastStatus[current.ID] = current.Status
	}
	frame, err := app.renderTick(languageSpanish, services, lastStatus)
	if err != nil {
		b.Fatal(err)
	}
	b.SetBytes(int64(len(frame)))
	b.ReportAllocs()
	for b.Loop() {
		if _, err := app.renderTick(languageSpanish, services, lastStatus); err != nil {
			b.Fatal(err)
		}
	}
}
