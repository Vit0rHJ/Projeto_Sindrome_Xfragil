-- =====================================================================
-- Banco de dados do sistema "Eu Digo X" - Síndrome do X Frágil
-- Script completo (sobe o banco do zero), refletindo o schema em uso
-- pela aplicação (Backend + Frontend) em 2026-06-11.
--
-- Para recriar o banco do zero, basta rodar este arquivo inteiro:
--   mysql -u root -p < banco.sql
-- =====================================================================

DROP DATABASE IF EXISTS psinx;
CREATE DATABASE psinx
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE psinx;

-- ---------------------------------------------------------------------
-- usuarios: contas do sistema (RF03/RNF06 - 4 perfis com RBAC)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id            INT NOT NULL AUTO_INCREMENT,
    nome          VARCHAR(150) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    senha_hash    VARCHAR(255) NOT NULL,
    perfil        ENUM('admin','secretaria','medico','responsavel') NOT NULL DEFAULT 'responsavel',
    crm           VARCHAR(20) NULL,
    especialidade VARCHAR(100) NULL,
    foto          VARCHAR(255) NULL,
    ativo         TINYINT(1) NOT NULL DEFAULT 1,
    criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- usuário administrador padrão (senha: ver script de seed/README)
INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
('Administrador', 'admin@gmail.com',
 '$2b$10$Gp.j.7OTTYdk6IkfoxiPiu.2rqj7hU8fJSu1lCgdG.VpLlbhS1AI2',
 'admin');

-- ---------------------------------------------------------------------
-- pacientes: ficha completa do paciente (anamnese, responsável, etc.)
-- ---------------------------------------------------------------------
CREATE TABLE pacientes (
    id                    INT NOT NULL AUTO_INCREMENT,
    nome                  VARCHAR(150) NOT NULL,
    cpf                   VARCHAR(14) NOT NULL UNIQUE,
    data_nascimento       DATE NULL,
    sexo                  ENUM('M','F') NULL,
    nome_mae              VARCHAR(150) NULL,
    nome_pai              VARCHAR(150) NULL,
    email                 VARCHAR(150) NULL,
    telefone              VARCHAR(20) NULL,
    whatsapp              VARCHAR(20) NULL,
    telefone2             VARCHAR(20) NULL,
    cidade                VARCHAR(100) NULL,
    estado                VARCHAR(2) NULL,
    pais                  VARCHAR(50) NOT NULL DEFAULT 'Brasil',
    foto                  VARCHAR(255) NULL,
    nome_responsavel      VARCHAR(150) NOT NULL,
    cpf_responsavel       VARCHAR(14) NOT NULL,
    telefone_responsavel  VARCHAR(20) NOT NULL,
    grau_parentesco       VARCHAR(50) NULL,
    responsavel_id        INT NULL,
    ja_fez_exame_dna      TINYINT(1) NOT NULL DEFAULT 0,
    interesse_exame_pcr   TINYINT(1) NOT NULL DEFAULT 0,
    resultado_exame       ENUM('mutacao_completa','pre_mutacao','zona_grey','mosaicismo','negativo','nao_sei') NULL,
    diagnostico_autismo   TINYINT(1) NOT NULL DEFAULT 0,
    tem_irmaos            TINYINT(1) NOT NULL DEFAULT 0,
    historico_familiar_di ENUM('sim','nao','nao_sei') NOT NULL DEFAULT 'nao',
    historico_menopausa   ENUM('sim','nao','nao_sei') NOT NULL DEFAULT 'nao',
    historico_ataxia      ENUM('sim','nao','nao_sei') NOT NULL DEFAULT 'nao',
    medico_id             INT NULL,
    criado_em             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_paciente_medico
        FOREIGN KEY (medico_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_paciente_responsavel
        FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- consultas: agendamentos/atendimentos de cada paciente com um médico
-- ---------------------------------------------------------------------
CREATE TABLE consultas (
    id             INT NOT NULL AUTO_INCREMENT,
    paciente_id    INT NOT NULL,
    medico_id      INT NOT NULL,
    status         ENUM('pendente','realizada','cancelada') NOT NULL DEFAULT 'pendente',
    data_consulta  DATE NOT NULL,
    observacoes    TEXT NULL,
    criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_consulta_paciente
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
        ON UPDATE CASCADE,
    CONSTRAINT fk_consulta_medico
        FOREIGN KEY (medico_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- sintomas_pesos: pesos configuráveis de cada sintoma do checklist,
-- por sexo (RF11/RF12/RNF16). Pode ser ajustado sem alterar o código.
-- ---------------------------------------------------------------------
CREATE TABLE sintomas_pesos (
    id              INT NOT NULL AUTO_INCREMENT,
    codigo          VARCHAR(50)  NOT NULL,
    nome            VARCHAR(150) NOT NULL,
    categoria       ENUM('cognitivo_comportamental','fisico') NOT NULL,
    peso_masculino  DECIMAL(4,2) NOT NULL,
    peso_feminino   DECIMAL(4,2) NOT NULL,
    ativo           TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    UNIQUE KEY uk_sintomas_pesos_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pesos iniciais (somam 1.00 por sexo). Ponto de partida documentado,
-- substituível pelos pesos reais obtidos via Random Forest sobre a
-- coorte do IBK, sem qualquer alteração de código.
INSERT INTO sintomas_pesos (codigo, nome, categoria, peso_masculino, peso_feminino) VALUES
    ('sin_atraso_fala',            'Atraso na fala',                          'cognitivo_comportamental', 0.12, 0.07),
    ('sin_dif_aprendizado',        'Dificuldade de aprendizado',              'cognitivo_comportamental', 0.07, 0.15),
    ('sin_deficit_atencao',        'Déficit de atenção',                      'cognitivo_comportamental', 0.06, 0.15),
    ('sin_def_intelectual',        'Deficiência intelectual',                 'cognitivo_comportamental', 0.14, 0.09),
    ('sin_hiperatividade',         'Hiperatividade',                          'cognitivo_comportamental', 0.10, 0.07),
    ('sin_agressividade',          'Agressividade',                           'cognitivo_comportamental', 0.04, 0.05),
    ('sin_evita_contato_visual',   'Evita contato visual',                    'cognitivo_comportamental', 0.09, 0.10),
    ('sin_evita_contato_fisico',   'Evita contato físico',                    'cognitivo_comportamental', 0.02, 0.08),
    ('sin_movimentos_repetitivos', 'Movimentos repetitivos',                  'cognitivo_comportamental', 0.09, 0.06),
    ('sin_frouxidao',              'Frouxidão ligamentar/articular',          'fisico',                   0.08, 0.09),
    ('sin_macroquidia',            'Macroquidia (orelhas/testículos grandes)','fisico',                   0.10, 0.05),
    ('sin_face_alongada',          'Face alongada',                           'fisico',                   0.09, 0.04);

-- ---------------------------------------------------------------------
-- checklist: respostas do checklist clínico de 12 sintomas (RF09/RF10)
-- score_total = soma simples (0-12); score_ponderado e limiar_usado são
-- calculados pela API (RF11/RF12/RNF16) usando sintomas_pesos.
-- ---------------------------------------------------------------------
CREATE TABLE checklist (
    id              INT NOT NULL AUTO_INCREMENT,
    consulta_id     INT NOT NULL UNIQUE,
    preenchido_por  ENUM('responsavel','medico') NOT NULL DEFAULT 'responsavel',

    sin_atraso_fala            TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Demorou para falar',
    sin_dif_aprendizado        TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Dificuldades no aprendizado',
    sin_deficit_atencao        TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Déficit de atenção',
    sin_def_intelectual        TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Deficiência intelectual',
    sin_hiperatividade         TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Hiperatividade',
    sin_agressividade          TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Agressividade',
    sin_evita_contato_visual   TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Evita contato visual',
    sin_evita_contato_fisico   TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Evita contato físico',
    sin_movimentos_repetitivos TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Movimentos repetitivos e ritmados',
    sin_frouxidao               TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Articulações mais flexíveis (hiperextensibilidade)',
    sin_macroquidia             TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Testículos de tamanho maior',
    sin_face_alongada           TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Face alongada / orelhas de abano',

    observacoes      TEXT NULL,
    score_total      TINYINT NOT NULL DEFAULT 0,
    score_ponderado  DECIMAL(5,4) NOT NULL DEFAULT 0,
    limiar_usado     DECIMAL(5,4) NOT NULL DEFAULT 0.555,
    encaminhamento   ENUM('observacao','auxilio_clinico','medicacao') NOT NULL DEFAULT 'observacao',
    criado_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_checklist_consulta
        FOREIGN KEY (consulta_id) REFERENCES consultas(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- laudos: registro dos PDFs gerados para cada consulta avaliada
-- ---------------------------------------------------------------------
CREATE TABLE laudos (
    id            INT NOT NULL AUTO_INCREMENT,
    consulta_id   INT NOT NULL UNIQUE,
    arquivo_pdf   VARCHAR(255) NOT NULL,
    gerado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_laudo_consulta
        FOREIGN KEY (consulta_id) REFERENCES consultas(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- logs_auditoria: trilha de auditoria de ações sensíveis (RNF08 / LGPD)
-- ---------------------------------------------------------------------
CREATE TABLE logs_auditoria (
    id            INT NOT NULL AUTO_INCREMENT,
    usuario_id    INT NULL,
    usuario_nome  VARCHAR(150) NULL,
    perfil        VARCHAR(20)  NULL,
    acao          VARCHAR(100) NOT NULL,
    detalhes      VARCHAR(255) NULL,
    criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_logs_auditoria_usuario (usuario_id),
    KEY idx_logs_auditoria_criado_em (criado_em),
    CONSTRAINT fk_logs_auditoria_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- Views
-- ---------------------------------------------------------------------
CREATE VIEW vw_consulta_completa AS
SELECT
    c.id,
    c.status,
    c.data_consulta,
    c.observacoes,
    c.criado_em,
    p.id   AS paciente_id,
    p.nome AS paciente_nome,
    p.cpf  AS paciente_cpf,
    m.id   AS medico_id,
    m.nome AS medico_nome,
    ch.encaminhamento
FROM consultas c
JOIN pacientes p ON p.id = c.paciente_id
JOIN usuarios  m ON m.id = c.medico_id
LEFT JOIN checklist ch ON ch.consulta_id = c.id;

CREATE VIEW vw_checklist_resumo AS
SELECT
    ch.consulta_id,
    ch.score_total,
    ch.score_ponderado,
    ch.limiar_usado,
    ch.encaminhamento,
    ch.preenchido_por,
    p.nome AS paciente_nome,
    p.sexo AS paciente_sexo,
    m.nome AS medico_nome,
    c.data_consulta
FROM checklist ch
JOIN consultas c ON c.id = ch.consulta_id
JOIN pacientes p ON p.id = c.paciente_id
JOIN usuarios  m ON m.id = c.medico_id;

-- ---------------------------------------------------------------------
-- Triggers: calculam o score_total (soma simples 0-12) automaticamente.
-- score_ponderado, limiar_usado e encaminhamento são calculados pela
-- API a partir de sintomas_pesos e do sexo do paciente (RF11/RF12/RNF16).
-- ---------------------------------------------------------------------
DELIMITER $$

CREATE TRIGGER trg_calcular_score_insert
BEFORE INSERT ON checklist
FOR EACH ROW
BEGIN
    SET NEW.score_total = (
          NEW.sin_atraso_fala + NEW.sin_dif_aprendizado
        + NEW.sin_deficit_atencao + NEW.sin_def_intelectual
        + NEW.sin_hiperatividade + NEW.sin_agressividade
        + NEW.sin_evita_contato_visual + NEW.sin_evita_contato_fisico
        + NEW.sin_movimentos_repetitivos + NEW.sin_frouxidao
        + NEW.sin_macroquidia + NEW.sin_face_alongada
    );
END $$

CREATE TRIGGER trg_calcular_score_update
BEFORE UPDATE ON checklist
FOR EACH ROW
BEGIN
    SET NEW.score_total = (
          NEW.sin_atraso_fala + NEW.sin_dif_aprendizado
        + NEW.sin_deficit_atencao + NEW.sin_def_intelectual
        + NEW.sin_hiperatividade + NEW.sin_agressividade
        + NEW.sin_evita_contato_visual + NEW.sin_evita_contato_fisico
        + NEW.sin_movimentos_repetitivos + NEW.sin_frouxidao
        + NEW.sin_macroquidia + NEW.sin_face_alongada
    );
END $$

DELIMITER ;
