locals {
  lambda_layer_arn              = "arn:aws:lambda:us-east-1:657959507023:layer:Dynatrace_OneAgent_1_326_0_20251001-062918_with_collector_nodejs_x86:1"
  environment                   = "playground-dev"
  lambda_monitoring_secret_name = "lambda-monitoring-playground-dev"
  private_subnet_name           = "private-subnet-1"
}
