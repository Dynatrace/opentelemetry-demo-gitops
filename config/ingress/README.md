# Nginx ingress controller

You can follow the official installation [guide](https://kubernetes.github.io/ingress-nginx/deploy/) followed by [instrumentation](https://docs.dynatrace.com/docs/ingest-from/setup-on-k8s/guides/deployment-and-configuration/monitoring-and-instrumentation/instrument-nginx) or run

```bash
./deploy
```

You can adjust the deployment by setting these env vars:

- NAMESPACE - kubernetes namespace
- VERSION - version of the helm chart
