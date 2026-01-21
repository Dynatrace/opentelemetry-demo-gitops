locals {
  dynamodb_items = jsondecode(file("../../../data/dynamodb-data.json"))
  telescopes_file_list     = fileset("../../../img/telescopes", "**")
  accessories_file_list    = fileset("../../../img/accessories", "**")
  product_categories = {
    telescopes  = local.telescopes_file_list
    accessories = local.accessories_file_list
  }
  name_prefix    = "image-provider-${var.environment}"
}
