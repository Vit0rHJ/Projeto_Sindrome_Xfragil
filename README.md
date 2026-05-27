BACKEND:
Package.json: configura as dependencias do projeto e os scripts para rodar o servidor, é basicamente um documento do backend

.env: é onde estao guardadas as informacoes sensiveis do projeto, como as portas do servidor, dados de conexao com o banco, e as chaves secretas do jwt(as tokens), ele bunca vai pro gith

config/db.js: cria as conexoes com o banco, usando um pool de conexoes, todo arquivo que precisar consultar o banco vai precisar importar esse arquivo

CORS: é uma politica de segurança dos navegadores que bloqueia requisições de origens diferentes, como o frontend rodando na porta 3000 e o backend na 3001, com o cors a gente vai conseguir liberar isso e permitir que o frontend consiga se comunicar com o backend sem problemas

server.js: é ele que vai iniciar o servidor, configurar o CORS, pro react conseguir se comunicar, e registar todas as rotas, (quando agente rodar o npm run dev) é esse arquivo que o node vai executa

controllers/autenticador.js: ele vai ser responsavel pela logica do login, receber email,senha, busca os usuarios no banco, compara a senah com o hash, e vai devolver um token com o jwt se tudo estiver certo

meddlewares/auth.js: ele vai ser responsavel pela seguranca do sistema, toda rota protegida passa por ele antes de chegar no controller ele verifica se o token é valido e se o usuario tem permissao de acesso

routes/auth.js: define o endereço /api/auth/login e conecta a ele ao controller do login

A FAZER BACKEND:
Testar o login com uma ferramenta chamada Insomnia — antes de partir pro frontend, precisamos garantir que o backend está respondendo certo.
Controller e rota de usuários — onde o admin cadastra os médicos.
Controller e rota de pacientes — cadastro do paciente pelo médico.
Controller e rota de consultas — criar e listar consultas.
Controller e rota de checklist — salvar os 12 sintomas e receber o score calculado pelo banco.
Controller e rota de laudos — gerar o PDF do laudo.
 n


BANCO DE DADOS:
por enquanto estamos utilizando o MysqlServer, ele fica rodando em segundo plano na maquina na porta 3306, e existe independente de qualquer ferramente,OBS: estamos utilizando o mysqlworkbench para testar
 o banco e rodar as querries mas nao participa diretamente do sistema
 o mysql2 é a biblioteca do node que estamos usando para falar com o mysqlservrer diretamente sem ter que abrir o workbench diretamente



FRONTEND:

A FAZER FRONTEND: