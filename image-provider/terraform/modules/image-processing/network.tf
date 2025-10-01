data "aws_subnet" "this" {
  tags = {
    Name = var.private_subnet_name
  }
}
