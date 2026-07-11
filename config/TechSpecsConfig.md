# Requisitos Técnicos

## Geral

- Usuário único, não precisa de login no MVP (API Key simples é aceitável apenas para validação rápida; projetos SaaS/produção devem evitar segredo estático no frontend)
- Frontend em React + Vite usando Tailwind e responsivo
- Backend em Python + FastAPI + SQLAlchemy + Alembic
- Banco de dados SQLite local na pasta storage
- Upload de arquivos na pasta storage, dentro de subpastas por id da entidade de origem.
- Todos Ids de entidades devem ser UUID's.
- Utilizar migrações do Alembic para criar o banco e para alterações estruturais nas entidades (usando sempre a API do Alembic)
- Não utilizar alert() nem confirm() para comunicação com o usuário no frontend, ao invés disso, usar componentes Modal com design compatível com o site
- Nunca escreva/modifique na pasta storage, pois é onde ficam os dados sensíveis de usuário
- **Arquitetura de comunicação**: o frontend se comunica EXCLUSIVAMENTE com o backend via REST API. O frontend NUNCA se conecta diretamente a bancos de dados, serviços externos, SDKs de terceiros (Supabase, Firebase, etc.) ou qualquer outra coisa que não seja o backend do projeto. Toda regra de negócio, acesso a banco, autenticação e integração externa passa pelo backend.

## Frontend

- Página inicial é o dashboard
- Menu lateral com opções listadas nos requisitos visuais
- Responsivo
- Tema visual conforme detalhado nos requisitos visuais
- Campo para editar markdown no preenchimento de descrição, com opções de negrito, títulos, elementos etc
- Os campos markdown devem ser exibidos formatados, mas editados no texto puro.
- Datas e horas no formato brasileiro respeitando fuso horário do Brasil
- Números e valores monetários exibir no padrão brasileiro no frontend
- Utilizar variáveis de ambiente do Vite para configurações públicas, como `VITE_API_BASE_URL`
- No MVP, uma API Key simples pode ser usada apenas como proteção de validação rápida
- Em projetos SaaS/produção, nunca colocar segredos, chaves privadas, `JWT_SECRET`, connection strings ou API keys sensíveis em variáveis `VITE_*`

## Backend

- Arquitetura Clean, com isolamento de camada de aplicação, domínio e infraestrutura
- Injeção de dependência de serviço no controller
- Injeção de dependência do banco no serviço
- Testes unitários das entidades e validação de campos
- Testes de duplicidade de registros (exemplo: não pode duplicar clientes)
- MVP pode usar autenticação simples por API Key para validação rápida
- Projetos SaaS/produção devem usar autenticação adequada, token curto emitido pelo backend ou login/JWT conforme `LoginConfig.md`
- Aplicar rate limit e validação de payload em endpoints públicos de produção
- Upload de documentos na pasta storage
- Banco de dados na pasta storage
- Utilizar variáveis de ambiente para chave/segredo backend, database URL, porta, storage path, CORS e limites anti-abuso.
- Antes de criar a engine SQLAlchemy ou executar migrações Alembic com SQLite, garantir que o diretório pai definido em `DATABASE_URL` existe.
- Lembrar de configurar CORS local de forma ergonomica e CORS de produção com origens permitidas.
