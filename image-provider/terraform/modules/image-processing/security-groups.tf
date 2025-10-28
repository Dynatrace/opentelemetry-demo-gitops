resource "aws_security_group" "this" {
  name        = "${local.name_prefix}-sg"
  description = "Allows image processing to access the internet"
  vpc_id      = data.aws_subnet.this.vpc_id
}

resource "aws_vpc_security_group_egress_rule" "vpc_egress" {
  security_group_id = aws_security_group.this.id

  from_port   = 443
  to_port     = 443
  ip_protocol = "TCP"
  cidr_ipv4   = "0.0.0.0/0"
}
