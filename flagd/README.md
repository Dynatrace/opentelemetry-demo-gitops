# Problem pattern toggle

## About
 
ArgoCD monitors the directory under the application called **opentelemetry-demo-flagd-config**. After each modification, ArgoCD synchronizes the data and applies the changes. The goal of this configuration is to switch the feature flags state of OpenTelemetry demo configuration, which in effect enables or disables problem patterns

## Purpose of configuration files

Flagd stores feature flag states in a ConfigMap. To toggle a problem pattern, the value of the flag needs to be updated. Flagd itself doesn't detect manual changes in the ConfigMap, to apply changes Flagd need to be restarted. To facilitate this, a job has been added that restarts Flagd after a feature flag change.


## Configuration

`flagd-config.yaml` contains ConfiMap with feature flag states

```json
"productCatalogFailure": {
    "description": "Fail product catalog service on a specific product",
    "state": "ENABLED",
    "variants": {
        "on": true,
        "off": false
    },
    // flag state, to enable switch value to on
    "defaultVariant": "off"
},
```

`flagd-restart.yaml` contains job restarting flagd 

Job is tagged as ArgoCD hook, which is triggered automatically after succesful sync and deleted afterward. 

```json
annotations:
    // triggers hook after sync
    argocd.argoproj.io/hook: PostSync
    // deletes hook resourcers after successful deployment 
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
```


