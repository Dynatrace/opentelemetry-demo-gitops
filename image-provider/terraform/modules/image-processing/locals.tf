locals {
  dynamodb_items = jsondecode(file("../../../data/dynamodb-data.json"))
  file_list      = fileset("../../../img", "**")
  name_prefix    = "image-provider-${var.environment}"
}
