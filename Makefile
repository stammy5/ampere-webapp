# Makefile for Ampere AI Document Processing Service

# Variables
PYTHON = python3
PIP = pip3
SERVICE_DIR = ai_service
VENV = venv
VENV_BIN = $(VENV)/bin

# Check if we're on Windows
ifeq ($(OS),Windows_NT)
	VENV_BIN = $(VENV)/Scripts
	PYTHON = python
	PIP = pip
endif

# Default target
.PHONY: help
help:
	@echo "Ampere AI Document Processing Service - Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  install     - Install dependencies"
	@echo "  run         - Run the AI service"
	@echo "  test        - Run tests"
	@echo "  build       - Build Docker image"
	@echo "  clean       - Clean Python cache files"
	@echo "  help        - Show this help message"

# Install dependencies
.PHONY: install
install:
	@echo "Installing dependencies..."
	@if [ ! -d "$(VENV)" ]; then \
		$(PYTHON) -m venv $(VENV); \
	fi
	$(VENV_BIN)/$(PIP) install -r $(SERVICE_DIR)/requirements.txt
	@echo "Dependencies installed successfully!"

# Run the service
.PHONY: run
run:
	@echo "Starting AI service..."
	@if [ -d "$(VENV)" ]; then \
		$(VENV_BIN)/$(PYTHON) $(SERVICE_DIR)/main.py; \
	else \
		$(PYTHON) $(SERVICE_DIR)/main.py; \
	fi

# Run tests
.PHONY: test
test:
	@echo "Running tests..."
	@if [ -d "$(VENV)" ]; then \
		$(VENV_BIN)/$(PYTHON) -m pytest $(SERVICE_DIR)/tests/ -v; \
	else \
		$(PYTHON) -m pytest $(SERVICE_DIR)/tests/ -v; \
	fi

# Build Docker image
.PHONY: build
build:
	@echo "Building Docker image..."
	docker build -t ampere-ai-service $(SERVICE_DIR)/

# Clean Python cache files
.PHONY: clean
clean:
	@echo "Cleaning Python cache files..."
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*~" -delete
	@echo "Clean completed!"

# Docker Compose commands
.PHONY: up
up:
	@echo "Starting services with Docker Compose..."
	docker-compose -f $(SERVICE_DIR)/docker-compose.yml up -d

.PHONY: down
down:
	@echo "Stopping services with Docker Compose..."
	docker-compose -f $(SERVICE_DIR)/docker-compose.yml down