variable "vpc_id" {
    description = "The ID of the existing VPC."
    type = string
}

variable "public_subnet_id" {
    description = "The ID of the public subnet to use."
    type = string
}

variable "security_group_id" {
    description = "The ID of the security group to use."
    type = string
}

variable "ecs_task_execution_role_arn" {
    description = "The ARN of the ECS task execution role."
    type = string
}