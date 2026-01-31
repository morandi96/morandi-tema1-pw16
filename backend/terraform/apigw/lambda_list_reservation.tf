resource "null_resource" "build_list_reservations" {
  triggers = {
    source_hash = filemd5("${path.module}/lambda/list_reservations/src/index.ts")
  }

  provisioner "local-exec" {
    command     = "npm install && npm run build"
    working_dir = "${path.module}/lambda/list_reservations"
  }
}

data "archive_file" "list_reservations_zip" {
  depends_on  = [null_resource.build_list_reservations]
  type        = "zip"
  source_dir  = "${path.module}/lambda/list_reservations/dist"
  output_path = "${path.module}/lambda/list_reservations.zip"
}

resource "aws_lambda_function" "list_reservations" {
  filename         = data.archive_file.list_reservations_zip.output_path
  function_name    = "${var.project_name}-${var.environment}-list-reservations"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.list_reservations_zip.output_base64sha256
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
    Name        = "${var.project_name}-${var.environment}-list-reservations"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_lambda_permission" "api_gateway_list" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.list_reservations.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.reservation_api.execution_arn}/*/*"
}
