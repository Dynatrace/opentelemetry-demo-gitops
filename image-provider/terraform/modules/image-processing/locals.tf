locals {
  dynamodb_items        = jsondecode(file("../../../data/dynamodb-data.json"))
  telescopes_file_list  = fileset("../../../img/telescopes", "**")
  accessories_file_list = fileset("../../../img/accessories", "**")
  product_categories = {
    telescopes  = local.telescopes_file_list
    accessories = local.accessories_file_list
  }
  name_prefix = "image-provider-${var.environment}"

  # When set to true, this flag causes the image-provider Lambda to fail during image processing.
  # The failure simulates losing IAM permission to read the DynamoDB table used to retrieve the bucket name,
  # so the Lambda will throw an error when attempting that lookup.
  # NOTE: This change is intended to apply to all environments.
  image_provider_failure_enabled = true
}
