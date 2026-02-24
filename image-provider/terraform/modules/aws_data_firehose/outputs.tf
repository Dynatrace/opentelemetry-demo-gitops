output "firehose_name" {
  description = "Name of the detected AWS Firehose created by DAC for the given tenant"
  value       = data.external.find_aws_firehose.result.firehose_name
}

output "firehose_arn" {
  description = "ARN of the detected AWS Firehose created by DAC for the given tenant"
  value       = data.external.find_aws_firehose.result.firehose_arn
}

output "ingest_role_arn" {
  description = "ARN of the IAM role created to allow CloudWatch Logs to write to the Firehose"
  value       = aws_iam_role.fh_put_record_role.arn
}
