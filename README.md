 Eu Digo X — Sistema de Gestão Clínica para Síndrome X Frágil

Projeto acadêmico desenvolvido na PUCPR, inspirado no programa Eu Digo X do Instituto Buko Kaesemodel (Curitiba, PR). O sistema permite rastreamento, acompanhamento e gestão de pacientes com suspeita ou diagnóstico de Síndrome do X Frágil, desde o pré-checklist preenchido pelo responsável até a geração do laudo clínico.

GERAL:

os testes do back estão sendo feitos utilizando postman.
o mariaDB está sem senha por enquanto para facilitar na fase de desenvolvimento, senha será adicionada antes do deploy.
o backend usa commonJS (require/module.exports), não ES modules.
o .env nunca deve ser commitado no github pois contém informações sensíveis.
os triggers precisam ser criados separadamente do banco.sql por limitação do mysql workbench com delimiter (no banco.sql eles já estão dentro de blocos DELIMITER $$ ... $$, basta rodar o arquivo inteiro em uma ferramenta que suporte DELIMITER, como mysql cli, workbench ou phpmyadmin).

para rodar o mariaDB pelo terminal:
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root

para rodar o servidor:
cd Backend
npm run dev

servidor disponível em: http://localhost:3001

para rodar o frontend:
cd Frontend
npm run dev

frontend disponível em: http://localhost:5173


COMO SUBIR O PROJETO DO ZERO:

1. instalar mysql server 8.0 (ou mariadb) e deixar rodando na porta 3306.
2. criar o banco rodando o arquivo banco/banco.sql inteiro (ele já cria o banco "psinx", as tabelas, views, triggers, os pesos dos sintomas e o usuário admin).
   & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root < banco/banco.sql
3. dentro de Backend, criar um arquivo .env com:
   PORT=3001
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=psinx
   JWT_SECRET=uma_string_secreta_qualquer
   JWT_EXPIRES_IN=8h
4. cd Backend && npm install && npm run dev
5. cd Frontend && npm install && npm run dev
6. acessar http://localhost:5173 e logar com admin@gmail.com / admin123 (ver seção TESTES POSTMAN para credenciais e fluxo).


BANCO DE DADOS:

estamos utilizando o mysql server rodando em segundo plano na porta 3306. o mysql2 é a biblioteca do node que usamos para falar com o servidor diretamente sem precisar abrir o workbench.

o banco passou por atualizações conforme novos requisitos foram chegando. atualmente temos a modelagem completa das tabelas (usuarios, pacientes, consultas, checklist, laudos, sintomas_pesos, logs_auditoria), views para consultas simplificadas (vw_consulta_completa, vw_checklist_resumo), triggers automáticos de cálculo do score bruto, e campos adicionados com base no formulário real do eu digo x.

SINTOMAS_PESOS:
tabela que guarda o peso de cada um dos 12 sintomas do checklist, separado por sexo (peso_masculino e peso_feminino). esses pesos são usados para calcular o score ponderado (ver seção METODOLOGIA DO SCORE abaixo). os pesos podem ser ajustados direto no banco (UPDATE sintomas_pesos SET ...) sem precisar mexer em nenhuma linha de código, porque o backend sempre lê os pesos ativos (ativo=1) na hora de salvar o checklist.

LOGS_AUDITORIA:
tabela de trilha de auditoria (LGPD/RNF08). registra automaticamente: tentativas de login (sucesso e falha), salvamento de checklist e geração de laudo. cada registro guarda usuário, perfil, ação, detalhes e data/hora. só o admin consegue visualizar essa trilha (tela Relatórios).

TRIGGERS:
os triggers (trg_calcular_score_insert e trg_calcular_score_update) calculam automaticamente o score_total, que é a soma simples dos 12 sintomas marcados (0 a 12). esse valor é só um indicador bruto/visual — o valor que realmente define o encaminhamento clínico é o score_ponderado, calculado pelo backend (ver abaixo).


METODOLOGIA DO SCORE (RF11/RF12/RNF16):

o score_total (0 a 12) é a contagem simples de sintomas marcados, calculada automaticamente pelo trigger do banco. ele serve como referência rápida, mas não define sozinho o encaminhamento, porque a síndrome do x frágil se manifesta de forma diferente em meninos e meninas (o gene FMR1 está no cromossomo X, e meninas geralmente têm um segundo X que compensa parte do efeito).

por isso, o sistema calcula também o score_ponderado, um valor entre 0 e 1:

  score_ponderado = soma( peso_do_sintoma[sexo_do_paciente] x (1 se o sintoma foi marcado, 0 se não) )

os pesos de cada sintoma (tabela sintomas_pesos) somam 1.00 para cada sexo e foram definidos priorizando os sinais mais característicos da síndrome em cada caso (por exemplo, déficit de atenção e dificuldade de aprendizado pesam mais no sexo feminino, enquanto deficiência intelectual e atraso de fala pesam mais no masculino).

o resultado é comparado a um limiar específico por sexo (limiar_usado), também configurável:
  - masculino: limiar 0.56
  - feminino:  limiar 0.55

com base nisso, o paciente recebe um encaminhamento:
  - score_ponderado < limiar x 0.7        -> observacao (acompanhamento de rotina)
  - limiar x 0.7 <= score_ponderado < limiar -> auxilio_clinico (auxílio clínico recomendado)
  - score_ponderado >= limiar              -> medicacao (encaminhamento prioritário, avaliação genética recomendada)

essa regra de negócio fica inteira em Backend/src/controllers/checklist.js (função calcularScorePonderado), e os pesos/limiares podem ser recalibrados no banco a qualquer momento (por exemplo, após validação estatística com a base de dados real do instituto), sem precisar alterar o código do sistema.


PERFIS DE USUÁRIO:

admin: vê todos os pacientes e consultas, pode gerenciar tudo no sistema, é o único que vê a trilha de auditoria.
secretaria: vê todos os dados, direciona pacientes para médicos e acessa os relatórios agregados.
medico: vê apenas seus próprios pacientes e consultas, vê o score ponderado e o encaminhamento.
responsavel: faz o próprio cadastro, cadastra o paciente e faz o pré-checklist. o score não aparece para ele.


BACKEND:

PACKAGE.JSON:
configura as dependências do projeto e os scripts para rodar o servidor. é basicamente o documento de identidade do backend.

.ENV:
guarda as informações sensíveis do projeto como porta do servidor, dados de conexão com o banco e a chave secreta do jwt. nunca vai para o github.

CONFIG/DB.JS:
cria a conexão com o banco usando um pool de conexões. todo arquivo que precisar consultar o banco importa esse arquivo. conexão com mariadb via pool já configurada e funcionando.

SERVER.JS:
inicia o servidor, configura o cors para o react conseguir se comunicar com o backend, e registra todas as rotas. quando rodamos npm run dev é esse arquivo que o node executa. o cors está configurado para liberar as portas 3000 e 5173.

MIDDLEWARES/AUTH.JS:
responsável pela segurança do sistema. toda rota protegida passa por ele antes de chegar no controller. verifica se o token jwt é válido e se o usuário tem permissão de acesso.
middlewares disponíveis: autenticar, apenasAdmin, adminOuSecretaria.

CONTROLLERS/AUTENTICADOR.JS:
responsável pela lógica de login e cadastro de responsável. recebe email e senha, busca o usuário no banco, compara a senha com o hash e devolve um token jwt se tudo estiver certo. toda tentativa de login (sucesso, senha errada ou email inexistente) é registrada na trilha de auditoria.

CONTROLLERS/USUARIOS.JS:
crud de médicos e secretaria. funcionalidades prontas e testadas: cadastrar médico ou secretaria (apenas admin), listar médicos ativos (apenas admin), editar dados do médico, desativar médico transferindo pacientes e consultas para outro médico antes de desativar, e atualizar foto do médico.

CONTROLLERS/PACIENTES.JS:
gestão de pacientes. funcionalidades prontas e testadas: cadastrar paciente com todos os campos do formulário real do eu digo x, listar pacientes por perfil (admin e secretaria veem todos, médico vê apenas os seus), buscar paciente por cpf, e atualizar foto do paciente.

CONTROLLERS/CONSULTAS.JS:
gestão de consultas. funcionalidades prontas e testadas: criar consulta vinculando médico e paciente, listar consultas por perfil (admin e secretaria veem todas, médico vê apenas as suas), e atualizar status (pendente, realizada, cancelada).

CONTROLLERS/CHECKLIST.JS:
salva os 12 sintomas da avaliação clínica. funcionalidades prontas e testadas: salvar checklist (aceita médico e responsável), score_total calculado automaticamente pelo trigger do banco, score_ponderado/limiar_usado/encaminhamento calculados pelo backend com base no sexo do paciente e nos pesos da tabela sintomas_pesos, campo de observações disponível. salvar um checklist gera um registro na trilha de auditoria.

regra do fluxo clínico: o pré-checklist do responsável serve apenas de triagem para a secretaria direcionar o paciente. quando o médico faz a avaliação oficial da mesma consulta, ela SUBSTITUI o pré-checklist (é o registro que vale para o laudo). ninguém refaz a própria avaliação: responsável envia 1x, médico avalia 1x. o preenchido_por é derivado do perfil do token no servidor, não do body da requisição.

os 12 sintomas (nomes exatos das colunas do banco): sin_atraso_fala, sin_dif_aprendizado, sin_deficit_atencao, sin_def_intelectual, sin_hiperatividade, sin_agressividade, sin_evita_contato_visual, sin_evita_contato_fisico, sin_movimentos_repetitivos, sin_frouxidao, sin_macroquidia, sin_face_alongada.

CONTROLLERS/LAUDOS.JS:
geração e visualização de laudos usando a biblioteca pdfkit para gerar pdfs diretamente pelo node. funcionalidades prontas e testadas: buscar dados do laudo em json para exibição na tela, e gerar e baixar laudo em pdf com dados do paciente, médico, score total, score ponderado, limiar utilizado e encaminhamento. pdfs ficam salvos em Backend/src/laudos/. a geração do laudo é registrada na trilha de auditoria.

CONTROLLERS/SECRETARIA.JS:
fluxo da secretaria. funcionalidades prontas e testadas: listar pré-checklists preenchidos por responsáveis, e direcionar paciente para um médico específico.

CONTROLLERS/RELATORIOS.JS:
relatórios agregados para gestão (admin/secretaria). funcionalidades: totais gerais (pacientes, consultas, avaliações), distribuição de encaminhamentos, médias de score ponderado por sexo, evolução mensal das avaliações, avaliações por médico, exportação em csv de todas as avaliações, histórico de evolução do score de um paciente específico (usado no gráfico de evolução do laudo), e listagem da trilha de auditoria (apenas admin).

UTILS/AUDITORIA.JS:
helper registrarLog(usuario, acao, detalhes) usado pelos outros controllers para gravar eventos na tabela logs_auditoria. falhas ao gravar log nunca derrubam a requisição principal (apenas geram um console.error).

UTILS/UPLOAD.JS:
configuração da biblioteca multer para upload de imagens. o frontend envia a foto, o multer intercepta, salva o arquivo na pasta uploads, e o controller salva o caminho no banco. o banco nunca armazena a imagem, apenas o caminho do arquivo. formatos aceitos: jpeg, jpg, png, webp. tamanho máximo: 5mb. url de acesso: http://localhost:3001/uploads/nome_do_arquivo.jpg


ROTAS DA API:

POST   /api/auth/login                    login (público)
POST   /api/auth/cadastro-responsavel     cadastro de responsável (público)

POST   /api/usuarios                      cadastrar médico/secretaria (admin)
GET    /api/usuarios                      listar médicos ativos (admin/secretaria)
PUT    /api/usuarios/:id                  editar médico (admin)
PATCH  /api/usuarios/:id/desativar        desativar médico (admin)
PATCH  /api/usuarios/:id/foto             atualizar foto (autenticado)

POST   /api/pacientes                     cadastrar paciente (autenticado)
GET    /api/pacientes                     listar pacientes (autenticado)
GET    /api/pacientes/cpf/:cpf            buscar por cpf (autenticado)
PATCH  /api/pacientes/:id/foto            atualizar foto (autenticado)

POST   /api/consultas                     criar consulta (autenticado)
GET    /api/consultas                     listar consultas (autenticado)
PATCH  /api/consultas/:id                 atualizar status (autenticado)

POST   /api/checklist                     salvar checklist (autenticado)
GET    /api/checklist/:consulta_id        buscar checklist (autenticado)

GET    /api/laudos/:consulta_id           dados do laudo em json (autenticado)
GET    /api/laudos/:consulta_id/pdf       baixar pdf (autenticado)

GET    /api/secretaria                    listar pré-checklists (admin/secretaria)
POST   /api/secretaria/direcionar         direcionar paciente para médico (admin/secretaria)

GET    /api/relatorios/agregado           estatísticas agregadas (admin/secretaria)
GET    /api/relatorios/csv                exportar csv das avaliações (admin/secretaria)
GET    /api/relatorios/historico/:paciente_id  histórico de score do paciente (autenticado)
GET    /api/relatorios/auditoria          trilha de auditoria, últimos 200 registros (admin)


TESTES POSTMAN:

credenciais de desenvolvimento:
admin:   admin@gmail.com  /  admin123
médico:  medico@gmail.com /  medico123

fluxo completo de teste:
1. POST /api/auth/login              pegar token admin
2. POST /api/usuarios                cadastrar médico com token admin
3. POST /api/auth/login              pegar token médico
4. POST /api/pacientes               cadastrar paciente com token médico
5. POST /api/consultas               criar consulta com token médico
6. POST /api/checklist               salvar checklist com token médico
7. GET  /api/laudos/:id              ver dados do laudo
8. GET  /api/laudos/:id/pdf          baixar pdf
9. GET  /api/relatorios/agregado     ver relatórios agregados (token admin/secretaria)
10. GET /api/relatorios/auditoria    ver trilha de auditoria (token admin)

para enviar o token no postman: aba authorization → bearer token


FRONTEND:

react 19 + vite + react router 7 + axios + recharts.

SERVICES/API.JS:
instância do axios com a baseURL do backend (http://localhost:3001/api) e um interceptor que coloca automaticamente o token jwt salvo no localStorage em todas as requisições. também exporta getUser(), que decodifica o payload do token para saber nome, id e perfil do usuário logado sem precisar de outra requisição.

COMPONENTS/LAYOUT.JSX:
topbar + sidebar fixos, com o conteúdo de cada página renderizado no <Outlet/>. o menu lateral é montado dinamicamente filtrando os itens pelo perfil do usuário logado (cada item tem uma lista de perfis que podem vê-lo).

PÁGINAS:
- Login.jsx: tela de login.
- CadastroResponsavel.jsx: cadastro público de responsáveis.
- Home.jsx: tela inicial pós-login.
- Cadastro.jsx: cadastro completo do paciente (formulário do eu digo x).
- Checklist.jsx: preenchimento do checklist de 12 sintomas. ao salvar, mostra o score total, e (para médico/admin/secretaria) o score ponderado com uma barra visual indicando a posição em relação ao limiar.
- Laudo.jsx: exibição do laudo de uma consulta, com score total, score ponderado, limiar, encaminhamento, gráfico de evolução do score ponderado do paciente ao longo do tempo (quando há mais de uma avaliação) e botão para baixar o pdf.
- Laudos.jsx: lista de consultas com laudo disponível.
- Secretaria.jsx: fila de pré-checklists e direcionamento de pacientes para médicos.
- AdminMedicos.jsx: cadastro/edição/desativação de médicos e secretárias.
- Relatorios.jsx: painel administrativo com cards de totais, gráfico de pizza (distribuição de encaminhamentos), gráfico de linha (evolução mensal), gráfico de barras (score ponderado médio por sexo e avaliações por médico), exportação de csv e (admin) trilha de auditoria.

ROTAS (App.jsx):
"/" e "/cadastro-responsavel" são públicas. todas as demais ficam dentro de <PrivateRoute><Layout/></PrivateRoute>, que redireciona para o login se não houver token válido. "/admin/medicos" exige especificamente o perfil admin.
