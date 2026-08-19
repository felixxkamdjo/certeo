FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["backend/Certeo.sln", "backend/"]
COPY ["backend/src/Certeo.Api/Certeo.Api.csproj", "backend/src/Certeo.Api/"]
RUN dotnet restore "backend/src/Certeo.Api/Certeo.Api.csproj"

COPY backend/ .
WORKDIR "/src/backend/src/Certeo.Api"
RUN dotnet build "Certeo.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Certeo.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5001
ENTRYPOINT ["dotnet", "Certeo.Api.dll"]