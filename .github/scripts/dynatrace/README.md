# Dynatrace Deployment Event Script

Sends a Dynatrace `CUSTOM_DEPLOYMENT` event after the image lambda Terraform deployment succeeds.

With the changes to the event ingest API it requires to set the service id directly on the event, so the script needs to fetch it first.

## Inputs

Required environment variables:

- `DT_URL`: Dynatrace platform URL, for example `https://abc12345.apps.dynatrace.com`.
- `DT_TOKEN`: Dynatrace platform token used as `Authorization: Bearer <token>`.
- `DEPLOY_ENV`: Deployment environment name, for example `playground-dev` or `staging`.
- `TERRAFORM_OUTCOME`: Terraform apply outcome to include in event properties.

GitHub Actions provides these variables automatically in the workflow:

- `GITHUB_REPOSITORY`
- `GITHUB_SHA`
- `GITHUB_REF`
- `GITHUB_EVENT_NAME`
- `GITHUB_WORKFLOW`

## Token Permissions

The platform token needs permissions for the DQL lookup and event ingest:

- `storage:smartscape:read`
- `storage:events:write`


## Environment Behavior

`dt.source_entity` is only set for staging/prod-like environments:

```text
staging, playground-staging, playground, live, live3gen
```

It is intentionally omitted for dev environments. Event association behavior differs while changes move through stages, so dev events only use the Smartscape source properties.

## Local Test

To run the same script locally against a real Dynatrace environment:

```bash
DT_URL="https://abc12345.apps.dynatrace.com" \
DT_TOKEN="dt0s16..." \
.github/scripts/dynatrace/test-local.sh
```

This sends a real event. Use a dev environment or test token when validating changes.
