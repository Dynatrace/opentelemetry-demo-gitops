# Dynatrace operator

You can deploy the Dynatrace operator by following the official [guide](https://docs.dynatrace.com/docs/ingest-from/setup-on-k8s/deployment/full-stack-observability) or by using the sample deployment script provided here.

## Using the sample deployment

Export the required environment variables, then run the deploy script:

```bash
export CLUSTER_NAME=<your-cluster-name>        # name shown in the Dynatrace tenant
export CLUSTER_API_URL=https://<your-tenant-id>.live.dynatrace.com/api
export OPERATOR_TOKEN=<your-operator-token>     # Kubernetes: Dynatrace Operator template
export DATA_INGEST_TOKEN=<your-ingest-token>    # Kubernetes: Data Ingest template

./deploy
```

The `CLUSTER_API_URL` should include the `/api` path as shown above.

Tokens can be created in your Dynatrace tenant under **Access Tokens**, using the respective template for each.
