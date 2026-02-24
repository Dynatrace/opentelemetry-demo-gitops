#!/bin/bash

# This script finds the AWS Firehose delivery stream created by DAC for a given tenant, based on a filter string.
# It outputs the name and ARN of the Firehose in JSON format.
# Test locally:
#   echo '{"filter":"uby"}' | ./find_aws_firehose.sh

set -euo pipefail

eval "$(jq -r '@sh "FILTER=\(.filter)"')"

DELIVERY_STREAM_NAMES_JSON="$(aws firehose list-delivery-streams \
    --query "DeliveryStreamNames[?contains(@, '$FILTER')]" \
    --output json)"
FIREHOSE_NAME="$(jq -r 'sort | .[0] // empty' <<< "$DELIVERY_STREAM_NAMES_JSON")"

# Fail if no matching Firehose delivery stream is found
if [[ -z "$FIREHOSE_NAME" ]]; then
	echo "No AWS Firehose delivery stream found matching filter: $FILTER" >&2
	exit 1
fi

# Get the ARN of the found Firehose delivery stream
FIREHOSE_ARN="$(aws firehose describe-delivery-stream \
    --delivery-stream-name "$FIREHOSE_NAME" \
    --query "DeliveryStreamDescription.DeliveryStreamARN" \
    --output text)"

# Output the Firehose name and ARN as JSON
jq -n \
	--arg firehose_name "$FIREHOSE_NAME" \
	--arg firehose_arn "$FIREHOSE_ARN" \
	'{"firehose_name":$firehose_name,"firehose_arn":$firehose_arn}'
