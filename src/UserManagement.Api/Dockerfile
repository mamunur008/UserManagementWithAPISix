FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Directory.Build.props ./
COPY src/UserManagement.Domain/UserManagement.Domain.csproj src/UserManagement.Domain/
COPY src/UserManagement.Application/UserManagement.Application.csproj src/UserManagement.Application/
COPY src/UserManagement.Infrastructure/UserManagement.Infrastructure.csproj src/UserManagement.Infrastructure/
COPY src/UserManagement.Api/UserManagement.Api.csproj src/UserManagement.Api/
RUN dotnet restore src/UserManagement.Api/UserManagement.Api.csproj
COPY src ./src
RUN dotnet publish src/UserManagement.Api/UserManagement.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "UserManagement.Api.dll"]
