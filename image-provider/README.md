# Astroshop image provider

## Description



## Deployment

### Requirements

- [Node.js](https://nodejs.org/en)
- [Terraform](https://developer.hashicorp.com/terraform) 
- [AWS CLI](https://aws.amazon.com/cli/)
- Dynatrace tenant

### Secrets

Firstly, go to your Dynatrace tenant, then go to **Deploy OneAgent** app, select **AWS Lambda**, enable **Traces and Logs**, click **Create token**, select **x86 architecture**, select **Configure with environment variables** and choose the right **region**.

Fill this json with your data:

```json
{
  "DT_TENANT": "",
  "DT_CLUSTER_ID": "",
  "DT_URL": "", # DT_CONNECTION_BASE_URL
  "DT_CONNECTION_AUTH_TOKEN": "",
  "DT_LOG_COLLECTION_AUTH_TOKEN": "",
}
```

**Note:** Lambda layer displayed at the bottom of the page comes as a variable in the `image_processing` module.

And create a secret in Secret Manager using AWS CLI. Name of the secret comes as a variable in the `image_processing` module. The default secret name is `lambda-monitoring-<env_name>`

### Steps

- Navigate to [src](src/) directory and run `npm install`. 
- Navigate to [environments](terraform/environments/) and choose your environment, or create a new one.
- Init the terraform project by running `terraform init`.
- **OPTIONAL** create a file with .tfvars extension to override default variables.
- Apply the configuration by running `terraform apply`.
