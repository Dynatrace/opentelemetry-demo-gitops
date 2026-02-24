resource "aws_cloudwatch_log_subscription_filter" "this" {
  name            = var.subscription_name
  log_group_name  = var.log_group_name
  destination_arn = var.firehose_stream_arn
  filter_pattern  = var.subscription_filter_pattern
  role_arn        = var.role_arn
}
