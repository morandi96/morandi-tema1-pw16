variable "project_name" {
  type        = string
  description = "Nome del progetto"
  default     = "pw16"
}

variable "environment" {
  type        = string
  description = "Ambiente di deployment"
  default     = "dev"
}

variable "aws_region" {
  type        = string
  description = "AWS Region"
  default     = "eu-west-1"
}

# Cognito Token Validity
variable "access_token_validity" {
  type        = number
  description = "Durata access token in minuti"
  default     = 60
}

variable "id_token_validity" {
  type        = number
  description = "Durata id token in minuti"
  default     = 60
}

variable "refresh_token_validity" {
  type        = number
  description = "Durata refresh token in giorni"
  default     = 30
}

# OAuth URLs
variable "callback_urls" {
  type        = list(string)
  description = "URL di callback per OAuth"
  default     = ["http://localhost:5173"]
}

variable "logout_urls" {
  type        = list(string)
  description = "URL di logout per OAuth"
  default     = ["http://localhost:5173"]
}

# Billing Alarm
# variable "alert_email" {
#   type        = string
#   description = "Email per ricevere gli allarmi di billing"
#   default     = "morandi.christian96w@gmail.com"
# }

# variable "billing_threshold" {
#   type        = number
#   description = "Soglia di costo in USD per l'allarme"
#   default     = 1.0
# }
