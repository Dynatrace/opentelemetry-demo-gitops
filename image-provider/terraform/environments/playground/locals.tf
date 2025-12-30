locals {
  lambda_layer_arn              = "arn:aws:lambda:us-east-1:585768157899:layer:Dynatrace_OneAgent_1_327_56_20251218-151643_with_collector_nodejs_x86:1"
  environment                   = "playground"
  lambda_monitoring_secret_name = "lambda-monitoring-playground"
  private_subnet_name           = "private-subnet-1"
}
