variable "project_name" {
  type        = string
  description = "Nome del progetto"
}

variable "environment" {
  type        = string
  description = "Ambiente di deployment"
}

variable "alert_email" {
  type        = string
  description = "Email per ricevere gli allarmi di billing"
}

variable "billing_threshold" {
  type        = number
  description = "Soglia di costo in USD per l'allarme"
  default     = 1.0
}
