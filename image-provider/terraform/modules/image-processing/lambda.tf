data "archive_file" "this" {
  type        = "zip"
  source_dir  = "../../../src"
  output_path = "../../../build/image-processing.zip"
}

resource "aws_lambda_function" "this" {
  function_name    = "astroshop-image-provider-${var.environment}"
  role             = aws_iam_role.this.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  filename         = data.archive_file.this.output_path
  source_code_hash = filebase64sha256(data.archive_file.this.output_path)
  memory_size      = 512
  timeout          = 5

  environment {
    variables = {
      AWS_LAMBDA_EXEC_WRAPPER : "/opt/dynatrace"
      IMAGE_RESIZE_PROBLEM_FLAG : var.image_resize_problem_flag
      OTEL_SERVICE_NAME : "lambda-image-resizer"
      BUCKET : "${aws_s3_bucket.this.bucket}"
      DYNAMODB_TABLE_NAME : aws_dynamodb_table.this.name
      DT_TENANT : local.dynatrace_tenant
      DT_CLUSTER_ID : local.dt_cluster_id
      DT_CONNECTION_BASE_URL : local.dt_connection_base_url
      DT_CONNECTION_AUTH_TOKEN : local.dt_connection_auth_token
      DT_LOG_COLLECTION_AUTH_TOKEN : local.dt_log_collection_auth_token
    }
  }

  vpc_config {
    subnet_ids         = [data.aws_subnet.this.id]
    security_group_ids = [aws_security_group.this.id]
  }

  layers = [var.lambda_layer_arn]
  logging_config {
    log_format = "JSON"
  }
  tracing_config {
    mode = "PassThrough"
  }
}

