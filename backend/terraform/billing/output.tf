output "sns_topic_arn" {
  description = "ARN del topic SNS per gli allarmi"
  value       = aws_sns_topic.billing_alarm.arn
}

output "alarm_name" {
  description = "Nome dell'allarme CloudWatch"
  value       = aws_cloudwatch_metric_alarm.billing_alarm.alarm_name
}
