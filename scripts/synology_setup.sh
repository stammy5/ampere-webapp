#!/bin/bash
# Synology NAS setup script for AMPERE WEBAPP

echo "Creating required directories for AMPERE WEBAPP..."

# Create directories for persistent storage
mkdir -p /volume1/docker/ampere-webapp/postgres_data
mkdir -p /volume1/docker/ampere-webapp/uploads
mkdir -p /volume1/docker/ampere-webapp/app_data

# Set permissions
echo "Setting correct permissions..."
chmod -R 777 /volume1/docker/ampere-webapp

# Create symlink for Docker socket (helps with permission issues)
echo "Creating Docker socket symlink..."
ln -sf /var/run/docker.sock /volume1/docker/docker.sock
chmod 666 /volume1/docker/docker.sock

echo "Setup complete. You can now deploy AMPERE WEBAPP using Docker Compose."
echo "Use the following command to start the application:"
echo "docker-compose up -d"