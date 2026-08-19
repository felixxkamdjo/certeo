FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy solution and restaure dependancies
COPY ["backend/Certeo.sln", "backend/"]
COPY ["backend/src/Certeo.Gateway/Certeo.Gateway.csproj", "backend/src/Certeo.Gateway/"]
COPY ["backend/src/Certeo.Api/Certeo.Api.csproj", "backend/src/Certeo.Api/"]
RUN dotnet restore "backend/src/Certeo.Gateway/Certeo.Gateway.csproj"

# copy backend code and compile
COPY backend/ .
WORKDIR "/src/backend/src/Certeo.Gateway"
RUN dotnet build "Certeo.Gateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Certeo.Gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 5000
ENTRYPOINT ["dotnet", "Certeo.Gateway.dll"]