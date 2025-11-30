# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution
COPY src/*.sln ./

# Copy các csproj đúng đường dẫn
COPY src/Api/Api.csproj Api/
COPY src/Application/Application.csproj Application/
COPY src/Domain/Domain.csproj Domain/
COPY src/Infrastructure/Infrastructure.csproj Infrastructure/

# Restore
RUN dotnet restore

# Copy toàn bộ source
COPY src/ .

# Build release
RUN dotnet publish *.sln -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "Api.dll"]
