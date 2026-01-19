output "table_name" {
  description = "Nome della tabella DynamoDB"
  value       = aws_dynamodb_table.reservations.name
}

output "table_arn" {
  description = "ARN della tabella DynamoDB"
  value       = aws_dynamodb_table.reservations.arn
}

output "status_index_name" {
  description = "Nome del GSI per status"
  value       = "StatusIndex"
}

output "date_index_name" {
  description = "Nome del GSI per data"
  value       = "DateIndex"
}
