module "dac_logs_product_admin" {
  count      = var.enable_dac_logs ? 1 : 0
  depends_on = [aws_lambda_function.this]
  source     = "../../modules/aws_dac_logs"

  subscription_name   = "dac-logs-subscription-image-processing-${var.environment}"
  log_group_name      = "/aws/lambda/${aws_lambda_function.this.function_name}"
  firehose_stream_arn = var.dac_firehose_arn
  role_arn            = var.dac_ingest_role_arn
}
