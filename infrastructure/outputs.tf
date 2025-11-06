locals {
  cert_validation_name = var.deployment_mode == "separate" && length(aws_acm_certificate.root_cf) > 0 ? try(tolist(aws_acm_certificate.root_cf[0].domain_validation_options)[0].resource_record_name, "See AWS Console") : ""
  cert_validation_value = var.deployment_mode == "separate" && length(aws_acm_certificate.root_cf) > 0 ? try(tolist(aws_acm_certificate.root_cf[0].domain_validation_options)[0].resource_record_value, "See AWS Console") : ""
  cloudfront_domain = var.deployment_mode == "separate" && length(aws_cloudfront_distribution.root) > 0 ? aws_cloudfront_distribution.root[0].domain_name : ""

  dns_instructions_separate = var.deployment_mode == "separate" ? join("\n", [
    "",
    "=================================================================",
    "DNS SETUP REQUIRED (Separate Mode)",
    "=================================================================",
    "",
    "Create these DNS records at your DNS provider:",
    "",
    "1. ACM Certificate Validation (temporary):",
    "   Name:  ${local.cert_validation_name}",
    "   Type:  CNAME",
    "   Value: ${local.cert_validation_value}",
    "   TTL:   300",
    "   ",
    "   Note: Wait for certificate to validate (5-10 minutes) before creating A record.",
    "",
    "2. Web Client Domain (after cert validates):",
    "   Name:  ${var.deployment_domain}",
    "   Type:  A or CNAME",
    "   Value: ${local.cloudfront_domain}",
    "   TTL:   300",
    "   ",
    "   Note: Some DNS providers require ALIAS record for root domains.",
    "",
    "3. (Optional) AAAA Record for IPv6:",
    "   Name:  ${var.deployment_domain}",
    "   Type:  AAAA or CNAME",
    "   Value: ${local.cloudfront_domain}",
    "   TTL:   300",
    "",
    "Wait 10-15 minutes for DNS propagation.",
    "",
    "Test: curl https://${var.deployment_domain}",
    "",
    "=================================================================",
  ]) : ""

  dns_instructions_shared = var.deployment_mode == "shared" ? join("\n", [
    "",
    "=================================================================",
    "SHARED MODE: Server CloudFront Integration Required",
    "=================================================================",
    "",
    "The web client S3 bucket has been created. You now need to configure",
    "your server's CloudFront distribution to serve the web client.",
    "",
    "S3 Bucket: ${aws_s3_bucket.site.id}",
    "S3 Website Endpoint: ${aws_s3_bucket_website_configuration.site.website_endpoint}",
    "",
    "=================================================================",
  ]) : ""
}

output "dns_setup_instructions" {
  value = var.deployment_mode == "separate" ? local.dns_instructions_separate : local.dns_instructions_shared
}

output "website_url" {
  description = "Website URL"
  value       = "https://${var.deployment_domain}"
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain (target for DNS)"
  value       = var.deployment_mode == "separate" ? aws_cloudfront_distribution.root[0].domain_name : "N/A (using server CloudFront)"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = var.deployment_mode == "separate" ? aws_cloudfront_distribution.root[0].id : "N/A (using server CloudFront)"
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.site.id
}

output "s3_website_endpoint" {
  description = "S3 website endpoint (for server CloudFront integration)"
  value       = aws_s3_bucket_website_configuration.site.website_endpoint
}

output "cert_validation_record" {
  description = "Certificate validation CNAME record"
  value = var.deployment_mode == "separate" ? try({
    name  = tolist(aws_acm_certificate.root_cf[0].domain_validation_options)[0].resource_record_name
    value = tolist(aws_acm_certificate.root_cf[0].domain_validation_options)[0].resource_record_value
  }, {}) : {}
}

output "server_integration_info" {
  description = "Information needed for server CloudFront integration"
  value = var.deployment_mode == "shared" ? {
    s3_bucket_name      = aws_s3_bucket.site.id
    s3_website_endpoint = aws_s3_bucket_website_configuration.site.website_endpoint
    deployment_domain   = var.deployment_domain
  } : null
}

