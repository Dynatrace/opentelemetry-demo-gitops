locals {
  lambda_layer_arn              = "arn:aws:lambda:us-east-1:585768157899:layer:Dynatrace_OneAgent_1_329_73_20260123-140641_with_collector_nodejs_x86:1"
  environment                   = "live3gen"
  lambda_monitoring_secret_name = "lambda-monitoring-live3gen"
  private_subnet_name           = "private-subnet-1"
}
