provider "aws" {
    region = "eu-central-1"
}

data "aws_ssm_parameter" "vpc_id" {
    name = "/feedback-app/backend/test/vpc-id"
}

data "aws_ssm_parameter" "db_username" {
    name = "/feedback-app/backend/test/db-user"
}

data "aws_ssm_parameter" "db_password" {
    name = "/feedback-app/backend/test/db-password"
}

data "aws_ssm_parameter" "db_name" {
    name = "/feedback-app/backend/test/db-name"
}

data "aws_ssm_parameter" "db_port" {
    name = "/feedback-app/backend/test/db-port"
}

resource "aws_security_group" "rds_postgres_sg" {
    name = "rds-postgres-sg"
    description = "Allow all inbound traffic to postgres db."
    vpc_id = data.aws_ssm_parameter.vpc_id.value

    ingress {
        from_port = data.aws_ssm_parameter.db_port.value
        to_port = data.aws_ssm_parameter.db_port.value
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

data "aws_subnets" "selected_subnets" {
    filter {
      name = "vpc-id"
      values = [data.aws_ssm_parameter.vpc_id.value]
    }
}

resource "aws_db_subnet_group" "rds_subnet_group" {
    name = "rds-subnet-group"
    subnet_ids = data.aws_subnets.selected_subnets.ids
}

resource "aws_db_instance" "feedback_db" {
    identifier = "feedback-api-db"
    engine = "postgres"
    engine_version = "16.3"
    instance_class = "db.t3.micro"
    storage_type = "gp3"
    allocated_storage = 20
    username = data.aws_ssm_parameter.db_username.value
    password = data.aws_ssm_parameter.db_password.value
    db_name = data.aws_ssm_parameter.db_name.value
    port = data.aws_ssm_parameter.db_port.value
    parameter_group_name = "default.postgres16"
    publicly_accessible = true
    vpc_security_group_ids = [ aws_security_group.rds_postgres_sg.id ]
    db_subnet_group_name = aws_db_subnet_group.rds_subnet_group.name

    skip_final_snapshot = true
}

resource "aws_ssm_parameter" "rds_endpoint" {
    name = "/feedback-app/backend/test/db-host"
    type = "String"
    value = aws_db_instance.feedback_db.endpoint
}

output "rds_endpoint" {
    description = "The endpoint of the RDS Postgres database."
    value = aws_db_instance.feedback_db.endpoint
}