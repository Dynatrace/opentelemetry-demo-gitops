


{{- define "astroshop.opentelemetry.serviceAccountName" -}}
{{ printf "%s" .Release.Name }}
{{- end }}

