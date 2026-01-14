resource "aws_s3_bucket" "products" {
  for_each = local.product_categories

  bucket        = "${local.name_prefix}-${each.key}"
  force_destroy = true
}

resource "aws_s3_object" "products" {
  for_each = merge([
    for category, files in local.product_categories : {
      for file in files : "${category}/${file}" => {
        bucket   = category
        file     = file
        category = category
      }
    }
  ]...)

  bucket = aws_s3_bucket.products[each.value.category].bucket
  key    = "${each.value.file}"
  source = "../../../img/${each.value.category}/${each.value.file}"
  etag   = filemd5("../../../img/${each.value.category}/${each.value.file}")
}

resource "aws_s3_bucket_public_access_block" "products" {
  for_each = local.product_categories

  bucket = aws_s3_bucket.products[each.key].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}