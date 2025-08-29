#!/bin/sh
# Database migration script for AMPERE WEBAPP

# Exit on error
set -e

echo "Starting database migration process..."
echo "Database URL: $DATABASE_URL"

# Check if database is available
echo "Checking database connection..."
MAX_RETRIES=30
COUNTER=0

until nc -z db 5432; do
  COUNTER=$((COUNTER+1))
  if [ $COUNTER -gt $MAX_RETRIES ]; then
    echo "Database connection failed after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "Waiting for database connection (attempt: $COUNTER)..."
  sleep 2
done

echo "Database connection successful."

# Run migrations based on your ORM
# For Prisma ORM (uncomment if using Prisma)
# npx prisma migrate deploy

# For Sequelize (uncomment if using Sequelize)
# npx sequelize-cli db:migrate

# For custom migrations
# node scripts/migrate.js

echo "Database migration completed successfully."