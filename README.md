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
# Flagd configuration change: problem patterns

## About

ArgoCD monitors the directory under the application called **opentelemetry-demo-flagd-config**. After each modification, ArgoCD synchronizes the data and applies the changes. The goal of this configuration is to switch the feature flags state of OpenTelemetry demo configuration, which in effect enables or disables problem patterns

## Purpose of configuration files

Flagd stores feature flag states in a ConfigMap. To toggle a problem pattern, the value of the flag needs to be updated. Flagd itself doesn't detect manual changes in the ConfigMap, to apply changes Flagd need to be restarted. To facilitate this, a job has been added that restarts Flagd after a feature flag change.

## Configuration

`flagd-config.yaml` contains ConfigMap with feature flag states

To toggle flag, change value of **defaultVariant** to either **on** or **off**.

```json
"productCatalogFailure": {
    "description": "Fail product catalog service on a specific product",
    "state": "ENABLED",
    "variants": {
        "on": true,
        "off": false
    },
    "defaultVariant": "off"
}
```

`flagd-restart.yaml` contains job restarting flagd

Job is tagged as ArgoCD hook, which is triggered automatically after succesful sync and deleted afterward.

```yaml
annotations:
  #  triggers hook after sync
  argocd.argoproj.io/hook: PostSync
  #  deletes hook resourcers after successful deployment
  argocd.argoproj.io/hook-delete-policy: HookSucceeded
```
