{{- if  index .Values "components" "dt-credentials" "enabled" }}
apiVersion: v1
kind: Secret
metadata:
  name: dt-credentials
  namespace: "{{ .Release.Namespace }}"
type: Opaque
{{- with index .Values "components" "dt-credentials" }}
stringData:
  DT_ENDPOINT: {{ required "[tenantEndpoint] is required when [dt-credentials] is enabled" .tenantEndpoint }}
  DT_API_TOKEN: {{ required "[tenantToken] is required when [dt-credentials] is enabled" .tenantToken }}
{{- end }}
{{- end }}
