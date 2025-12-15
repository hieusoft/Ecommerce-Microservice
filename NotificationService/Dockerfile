# =========================
# BUILD STAGE
# =========================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy csproj trước để cache restore
COPY src/src.csproj ./src/
RUN dotnet restore ./src/src.csproj

# Copy toàn bộ source, bao gồm folder Templates
COPY src ./src
WORKDIR /app/src

# Chắc chắn folder Templates được copy vào output khi publish
RUN dotnet publish src.csproj -c Release -o /app/publish

# =========================
# RUNTIME STAGE
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Copy output từ build stage
COPY --from=build /app/publish .

# Copy folder Templates vào runtime container nếu RazorLight dùng relative path
COPY src/Templates ./Templates

# Nếu CÓ HTTP API → giữ
EXPOSE 8087

# ⚠️ ĐỔI TÊN DLL nếu project khác tên
ENTRYPOINT ["dotnet", "src.dll"]
