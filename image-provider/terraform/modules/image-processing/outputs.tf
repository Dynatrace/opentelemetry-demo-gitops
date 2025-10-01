output "image_api_invoke_url" {
  value = "${aws_apigatewayv2_api.this.api_endpoint}/default"
}
