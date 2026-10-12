package views

import (
	"strconv"

	"github.com/a-h/templ"
)

type Messages map[string]string

type ServiceView struct {
	ID, Name, Status, StatusLabel, Language string
	CPU, RAM                                int
	Logs                                    []string
	OutOfBand                               bool
	Messages                                Messages
	LogsTitle, HelpTitle, HelpLabel         string
}

func hxVals(id, lang string) string {
	return `{"id":"` + id + `","lang":"` + lang + `"}`
}

func alpineLiveText(m Messages) string {
	return "connected ? '" + m["live"] + "' : '" + m["reconnecting"] + "'"
}

func alpineMatch(name string) string {
	return "match('" + name + "')"
}

func alpineOpenHelp(id string) string {
	return "openHelp($el, '" + id + "')"
}

func alpineOpenLogs(id string) string {
	return "openLogs($el, '" + id + "')"
}

func metricStyle(value int) templ.SafeCSS {
	return templ.SafeCSS("width: " + strconv.Itoa(value) + "%")
}
