 -- novo banco mais otimizado
DROP DATABASE IF EXISTS psinx;
CREATE DATABASE psinx
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE psinx;

-- TABELA: usuarios
-- Armazena admins e médicos do sistema.
-- O campo "perfil" diferencia quem é admin de quem é médico.

CREATE TABLE usuarios (
    id           INT NOT NULL AUTO_INCREMENT,
    nome         VARCHAR(150) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    senha_hash   VARCHAR(255) NOT NULL,
    perfil       ENUM('admin', 'medico') NOT NULL DEFAULT 'medico',
    crm          VARCHAR(20) NULL COMMENT 'CRM do médico (null para admin)',
    especialidade VARCHAR(100) NULL,
    criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
) ENGINE = InnoDB;


-- Admin padrão (email: admin@gmail.com / senha: admin123)
-- O hash abaixo foi gerado com bcrypt usando 10 rounds.

INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
('Administrador', 'admin@gmail.com',
 '$2b$10$Kd5V1e8QwZv3hXnYpLmR4OqT7uBcJfGsNiAeDkWyMxPzCvHoUjSr2',
 'admin');

-- TABELA: pacientes
-- Cada paciente fica vinculado ao médico que o cadastrou.
CREATE TABLE pacientes (
    id                    INT NOT NULL AUTO_INCREMENT,
    nome                  VARCHAR(150) NOT NULL,
    cpf                   VARCHAR(14) NOT NULL UNIQUE,
    email                 VARCHAR(150) NULL,
    telefone              VARCHAR(20) NULL,
    data_nascimento       DATE NULL,
    nome_responsavel      VARCHAR(150) NOT NULL,
    cpf_responsavel       VARCHAR(14) NOT NULL,
    telefone_responsavel  VARCHAR(20) NOT NULL,
    medico_id             INT NOT NULL,
    criado_em             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_paciente_medico
        FOREIGN KEY (medico_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;


-- TABELA: consultas
-- Representa cada atendimento. Liga paciente + médico.

CREATE TABLE consultas (
    id             INT NOT NULL AUTO_INCREMENT,
    paciente_id    INT NOT NULL,
    medico_id      INT NOT NULL,
    status         ENUM('pendente', 'realizada', 'cancelada') NOT NULL DEFAULT 'pendente',
    data_consulta  DATE NOT NULL,
    observacoes    TEXT NULL,
    criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_consulta_paciente
        FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_consulta_medico
        FOREIGN KEY (medico_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB;

-- TABELA: checklist
-- Os 12 sintomas avaliados na consulta.
-- O score e o encaminhamento são calculados automaticamente por trigger.

CREATE TABLE checklist (
    id              INT NOT NULL AUTO_INCREMENT,
    consulta_id     INT NOT NULL UNIQUE,

    -- Sinais físicos
    sin_macroquidia                TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Macroquidia',
    sin_face_alongada              TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Face alongada',
    sin_orelhas_proeminentes       TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Orelhas grandes e proeminentes',
    sin_prognatismo                TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Prognatismo',
    sin_hipotonia                  TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Hipotonia muscular',
    sin_frouxidao                  TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Frouxidão ligamentar',
    sin_palato_ogival              TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Palato ogival',

    -- Sinais comportamentais / cognitivos
    sin_def_intelectual            TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Deficiência intelectual',
    sin_atraso_fala                TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Atraso na fala',
    sin_hiperatividade             TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Hiperatividade / TDAH',
    sin_autismo                    TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Comportamentos do espectro autista',
    sin_ansiedade                  TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Ansiedade / Timidez extrema',

    -- Resultado (preenchido pelos triggers)
    score_total      TINYINT NOT NULL DEFAULT 0 COMMENT 'Soma dos sintomas presentes (0-12)',
    encaminhamento   ENUM('observacao', 'auxilio_clinico', 'medicacao')
                     NOT NULL DEFAULT 'observacao',
    criado_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_checklist_consulta
        FOREIGN KEY (consulta_id) REFERENCES consultas(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

-- TABELA: laudos
-- Armazena o caminho do PDF gerado após a consulta.

CREATE TABLE laudos (
    id            INT NOT NULL AUTO_INCREMENT,
    consulta_id   INT NOT NULL UNIQUE,
    arquivo_pdf   VARCHAR(255) NOT NULL COMMENT 'Caminho do arquivo PDF no servidor',
    gerado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_laudo_consulta
        FOREIGN KEY (consulta_id) REFERENCES consultas(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;


-- VIEW: vw_consulta_completa
-- Junta consulta + paciente + médico num só lugar.
-- Útil para listar consultas na home sem precisar fazer JOINs no código.

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
    m.nome AS medico_nome
FROM consultas c
JOIN pacientes p ON p.id = c.paciente_id
JOIN usuarios  m ON m.id = c.medico_id;


-- VIEW: vw_checklist_resumo
-- Resumo do resultado da consulta (score + encaminhamento).

CREATE VIEW vw_checklist_resumo AS
SELECT
    ch.consulta_id,
    ch.score_total,
    ch.encaminhamento,
    p.nome AS paciente_nome,
    m.nome AS medico_nome,
    c.data_consulta
FROM checklist ch
JOIN consultas c ON c.id = ch.consulta_id
JOIN pacientes p ON p.id = c.paciente_id
JOIN usuarios  m ON m.id = c.medico_id;


-- TRIGGERS: cálculo automático do score e do encaminhamento, sempre que um checklist for inserido ou atualizado,o banco recalcula o score_total e define o encaminhamento isso evita que o backend precise fazer essa conta.


DELIMITER $$

--insert
CREATE TRIGGER trg_calcular_score_insert
BEFORE INSERT ON checklist
FOR EACH ROW
BEGIN
    SET NEW.score_total = (
          NEW.sin_macroquidia
        + NEW.sin_face_alongada
        + NEW.sin_orelhas_proeminentes
        + NEW.sin_prognatismo
        + NEW.sin_hipotonia
        + NEW.sin_frouxidao
        + NEW.sin_palato_ogival
        + NEW.sin_def_intelectual
        + NEW.sin_atraso_fala
        + NEW.sin_hiperatividade
        + NEW.sin_autismo
        + NEW.sin_ansiedade
    );

    SET NEW.encaminhamento = CASE
        WHEN NEW.score_total <= 3 THEN 'observacao'
        WHEN NEW.score_total <= 7 THEN 'auxilio_clinico'
        ELSE 'medicacao'
    END;
END $$

--update
CREATE TRIGGER trg_calcular_score_update
BEFORE UPDATE ON checklist
FOR EACH ROW
BEGIN
    SET NEW.score_total = (
          NEW.sin_macroquidia
        + NEW.sin_face_alongada
        + NEW.sin_orelhas_proeminentes
        + NEW.sin_prognatismo
        + NEW.sin_hipotonia
        + NEW.sin_frouxidao
        + NEW.sin_palato_ogival
        + NEW.sin_def_intelectual
        + NEW.sin_atraso_fala
        + NEW.sin_hiperatividade
        + NEW.sin_autismo
        + NEW.sin_ansiedade
    );

    SET NEW.encaminhamento = CASE
        WHEN NEW.score_total <= 3 THEN 'observacao'
        WHEN NEW.score_total <= 7 THEN 'auxilio_clinico'
        ELSE 'medicacao'
    END;
END $$

DELIMITER ;

-- FIM DO SCRIPT
-- Para testar:
--   SHOW TABLES;
--   DESCRIBE usuarios;
--   SELECT * FROM usuarios;
