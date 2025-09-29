variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}
variable "image_resize_problem_flag" {
  description = "Flag to simulate image resize problem"
  type        = bool
  default     = false
}
variable "lambda_monitoring_secret_name" {
  description = "The name of the Lambda monitoring secret"
  type        = string
  default     = "lambda-monitoring-staging"
}
variable "private_subnet_name" {
  description = "The name of the private subnet to lambda resources in"
  type        = string
  default     = "private-subnet-1"
}
