terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

locals {
  site_dir = "${path.module}/../dist"
}

########################
# ACM Certificate (CloudFront - must be in us-east-1)
# Only needed for separate deployment mode
########################

resource "aws_acm_certificate" "root_cf" {
  count             = var.deployment_mode == "separate" ? 1 : 0
  provider          = aws.us_east_1
  domain_name       = var.deployment_domain
  validation_method = "DNS"
}

resource "aws_acm_certificate_validation" "root_cf" {
  count           = var.deployment_mode == "separate" ? 1 : 0
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.root_cf[0].arn
}

########################
# S3 Bucket for Static Site
########################

resource "aws_s3_bucket" "site" {
  bucket = "jmap-web-${replace(var.deployment_domain, ".", "-")}"
}

resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = ["s3:GetObject"]
      Resource  = ["${aws_s3_bucket.site.arn}/*"]
    }]
  })
  depends_on = [aws_s3_bucket_public_access_block.site]
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}

resource "aws_s3_object" "site_files" {
  for_each     = fileset(local.site_dir, "**")
  bucket       = aws_s3_bucket.site.id
  key          = each.value
  source       = "${local.site_dir}/${each.value}"
  etag         = filemd5("${local.site_dir}/${each.value}")
  content_type = lookup({
    "html" = "text/html"
    "css"  = "text/css"
    "js"   = "application/javascript"
    "json" = "application/json"
    "png"  = "image/png"
    "jpg"  = "image/jpeg"
    "jpeg" = "image/jpeg"
    "svg"  = "image/svg+xml"
    "ico"  = "image/x-icon"
    "txt"  = "text/plain"
    "webp" = "image/webp"
  }, regex("\\.[^.]+$", each.value) != null ? replace(regex("\\.[^.]+$", each.value), ".", "") : "bin", "application/octet-stream")
}

########################
# CloudFront Function for SPA Routing
# Only created in "separate" deployment mode
########################

resource "aws_cloudfront_function" "spa_routing" {
  count    = var.deployment_mode == "separate" ? 1 : 0
  name     = "jmap-web-spa-routing-${replace(var.deployment_domain, ".", "-")}"
  runtime  = "cloudfront-js-1.0"
  comment  = "SPA routing: rewrite requests without file extensions to index.html"
  publish  = true
  code     = <<-EOT
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Check if the URI has a file extension (e.g., .js, .css, .png, etc.)
    // If it does, let it pass through normally - these are actual assets
    if (uri.match(/\.[a-zA-Z0-9]+$/)) {
        return request;
    }
    
    // Handle root path
    if (uri === '/') {
        request.uri = '/index.html';
        return request;
    }
    
    // If the URI doesn't have a file extension, it's a route
    // Rewrite it to index.html for SPA routing
    request.uri = '/index.html';
    
    return request;
}
EOT
}

########################
# CloudFront Distribution (Pure SPA Hosting)
# Only created in "separate" deployment mode
########################

resource "aws_cloudfront_distribution" "root" {
  count                = var.deployment_mode == "separate" ? 1 : 0
  enabled              = true
  aliases              = [var.deployment_domain]
  default_root_object  = "index.html"
  price_class          = "PriceClass_100"
  is_ipv6_enabled      = true
  comment              = "JMAP Web Client - Pure SPA"

  # S3 origin for web app (ONLY S3 - no JMAP API origin)
  origin {
    domain_name = aws_s3_bucket_website_configuration.site.website_endpoint
    origin_id   = "s3-website-origin"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default behavior: serve web app
  default_cache_behavior {
    target_origin_id       = "s3-website-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Use CloudFront Function for SPA routing
    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.spa_routing[0].arn
    }

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # Fallback error responses (should rarely be hit now with the function)
  # These are kept as a safety net, but the CloudFront Function handles most cases
  custom_error_response {
    error_code         = 404
    response_code      = 404
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 403
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.root_cf[0].certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  depends_on = [aws_acm_certificate_validation.root_cf[0]]
}

