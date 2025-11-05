resource "aws_s3_bucket" "this" {
  bucket = local.name_prefix

  force_destroy = true
}


resource "aws_s3_object" "this" {
  for_each = { for file in local.file_list : file => file }

  bucket = aws_s3_bucket.this.bucket
  key    = "original/${each.key}"
  source = "../../../img/${each.value}"
  etag   = filemd5("../../../img/${each.value}")
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
