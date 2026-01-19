terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "cognito" {
  source = "./cognito"

  project_name           = var.project_name
  environment            = var.environment
  access_token_validity  = var.access_token_validity
  id_token_validity      = var.id_token_validity
  refresh_token_validity = var.refresh_token_validity
  callback_urls          = var.callback_urls
  logout_urls            = var.logout_urls
}

module "dynamodb" {
  source = "./dynamodb"

  project_name = var.project_name
  environment  = var.environment
}

module "apigw" {
  source = "./apigw"

  project_name          = var.project_name
  environment           = var.environment
  region                = var.aws_region
  cognito_user_pool_arn = module.cognito.user_pool_arn
  dynamodb_table_name   = module.dynamodb.table_name
  dynamodb_table_arn    = module.dynamodb.table_arn
}

module "webhosting" {
  source = "./webhosting"

  project_name = var.project_name
  environment  = var.environment
}

# Cognito Outputs
output "cognito_user_pool_id" {
  description = "ID del Cognito User Pool"
  value       = module.cognito.user_pool_id
}

output "cognito_client_id" {
  description = "ID del Cognito Client (per il frontend)"
  value       = module.cognito.client_id
}

output "cognito_domain" {
  description = "Dominio Cognito per OAuth"
  value       = module.cognito.user_pool_domain
}

# Cognito Outputs
output "cognito_hosted_ui_url" {
  description = "URL della Hosted UI"
  value       = module.cognito.hosted_ui_url
}

# DynamoDB Outputs
output "dynamodb_table_name" {
  description = "Nome della tabella DynamoDB per le prenotazioni"
  value       = module.dynamodb.table_name
}

output "dynamodb_table_arn" {
  description = "ARN della tabella DynamoDB"
  value       = module.dynamodb.table_arn
}

# API Gateway Outputs
output "api_endpoint" {
  description = "URL base dell'API"
  value       = module.apigw.api_endpoint
}
