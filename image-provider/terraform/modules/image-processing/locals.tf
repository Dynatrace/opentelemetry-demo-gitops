locals {
  dynamodb_items = jsondecode(file("../../../data/dynamodb-data.json"))

  file_list = fileset("../../../img", "**")
}
