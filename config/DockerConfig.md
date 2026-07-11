# Configuração do Docker no Projeto

Depois que o projeto estiver pronto, criar a estrutura necessária para rodar o projeto usando Docker.

## Detalhes técnicos

- Criar arquivos Dockerfile para o frontend e o backend
- Criar arquivo Docker compose na raiz do projeto para facilitar a orquestração dos containers
- Adicionar instruções de execução usando Docker no README.md do projeto
- Criar volume storage para uso do backend compartilhado com o sistema host (bind mount) [ usar a pasta storage do projeto como ponto de montagem, por exemplo `./storage:/storage` quando o compose estiver na raiz ]
- Usar Docker compose para subir o ambiente a partir da raiz do projeto
- Verificar saúde da API antes de levantar o container do frontend
- Não esqueça de instalar o wget na imagem do backend para funcionar a verificação de saúde da API
- Criar o diretório `/storage` no Dockerfile do backend antes de iniciar o serviço, sem gravar dados sensíveis na imagem
- Ao usar SQLite em `/storage/app.db`, garantir no código do backend/Alembic que o diretório pai do banco existe antes de abrir a conexão
- Não utilizar porta 80 para o backend, deixar o frontend em uma porta alta tipo 8080.
