# Meu Campeonato

API backend para simulação de campeonato eliminatório (mata-mata) de futebol. Desafio técnico com Node.js, TypeScript, Fastify, Prisma e PostgreSQL.

## Pré-requisitos

- **Node.js** 20+ (LTS)
- **Docker** e **Docker Compose** (para rodar Postgres e Redis)
- **Python 3** (para o script `teste.py`, usado na geração de placar)

## Execução com Docker Compose

Suba todos os serviços (app, PostgreSQL, Redis):

```bash
docker-compose up --build
```

- API: http://localhost:3000
- Health: http://localhost:3000/health
- Postgres: localhost:5432 (usuário `campeonato`, senha `campeonato123`, DB `meu_campeonato`)
- Redis: localhost:6379

## Execução local (sem Docker da API)

1. Instale as dependências:

```bash
npm install
```

2. Configure o banco. Crie um arquivo `.env` na raiz com:

```
DATABASE_URL="postgresql://campeonato:campeonato123@localhost:5432/meu_campeonato"
REDIS_URL="redis://localhost:6379"
```

3. Suba apenas Postgres e Redis (se quiser) com Docker:

```bash
docker-compose up -d postgres redis
```

4. Gere o Prisma Client e rode as migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

5. Inicie a API em modo desenvolvimento:

```bash
npm run dev
```

Ou em produção (build + start):

```bash
npm run build
npm start
```

## Script Python (teste.py)

O arquivo **`teste.py`** fica na **raiz do projeto**. Ele é usado pelo backend para gerar o placar de cada partida (duas linhas com valores de 0 a 7). O enunciado exige que o arquivo se chame `teste.py`.

## Testes

**Unitários** (sem banco):

```bash
npm test
```

**E2E** (requer PostgreSQL rodando; ex.: `docker-compose up -d postgres`):

```bash
npm run test:e2e
```

Com cobertura (meta 90%):

```bash
npm run test:coverage
```

## CI/CD

O projeto possui workflow GitHub Actions (`.github/workflows/ci.yml`) que executa em todo push/PR para as branches `main` e `master`:

- **lint**: ESLint
- **test**: testes unitários
- **test-e2e**: testes E2E com PostgreSQL em serviço

## Documentação do projeto

- **Requisitos e cronograma:** [plan.md](plan.md)
- **Tarefas por fase:** [tasks.md](tasks.md)
- **Checklist de requisitos:** [TODO.md](TODO.md)
- **Modelo de dados:** [docs/database.md](docs/database.md)
- **Diagramas UML:** [docs/diagrams.md](docs/diagrams.md)
- **System design:** [docs/system-design.md](docs/system-design.md)

- **API REST**: http://localhost:3000
- **Swagger/OpenAPI**: http://localhost:3000/docs
- **Collection Postman/Insomnia**: [docs/meu-campeonato-postman.json](docs/meu-campeonato-postman.json)
