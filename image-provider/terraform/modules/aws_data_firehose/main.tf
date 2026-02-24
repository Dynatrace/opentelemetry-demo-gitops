# Find the existing Firehose stream that was created by Dynatrace, matching the provided name filter
data "external" "find_aws_firehose" {
  program = ["bash", "${path.module}/scripts/find_aws_firehose.sh"]

  query = {
    filter = var.firehose_name_filter
  }
}

# Create an IAM role for CloudWatch Logs to assume when writing to the Firehose
resource "aws_iam_role" "fh_put_record_role" {
  name = "dac-logs-ingest-${var.firehose_name_filter}-role"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : "sts:AssumeRole",
        "Effect" : "Allow",
        "Principal" : {
          "Service" : "logs.amazonaws.com"
        },
      }
    ]
  })
}

resource "aws_iam_role_policy" "fh_put_record_policy" {
  name = "dac-logs-ingest-${var.firehose_name_filter}-policy"
  role = aws_iam_role.fh_put_record_role.id

  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : [
          "firehose:PutRecord",
          "firehose:PutRecordBatch"
        ],
        "Resource" : data.external.find_aws_firehose.result.firehose_arn,
        "Effect" : "Allow"
      }
    ]
  })
}
