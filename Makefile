.PHONY: help install dev build lint type-check preview clean docker-build docker-run format test

# Default target - show help
help:
	@echo "Hamsaya Dashboard - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install     - Install dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build for production"
	@echo "  make preview     - Preview production build"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint        - Run ESLint"
	@echo "  make format      - Format code with Prettier"
	@echo "  make type-check  - Run TypeScript type checking"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-run   - Run Docker container"
	@echo "  make docker-stop  - Stop Docker container"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean       - Clean build artifacts and dependencies"
	@echo "  make deps        - Update dependencies"
	@echo ""

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Alternative: install with clean cache
install-clean:
	@echo "Installing dependencies with clean cache..."
	rm -rf node_modules package-lock.json
	npm install

# Start development server
dev:
	@echo "Starting development server..."
	npm run dev

# Build for production
build:
	@echo "Building for production..."
	npm run build

# Preview production build
preview:
	@echo "Previewing production build..."
	npm run preview

# Run linter
lint:
	@echo "Running ESLint..."
	npm run lint

# Format code with Prettier (if configured)
format:
	@echo "Formatting code..."
	@if [ -f "node_modules/.bin/prettier" ]; then \
		npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,json}"; \
	else \
		echo "Prettier not installed. Run 'npm install -D prettier' to add it."; \
	fi

# Type check with TypeScript
type-check:
	@echo "Running TypeScript type checking..."
	npx tsc --noEmit

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t hamsaya-dashboard:latest .

# Run Docker container
docker-run:
	@echo "Running Docker container..."
	docker run -d \
		--name hamsaya-dashboard \
		-p 3000:80 \
		-e VITE_API_URL=${VITE_API_URL:-http://localhost:8080/api/v1} \
		hamsaya-dashboard:latest
	@echo "Dashboard running at http://localhost:3000"

# Stop Docker container
docker-stop:
	@echo "Stopping Docker container..."
	docker stop hamsaya-dashboard || true
	docker rm hamsaya-dashboard || true

# Start all services with docker-compose
docker-up:
	@echo "Starting services with docker-compose..."
	docker-compose up -d

# Stop all services with docker-compose
docker-down:
	@echo "Stopping services with docker-compose..."
	docker-compose down

# View docker-compose logs
docker-logs:
	docker-compose logs -f

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules
	rm -rf .vite

# Update dependencies
deps:
	@echo "Updating dependencies..."
	npm update

# Check for outdated dependencies
deps-check:
	@echo "Checking for outdated dependencies..."
	npm outdated

# Run security audit
audit:
	@echo "Running security audit..."
	npm audit

# Fix security vulnerabilities
audit-fix:
	@echo "Fixing security vulnerabilities..."
	npm audit fix

# Analyze bundle size
analyze:
	@echo "Analyzing bundle size..."
	@echo "Building with source maps for analysis..."
	npm run build -- --sourcemap
	@echo "Use a tool like 'source-map-explorer dist/assets/*.js' to analyze"

# CI/CD - Full check (lint + type-check + build)
ci:
	@echo "Running CI checks..."
	@make lint
	@make type-check
	@make build
	@echo "All CI checks passed!"

# Quick dev setup (install + dev)
setup:
	@make install
	@echo "Copying .env.example to .env..."
	@if [ ! -f .env ]; then cp .env.example .env; fi
	@echo "Setup complete! Edit .env if needed, then run 'make dev'"

# Production build with environment
build-prod:
	@echo "Building for production..."
	@if [ -z "$(API_URL)" ]; then \
		echo "Error: API_URL not set. Usage: make build-prod API_URL=https://api.example.com/api/v1"; \
		exit 1; \
	fi
	VITE_API_URL=$(API_URL) npm run build
	@echo "Production build complete!"

# Staging build with environment
build-staging:
	@echo "Building for staging..."
	@if [ -z "$(API_URL)" ]; then \
		echo "Error: API_URL not set. Usage: make build-staging API_URL=https://staging-api.example.com/api/v1"; \
		exit 1; \
	fi
	VITE_API_URL=$(API_URL) npm run build
	@echo "Staging build complete!"
