variable "project_name" {
  type        = string
  description = "Nome del progetto"
}

variable "environment" {
  type        = string
  description = "Ambiente di deployment"
}

variable "region" {
  type        = string
  description = "AWS Region"
}

variable "cognito_user_pool_arn" {
  type        = string
  description = "ARN del Cognito User Pool per l'autorizzazione"
}

variable "dynamodb_table_name" {
  type        = string
  description = "Nome della tabella DynamoDB per le prenotazioni"
}

variable "dynamodb_table_arn" {
  type        = string
  description = "ARN della tabella DynamoDB per le prenotazioni"
}
