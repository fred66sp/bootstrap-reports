package main

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// Bootstrap 6 is used through its ESM bundle and never through the
// `window.bootstrap` global, which no longer exists in v6 (AGENTS.md states the
// rule; docs/devops-pulse/REFERENCIA.md explains it). The rule was text-only
// until this test, so nothing stopped a future change from reintroducing the
// global and failing in the browser instead of in CI.
//
// The check is deliberately literal: the string must not appear anywhere in the
// client code, including a comment that merely mentions it. Parsing JavaScript
// to exclude comments would make the guard fragile, and any new occurrence is
// worth a human look anyway. The rule is stated in the documentation, not in the
// client sources.
const forbiddenBootstrapGlobal = "window.bootstrap"

func TestClientCodeNeverReachesTheBootstrapGlobal(t *testing.T) {
	roots := []string{"web/views", "web/static"}
	// The vendored bundle is third-party code and does define that global; it is
	// shipped as-is and is not ours to police.
	skipDir := filepath.Clean(filepath.Join("web", "static", "vendor"))
	scanned := 0
	var offenders []string

	for _, root := range roots {
		walkErr := filepath.WalkDir(root, func(path string, entry fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			if entry.IsDir() {
				if filepath.Clean(path) == skipDir {
					return fs.SkipDir
				}
				return nil
			}
			switch filepath.Ext(path) {
			case ".templ", ".js", ".mjs", ".html":
			default:
				return nil
			}

			scanned++
			content, err := os.ReadFile(path)
			if err != nil {
				return err
			}
			for i, line := range strings.Split(string(content), "\n") {
				if strings.Contains(line, forbiddenBootstrapGlobal) {
					offenders = append(offenders, fmt.Sprintf("%s:%d: %s", path, i+1, strings.TrimSpace(line)))
				}
			}
			return nil
		})
		if walkErr != nil {
			t.Fatalf("walking %s: %v", root, walkErr)
		}
	}

	// A guard that scans nothing after a directory rename would pass silently.
	if scanned == 0 {
		t.Fatal("no client files were scanned: this guard would pass vacuously")
	}
	if len(offenders) > 0 {
		t.Errorf("client code must not reference %s; the ESM plugins come from the vendored bundle instead:\n%s",
			forbiddenBootstrapGlobal, strings.Join(offenders, "\n"))
	}
}
