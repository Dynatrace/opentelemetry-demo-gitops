locals {
  dynatrace_tenant             = sensitive(jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)["DT_TENANT"])
  dt_cluster_id                = sensitive(jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)["DT_CLUSTER_ID"])
  dt_connection_base_url       = sensitive(jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)["DT_URL"])
  dt_connection_auth_token     = sensitive(jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)["DT_CONNECTION_AUTH_TOKEN"])
  dt_log_collection_auth_token = sensitive(jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)["DT_LOG_COLLECTION_AUTH_TOKEN"])

  dynamodb_items = jsondecode(file("../../../data/dynamodb-data.json"))

  file_list = fileset("../../../img", "**")
}
