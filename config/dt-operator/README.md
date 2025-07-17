# Dynatrace operator

You can deploy Dynatrace operator following official [guide](https://docs.dynatrace.com/docs/ingest-from/setup-on-k8s/deployment/full-stack-observability) or by running

```bash
./deploy
```

You need to set these env vars before deployment

- CLUSTER_NAME - the name of the cluster displayed in the tenant
- CLUSTER_API_URL - url of the tenant including the `/api`, e.g. **https://wkf10640.live.dynatrace.com/api**
- OPERATOR_TOKEN - access token using the `Kubernetes: Dynatrace Operator` template
- DATA_INGEST_TOKEN - access token using the `Kubernetes: Data Ingest` template
