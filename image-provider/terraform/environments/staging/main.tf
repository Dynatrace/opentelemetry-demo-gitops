terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0.0"
    }
  }

  required_version = "~> 1.12"

  backend "s3" {
    key          = "demo-deployments/image-provider/staging/terraform.tfstate"
    bucket       = "dt-demoability-terraform-backend"
    region       = "us-east-1"
    kms_key_id   = "alias/dt-demoability-backend-key"
    use_lockfile = true
    encrypt      = true
  }
}

provider "aws" {
  region                   = var.aws_region
  shared_credentials_files = ["$HOME/.aws/credentials"]

  ignore_tags {
    key_prefixes = ["ACE:"]
  }

  default_tags {
    tags = {
      deployed-with  = "terraform"
      git-repository = "https://github.com/Dynatrace/opentelemetry-demo-gitops"
      dt_owner_email = "rafal.psciuk@dynatrace.com"
      dt_owner_team  = "team-demoability"
    }
  }
}

module "image_processing" {
  source                        = "../../modules/image-processing"
  environment                   = var.environment
  aws_region                    = var.aws_region
  stage_name                    = var.stage
  image_resize_problem_flag     = var.image_resize_problem_flag
  lambda_layer_arn              = var.lambda_layer_arn
  lambda_monitoring_secret_name = var.lambda_monitoring_secret_name
}
