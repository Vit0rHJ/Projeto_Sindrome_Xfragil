BACKEND:
OBS IMPORTANTES PARA O PROJETO:
admin ve todos os pacintes e consultas/ medico ve apenas seus proprios pacintes/ e o score do primeiro checklist feito pelo vresponsavel nao aparece para ele.
os triggers do banco calculam o score automaticamnte no INSERT e UPDATE.
 score de 0-3: observaco, 4-7: auxilio clinico, 8-12: medicaco
 o MariaDB ta sem senha por enquanto para facilitar na fase de desenvolvimento, depois vai ser colocado
GERAL:  Os testes do back estao sendo feitos utilizando postman
o cadastro de medicos pelo admin e a listagem de medicos tbm ja foi feito testado e e esta funcionando.
o cadastro esta completo comforme os campos do formulario da pagina do Eu Digo X.
na questao da listagem de perfil, como foi requisitado pelo pessoal da clinica o admin ve todos os pacientes e o medico ve apenas os proprios.
a criaco de consultas relacionadas ao medico e paciente.
listag  por perfil ta feito.
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

A FAZER BACKEND:
Controller e rota de checklist 
Controller e rota de laudos — gerar o PDF do laudo.



BANCO DE DADOS:
por enquanto estamos utilizando o MysqlServer, ele fica rodando em segundo plano na maquina na porta 3306, e existe independente de qualquer ferramente,OBS: estamos utilizando o proprio mysqlserver para fazer os testes, o mysql2 é a biblioteca do node que estamos usando para falar com o mysqlservrer diretamente sem ter que abrir o workbench diretamente.
depois de alguns novos requesitos terem sido feitos o banco teve que ser alterado, atulamente estao com a modelagem completa(usuarios, pacientes, consultas, checklist, laudos).
as viws para consultas simplificadas (vw_consulta_completa, vw_checklist_resumo).
os triggers automaticos dos scores de encaminhamento tbm estao completos.
e agora tbm relacionado aos novos reuesitos, eu adicionei compos com base no formulario real do Eu Digo X.



FRONTEND:

A FAZER FRONTEND: