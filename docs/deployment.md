# Deployment guide

## Prerequisites

- Node.js 18+
- AWS CLI configured
- Terraform installed
- DNS provider access
- Deployed JMAP server

## Deployment Modes

The web client supports two deployment modes:

1. **Separate mode** (default): Creates its own CloudFront distribution
   - Use when client and server are on different domains (e.g., `clientdomain.com` client, `serverdomain.com` server)
   - Fully independent deployment
   - Requires DNS setup for the client domain

2. **Shared mode**: Uses existing server CloudFront distribution
   - Use when client and server share the same domain (e.g., both on `domain.com`)
   - Must use shared infrastructure as server cloudfront must redirect autodiscovery endpoints, and web client must be served on root domain
   - Web client S3 bucket is created, but you must configure server CloudFront to serve it
   - **Deployment order**: Server must be deployed first, then client, then server again

## Deployment Steps

1. Configure deployment settings:
```bash
cp config.mk.example config.mk
# Edit config.mk: set REGION, DEPLOYMENT_DOMAIN, JMAP_API_URL
```

2. Configure AWS credentials (see https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html):
```bash
aws configure sso
aws sso login
```

3. Run initial deployment:
```bash
make deploy
```

   On first run, you will be prompted to choose a deployment mode:
   - Enter `1` for separate mode (own CloudFront)
   - Enter `2` for shared mode (use server CloudFront)
   
   If you choose shared mode, you'll also need to provide your server's CloudFront distribution ID.
   
   Your choice is saved to `config.mk` and will be used for all future deployments.

4. **If using separate mode**, follow these DNS setup steps:

   a. Create the certificate validation DNS record at your DNS provider. Record details are shown in the terraform output after deployment:
      - Name: `<from terraform output>`
      - Type: CNAME
      - Value: `<from terraform output>`
      - TTL: 300
      
      Note: Record name is shown without the zone suffix (most providers add it automatically).

   b. Wait until DNS record propagates and certificate validates. You can verify certificate status in AWS Certificate Manager (us-east-1 region).

   c. Once certificate shows `ISSUED`, create the domain DNS record at your DNS provider:
      - Name: `<DEPLOYMENT_DOMAIN>`
      - Type: A or CNAME (some providers require ALIAS for root domains)
      - Value: `<CloudFront domain from terraform output>`
      - TTL: 300
      
      Note: Record name is shown without the zone suffix (most providers add it automatically).

   d. Wait for DNS propagation (10-15 minutes), then test:
      ```bash
      curl https://your-domain.com
      ```

5. **If using shared mode**, follow these steps in order:

   **Step 5a: Deploy server first** (if not already deployed)
   
   The server must be deployed first to create the CloudFront distribution:
   Take note of the CloudFront distribution ID:
   **Step 5b: Deploy client in shared mode**
   
   When prompted during `make deploy`, choose option `2` (shared mode) and provide the CloudFront distribution ID from step 5a.
   
   After deployment, take note of the S3 website endpoint:

   **Step 5c: Configure and redeploy server**
   
   In your server repo, configure it to serve the web client by adding the S3 endpoint to server's `config.mk` or Terraform variables

   **Step 5d: Verify deployment**
   
   Wait for CloudFront deployment (5-10 minutes), then test:
   ```bash
   curl https://your-domain.com                    # Should serve web client
   curl https://your-domain.com/.well-known/jmap   # Should serve autodiscovery
   ```

