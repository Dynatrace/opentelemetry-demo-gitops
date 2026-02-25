# Logs from AWS resources using DAC

## Requirements
* aws cli
* jq

## Flow
1. Finds Data Firehose created by DAC based on tenant name
  - Uses external data source https://registry.terraform.io/providers/hashicorp/external/latest/docs/data-sources/external since official terraform data firehose do not support filters as of now.
2. Create role to ingest data from Log Group to Data Firehose
