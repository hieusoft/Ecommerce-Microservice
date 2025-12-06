# ==============================
# 1. Build stage
# ==============================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj & restore
COPY src/*.csproj ./
RUN dotnet restore ./src.csproj

# Copy toàn bộ source code
COPY src/. ./

# Publish
RUN dotnet publish ./src.csproj -c Release -o /app/publish

# ==============================
# 2. Runtime stage
# ==============================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8000

# Run API Gateway (tên dll = src.dll)
ENTRYPOINT ["dotnet", "src.dll"]
