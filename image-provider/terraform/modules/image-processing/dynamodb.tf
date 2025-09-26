resource "aws_dynamodb_table" "this" {
  name         = "astroshop-${var.environment}-products"
  hash_key     = "id"
  billing_mode = "PAY_PER_REQUEST"

  server_side_encryption {
    enabled = true
  }

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_dynamodb_table_item" "this" {
  for_each = { for item in local.dynamodb_items : item.id => item }

  table_name = aws_dynamodb_table.this.name
  hash_key   = aws_dynamodb_table.this.hash_key

  item = jsonencode({
    id      = { S = each.value.id }
    picture = { S = each.value.picture }
  })
}
