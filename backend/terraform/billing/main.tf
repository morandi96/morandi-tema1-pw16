# # Billing Alarm - GRATUITO
# # NOTA: Gli allarmi billing devono essere creati in us-east-1

# terraform {
#   required_providers {
#     aws = {
#       source                = "hashicorp/aws"
#       version               = "~> 5.0"
#       configuration_aliases = [aws.us_east_1]
#     }
#   }
# }

# # SNS Topic per notifiche email
# resource "aws_sns_topic" "billing_alarm" {
#   provider = aws.us_east_1
#   name     = "${var.project_name}-${var.environment}-billing-alarm"

#   tags = {
#     Name        = "${var.project_name}-${var.environment}-billing-alarm"
#     Environment = var.environment
#     Project     = var.project_name
#   }
# }

# # Sottoscrizione email
# resource "aws_sns_topic_subscription" "billing_email" {
#   provider  = aws.us_east_1
#   topic_arn = aws_sns_topic.billing_alarm.arn
#   protocol  = "email"
#   endpoint  = var.alert_email
# }

# # CloudWatch Alarm per costi
# resource "aws_cloudwatch_metric_alarm" "billing_alarm" {
#   provider            = aws.us_east_1
#   alarm_name          = "${var.project_name}-${var.environment}-billing-alarm"
#   comparison_operator = "GreaterThanThreshold"
#   evaluation_periods  = 1
#   metric_name         = "EstimatedCharges"
#   namespace           = "AWS/Billing"
#   period              = 21600  # 6 ore
#   statistic           = "Maximum"
#   threshold           = var.billing_threshold
#   alarm_description   = "Allarme quando i costi AWS superano $${var.billing_threshold}"

#   dimensions = {
#     Currency = "USD"
#   }

#   alarm_actions = [aws_sns_topic.billing_alarm.arn]

#   tags = {
#     Name        = "${var.project_name}-${var.environment}-billing-alarm"
#     Environment = var.environment
#     Project     = var.project_name
#   }
# }
