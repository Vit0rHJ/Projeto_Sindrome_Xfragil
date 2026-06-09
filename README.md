 Eu Digo X — Sistema de Gestão Clínica para Síndrome X Frágil

Projeto acadêmico desenvolvido na PUCPR, inspirado no programa Eu Digo X do Instituto Buko Kaesemodel (Curitiba, PR). O sistema permite rastreamento, acompanhamento e gestão de pacientes com suspeita ou diagnóstico de Síndrome do X Frágil.

GERAL:

os testes do back estão sendo feitos utilizando postman.
o mariaDB está sem senha por enquanto para facilitar na fase de desenvolvimento, senha será adicionada antes do deploy.
o backend usa commonJS (require/module.exports), não ES modules.
o .env nunca deve ser commitado no github pois contém informações sensíveis.
os triggers precisam ser criados separadamente do banco.sql por limitação do mysql workbench com delimiter.

para rodar o mariaDB pelo terminal:
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root

para rodar o servidor:
cd Backend
npm run dev

servidor disponível em: http://localhost:3001


BANCO DE DADOS:

estamos utilizando o mysql server rodando em segundo plano na porta 3306. o mysql2 é a biblioteca do node que usamos para falar com o servidor diretamente sem precisar abrir o workbench.

o banco passou por atualizações conforme novos requisitos foram chegando. atualmente temos a modelagem completa das tabelas (usuarios, pacientes, consultas, checklist, laudos), views para consultas simplificadas (vw_consulta_completa, vw_checklist_resumo), triggers automáticos de cálculo de score e encaminhamento, e campos adicionados com base no formulário real do eu digo x.

os triggers calculam o score automaticamente no INSERT e UPDATE da tabela checklist:
- score 0–3: observacao
- score 4–7: auxilio_clinico
- score 8–12: medicacao

PERFIS DE USUÁRIO:

admin: vê todos os pacientes e consultas, pode gerenciar tudo no sistema.
secretaria: vê todos os dados e direciona pacientes para médicos, sem poder total de edição.
medico: vê apenas seus próprios pacientes e consultas.
responsavel: faz o próprio cadastro, cadastra o paciente e faz o pré-checklist. o score não aparece para ele.


BACKEND:

PACKAGE.JSON:
configura as dependências do projeto e os scripts para rodar o servidor. é basicamente o documento de identidade do backend.

.ENV:
guarda as informações sensíveis do projeto como porta do servidor, dados de conexão com o banco e a chave secreta do jwt. nunca vai para o github.

CONFIG/DB.JS:
cria a conexão com o banco usando um pool de conexões. todo arquivo que precisar consultar o banco importa esse arquivo. conexão com mariadb via pool já configurada e funcionando.

SERVER.JS:
inicia o servidor, configura o cors para o react conseguir se comunicar com o backend, e registra todas as rotas. quando rodamos npm run dev é esse arquivo que o node executa. o cors está configurado para liberar as portas 3000 e 3002.

MIDDLEWARES/AUTH.JS:
responsável pela segurança do sistema. toda rota protegida passa por ele antes de chegar no controller. verifica se o token jwt é válido e se o usuário tem permissão de acesso.
middlewares disponíveis: autenticar, apenasAdmin, adminOuSecretaria.

CONTROLLERS/AUTENTICADOR.JS:
responsável pela lógica de login e cadastro de responsável. recebe email e senha, busca o usuário no banco, compara a senha com o hash e devolve um token jwt se tudo estiver certo. login com jwt já testado e funcionando.

CONTROLLERS/USUARIOS.JS:
crud de médicos e secretaria. funcionalidades prontas e testadas: cadastrar médico ou secretaria (apenas admin), listar médicos ativos (apenas admin), editar dados do médico, desativar médico transferindo pacientes e consultas para outro médico antes de desativar, e atualizar foto do médico.

CONTROLLERS/PACIENTES.JS:
gestão de pacientes. funcionalidades prontas e testadas: cadastrar paciente com todos os campos do formulário real do eu digo x, listar pacientes por perfil (admin e secretaria veem todos, médico vê apenas os seus), buscar paciente por cpf, e atualizar foto do paciente.

CONTROLLERS/CONSULTAS.JS:
gestão de consultas. funcionalidades prontas e testadas: criar consulta vinculando médico e paciente, listar consultas por perfil (admin e secretaria veem todas, médico vê apenas as suas), e atualizar status (pendente, realizada, cancelada).

CONTROLLERS/CHECKLIST.JS:
salva os 12 sintomas da avaliação clínica. funcionalidades prontas e testadas: salvar checklist (aceita médico e responsável), score e encaminhamento calculados automaticamente pelos triggers do banco, campo de observações disponível. cada consulta só pode ter um checklist.

os 12 sintomas (nomes exatos das colunas do banco): sin_atraso_fala, sin_dif_aprendizado, sin_deficit_atencao, sin_def_intelectual, sin_hiperatividade, sin_agressividade, sin_evita_contato_visual, sin_evita_contato_fisico, sin_movimentos_repetitivos, sin_frouxidao, sin_macroquidia, sin_face_alongada.

CONTROLLERS/LAUDOS.JS:
geração e visualização de laudos usando a biblioteca pdfkit para gerar pdfs diretamente pelo node. funcionalidades prontas e testadas: buscar dados do laudo em json para exibição na tela, e gerar e baixar laudo em pdf com dados do paciente, médico, score e encaminhamento. pdfs ficam salvos em Backend/src/laudos/

CONTROLLERS/SECRETARIA.JS:
fluxo da secretaria. funcionalidades prontas e testadas: listar pré-checklists preenchidos por responsáveis, e direcionar paciente para um médico específico.

UTILS/UPLOAD.JS:
configuração da biblioteca multer para upload de imagens. o frontend envia a foto, o multer intercepta, salva o arquivo na pasta uploads, e o controller salva o caminho no banco. o banco nunca armazena a imagem, apenas o caminho do arquivo. formatos aceitos: jpeg, jpg, png, webp. tamanho máximo: 5mb. url de acesso: http://localhost:3001/uploads/nome_do_arquivo.jpg


ROTAS DA API:

POST   /api/auth/login                    login (público)
POST   /api/auth/cadastro-responsavel     cadastro de responsável (público)

POST   /api/usuarios                      cadastrar médico/secretaria (admin)
GET    /api/usuarios                      listar médicos ativos (admin)
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

para enviar o token no postman: aba authorization → bearer token 

FRONTEND:

a ser preenchido.
