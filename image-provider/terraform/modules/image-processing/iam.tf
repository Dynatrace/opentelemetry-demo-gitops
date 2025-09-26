resource "aws_iam_role" "this" {
  name = "astroshop-${var.environment}-image-provider"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy" "access_s3_bucket" {
  name = "astroshop-${var.environment}-image-provider-access-s3-bucket"
  role = aws_iam_role.this.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect : "Allow"
        Resource = "${aws_s3_bucket.this.arn}/*"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:PutObjectTagging"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_basic_execution" {
  name = "astroshop-${var.environment}-image-provider-lambda-basic-execution"
  role = aws_iam_role.this.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect : "Allow"
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:*"
        Action   = "logs:CreateLogGroup"
      },
      {
        Effect : "Allow"
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${aws_lambda_function.this.function_name}:*"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy" "access_vpc_execution_role" {
  name = "astroshop-${var.environment}-image-provider-access-vpc-execution-role"
  role = aws_iam_role.this.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect : "Allow"
        Resource = "*"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeNetworkInterfaces"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "dynamodb_read_only_access" {
  role       = aws_iam_role.this.id
  policy_arn = "arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess"
}
