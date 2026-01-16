terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
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

# =============================================================================
# Cognito Module
# =============================================================================
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

# =============================================================================
# Outputs
# =============================================================================
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

output "cognito_hosted_ui_url" {
  description = "URL della Hosted UI"
  value       = module.cognito.hosted_ui_url
}
