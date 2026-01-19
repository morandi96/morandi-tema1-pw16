# Lambda: Active Reservation

# Build TypeScript prima di creare lo zip
resource "null_resource" "build_active_reservation" {
  triggers = {
    source_hash = filemd5("${path.module}/lambda/active_reservation/src/index.ts")
  }

  provisioner "local-exec" {
    command     = "npm install && npm run build"
    working_dir = "${path.module}/lambda/active_reservation"
  }
}

data "archive_file" "active_reservation_zip" {
  depends_on  = [null_resource.build_active_reservation]
  type        = "zip"
  source_dir  = "${path.module}/lambda/active_reservation/dist"
  output_path = "${path.module}/lambda/active_reservation.zip"
}

resource "aws_lambda_function" "active_reservation" {
  filename         = data.archive_file.active_reservation_zip.output_path
  function_name    = "${var.project_name}-${var.environment}-active-reservation"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.active_reservation_zip.output_base64sha256
  runtime          = "nodejs22.x"
  timeout          = 10
  memory_size      = 128

  environment {
    variables = {
      DYNAMODB_TABLE = var.dynamodb_table_name
      ENVIRONMENT    = var.environment
    }
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-active-reservation"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_lambda_permission" "api_gateway_active" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.active_reservation.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.reservation_api.execution_arn}/*/*"
}
