output "dynatrace_tenant" {
  value = sensitive(jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)["DT_TENANT"])
}
output "dt_cluster_id" {
  value = sensitive(jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)["DT_CLUSTER"])
}
output "dt_connection_base_url" {
  value = sensitive(jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)["DT_CONNECTION_BASE_URL"])
}
output "dt_connection_auth_token" {
  value = sensitive(jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)["DT_CONNECTION_AUTH_TOKEN"])
}
output "dt_log_collection_auth_token" {
  value = sensitive(jsondecode(data.aws_secretsmanager_secret_version.this.secret_string)["DT_LOG_COLLECTION_AUTH_TOKEN"])
}
