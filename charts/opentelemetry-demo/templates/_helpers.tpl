


{{- define "astroshop.opentelemetry.serviceAccountName" -}}
{{ printf "%s-otel-demo" .Release.Name }}
{{- end }}

