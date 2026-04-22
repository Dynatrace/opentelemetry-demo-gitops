# Flagd configuration — problem patterns

## About

ArgoCD monitors the `flagd/` directory under an application called **opentelemetry-demo-flagd-config**. After each change merged to the tracked branch, ArgoCD synchronises the directory and applies the updated ConfigMap to the cluster. This is used to toggle feature flags in the Astroshop application, which in turn enables or disables problem patterns for demonstration purposes.

## Files

| File                 | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `flagd-config.yaml`  | ConfigMap containing feature flag states         |
| `flagd-restart.yaml` | ArgoCD hook job that restarts Flagd after a sync |

## Toggling a feature flag

Open `flagd-config.yaml` and change the `defaultVariant` of the relevant flag to `"on"` or `"off"`:

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

Commit and push the change. ArgoCD will detect it, sync the ConfigMap, and the restart job will run automatically to apply the new flag state.

## How the restart job works

Flagd does not detect ConfigMap changes at runtime, so a Job is used to restart it after each sync. The job is defined as an ArgoCD hook:

```yaml
annotations:
  argocd.argoproj.io/hook: PostSync # runs after a successful sync
  argocd.argoproj.io/hook-delete-policy: HookSucceeded # cleaned up after completion
```
