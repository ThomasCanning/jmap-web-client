-include config.mk

TF_DIR ?= infrastructure

.PHONY: build deploy site tf-apply ensure-config local clean lint test

build:
	@echo "Building web client..."
	npm ci
	@if [ -n "$(SERVER_URL)" ]; then \
		VITE_SERVER_URL=$(SERVER_URL) npm run build; \
	else \
		npm run build; \
	fi
	@echo "✓ Build complete"

lint:
	@echo "Running linter and formatter..."
	npx eslint --fix "**/*.{ts,tsx}"
	npx prettier --write "**/*.{ts,tsx,json,md}"
	@echo "✓ Linting complete"

test:
	@echo "Running tests..."
	npm test
	@echo "✓ Tests complete"

deploy: ensure-config ensure-deployment-mode lint test build tf-apply
	@echo ""
	@echo "✓ Deployment complete!"
	@echo ""
	@echo "Check terraform output above for DNS setup instructions."

site: ensure-config build
	@echo "Uploading website files to S3..."
	AWS_REGION=$(REGION) terraform -chdir=$(TF_DIR) init -upgrade
	AWS_REGION=$(REGION) terraform -chdir=$(TF_DIR) apply \
		-target=aws_s3_object.site_files \
		-var="region=$(REGION)" \
		-var="deployment_domain=$(DEPLOYMENT_DOMAIN)" \
		-var="deployment_mode=$(DEPLOYMENT_MODE)" \
		-var="server_cloudfront_id=$(SERVER_CLOUDFRONT_ID)" \
		-auto-approve
	@echo ""
	@echo "✓ Website files uploaded!"
	@echo ""
	@echo "Note: CloudFront cache may take a few minutes to invalidate."

tf-apply:
	@echo "Deploying infrastructure..."
	AWS_REGION=$(REGION) terraform -chdir=$(TF_DIR) init -upgrade
	AWS_REGION=$(REGION) terraform -chdir=$(TF_DIR) apply \
		-var="region=$(REGION)" \
		-var="deployment_domain=$(DEPLOYMENT_DOMAIN)" \
		-var="deployment_mode=$(DEPLOYMENT_MODE)" \
		-var="server_cloudfront_id=$(SERVER_CLOUDFRONT_ID)" \
		-auto-approve

ensure-config:
	@if [ -z "$(REGION)" ] || [ -z "$(DEPLOYMENT_DOMAIN)" ]; then \
	  echo "ERROR: Set REGION and DEPLOYMENT_DOMAIN in config.mk"; \
	  exit 1; \
	fi

ensure-deployment-mode:
	@if [ -z "$(DEPLOYMENT_MODE)" ]; then \
	  echo ""; \
	  echo "=========================================="; \
	  echo "Deployment Mode Selection"; \
	  echo "=========================================="; \
	  echo ""; \
	  echo "Choose deployment mode:"; \
	  echo "  1) separate - Create own CloudFront distribution (use when client and server are on different domains)"; \
	  echo "  2) shared   - Use existing server CloudFront (use when client and server share the same domain)"; \
	  echo ""; \
	  read -p "Enter choice [1 or 2]: " choice; \
	  if [ "$$choice" = "1" ]; then \
	    echo "DEPLOYMENT_MODE = separate" >> config.mk; \
	    echo ""; \
	    echo "✓ Deployment mode saved to config.mk"; \
	    echo ""; \
	  elif [ "$$choice" = "2" ]; then \
	    echo ""; \
	    read -p "Enter server CloudFront distribution ID: " cf_id; \
	    echo "DEPLOYMENT_MODE = shared" >> config.mk; \
	    echo "SERVER_CLOUDFRONT_ID = $$cf_id" >> config.mk; \
	    echo ""; \
	    echo "✓ Deployment mode saved to config.mk"; \
	    echo ""; \
	  else \
	    echo "ERROR: Invalid choice. Must be 1 or 2."; \
	    exit 1; \
	  fi; \
	fi
	@if [ "$(DEPLOYMENT_MODE)" = "shared" ] && [ -z "$(SERVER_CLOUDFRONT_ID)" ]; then \
	  echo "ERROR: SERVER_CLOUDFRONT_ID is required when DEPLOYMENT_MODE = shared"; \
	  echo "Set it in config.mk or run 'make deploy' again to set it interactively"; \
	  exit 1; \
	fi

local:
	@rm -f .env.local
	@echo "VITE_SERVER_URL=http://localhost:3001" > .env.local
	npm run dev

clean:
	rm -rf dist node_modules

