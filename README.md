# Opentelemetry demo gitops

This repository contains Helm chart for [Astroshop](https://github.com/Dynatrace/opentelemetry-demo), an adaptation of the [Opentelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) app, alongside with:

- sample deployment script
- [Argocd](./flagd/README.md) configuration used to showcase Dynatrace's ability to monitor gitops

## Deployment

### Requirements

- [Helm](https://helm.sh/docs/intro/install/) >= 3.18
- [kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/) >= 5.7
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- Dynatrace tenant

### Prerequisites

To properly function the Astroshop deployment requires a few other tools to be present on the cluster, however since they are not a part of the Astroshop itself, they are not included in the helm chart and have to be installed separately. We provide sample deployments but you can install them however you see fit or use already existing ones.

#### Dynatrace operator

To monitor the cluster with Dynatrace you can follow the official [guide](https://docs.dynatrace.com/docs/ingest-from/setup-on-k8s/deployment/full-stack-observability) or use the sample [deployment](./config/dt-operator/README.md)

#### DAPR

Astroshop uses [DAPR](https://dapr.io/) under the hood so it needs the operator installed on the cluster. Installation info [here](./config/dapr/README.md)

#### Ingress controller [optional]

If you want to deploy the ingress resources (by setting `components.ingress.enabled: true` in values) you will need the ingress controller running on the cluster. If you already have one running make sure that it's properly instrumented. Sample installation info [here](./config/ingress/README.md)

### Helm deployment

To deploy the helm chart you will first need to set the required values [here](./config/helm-values/values.yaml)

- _components.dt-credentials.tenantEndpoint_ - tenant url including the `/api/v2/otlp`, e.g. **https://wkf10640.live.dynatrace.com/api/v2/otlp**
- _components.dt-credentials.tenantToken_ - access token using the `Kubernetes: Data Ingest` template

then run

```bash
./deploy
```
