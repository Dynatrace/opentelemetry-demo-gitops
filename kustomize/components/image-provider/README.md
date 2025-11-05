# Component: image-provider

This component makes sure the `LAMBDA_URL` env var is set on the `frontend` service. Refer to [README.md](../../../image-provider/README.md) on how to setup the infrastructure required.

Provide this data:

- `data.env`
  - **LAMBDA_URL:** the value from `AstroshopImageProviderAPIUrl` terraform output
