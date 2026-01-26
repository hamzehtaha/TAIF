# TAIF Backend Docker Setup

## Overview
This document provides instructions for running the TAIF backend API with SQL Server using Docker.

## 🔐 Database Credentials

### SQL Server
- **Server**: `localhost,1433` (or `sqlserver` from within Docker network)
- **Username**: `sa`
- **Password**: `TaifDB@2026!`
- **Database**: `TAIF`

### Connection Strings

**From Host Machine (localhost)**:
```
Server=localhost,1433;Database=TAIF;User Id=sa;Password=TaifDB@2026!;TrustServerCertificate=True;
```

**From Docker Container**:
```
Server=sqlserver,1433;Database=TAIF;User Id=sa;Password=TaifDB@2026!;TrustServerCertificate=True;
```

## 📋 Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (included with Docker Desktop)
- At least 4GB of RAM allocated to Docker

## 🚀 Quick Start

### 1. Navigate to TAIF Project Directory
```bash
cd c:/Users/Mohammed Al-Qura'an/Desktop/Private-Repos/TAIF
```

### 2. Build and Start Services
```bash
docker-compose up --build
```

This command will:
- Pull SQL Server 2022 image
- Build the TAIF API Docker image
- Start SQL Server container
- Wait for SQL Server to be healthy
- Start TAIF API container
- Automatically run database migrations (`Update-Database`)
- Start the API on port 5000

### 3. Access the Application

- **API**: http://localhost:5000
- **Swagger UI**: http://localhost:5000/swagger
- **SQL Server**: localhost,1433

## 🛠️ Docker Commands

### Start Services (Detached Mode)
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop Services and Remove Volumes (Clean Database)
```bash
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# TAIF API only
docker-compose logs -f taif-api

# SQL Server only
docker-compose logs -f sqlserver
```

### Rebuild After Code Changes
```bash
docker-compose up --build
```

### Run Migrations Manually
```bash
docker-compose exec taif-api dotnet ef database update --project TAIF.Infrastructure.csproj --startup-project TAIF.API.csproj
```

## 📁 Project Structure

```
TAIF/
├── Dockerfile                  # Multi-stage build for TAIF API
├── docker-compose.yml          # Orchestrates SQL Server + API
├── docker-entrypoint.sh        # Startup script with migration
├── .dockerignore              # Files to exclude from Docker build
├── TAIF/                      # Main API project
├── TAIF.Application/          # Application layer
├── TAIF.Domain/               # Domain layer
└── TAIF.Infrastructure/       # Infrastructure + Migrations
```

## 🔄 Database Migrations

### Automatic Migration
Migrations run automatically when the container starts via `docker-entrypoint.sh`.

### Manual Migration
If you need to run migrations manually:

```bash
# From host machine (if .NET SDK installed)
dotnet ef database update --project TAIF.Infrastructure/TAIF.Infrastructure.csproj --startup-project TAIF/TAIF.API.csproj

# From Docker container
docker-compose exec taif-api dotnet ef database update --project TAIF.Infrastructure.csproj --startup-project TAIF.API.csproj
```

### Create New Migration
```bash
# From host machine
dotnet ef migrations add MigrationName --project TAIF.Infrastructure/TAIF.Infrastructure.csproj --startup-project TAIF/TAIF.API.csproj

# Then rebuild Docker image
docker-compose up --build
```

## 🗄️ Connecting to SQL Server

### Using SQL Server Management Studio (SSMS)
1. Server name: `localhost,1433`
2. Authentication: SQL Server Authentication
3. Login: `sa`
4. Password: `TaifDB@2026!`

### Using Azure Data Studio
1. Connection type: Microsoft SQL Server
2. Server: `localhost,1433`
3. Authentication type: SQL Login
4. User name: `sa`
5. Password: `TaifDB@2026!`
6. Database: `TAIF`

### Using Command Line (sqlcmd)
```bash
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaifDB@2026!" -d TAIF
```

## 🔧 Configuration

### Environment Variables (docker-compose.yml)

**SQL Server**:
- `ACCEPT_EULA=Y` - Accept SQL Server license
- `SA_PASSWORD=TaifDB@2026!` - SA password
- `MSSQL_PID=Developer` - Developer edition

**TAIF API**:
- `ASPNETCORE_ENVIRONMENT=Development` - Environment
- `ASPNETCORE_URLS=http://+:5000` - Listening URL
- `ConnectionStrings__DefaultConnection` - Database connection
- `Jwt__Key` - JWT signing key
- `Jwt__Issuer` - JWT issuer
- `Jwt__Audience` - JWT audience
- `Jwt__AccessTokenMinutes=15` - Access token lifetime
- `Jwt__RefreshTokenDays=30` - Refresh token lifetime

### Ports
- **5000**: TAIF API
- **1433**: SQL Server

## 📊 Health Checks

SQL Server health check runs every 10 seconds:
```bash
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P TaifDB@2026! -Q "SELECT 1"
```

The API waits for SQL Server to be healthy before starting.

## 🐛 Troubleshooting

### Issue: SQL Server container fails to start
**Solution**: Ensure Docker has at least 2GB RAM allocated. Check Docker Desktop settings.

### Issue: Password does not meet SQL Server policy
**Solution**: The password `TaifDB@2026!` meets requirements (uppercase, lowercase, number, special character).

### Issue: Migration fails
**Solution**: 
1. Check SQL Server is running: `docker-compose ps`
2. Check logs: `docker-compose logs sqlserver`
3. Verify connection string in docker-compose.yml
4. Run migration manually to see detailed error

### Issue: Port 1433 or 5000 already in use
**Solution**: 
```bash
# Stop local SQL Server
# Or change ports in docker-compose.yml:
ports:
  - "1434:1433"  # SQL Server
  - "5001:5000"  # API
```

### Issue: Cannot connect from frontend
**Solution**: Update frontend `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🔒 Security Notes

### For Production:
1. **Change SA Password**: Use a strong, unique password
2. **Change JWT Key**: Generate a secure random key (min 32 characters)
3. **Use Secrets**: Don't commit passwords to git
4. **Enable HTTPS**: Configure SSL certificates
5. **Restrict CORS**: Limit allowed origins
6. **Use Environment Variables**: Store sensitive data securely

### Example Production docker-compose.yml:
```yaml
environment:
  - SA_PASSWORD=${SQL_SA_PASSWORD}
  - ConnectionStrings__DefaultConnection=${CONNECTION_STRING}
  - Jwt__Key=${JWT_SECRET_KEY}
```

## 📝 Logs

Application logs are stored in:
- **Container**: `/app/Logs`
- **Host**: `./Logs` (mounted volume)

Database logs are stored in SQL Server container.

## 🧪 Testing the Setup

### 1. Check Services are Running
```bash
docker-compose ps
```

Expected output:
```
NAME            STATUS          PORTS
taif-api        Up              0.0.0.0:5000->5000/tcp
taif-sqlserver  Up (healthy)    0.0.0.0:1433->1433/tcp
```

### 2. Test API Health
```bash
curl http://localhost:5000/swagger
```

### 3. Test Database Connection
```bash
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaifDB@2026!" -Q "SELECT name FROM sys.databases WHERE name = 'TAIF'"
```

### 4. Check Migrations Applied
```bash
docker-compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "TaifDB@2026!" -d TAIF -Q "SELECT * FROM __EFMigrationsHistory"
```

### 5. Test Authentication Endpoints
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test@123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'
```

## 🔄 Updating the Application

### After Code Changes:
```bash
# Rebuild and restart
docker-compose up --build

# Or rebuild without cache
docker-compose build --no-cache
docker-compose up
```

### After Database Schema Changes:
```bash
# Create migration on host
dotnet ef migrations add NewMigration --project TAIF.Infrastructure/TAIF.Infrastructure.csproj --startup-project TAIF/TAIF.API.csproj

# Rebuild and restart (migrations run automatically)
docker-compose up --build
```

## 📦 Data Persistence

Database data persists in Docker volume `sqlserver-data`. To reset:
```bash
docker-compose down -v
docker-compose up --build
```

## 🌐 Integration with Frontend

Update Taif-Portal `.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Both services can run simultaneously:
- **Backend**: http://localhost:5000 (Docker)
- **Frontend**: http://localhost:3000 (npm run dev)

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [SQL Server on Docker](https://learn.microsoft.com/en-us/sql/linux/quickstart-install-connect-docker)
- [EF Core Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [ASP.NET Core in Docker](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/docker/)

## ✅ Summary

✅ **SQL Server 2022** running in Docker
✅ **TAIF API** (.NET 8.0) running in Docker
✅ **Automatic database migrations** on startup
✅ **Health checks** ensure proper startup order
✅ **Persistent data** with Docker volumes
✅ **Easy development** with docker-compose
✅ **Production-ready** with security notes

---

**Database Credentials Summary**:
- **Server**: localhost,1433
- **Username**: sa
- **Password**: TaifDB@2026!
- **Database**: TAIF
