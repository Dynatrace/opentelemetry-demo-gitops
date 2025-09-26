resource "aws_s3_bucket" "this" {
  bucket = "astroshop-image-provider-staging"

  force_destroy = true
}


resource "aws_s3_object" "this" {
  for_each = { for file in local.file_list : file => file }

  bucket = aws_s3_bucket.this.bucket
  key    = each.key
  source = "../../../img/${each.value}"
  etag   = filemd5("../../../img/${each.value}")
}

