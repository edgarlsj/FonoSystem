# 🎙️ FonoSystem

Sistema de Gestão Fonoaudiológica — TEA · Reabilitação Auditiva · Fala

## Stack

- **Backend**: Java 17 + Spring Boot 3.2.5 + PostgreSQL 15
- **Frontend**: React 18 + Vite + TypeScript
- **Autenticação**: JWT (15min) + Refresh Token (7d)
- **Banco**: PostgreSQL 15 com Flyway migrations

## Pré-requisitos

- Java 17+
- Node.js 20+
- Docker + Docker Compose
- Maven 3.8+ 
- test

## Início Rápido

### 1. Subir o banco de dados

```bash
docker compose up db -d
```

### 2. Rodar o backend

```bash
cd backend
# Defina JAVA_HOME para Java 17 se necessário
mvn spring-boot:run
```

O backend estará em `http://localhost:8080/api`
Swagger UI: `http://localhost:8080/api/swagger-ui.html`

### 3. Rodar o frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend estará em `http://localhost:3000`

### 4. Login

- **Email**: `viviane@fonosystem.com`
- **Senha**: `admin123`

## Deploy com Docker Compose

```bash
# Build backend
cd backend && mvn clean package -DskipTests && cd ..

# Subir tudo
docker compose up --build -d
```

Acesse em `http://localhost:3000`

## Estrutura do Projeto

```
FonoSystem/
├── docker-compose.yml
├── index.html              # Mockup estático
├── index.css               # Design system
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
│       ├── java/br/com/fonosystem/
│       │   ├── config/         # Security, CORS
│       │   ├── controller/     # REST Controllers
│       │   ├── dto/            # Request/Response DTOs
│       │   ├── exception/      # Global error handling
│       │   ├── model/          # JPA Entities
│       │   ├── repository/     # Spring Data JPA
│       │   ├── security/       # JWT Filter, Utils
│       │   └── service/        # Business logic
│       └── resources/
│           ├── application.yml
│           └── db/migration/   # Flyway SQL
└── frontend/
    ├── package.json
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── context/            # AuthContext
        ├── services/           # Axios API
        ├── components/         # Layout
        └── pages/              # Login, Dashboard, etc.
```

## API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/v1/auth/login` | Login → JWT |
| POST | `/v1/auth/refresh` | Refresh token |
| GET/POST | `/v1/pacientes` | CRUD pacientes |
| GET/POST | `/v1/pacientes/{id}/anamneses` | Anamneses |
| GET/POST | `/v1/pacientes/{id}/avaliacoes` | Avaliações |
| GET/POST | `/v1/pacientes/{id}/relatorios` | Relatórios |
| GET | `/v1/relatorios?data=YYYY-MM-DD` | Por data |
| GET | `/v1/pacientes/{id}/evolucao` | Gráficos |

## Licença

Uso interno — Clínica Fonoaudiológica
