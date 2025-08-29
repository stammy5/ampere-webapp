# AMPERE WEBAPP Docker Deployment Guide

This guide outlines how to deploy the AMPERE WEBAPP using Docker, with a focus on data persistence and safe updates.

## Prerequisites

- Docker and Docker Compose installed on the server
- Git for version control
- Basic understanding of Docker concepts

## Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AMPERE\ WEBAPP
   ```

2. Create an environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit the `.env` file with your preferred settings:
   - Set a secure database password
   - Update ports if needed
   - Set the initial app version

## Synology NAS Deployment

For Synology NAS users, we've provided a special setup script:

1. Enable SSH on your Synology NAS in Control Panel > Terminal & SNMP

2. Connect to your NAS via SSH:
   ```bash
   ssh admin@your-nas-ip
   ```

3. Run the setup script (you may need to make it executable first):
   ```bash
   cd /volume1/docker/ampere-webapp
   chmod +x scripts/synology_setup.sh
   sudo ./scripts/synology_setup.sh
   ```

4. This script will:
   - Create necessary directories for persistent storage
   - Set proper permissions
   - Create symlinks to fix common Docker issues on Synology

5. Deploy using docker-compose:
   ```bash
   docker-compose up -d
   ```

### Resolving Synology-Specific Issues

If you encounter the error "unable to evaluate symlinks in Dockerfile path":

1. Go to Control Panel > Task Scheduler in DSM
2. Create a new scheduled task (User-defined script)
3. Set it to run at startup with root privileges
4. Add the following script:
   ```bash
   ln -sf /var/run/docker.sock /volume1/docker/docker.sock
   chmod 666 /volume1/docker/docker.sock
   ```

For "DATABASE_URL variable is not set" errors, ensure your .env file is properly set up and in the same directory as docker-compose.yml.

## Data Persistence

### Persistent Volumes

The Docker setup includes three persistent volumes:

1. **postgres_data**: Stores all database files
   - Path inside container: `/var/lib/postgresql/data`
   - Contains all tables, indexes, and database configuration

2. **uploads**: Stores user-uploaded files
   - Path inside container: `/app/public/uploads`
   - Contains images, PDFs, and other user uploads

3. **app_data**: Stores application data
   - Path inside container: `/app/data`
   - Contains cache files, logs, and other application-specific data

These volumes persist across container restarts, rebuilds, and updates.

## Initial Deployment

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

2. The initial deployment will:
   - Create persistent volumes
   - Start the database
   - Run database migrations
   - Start the frontend application

3. Access the application at `http://localhost:3000` (or your configured port)

## Updating the Application

### Safe Update Process

1. Pull the latest code:
   ```bash
   git pull
   ```

2. Update the version in `.env`:
   ```
   APP_VERSION=1.0.1
   ```

3. Rebuild and update the containers:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

This process:
- Creates a new versioned image
- Runs database migrations
- Updates the running containers
- Preserves all data in the persistent volumes

### Database Migrations

Migrations run automatically during deployment via the `migrator` service. This ensures:
- Database schema stays in sync with application code
- Existing data is preserved and adapted to new schema
- No data loss during updates

## Backup Strategy

### Database Backups

Create regular backups of the PostgreSQL database:

```bash
docker-compose exec db pg_dump -U postgres ampere_db > backup_$(date +%Y%m%d).sql
```

### Volume Backups

Backup the Docker volumes:

```bash
# Stop containers before backing up volumes
docker-compose down

# Backup each volume
docker run --rm -v ampere_webapp_postgres_data:/source -v $(pwd)/backups:/backup alpine tar czf /backup/postgres_data_$(date +%Y%m%d).tar.gz /source
docker run --rm -v ampere_webapp_uploads:/source -v $(pwd)/backups:/backup alpine tar czf /backup/uploads_$(date +%Y%m%d).tar.gz /source
docker run --rm -v ampere_webapp_app_data:/source -v $(pwd)/backups:/backup alpine tar czf /backup/app_data_$(date +%Y%m%d).tar.gz /source

# Restart containers
docker-compose up -d
```

## Rollback Procedure

If an update causes issues, you can roll back to a previous version:

1. Edit the `.env` file to use the previous version:
   ```
   APP_VERSION=1.0.0
   ```

2. Restart the services:
   ```bash
   docker-compose up -d
   ```

This will revert to the previous application version while preserving all data.

## Troubleshooting

### Container Logs

View container logs:
```bash
docker-compose logs -f frontend
docker-compose logs -f db
```

### Database Access

Connect to the database:
```bash
docker-compose exec db psql -U postgres -d ampere_db
```

### Volume Inspection

List volumes:
```bash
docker volume ls | grep ampere
```

## Notes on Data Storage

- **Database Data**: All database tables, records, and settings are stored in the PostgreSQL volume.
- **User Uploads**: Files uploaded by users through the application are stored in the uploads volume.
- **Application Data**: Configuration files, logs, and cache are stored in the app_data volume.

## Migration Steps for Schema Changes

When the application includes database schema changes:

1. The migrations will run automatically during the update process.
2. Always check the migration logs to ensure successful completion:
   ```bash
   docker-compose logs migrator
   ```

3. If migrations fail, check for errors and resolve issues before proceeding.

## Security Considerations

- The Next.js application runs as a non-root user (nextjs) for improved security.
- Environment variables store sensitive information (never commit the .env file).
- The database is only accessible from within the Docker network.