
resource "aws_dynamodb_table" "reservations" {
  name         = "${var.project_name}-${var.environment}-reservations"
  billing_mode = "PAY_PER_REQUEST"

  # Chiave primaria: PK (Partition Key) + SK (Sort Key)
  # PK = USER#<user_id> per raggruppare per utente
  # SK = RESERVATION#<reservation_id> per identificare singola prenotazione
  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  # Global Secondary Index per query per status (active, cancelled, completed)
  attribute {
    name = "status"
    type = "S"
  }

  # Global Secondary Index per query per data
  attribute {
    name = "date"
    type = "S"
  }

  # Global Secondary Index per cercare prenotazioni per status
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "PK"
    range_key       = "status"
    projection_type = "ALL"
  }

  # Global Secondary Index per cercare prenotazioni per data
  global_secondary_index {
    name            = "DateIndex"
    hash_key        = "PK"
    range_key       = "date"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = false
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-reservations"
    Description = "DynamoDB table for medical reservations"
  }
}
