# Trilhas do Brasil

## Objetivo do Projeto

Um tipo de rede social para trilheiros do Brasil e turistas poderem conhecer e se aventurar pelos caminhos do Brasil. A ideia principal é fazer um tipo de Waze para trilheiros, incluindo orientações, pontos de interesse, alertas de perigos, fotos dos locais, caminhos a seguir, enfim, tudo que um aplicativo GPS deve ter para auxiliar o aventureiro a entrar e sair da trilha com segurança, ou pelo menos sabendo se orientar no percurso.

## Regras de Negócio

- O usuário pode se cadastrar, criar seu login e senha, e preencher informações de Perfil.
- devem existir ferramentas para que os próprios usuários votem e engajem de forma positiva ou negativa nas publicações
- O aplicativo também deve possuir ferramentas offline, para o usuário poder baixar a rota da trilha que vai fazer
- a tela principal do aplicativo deve mostrar um mapa com a localização atual do GPS do usuário logado, além de informação (pinos no mapa) de locais próximos
- O usuário pode pesquisar por trilhas pelo nome ou pela região
- Ao selecionar a trilha o usuário acessa todas as informações com fotos, mapas, pontos de interesse, qual caminho seguir
- Essas informações pivotadas do minimapa a princípio pode ser de 3 tipos: Fotos de lugares interessantes, Informações de segurança, Direções
- o usuário pode clicar no mapa e preencher um formulário para cadastrar os pontos de interesse.
- O sistema deve consultar API do Google para auxiliar o usuário no preenchimento da trilha que ele está marcando a informação de interesse
- o usuário deve poder também adicionar um nome social da Trilha, ou seja, o nome pelo qual ela é conhecida regionalmente.

## Entidades

- Usuário: Nome, Email, Senha
- Tipo Pivot: Fotos, Informações, Rotas
- Pivot: Descrição, Latitude, Longitude
- Tipo de Trilha: está a pé, de bicicleta, de moto, de jipe ou é uma trilha de escalada, ou é aquática
- Perfil: Usuário, Avatar, Biografia, Interesses pessoais, Data de aniversário

## Requisitos Funcionais

- qualquer informação pode ser postada por qualquer usuário do aplicativo
- Essa rede social deve ser um ecossistema que se auto-regule
- validade ou a confiabilidade da informação deve ser organicamente regulada pela própria comunidade
- Assim como temos ferramentas no Waze para informar que existe algum perigo no caminho, também existem ferramentas para o usuário que está passando por aquele caminho confirmar se o perigo existe e se ainda está lá.
- O aplicativo deve ser responsivo priorizando o uso pelo celular
- o aplicativo precisa mostrar a posição do usuário no mapa, pivotar localização de trilhas também no mapa, e quando abrir as informações da trilha, mostrar um minimapa também pivotado com as informações da trilha
- Precisa ter também ferramentas que alterem a visualização dependendo se o usuário está a pé, de bicicleta, de moto, de jipe ou é uma trilha de escalada, ou é aquática (raft, por exemplo).

## Requisitos Visuais
- Opcoes do menu lateral: Mapa, Pivots, Perfil
- Tema visual: O visual deve transmitir aventura, liberdade, natureza, resistência, tecnologia e segurança. A interface deve ter uma identidade inspirada em esportes radicais, expedições outdoor, montanhismo, trekking, cachoeiras, florestas e mapas topográficos.

Utilize um design moderno, imersivo e funcional, combinando fotografias de paisagens brasileiras com elementos gráficos inspirados em mapas, curvas de nível, bússolas, coordenadas geográficas, marcações de GPS, placas de trilha e equipamentos de aventura.

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
