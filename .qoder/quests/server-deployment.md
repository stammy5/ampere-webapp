# Server Deployment Design for ampere.com.sg (Vodien Hosting)

## 1. Overview

This document outlines the deployment strategy for the Ampere WebApp (ampere-engineering-app), a Next.js-based web application with features including dashboard, finance management, project tracking, and user management. The application will be deployed to https://ampere.com.sg/login on Vodien hosting platform.

## 2. Technology Stack

- Framework: Next.js (React)
- Language: TypeScript
- Styling: Tailwind CSS
- Package Manager: npm
- Deployment Target: [To be determined based on hosting provider]

## 3. Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│   Development   │───▶│   Build Process  │───▶│   Vodien Hosting   │
│   Environment   │    │                  │    │                    │
│                 │    │  - Code Compile  │    │  - Node.js Runtime │
│ - Local Dev     │    │  - Asset Optimize│    │  - Static Files    │
│ - Feature Dev   │    │  - Bundle Create │    │  - SSL Termination │
└─────────────────┘    └──────────────────┘    └────────────────────┘
```

## 4. Vodien Hosting Specific Requirements

### 4.1 Hosting Plan Requirements
- Node.js support (check Vodien plan specifications)
- Sufficient disk space for application files and logs
- Adequate memory allocation for Node.js processes
- Bandwidth allocation for user traffic

### 4.2 Vodien Control Panel Setup
- Access Vodien control panel at https://www.vodien.com/controlpanel/
- Navigate to application management section
- Configure Node.js application settings
- Set up domain mapping for ampere.com.sg

### 4.3 Vodien Limitations to Consider
- Resource limits (CPU, memory, concurrent processes)
- File storage quotas
- Bandwidth limitations
- Database connection limits (if using Vodien database services)

## 4. Build Process

### 4.1 Prerequisites
- Node.js (version 18 or higher recommended)
- npm package manager
- Access to source code repository

### 4.2 Build Steps
1. Install dependencies:
   ```
   npm install
   ```

2. Run build process:
   ```
   npm run build
   ```

3. Output directory: `.next/`

## 5. Upload Methods for Vodien Hosting

### 5.1 Secure File Transfer (SFTP) - Vodien
- Use SFTP client (FileZilla, WinSCP) to transfer files
- Connect to Vodien server with credentials from control panel
- Upload built application files to designated directory (typically /home/username/public_html/ or specified application directory)
- Ensure file permissions are correctly set

### 5.2 SSH Deployment - Vodien
- Connect to Vodien server via SSH if available in your hosting plan
- Clone or transfer repository to server
- Build and run application directly on server
- Configure SSH keys for secure authentication

### 5.3 Control Panel Deployment - Vodien
- Use Vodien control panel for application deployment if Node.js support is available
- Follow Vodien-specific deployment procedures
- Configure application settings through control panel interface

### 5.4 Git Deployment - Vodien
- If Vodien supports Git deployment, push code to designated repository
- Configure automatic build and deployment on push
- Set up proper branch deployment rules

## 5. Deployment Options for Vodien Hosting

### 5.1 Server-Side Rendering Deployment (Recommended for Vodien)
Vodien hosting supports Node.js applications, making server-side rendering the optimal choice:
- Build the application using `npm run build`
- Deploy the built application with `.next/` directory, `node_modules/`, and source files
- Run the application with `npm start` command
- Configure the server to use the port assigned by Vodien or customize in environment variables

### 5.2 Static Site Export (Alternative for Vodien)
If Vodien hosting is limited to static file hosting:
- Export static files using `next export`
- Upload generated files to server
- Note: This option will not support dynamic features like user authentication

### 5.3 Vodien-Specific Considerations
- Check Vodien control panel for Node.js application support
- Verify available Node.js versions
- Confirm port allocation for custom applications
- Review Vodien's file storage limits

## 6. Environment Configuration for Vodien Hosting

### 6.1 Environment Variables
Required environment variables for https://ampere.com.sg/login on Vodien:
- Database connection strings (if using external database or Vodien database services)
- API keys for external services
- Service credentials
- Session secret for authentication
- NEXT_PUBLIC_* variables for client-side usage
- NODE_ENV=production
- PORT (as specified by Vodien hosting)

### 6.2 Configuration Files
- next.config.js (Next.js configuration)
- .env.production (Production environment variables)
- Custom configuration files for Vodien-specific settings
- Vodien control panel configuration (if applicable)

## 7. Deployment Process for Vodien Hosting

### 7.1 Pre-deployment Checklist
- [ ] Code review completed
- [ ] Tests passing
- [ ] Build successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations applied (if applicable)
- [ ] SSL certificate ready for https://ampere.com.sg
- [ ] Vodien hosting plan verified for Node.js support
- [ ] Vodien control panel access confirmed

### 7.2 Deployment Steps for Vodien
1. Build application with `npm run build`
2. Transfer files to Vodien server:
   - All source files
   - `.next/` directory (built output)
   - `node_modules/` directory
   - Configuration files
3. Configure environment variables on Vodien server
4. Start application services with `npm start`
5. Configure reverse proxy (if needed) to route traffic from https://ampere.com.sg/login
6. Set up Vodien domain mapping for ampere.com.sg
7. Verify deployment by accessing https://ampere.com.sg/login
8. Monitor application performance and errors
9. Check Vodien resource usage

## 8. Post-Deployment for Vodien Hosting

### 8.1 Verification
- Application accessibility at https://ampere.com.sg/login
- User authentication functionality
- Dashboard and data display features
- Form submission and data persistence
- Performance benchmarks
- Vodien resource usage (CPU, memory, disk space)

### 8.2 Monitoring
- Error tracking with logging service
- Performance monitoring (response times, memory usage)
- Uptime monitoring for https://ampere.com.sg
- Database connection monitoring
- SSL certificate expiration tracking
- Vodien hosting resource limits monitoring

## 9. Rollback Strategy for Vodien Hosting

### 9.1 When to Rollback
- Critical errors affecting https://ampere.com.sg/login functionality
- Performance degradation impacting user experience
- Security vulnerabilities
- Database connectivity issues
- Vodien hosting resource limit exceeded

### 9.2 Rollback Process
1. Identify previous stable version from version control
2. Restore application files on Vodien server
3. Restore database from backup (if needed)
4. Restart services using `npm start`
5. Verify functionality at https://ampere.com.sg/login
6. Monitor for any residual issues
7. Check Vodien resource usage after rollback