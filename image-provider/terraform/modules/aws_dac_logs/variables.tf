variable "subscription_name" {
  description = "Name of the CloudWatch Logs subscription filter"
  type        = string
}

variable "log_group_name" {
  description = "Name of the CloudWatch Log Group to subscribe"
  type        = string
}

variable "firehose_stream_arn" {
  description = "ARN of the Kinesis Data Firehose delivery stream destination"
  type        = string
}

variable "role_arn" {
  description = "IAM role ARN that CloudWatch Logs assumes to write to Firehose. Leave empty only if not required in your setup"
  type        = string
}

variable "subscription_filter_pattern" {
  description = "Optional CloudWatch Logs subscription filter pattern. Use empty string to forward all logs"
  type        = string
  default     = ""
}
