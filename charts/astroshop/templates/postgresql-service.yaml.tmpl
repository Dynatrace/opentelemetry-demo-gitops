{{- if index .Values.components.postgresqlExternalService.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-postgresql-external
  annotations:
    service.beta.kubernetes.io/azure-deny-all-except-load-balancer-source-ranges: true
spec:
  type: LoadBalancer
  externalTrafficPolicy: Local
  selector:
    app.kubernetes.io/name: postgresql
  ports:
    - port: 5432
  {{- with .Values.components.postgresqlExternalService.loadBalancerSourceRanges }}
  loadBalancerSourceRanges:
  {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end }}
