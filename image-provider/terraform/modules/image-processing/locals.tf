locals {
  dynamodb_items        = jsondecode(file("../../../data/dynamodb-data.json"))
  telescopes_file_list  = fileset("../../../img/telescopes", "**")
  accessories_file_list = fileset("../../../img/accessories", "**")
  static_file_list      = fileset("../../../img/static", "**")
  product_categories = {
    telescopes  = local.telescopes_file_list
    accessories = local.accessories_file_list
    static      = local.static_file_list
  }
  name_prefix = "image-provider-${var.environment}"

  # When set to false, this flag ensures the image-provider Lambda has IAM permission to read the DynamoDB table
  # used to retrieve the bucket name, allowing the Lambda to function correctly during image processing.
  # NOTE: This change is intended to apply to all environments.
  image_provider_failure_enabled = false
}