# SecurityChecklist.md — Checklist mínimo de produção para SaaS

## Frase-guia

MVP pode ser simples; SaaS completo precisa sair sem segredos no frontend e com checklist mínimo de produção.

## Objetivo

Este checklist define as validações mínimas que devem ser feitas antes de considerar um projeto SaaS pronto para entrega. Ele complementa `LoginConfig.md`, `SupabaseConfig.md`, `TechSpecsConfig.md` e `DockerConfig.md`.

## Segredos e variáveis de ambiente

- Nenhum segredo pode estar hardcoded no código.
- Nenhum segredo pode ser exposto em variáveis `VITE_*` do frontend.
- `JWT_SECRET` deve existir apenas no backend e ser obrigatório em produção.
- `DATABASE_URL`, chaves de integração, credenciais de e-mail e tokens privados devem existir apenas no backend.
- O README deve listar variáveis obrigatórias sem revelar valores reais.

## Autenticação e autorização

- Login e cadastro devem seguir `LoginConfig.md`.
- Senhas devem ser armazenadas apenas como hash seguro com bcrypt ou argon2.
- Tokens JWT devem ter expiração.
- Rotas privadas devem exigir `Authorization: Bearer <token>`.
- O backend deve validar assinatura, expiração e usuário ativo antes de executar regras de negócio.
- O frontend deve tratar `401` com logout, limpeza de sessão ou redirecionamento para login.

## Frontend e integrações externas

- O frontend deve se comunicar exclusivamente com o backend.
- O frontend nunca deve usar SDK do Supabase, `SUPABASE_URL`, `anon key`, `service_role` ou conexão direta com banco.
- Qualquer integração externa deve passar pelo backend.
- O frontend pode usar apenas configurações públicas, como `VITE_API_BASE_URL`.

## Banco de dados e Supabase

- O backend deve acessar Supabase apenas como PostgreSQL gerenciado via `DATABASE_URL`.
- A conexão PostgreSQL em produção deve usar SSL quando exigido pelo provedor.
- Migrações Alembic devem executar com sucesso contra o banco de produção.
- Dados sensíveis não devem ser gravados em logs.

## Validação de entrada

- Schemas de entrada devem validar tipos, tamanhos e campos obrigatórios.
- Payloads inesperados devem ser rejeitados.
- Uploads devem ter limites de tamanho e tipo quando existirem.
- Erros de validação devem ser seguros e não revelar stack trace ou segredos.

## CORS, rate limit e abuso

- CORS em produção deve restringir o domínio real do frontend.
- Login, cadastro, reset de senha e endpoints públicos devem ter rate limit.
- Ações públicas sensíveis devem considerar CAPTCHA, Turnstile ou outro controle anti-abuso.
- O backend deve retornar `429` quando o limite de requisições for excedido.

## Logs e observabilidade

- Logs não devem conter senhas, tokens JWT, connection strings ou dados sensíveis.
- Falhas de autenticação e rate limit devem ser registradas com informações suficientes para auditoria.
- Erros de produção devem ser tratados sem expor detalhes internos ao usuário.

## Deploy e Docker

- Backend e frontend devem ter Dockerfiles próprios.
- `docker compose` deve subir o ambiente completo.
- `storage/` deve ser tratado como artefato de runtime.
- Portas e URLs devem vir de variáveis de ambiente.
- O README deve explicar como configurar produção e desenvolvimento.

## Validação final obrigatória

Antes de concluir a entrega do SaaS, a IA deve confirmar:

- Backend inicia sem erros.
- Frontend compila sem erros.
- Migrações Alembic executam com sucesso.
- Docker compose sobe o ambiente.
- Não há segredo no bundle frontend.
- Rotas privadas exigem bearer token.
- Frontend não acessa Supabase diretamente.
- CORS de produção está configurável.
- Rate limit existe para rotas sensíveis.
- README documenta variáveis e comandos sem expor segredos.
