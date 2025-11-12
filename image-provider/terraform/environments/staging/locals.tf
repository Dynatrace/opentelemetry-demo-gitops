locals {
  lambda_layer_arn              = "arn:aws:lambda:us-east-1:657959507023:layer:Dynatrace_OneAgent_1_329_0_20251111-141604_with_collector_nodejs_x86:1"
  environment                   = "staging"
  lambda_monitoring_secret_name = "lambda-monitoring-staging"
  private_subnet_name           = "private-subnet-1"
}
