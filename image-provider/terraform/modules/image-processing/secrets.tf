data "aws_secretsmanager_secret" "this" {
  name = "lambda-monitoring-${var.environment}"
}

data "aws_secretsmanager_secret_version" "this" {
  secret_id = data.aws_secretsmanager_secret.this.id
}

