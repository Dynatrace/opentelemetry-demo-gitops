variable "environment" {
  type        = string
  description = "Name of the environment, for example playground"
}
variable "aws_region" {
  type        = string
  description = "AWS region the config will be deployed to"
}
variable "image_resize_problem_flag" {
  type        = bool
  description = "Flag to simulate image resize problem"
}
variable "lambda_layer_arn" {
  type        = string
  description = "The ARN of the Lambda layer used for monitoring"
}
variable "private_subnet_name" {
  type        = string
  description = "The name of the private subnet to lambda in"
}
variable "dynatrace_tenant" {
  type        = string
  description = "The Dynatrace tenant URL"
}

variable "dt_cluster_id" {
  type        = string
  description = "The Dynatrace cluster ID"
}

variable "dt_connection_base_url" {
  type        = string
  description = "The Dynatrace connection base URL"
}

variable "dt_connection_auth_token" {
  type        = string
  description = "The Dynatrace connection auth token"
}

variable "dt_log_collection_auth_token" {
  type        = string
  description = "The Dynatrace log collection auth token"
}

