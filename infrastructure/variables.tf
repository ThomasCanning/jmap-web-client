variable "region" {
  type        = string
  description = "AWS region for S3 bucket"
}

variable "deployment_domain" {
  type        = string
  description = "Domain for web client (e.g., jmapbox.com or app.jmapbox.com)"
}

variable "deployment_mode" {
  type        = string
  description = "Deployment mode: 'separate' (own CloudFront) or 'shared' (use server CloudFront)"
  default     = "separate"
  validation {
    condition     = contains(["separate", "shared"], var.deployment_mode)
    error_message = "deployment_mode must be 'separate' or 'shared'"
  }
}

variable "server_cloudfront_id" {
  type        = string
  description = "Server CloudFront distribution ID (required when deployment_mode = 'shared')"
  default     = ""
}

