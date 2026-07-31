# Trilhas do Brasil

## Objetivo do Projeto

Rede social para trilheiros do Brasil e turistas poderem compartilhar e se aventurar pelos caminhos do Brasil. A ideia principal é um tipo de Waze para trilheiros, incluindo orientações, pontos de interesse, alertas de perigos, fotos dos locais, caminhos a seguir, enfim, tudo que um aplicativo GPS deve ter para auxiliar o aventureiro a entrar e sair da trilha com segurança, ou pelo menos sabendo se orientar no percurso.

## Regras de Negócio

- O usuário pode se cadastrar, criar seu login e senha, e preencher informações de Perfil.
- O usuário pode criar pinos (pivots) no mapa para marcar um ponto de interesse, enviando uma foto, um nome e uma descrição.
- Os usuários podem votar nos pinos criados por outros usuários, engajando positiva ou negativamente
- O usuário deve poder baixar pinos de interesse, conforme a região onde ele vai fazer trilha, para consultar offline.
- O usuário escolhe um pino (pivot) central e diz qual raio ele quer que outros pinos sejam incluídos para serem baixados.
- A tela principal do aplicativo deve mostrar um mapa com a localização atual do GPS do usuário logado
- No mapa da tela principal, devem aparecer os pinos cadastrados pelos usuários na área visível do mapa.
- Os pinos devem ter indicação de cor, conforme a quantidade de votos positivos ou negativos naquele pino. Indo de verde (boas recomendações) até vermelho (má reputação).
- O usuário pode pesquisar por trilhas pelo nome ou pela região
- O mapa deve ser interativo, deixando o usuário navegar e aplicar zoom.
- Ao clicar no pino o usuário tem acesso a um painel com foto e informações do local marcado.
- No painel de detalhes do pino, o usuário pode votar positivamente ou negativamente, além de poder ver o status atual das recomendações.
- No painel de detalhes do pino, o usuário ainda pode deixar um comentário.
- O usuário deve poder cadastrar pontos de atenção, como árvores caídas, barranco solto, alagamentos, entre outros eventos que o turista precisa ficar atento.

## Entidades

- Usuário: Nome, Email, Senha
- Pino (Pivot): Nome, Descrição, Latitude, Longitude, Foto, Pontos de atenção
- Pontos de atenção: Nome, Descrição, Tipo
- Tipos de ponto de atenção: Desmoronamento, Ponto intransponível, Alagamento, Propriedade Privada, Perigo, Assalto, Queimada
- Tipo de Pino: A pé, Bicicleta, Moto, Jipe, Escalada, Aquática, Quadriciclo, Cavalo, Mista
- Perfil: Usuário, Avatar, Biografia, Interesses pessoais, Data de aniversário
- Veículo: Usuario, Marca, Modelo, Descrição, Tipo
- Tipo de veículo: Carro, Moto, Jipe, Tênis, Bicicleta, Outros

## Requisitos Funcionais

- Usar API's do Google Maps integrado no aplicativo.
- qualquer informação pode ser postada por qualquer usuário do aplicativo
- O aplicativo deve ser responsivo priorizando o uso pelo celular
- Filtros que alterem a visualização dependendo se o usuário está a pé, de bicicleta, de moto, de jipe ou é uma trilha de escalada, ou é aquática (raft, por exemplo).

## Requisitos Visuais
- Opcoes do menu lateral: Mapa, Pivots, Veículos, Perfil
- Tema visual: Utilize um design moderno, imersivo e funcional, combinando fotografias de paisagens brasileiras com elementos gráficos inspirados em mapas, curvas de nível, bússolas, coordenadas geográficas, marcações de GPS, placas de trilha e equipamentos de aventura.
Paleta de cores:
Verde-floresta e verde-musgo como cores principais.
Laranja queimado ou amarelo de sinalização para alertas, botões e pontos importantes.
Tons de terra, areia e pedra para elementos secundários.
Azul profundo para rios, cachoeiras e recursos relacionados à água.
Fundo escuro em grafite ou verde muito escuro para reforçar o estilo radical e tecnológico.
Vermelho apenas para perigos, emergências e trechos críticos.
A interface deve apresentar mapas como elemento central, com trilhas destacadas por cores, níveis de dificuldade, distância, elevação, duração estimada, condições do percurso, pontos de interesse e alertas de risco.

---
> **Instrucoes para a Inteligencia Artificial**
>
> Este documento contem os requisitos de negocio e visuais do projeto.
> As especificacoes tecnicas detalhadas estao nos arquivos de contexto do pacote. Comece pelo arquivo **`Prompt.txt`**.
