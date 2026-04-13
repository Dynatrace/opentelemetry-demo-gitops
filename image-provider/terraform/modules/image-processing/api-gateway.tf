resource "aws_apigatewayv2_api" "this" {
  name          = local.name_prefix
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins  = ["*"]
    allow_methods  = ["GET"]
    allow_headers  = ["*"]
    expose_headers = []
    max_age        = 3600
  }
}

resource "aws_apigatewayv2_integration" "this" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.this.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "this" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /images"
  target    = "integrations/${aws_apigatewayv2_integration.this.id}"
}

# Log group naming convention: API-GatewayV2-Access-Logs*
# Source: https://docs.dynatrace.com/docs/ingest-from/amazon-web-services/ingest-telemetry/cloudwatch-logs#supplogsources
resource "aws_cloudwatch_log_group" "api_gw_access" {
  name              = "API-GatewayV2-Access-Logs-${aws_apigatewayv2_api.this.name}"
  retention_in_days = 7
}

resource "aws_apigatewayv2_stage" "this" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "default"
  auto_deploy = true
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw_access.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      ip                      = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      httpMethod              = "$context.httpMethod"
      routeKey                = "$context.routeKey"
      path                    = "$context.path"
      status                  = "$context.status"
      protocol                = "$context.protocol"
      responseLength          = "$context.responseLength"
      responseLatency         = "$context.responseLatency"
      integrationLatency      = "$context.integrationLatency"
      integrationStatus       = "$context.integrationStatus"
      errorMessage            = "$context.error.message"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "arn:aws:execute-api:${var.aws_region}:${var.aws_account_id}:${aws_apigatewayv2_api.this.id}/*/*"
}
