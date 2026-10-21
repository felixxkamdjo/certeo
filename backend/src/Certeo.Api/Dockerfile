# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["src/Certeo.Api/Certeo.Api.csproj", "src/Certeo.Api/"]
RUN dotnet restore "src/Certeo.Api/Certeo.Api.csproj"

# Copy all source files and publish release
COPY . .
WORKDIR "/src/src/Certeo.Api"
RUN dotnet publish "Certeo.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
EXPOSE 5239

# Copy published binaries
COPY --from=build /app/publish .

# Create volume folder for uploaded documents (CVs, badges)
RUN mkdir -p /app/uploads
VOLUME ["/app/uploads"]

ENV ASPNETCORE_URLS=http://+:5239
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Certeo.Api.dll"]