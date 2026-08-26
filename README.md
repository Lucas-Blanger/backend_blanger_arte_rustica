# Blanger Arte Rústica — API

API RESTful para o e-commerce **Blanger Arte Rústica**, construída com **Node.js + Express + Sequelize**, banco **Neon (Postgres serverless)** e pronta para rodar em **Docker**.

## Stack

- Node.js 20 + Express
- Sequelize (ORM) + Neon Postgres
- JWT para autenticação
- bcryptjs para hash de senha
- express-validator para validação de entrada
- Docker / docker-compose

## Estrutura de pastas

```
src/
├── config/        # env.js (variáveis de ambiente) e database.js (conexão Sequelize/Neon)
├── database/       # associations.js (relacionamentos entre models) e sync.js
├── middlewares/    # auth, validação e tratamento de erros
├── modules/
│   ├── auth/        # registro, login, /me
│   ├── users/        # perfil, troca de senha, administração de usuários
│   ├── addresses/     # CRUD de endereços do usuário
│   ├── products/       # catálogo (produtos + categorias)
│   └── orders/          # checkout, listagem, cancelamento, admin
├── utils/          # ApiError, asyncHandler, jwt.util
├── app.js          # configuração do Express
└── server.js       # bootstrap (conecta no banco e sobe o servidor)
```

## Configuração

1. Copie o `.env.example` para `.env` e preencha com a sua connection string do Neon:

```bash
cp .env.example .env
```

```
DATABASE_URL=postgresql://usuario:senha@ep-xxxx.neon.tech/blanger?sslmode=require
JWT_SECRET=uma-chave-bem-secreta
```

2. Instale as dependências:

```bash
npm install
```

3. Sincronize as tabelas no Neon (cria as tabelas a partir dos models):

```bash
npm run db:sync
```

5. Popule o banco com dados iniciais (Seed):

```bash
npm run db:seed
```

Ou execute a sincronização + seed em um único comando:

```bash
npm run db:setup
```

6. Rode em modo desenvolvimento (hot reload com nodemon):

```bash
npm run dev
```

A API sobe em `http://localhost:3000`, com prefixo `/api/v1`.

## Executando os Testes

Para rodar a suíte completa de testes unitários automatizados (Jest):

```bash
npm run test:unit
```

> Em modo `development`, o `server.js` já sincroniza os models automaticamente a cada start (`sequelize.sync({ alter: true })`), então o passo 3 é opcional no dia a dia — mas é útil para a primeira criação das tabelas ou em produção.

## Rodando com Docker

```bash
docker-compose up --build -d
```

Isso builda a imagem e sobe o container `blanger-arte-rustica-api`, lendo as variáveis do `.env`. Como o banco é o Neon (gerenciado, na nuvem), **não há container de Postgres local** — a API se conecta diretamente via `DATABASE_URL`.

Para parar:

```bash
docker-compose down
```

## Endpoints principais

Prefixo base: `/api/v1`

### Auth

| Método | Rota             | Descrição               | Autenticação |
| ------ | ---------------- | ----------------------- | ------------ |
| POST   | `/auth/register` | Cria uma conta          | Não          |
| POST   | `/auth/login`    | Login, retorna JWT      | Não          |
| GET    | `/auth/me`       | Dados do usuário logado | Sim          |

### Usuários

| Método | Rota                 | Descrição                     | Autenticação |
| ------ | -------------------- | ----------------------------- | ------------ |
| GET    | `/users/me`          | Perfil do usuário logado      | Sim          |
| PATCH  | `/users/me`          | Atualiza nome/e-mail/telefone | Sim          |
| PATCH  | `/users/me/password` | Troca de senha                | Sim          |
| GET    | `/users`             | Lista todos os usuários       | Admin        |
| GET    | `/users/:id`         | Detalhe de um usuário         | Admin        |
| PATCH  | `/users/:id/role`    | Muda o papel (customer/admin) | Admin        |
| DELETE | `/users/:id`         | Desativa um usuário           | Admin        |

### Endereços

| Método | Rota             | Descrição                  | Autenticação |
| ------ | ---------------- | -------------------------- | ------------ |
| GET    | `/addresses`     | Lista endereços do usuário | Sim          |
| GET    | `/addresses/:id` | Detalhe de um endereço     | Sim          |
| POST   | `/addresses`     | Cria endereço              | Sim          |
| PATCH  | `/addresses/:id` | Atualiza endereço          | Sim          |
| DELETE | `/addresses/:id` | Remove endereço            | Sim          |

### Produtos e categorias

| Método | Rota                       | Descrição                           | Autenticação |
| ------ | -------------------------- | ----------------------------------- | ------------ |
| GET    | `/products`                | Lista produtos (filtros, paginação) | Não          |
| GET    | `/products/:id`            | Detalhe de um produto               | Não          |
| POST   | `/products`                | Cria produto                        | Admin        |
| PATCH  | `/products/:id`            | Atualiza produto                    | Admin        |
| DELETE | `/products/:id`            | Desativa produto (soft delete)      | Admin        |
| GET    | `/products/categories`     | Lista categorias                    | Não          |
| POST   | `/products/categories`     | Cria categoria                      | Admin        |
| PATCH  | `/products/categories/:id` | Atualiza categoria                  | Admin        |
| DELETE | `/products/categories/:id` | Remove categoria                    | Admin        |

Filtros de `GET /products`: `?search=`, `?categoryId=`, `?minPrice=`, `?maxPrice=`, `?page=`, `?limit=`.

### Pedidos (checkout)

| Método | Rota                       | Descrição                                | Autenticação |
| ------ | -------------------------- | ---------------------------------------- | ------------ |
| POST   | `/orders`                  | Cria pedido a partir de itens            | Sim          |
| GET    | `/orders`                  | Lista pedidos do usuário logado          | Sim          |
| GET    | `/orders/:id`              | Detalhe de um pedido próprio             | Sim          |
| POST   | `/orders/:id/cancel`       | Cancela pedido próprio (devolve estoque) | Sim          |
| GET    | `/orders/admin/all`        | Lista todos os pedidos                   | Admin        |
| GET    | `/orders/admin/:id`        | Detalhe de qualquer pedido               | Admin        |
| PATCH  | `/orders/admin/:id/status` | Atualiza status (fluxo controlado)       | Admin        |

Exemplo de corpo para criar pedido:

```json
{
  "addressId": "uuid-do-endereco",
  "paymentMethod": "pix",
  "items": [
    { "productId": "uuid-produto-1", "quantity": 2 },
    { "productId": "uuid-produto-2", "quantity": 1 }
  ]
}
```

O checkout roda dentro de uma **transação Sequelize**: verifica estoque, calcula subtotal/frete/total, cria o pedido + itens e baixa o estoque atomicamente. Cancelamento devolve o estoque automaticamente.

## Autenticação

Todas as rotas protegidas esperam o header:

```
Authorization: Bearer <token>
```

O primeiro usuário cadastrado terá papel `customer` por padrão — promova a `admin` diretamente no banco ou via `PATCH /users/:id/role` usando outro admin já existente.

## Próximos passos sugeridos

- Adicionar testes automatizados (Jest + Supertest)
- Migrations versionadas com `sequelize-cli` em vez de `sync({ alter: true })`
- Integração com gateway de pagamento real
- Upload de imagens de produto (S3/Cloudinary) em vez de `imageUrl` manual
- Rate limiting (`express-rate-limit`) nas rotas de auth
