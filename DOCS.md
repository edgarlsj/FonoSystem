# FonoSystem — Conhecimento Completo do Sistema

## Visão Geral
Sistema de gestão fonoaudiológica especializado em **TEA** (Transtorno do Espectro Autista) e **Reabilitação Auditiva** (Implante Coclear / AASI). Desenvolvido como full-stack com Spring Boot 3 + React 18 + PostgreSQL.

- **Profissional principal**: Dra. Viviane Cardoso da Silva (ADMIN)
- **Login**: `viviane@fonosystem.com` / `admin123`
- **Workspace**: `c:\FonoSystem\`

---

## Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend | Spring Boot | 3.2.5 |
| Java | JDK | 17+ |
| Banco Produção | PostgreSQL | 15 |
| Banco Dev/Teste | H2 (in-memory) | — |
| Migrations | Flyway | — |
| Autenticação | JWT (jjwt) | 0.12.5 |
| PDF | iText7 | 8.0.3 |
| Frontend | React + Vite | 18.3 + 5.2 |
| Linguagem Front | TypeScript | 5.4 |
| HTTP Client | Axios | 1.7 |
| Gráficos | Recharts | 2.12 |
| Forms | React Hook Form + Zod | 7.51 + 3.23 |
| Infra | Docker Compose | 3.9 |

---

## Estrutura de Diretórios

```
c:\FonoSystem\
├── docker-compose.yml          # PostgreSQL + Backend + Frontend
├── README.md
├── index.html / index.css      # Protótipo estático original
│
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/
│       ├── java/br/com/fonosystem/
│       │   ├── FonoSystemApplication.java
│       │   ├── config/
│       │   │   ├── SecurityConfig.java      # JWT stateless + H2 console
│       │   │   ├── CorsConfig.java          # localhost:3000 e :5173
│       │   │   └── DataInitializer.java     # Seed data (@Profile("h2"))
│       │   ├── security/
│       │   │   ├── JwtUtils.java            # Token generation + validation
│       │   │   ├── JwtFilter.java           # OncePerRequestFilter
│       │   │   └── UserDetailsServiceImpl.java
│       │   ├── model/
│       │   │   ├── User.java
│       │   │   ├── Paciente.java            # Soft delete via deletedAt
│       │   │   ├── Anamnese.java            # TEA + Auditiva
│       │   │   ├── Avaliacao.java
│       │   │   ├── PlanoTerapeutico.java
│       │   │   ├── RelatorioDiario.java     # @Transient getters
│       │   │   └── enums/ (Perfil, Sexo, StatusPlano)
│       │   ├── repository/                  # Spring Data JPA
│       │   ├── dto/                         # Request + Response
│       │   ├── service/                     # Business logic
│       │   ├── controller/                  # REST endpoints
│       │   └── exception/                   # GlobalExceptionHandler (RFC 7807)
│       └── resources/
│           ├── application.yml              # PostgreSQL (produção)
│           ├── application-h2.yml           # H2 in-memory (dev)
│           ├── schema.sql / data.sql        # Backup SQL (não usado com H2 profile)
│           └── db/migration/V1-V6          # Flyway (PostgreSQL)
│
└── frontend/
    ├── package.json
    ├── vite.config.ts                       # Proxy /api → :8080
    ├── Dockerfile + nginx.conf
    └── src/
        ├── main.tsx / App.tsx               # BrowserRouter + PrivateRoute
        ├── context/AuthContext.tsx           # JWT + localStorage
        ├── services/api.ts                  # Axios + interceptors
        ├── components/Layout.tsx            # Navbar + Outlet
        └── pages/
            ├── Login.tsx
            ├── Dashboard.tsx
            ├── Pacientes.tsx
            ├── PacienteForm.tsx
            ├── Anamnese.tsx
            ├── Avaliacao.tsx
            └── Relatorios.tsx
```

---

## Modelo de Dados (6 Tabelas)

```
users (1) ──┬──< pacientes (N)
             │      │
             │      ├──< anamneses (N)
             │      │
             │      ├──< avaliacoes (N)
             │      │        │
             │      │        └──< planos_terapeuticos (N)
             │      │
             │      └──< relatorios_diarios (N)
             │
             └────── (profissional_id em todas as tabelas filhas)
```

### Campos Especiais
- **Paciente**: `deleted_at` (soft delete), `data_consentimento` (LGPD), `getIdade()` calculated
- **Anamnese**: Campos TEA (`diagnostico_tea`, `nivel_espectro`, `usa_caa`) + Auditiva (`tipo_perda`, `tipo_dispositivo`, `data_ativacao`)
- **PlanoTerapeutico**: `progresso` (0-100), `status` (EM_ANDAMENTO, ATINGIDO, NAO_ATINGIDO)
- **RelatorioDiario**: `percentual_acerto`, `nivel_engajamento` (1-5), `uso_caa_sessao`, `resposta_estimulacao_auditiva`

---

## API REST (19 endpoints)

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| POST | `/v1/auth/login` | ❌ | Login → JWT + refresh |
| POST | `/v1/auth/refresh` | ❌ | Refresh token |
| GET | `/v1/pacientes` | ✅ | Listar (paginado, filtros: nome, status) |
| GET | `/v1/pacientes/{id}` | ✅ | Buscar por ID |
| POST | `/v1/pacientes` | ✅ | Criar (requer LGPD consent) |
| PUT | `/v1/pacientes/{id}` | ✅ | Atualizar |
| PATCH | `/v1/pacientes/{id}/status` | ✅ | Ativar/Inativar |
| GET | `/v1/pacientes/{id}/anamneses` | ✅ | Listar anamneses |
| POST | `/v1/pacientes/{id}/anamneses` | ✅ | Criar anamnese |
| GET | `/v1/pacientes/{id}/avaliacoes` | ✅ | Listar avaliações |
| POST | `/v1/pacientes/{id}/avaliacoes` | ✅ | Criar avaliação |
| GET | `/v1/avaliacoes/{id}/plano` | ✅ | Listar metas do plano |
| PUT | `/v1/planos/{id}/status` | ✅ | Atualizar progresso/status |
| GET | `/v1/pacientes/{id}/relatorios` | ✅ | Relatórios do paciente |
| POST | `/v1/pacientes/{id}/relatorios` | ✅ | Registrar sessão |
| GET | `/v1/relatorios?data=YYYY-MM-DD` | ✅ | Sessões por data |
| GET | `/v1/pacientes/{id}/evolucao` | ✅ | Gráfico de evolução |

**Context path**: `/api` (todas as URLs ficam `/api/v1/...`)

---

## Padrões e Decisões

### Autenticação JWT
- **Access token**: 15min (900.000ms) — pode ser 1h no H2 (3.600.000ms)
- **Refresh token**: 7 dias (604.800.000ms)
- **Secret**: HMAC-SHA256, mínimo 32 bytes
- **Flow**: Login → `{token, refreshToken, nome, email, perfil}` → Axios interceptor com auto-refresh em 401

### Serialização JSON + Hibernate
- **IMPORTANTE**: `open-in-view: false` (melhor prática)
- Todas as `@ManyToOne` lazy têm `@JsonIgnore` para evitar referência circular
- `RelatorioDiario` usa getters `@Transient` (`getPacienteNome()`, `getPacienteId()`) para expor dados do paciente
- Queries com `JOIN FETCH` no `RelatorioDiarioRepository` para inicializar lazy antes da serialização
- `Avaliacao.planos` tem `@JsonIgnore` — usar endpoint `/avaliacoes/{id}/plano` separado

### Soft Delete
- **NÃO usar `@SQLRestriction`** — filtrar explicitamente nas queries JPQL (`WHERE p.deletedAt IS NULL`)
- Motivo: @SQLRestriction é global e torna pacientes inativos invisíveis para contagem e administração

### Dados Simulados (H2)
- Gerenciados pelo `DataInitializer.java` com `@Profile("h2")`
- **NÃO usar** `schema.sql`/`data.sql` com hashes BCrypt hardcoded — gerar em runtime
- `ddl-auto: create-drop` no perfil H2
- 2 profissionais, 6 pacientes, 3 anamneses, 2 avaliações, 5 metas, 3 sessões

### Error Handling
- `GlobalExceptionHandler` com RFC 7807 (`ProblemDetail`)
- `ResourceNotFoundException` → 404
- `BusinessException` → 422
- `BadCredentialsException` → 401
- `MethodArgumentNotValidException` → 400 com map de campos

---

## Bugs Conhecidos e Resolvidos

| Bug | Causa | Solução |
|-----|-------|---------|
| Login não funciona | BCrypt hash inválido no SQL | DataInitializer gera hash em runtime |
| LazyInitializationException | Collections sem @JsonIgnore + open-in-view=false | @JsonIgnore + JOIN FETCH |
| Pacientes inativos invisíveis | @SQLRestriction("deleted_at IS NULL") | Filtro explícito na query JPQL |
| Nome paciente null em relatórios | @JsonIgnore no ManyToOne | Getters @Transient + JOIN FETCH |

---

## Como Rodar

### Modo H2 (sem banco externo)
```bash
cd backend
set JAVA_HOME=C:\Program Files\Java\jdk-17
mvn spring-boot:run -Dspring-boot.run.profiles=h2
# http://localhost:8080/api/swagger-ui.html
# http://localhost:8080/api/h2-console (JDBC: jdbc:h2:mem:fonosystem, user: sa)

cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Modo Docker (PostgreSQL)
```bash
cd backend && mvn clean package -DskipTests && cd ..
docker compose up --build -d
# http://localhost:3000
```

### Requisitos da máquina
- Java 17+ (disponível em `C:\Program Files\Java\jdk-17`)
- Node.js 20+ (Node 14 local é insuficiente para Vite)
- Maven 3.8+
- Docker Desktop (para modo PostgreSQL)
