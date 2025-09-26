data "aws_subnet" "this" {
  tags = {
    Name = "private-subnet-1"
  }
}
