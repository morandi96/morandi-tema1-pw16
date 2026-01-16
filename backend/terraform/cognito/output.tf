output "user_pool_id" {
  description = "ID del Cognito User Pool"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  description = "ARN del Cognito User Pool"
  value       = aws_cognito_user_pool.main.arn
}

output "client_id" {
  description = "ID del Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.main.id
}

output "user_pool_domain" {
  description = "Dominio del Cognito User Pool"
  value       = aws_cognito_user_pool_domain.main.domain
}

output "hosted_ui_url" {
  description = "URL della Hosted UI di Cognito"
  value       = "https://${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
}
