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
