# AWS DAC logs

## Description
Module subscribes AWS Log Groups to Firehose stream that DAC creates for given Dynatrace instance.

## Usage

```hcl
module "aws_dac_logs" {
	source = "../aws_dac_logs"

	subscription_name            = "dac-logs-subscription"
	log_group_name               = "/aws/lambda/example-function"
	firehose_stream_arn          = "arn:aws:firehose:us-east-1:123456789012:deliverystream/example"
	subscription_filter_pattern  = ""
}
```

Notes:
- `subscription_filter_pattern` is optional. If omitted or set to empty string, all log events are forwarded.
