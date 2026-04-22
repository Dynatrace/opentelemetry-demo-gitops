# OpenTelemetry Demo GitOps

This repository contains everything needed to deploy and operate [Astroshop](https://github.com/Dynatrace/opentelemetry-demo), a Dynatrace adaptation of the [OpenTelemetry Demo](https://github.com/open-telemetry/opentelemetry-demo) application.

## What's in this repo

| Directory          | Description                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| `charts/astroshop` | Helm chart for the Astroshop application                                          |
| `kustomize/`       | Example kustomize deployments that use the Helm chart                             |
| `config/`          | Example deployments for cluster-level prerequisites (Dynatrace operator, ingress) |
| `image-provider/`  | AWS Lambda code and Terraform config for the optional image provider feature      |
| `flagd/`           | ArgoCD-managed feature flag configs used to trigger problem patterns at runtime   |

## Deploying Astroshop

### Requirements

- A running Kubernetes cluster
- [Helm](https://helm.sh/docs/intro/install/) >= 3.18
- [kustomize](https://kubectl.docs.kubernetes.io/installation/kustomize/) >= 5.7
- [kubectl](https://kubernetes.io/docs/tasks/tools/) configured to point at your cluster
- A Dynatrace tenant

### Step 1 — Install cluster prerequisites

These tools must be present on the cluster before deploying Astroshop. Sample deployments are provided but you can install them however you prefer, or reuse existing installations.

#### Dynatrace operator (required)

The operator handles Kubernetes monitoring and injects the OneAgent into workloads.

Follow the official [guide](https://docs.dynatrace.com/docs/ingest-from/setup-on-k8s/deployment/full-stack-observability) or use the sample deployment in [`config/dt-operator/`](./config/dt-operator/README.md).

#### Ingress controller (optional)

Required only if you want to expose Astroshop via an ingress resource (controlled by `components.ingress.enabled` in values). If you already have an ingress controller running, make sure it is instrumented with Dynatrace.

See [`config/ingress/`](./config/ingress/README.md) for a sample nginx setup.

### Step 2 — Configure values

Open [`kustomize/base/values.yaml`](./kustomize/base/values.yaml) and fill in your Dynatrace tenant details:

```yaml
components:
  dt-credentials:
    tenantEndpoint: https://<your-tenant-id>.live.dynatrace.com/api/v2/otlp
    tenantToken: <your-data-ingest-token>
```

- `tenantEndpoint` — your tenant URL with the `/api/v2/otlp` path appended
- `tenantToken` — an access token created using the `Kubernetes: Data Ingest` template

You can see all available chart values in [`charts/astroshop/values.yaml`](./charts/astroshop/values.yaml).

### Step 3 — Deploy

Run the deploy script from the root of the repository:

```bash
./deploy
```

The script runs `kustomize build --enable-helm` against `kustomize/base` and pipes the output to `kubectl apply`. Astroshop is deployed into the `astroshop` namespace, which is created automatically.

### Step 4 — Verify

```bash
kubectl get pods -n astroshop
```

All pods should reach `Running` state within a few minutes.

### Accessing the frontend (without ingress)

If you deployed without an ingress controller, you can reach the Astroshop frontend via port-forwarding:

```bash
kubectl port-forward svc/astroshop-frontendproxy 8080:8080 -n astroshop
```

The application will then be available at [http://localhost:8080](http://localhost:8080).

---

## Overlays

Overlays extend the base deployment with optional components. To deploy with an overlay:

```bash
./deploy <overlay-name>
```

### Available overlays

| Overlay          | What it adds                                |
| ---------------- | ------------------------------------------- |
| `all-components` | SQS connection + image provider integration |

> **Note:** overlays may require additional configuration — see the relevant component READMEs before deploying.

For the image provider specifically, see [`image-provider/`](./image-provider/README.md) for setup steps and the required Terraform infrastructure.

---

## Feature flags (GitOps via ArgoCD)

The `flagd/` directory contains feature flag configurations that are monitored by ArgoCD. Changing a flag value and pushing the change is enough to toggle a problem pattern in the running application — ArgoCD will sync the ConfigMap and restart Flagd automatically.

See [`flagd/README.md`](./flagd/README.md) for details.
