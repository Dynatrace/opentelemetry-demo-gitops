locals {
  lambda_layer_arn              = "arn:aws:lambda:us-east-1:657959507023:layer:Dynatrace_OneAgent_1_327_10_20251022-122302_with_collector_nodejs_x86:1"
  environment                   = "playground-staging"
  lambda_monitoring_secret_name = "lambda-monitoring-playground-staging"
  private_subnet_name           = "private-subnet-1"
}
