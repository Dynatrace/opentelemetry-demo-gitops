variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}
variable "stage" {
  description = "The deployment stage (e.g. dev, staging, prod)"
  type        = string
  default     = "staging"
}
variable "image_resize_problem_flag" {
  description = "Flag to simulate image resize problem"
  type        = bool
}
variable "environment" {
  description = "The environment name"
  type        = string
  default     = "staging"
}
variable "lambda_layer_arn" {
  description = "The ARN of the Lambda layer used for monitoring"
  type        = string
  default     = "arn:aws:lambda:us-east-1:725887861453:layer:Dynatrace_OneAgent_1_317_2_20250530-044837_with_collector_nodejs:1"
}
