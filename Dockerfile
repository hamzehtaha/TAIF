# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["TAIF.sln", "./"]
COPY ["TAIF/TAIF.API.csproj", "TAIF/"]
COPY ["TAIF.Application/TAIF.Application.csproj", "TAIF.Application/"]
COPY ["TAIF.Domain/TAIF.Domain.csproj", "TAIF.Domain/"]
COPY ["TAIF.Infrastructure/TAIF.Infrastructure.csproj", "TAIF.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "TAIF/TAIF.API.csproj"

# Copy all source files
COPY . .

# Build the application
WORKDIR "/src/TAIF"
RUN dotnet build "TAIF.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "TAIF.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Install EF Core tools for migrations
RUN dotnet tool install --global dotnet-ef --version 8.0.*
ENV PATH="${PATH}:/root/.dotnet/tools"

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install EF Core tools in runtime image
COPY --from=mcr.microsoft.com/dotnet/sdk:8.0 /usr/share/dotnet /usr/share/dotnet
RUN ln -sf /usr/share/dotnet/dotnet /usr/bin/dotnet || true
RUN dotnet tool install --global dotnet-ef --version 8.0.*
ENV PATH="${PATH}:/root/.dotnet/tools"

# Copy published app
COPY --from=publish /app/publish .

# Copy Docker-specific appsettings
COPY appsettings.Docker.json /app/appsettings.Production.json

# Copy entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
