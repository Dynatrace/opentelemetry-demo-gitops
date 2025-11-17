# Astroshop image provider

## Deployment

### Requirements

- [Node.js](https://nodejs.org/en)
- [Terraform](https://developer.hashicorp.com/terraform)
- [AWS CLI](https://aws.amazon.com/cli/)
- Dynatrace tenant

### Secrets

In order to monitor the image provider lambda you will need following information:

- DT_TENANT
- DT_CLUSTER_ID
- DT_CONNECTION_BASE_URL
- DT_CONNECTION_AUTH_TOKEN
- DT_LOG_COLLECTION_AUTH_TOKEN
- lambda layer \*

You can find it by going to your Dynatrace tenant, go to **Deploy OneAgent** app, select **AWS Lambda**, enable **Traces and Logs**, click **Create token**, select **x86 architecture**, select **Configure with environment variables** and choose the right **region**.

> **Note:** Lambda layer displayed at the bottom of the page is not tenant specific but will be needed to choose a compatible version with your tenant

The values can be supplied by variables/locals or by the use of the `secrets` module, it will read an AWS secret with following structure:

```json
{
  "DT_TENANT": "",
  "DT_CLUSTER": "",
  "DT_CONNECTION_BASE_URL": "",
  "DT_CONNECTION_AUTH_TOKEN": "",
  "DT_LOG_COLLECTION_AUTH_TOKEN": ""
}
```

### Steps

- Navigate to [src](src/) directory and run `npm install`.
- Navigate to [environments](terraform/environments/) and choose your environment, or create a new one.
- Init the terraform project by running `terraform init`.
  - if you created a new environment
- **OPTIONAL** create a file with .tfvars extension to override default variables.
- Make sure you're authenticated with AWS
- Apply the configuration by running `terraform apply`.
- To deploy the astroshop
  - paste the terraform output `AstroshopImageProviderAPIUrl` into [data.env](../kustomize/components/image-provider)
  - go to [root](../) of repository
    ```bash
    ./deploy image-provider
    ```
