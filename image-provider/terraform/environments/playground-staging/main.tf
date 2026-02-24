terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0.0"
    }
  }

  required_version = "~> 1.12"

  backend "s3" {
    key          = "demo-deployments/image-provider/playgorund-staging/terraform.tfstate"
    bucket       = "dt-demoability-terraform-backend"
    region       = "us-east-1"
    kms_key_id   = "alias/dt-demoability-backend-key"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region = var.aws_region

  ignore_tags {
    key_prefixes = ["ACE:"]
  }

  default_tags {
    tags = {
      deployed-with  = "terraform"
      git-repository = "https://github.com/Dynatrace/opentelemetry-demo-gitops"
      dt_owner_email = "rafal.psciuk@dynatrace.com"
      dt_owner_team  = "team-demoability"
      env            = local.environment
    }
  }
}

data "aws_caller_identity" "current" {}

module "firehose" {
  count  = local.enable_dac_logs ? 1 : 0
  source = "../../modules/aws_data_firehose"

  firehose_name_filter = local.dynatrace_tenant_id
  common_prefix = "dac-logs-image-processing"
}

module "image_processing" {
  source                       = "../../modules/image-processing"
  environment                  = local.environment
  aws_region                   = var.aws_region
  lambda_layer_arn             = local.lambda_layer_arn
  private_subnet_name          = local.private_subnet_name
  dynatrace_tenant             = module.secrets.dynatrace_tenant
  dt_cluster_id                = module.secrets.dt_cluster_id
  dt_connection_base_url       = module.secrets.dt_connection_base_url
  dt_connection_auth_token     = module.secrets.dt_connection_auth_token
  dt_log_collection_auth_token = module.secrets.dt_log_collection_auth_token
  aws_account_id               = data.aws_caller_identity.current.account_id
  enable_dac_logs              = local.enable_dac_logs
  dac_firehose_arn             = local.enable_dac_logs ? module.firehose[0].firehose_arn : null
  dac_ingest_role_arn          = local.enable_dac_logs ? module.firehose[0].ingest_role_arn : null
}

module "secrets" {
  source                        = "../../modules/secrets"
  lambda_monitoring_secret_name = local.lambda_monitoring_secret_name
}
