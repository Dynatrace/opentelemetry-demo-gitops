variable "environment" {
  type        = string
  description = "Name of the environment, for example playground"
}

variable "aws_region" {
  type        = string
  description = "AWS region the config will be deployed to"
}

variable "stage_name" {
  type        = string
  description = "The name of the deployment stage, e.g., staging or production"
}

variable "image_resize_problem_flag" {
  type        = bool
  description = "Flag to simulate image resize problem"
}

variable "lambda_layer_arn" {
  type        = string
  description = "The ARN of the Lambda layer used for monitoring"
}
