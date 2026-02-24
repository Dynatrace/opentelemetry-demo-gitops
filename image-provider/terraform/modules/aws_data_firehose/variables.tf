variable "firehose_name_filter" {
  description = "Filter string to identify the AWS Firehose delivery stream for DAC logs"
  type        = string
}

variable "common_prefix" {
  description = "Prefix for all the resources created in this module to avoid naming conflicts"
  type        = string
  default     = "dac-logs-ingest"
}
