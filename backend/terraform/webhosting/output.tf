output "s3_bucket_name" {
  description = "Nome del bucket S3"
  value       = aws_s3_bucket.frontend.bucket
}

output "s3_bucket_arn" {
  description = "ARN del bucket S3"
  value       = aws_s3_bucket.frontend.arn
}

output "cloudfront_distribution_id" {
  description = "ID della distribuzione CloudFront"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "Domain name della distribuzione CloudFront (URL del frontend)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "frontend_url" {
  description = "URL completo del frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}
