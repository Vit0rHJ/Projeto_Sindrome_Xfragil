BACKEND:

 SOBRE O LAUDO: vamos usar a biblioteca pdfkit que vai permitir agente criar pedf direto pelo node.js, No nosso projeto ele vai gerar o laudo da consulta com os dados do paciente, os sintomas marcados no checklist, o score e o encaminhamento tudo num PDF que o médico pode baixar e enviar para outros médicos.
OBS: secretaria, recebe checklist do responsavel, e tem acesso a dados gerais
OBS IMPORTANTES PARA O PROJETO:
admin ve todos os pacintes e consultas/ medico ve apenas seus proprios pacintes/ e o score do primeiro checklist feito pelo vresponsavel nao aparece para ele.
os triggers do banco calculam o score automaticamnte no INSERT e UPDATE.
score de 0-3: observaco, 4-7: auxilio clinico, 8-12: medicaco
o MariaDB ta sem senha por enquanto para facilitar na fase de desenvolvimento, depois vai ser colocado
GERAL: Os testes do back estao sendo feitos utilizando postman
o cadastro de medicos pelo admin e a listagem de medicos tbm ja foi feito testado e e esta funcionando.
o cadastro esta completo comforme os campos do formulario da pagina do Eu Digo X.
na questao da listagem de perfil, como foi requisitado pelo pessoal da clinica o admin ve todos os pacientes e o medico ve apenas os proprios.
a criaco de consultas relacionadas ao medico e paciente.
listag por perfil ta feito.
atualizaco de status(pendentes/realizados/cancelada)

Package.json: configura as dependencias do projeto e os scripts para rodar o servidor, é basicamente um documento do backend

.env: é onde estao guardadas as informacoes sensiveis do projeto, como as portas do servidor, dados de conexao com o banco, e as chaves secretas do jwt(as tokens), ele bunca vai pro gith.
atualizei as variaveis de ambiente.

config/db.js: cria as conexoes com o banco, usando um pool de conexoes, todo arquivo que precisar consultar o banco vai precisar importar esse arquivo.
ja foi feita a conexao copm MariaDB via a pool.

CORS: é uma politica de segurança dos navegadores que bloqueia requisições de origens diferentes, como o frontend rodando na porta 3000 e o backend na 3001, com o cors a gente vai conseguir liberar isso e permitir que o frontend consiga se comunicar com o backend sem problemas

server.js: é ele que vai iniciar o servidor, configurar o CORS, pro react conseguir se comunicar, e registar todas as rotas, (quando agente rodar o npm run dev) é esse arquivo que o node vai executa.
o servidor do express foi configurado.

controllers/autenticador.js: ele vai ser responsavel pela logica do login, receber email,senha, busca os usuarios no banco, compara a senah com o hash, e vai devolver um token com o jwt se tudo estiver certo.
os logins utilizando token JWT ja esta pronto e testado.

meddlewares/auth.js: ele vai ser responsavel pela seguranca do sistema, toda rota protegida passa por ele antes de chegar no controller ele verifica se o token é valido e se o usuario tem permissao de acesso.
o teste de token JWT nos middlewares tbm ja foi testado e esta funcionando.
a questao de restricao apenas para admin tbm ja foi testado e esta funcionando.

routes/auth.js: define o endereço /api/auth/login e conecta a ele ao controller do login.
eu adicionei as rotas de autenticaco.
o sisitema de rotas protegidas por perfil ta no (routes/auth.js)

PARA REALIZAR TESTES DO BACK: estamos utilizando o Postman

BIBLIOTECA MULTER: eu adicionei a nova biblioteca multer, para upload de fotos , éla serve para gerenciar o recebimento de arquivos no node, op front vai enviar a foto, o multer intercepta , salvo o arquivo na pasta uploads, coloca o caminho do arquivo  no req.file, o controller vai pegar o req.file.filename e vai salvar no banco, o banco nao vai salvar imagens ele vai salvar o caminho do arquvo 

A FAZER BACKEND:
Controller e rota de checklist
Controller e rota de laudos — gerar o PDF do laudo.

BANCO DE DADOS:
USAR ISSO PARA RODAR O MARIA DB: & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root


por enquanto estamos utilizando o MysqlServer, ele fica rodando em segundo plano na maquina na porta 3306, e existe independente de qualquer ferramente,OBS: estamos utilizando o proprio mysqlserver para fazer os testes, o mysql2 é a biblioteca do node que estamos usando para falar com o mysqlservrer diretamente sem ter que abrir o workbench diretamente.
depois de alguns novos requesitos terem sido feitos o banco teve que ser alterado, atulamente estao com a modelagem completa(usuarios, pacientes, consultas, checklist, laudos).
as viws para consultas simplificadas (vw_consulta_completa, vw_checklist_resumo).
os triggers automaticos dos scores de encaminhamento tbm estao completos.
e agora tbm relacionado aos novos reuesitos, eu adicionei compos com base no formulario real do Eu Digo X.

FRONTEND:
instalei a biblioteca axios: Axios é uma biblioteca que facilita fazer requisições HTTP no React — ou seja, é ela que vai fazer o React "conversar" com o backend.
Sem ela você usaria o fetch nativo do JavaScript, que funciona mas é mais verboso. O axios simplifica bastante. Compara:
Mesma coisa, muito menos código. Além disso o axios tem outras vantagens:

Converte automaticamente a resposta para JSON
Permite configurar uma URL base para não repetir http://localhost:3001 em todo lugar
Facilita enviar o token JWT no cabeçalho de todas as requisições automaticamente

A FAZER FRONTEND:

TESTES POSTMAN:
Passo 1 — Login para pegar o token do médico:
POST http://localhost:3001/api/auth/login
Body:
json
{
"email": "medico@gmail.com",
"senha": "medico123"
}
Passo 2 — Criar uma consulta:
POST http://localhost:3001/api/consultas
Authorization → Bearer Token → cola o token
Body:
json
{
"paciente_id": 1,
"data_consulta": "2026-06-10",
"observacoes": "Primeira consulta"
}
Passo 3 — Listar consultas:
GET http://localhost:3001/api/consultas
Authorization → Bearer Token → cola o token
Sem body

POST http://localhost:3001/api/auth/login
Body:
json
{
"email": "medico@gmail.com",
"senha": "medico123"
}

MEDICO:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwibm9tZSI6IkRyLiBUZXN0ZSIsInBlcmZpbCI6Im1lZGljbyIsImlhdCI6MTc4MDQwODYxOCwiZXhwIjoxNzgwNDM3NDE4fQ.ZBjX_i-LBBZ3i3PTWuULpOp1x-HgSHdobQDVdIDjzek
ADM:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibm9tZSI6IkFkbWluaXN0cmFkb3IiLCJwZXJmaWwiOiJhZG1pbiIsImlhdCI6MTc4MDQwODcyMSwiZXhwIjoxNzgwNDM3NTIxfQ.3WRIcxfoHyqkfaqaKP70KS2AFea1QNcgGlS31sINoUg

Faz login como admin primeiro:
POST http://localhost:3001/api/auth/login
Body:
json

Pega o token e cadastra o médico de novo:
POST http://localhost:3001/api/usuarios
Authorization → Bearer Token → token do admin
Body:
json
{
"nome": "Dr. Teste",
"email": "medico@gmail.com",
"senha": "medico123",
"crm": "12345",
"especialidade": "Neurologia"
}

Agora faz login como médico para pegar o token dele:
POST http://localhost:3001/api/auth/login
Body:
json
{
"email": "medico@gmail.com",
"senha": "medico123"
}
Pega o token e cadastra um paciente de teste:
POST http://localhost:3001/api/pacientes
Authorization → Bearer Token → token do médico
Body:
json
{
"nome": "Paciente Teste",
"cpf": "123.456.789-00",
"email": "paciente@gmail.com",
"telefone": "41999999999",
"data_nascimento": "2015-03-10",
"nome_responsavel": "Responsável Teste",
"cpf_responsavel": "987.654.321-00",
"telefone_responsavel": "41988888888"
}

Agora cria a consulta:
POST http://localhost:3001/api/consultas
Authorization → Bearer Token → token do médico
Body:
json
{
"paciente_id": 1,
"data_consulta": "2026-06-10",
"observacoes": "Primeira consulta"
}

Listar consultas:
GET http://localhost:3001/api/consultas
Authorization → Bearer Token → token do médico
Sem body
Atualizar status:
PATCH http://localhost:3001/api/consultas/1
Authorization → Bearer Token → token do médico
Bo
