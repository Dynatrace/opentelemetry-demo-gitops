# Component: flag-admin-ui

This component deploys a small internal admin application for toggling supported `flagd` feature flags through a GitHub-based workflow.

## Required local values

Add the following values to `kustomize/base/values.local.yaml`:

```yaml
components:
  flag-admin-ui:
    authUsername: admin
    authPassword: "change-me"
    githubToken: ghp_xxx
```

During `./deploy`, the repo generates `kustomize/components/flag-admin-ui/data.env` from those values and Kustomize creates the `flag-admin-ui-secrets` Secret automatically.

Quote `authPassword` if it contains YAML-special characters such as `#` or `:`.

Required values:

- `authUsername` - basic auth username for the admin UI
- `authPassword` - basic auth password for the admin UI
- `githubToken` - GitHub token with repo access to the target fork
