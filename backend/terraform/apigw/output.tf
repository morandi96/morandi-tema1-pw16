output "api_endpoint" {
  description = "URL base dell'API"
  value       = aws_api_gateway_stage.stage.invoke_url
}

output "api_id" {
  description = "ID dell'API Gateway"
  value       = aws_api_gateway_rest_api.reservation_api.id
}

output "stage_name" {
  description = "Nome dello stage"
  value       = aws_api_gateway_stage.stage.stage_name
}

output "lambda_create_arn" {
  description = "ARN della Lambda create-reservation"
  value       = aws_lambda_function.create_reservation.arn
}

output "lambda_list_arn" {
  description = "ARN della Lambda list-reservations"
  value       = aws_lambda_function.list_reservations.arn
}
