locals {
  lambda_layer_arn              = "arn:aws:lambda:us-east-1:585768157899:layer:Dynatrace_OneAgent_1_327_44_20251118-165931_with_collector_nodejs_x86:1"
  environment                   = "live"
  lambda_monitoring_secret_name = "lambda-monitoring-live"
  private_subnet_name           = "private-subnet-1"
}
