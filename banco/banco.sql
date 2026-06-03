-- eu, vc ainda tenho que comentar o banco nao se esqueça se nao vc vai esquecendo como ele ta funcionando
DROP DATABASE IF EXISTS psinx;
CREATE DATABASE psinx
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE psinx;

CREATE TABLE usuarios (
    id           INT NOT NULL AUTO_INCREMENT,
    nome         VARCHAR(150) NOT NULL,
    email        VARCHAR(150) NOT NULL UNIQUE,
    senha_hash   VARCHAR(255) NOT NULL,
    perfil       ENUM('admin', 'medico') NOT NULL DEFAULT 'medico',
    crm          VARCHAR(20) NULL,
    especialidade VARCHAR(100) NULL,
    criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
) ENGINE = InnoDB;


INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
('Administrador', 'admin@gmail.com',
 '$2b$10$Kd5V1e8QwZv3hXnYpLmR4OqT7uBcJfGsNiAeDkWyMxPzCvHoUjSr2',
 'admin');

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

CREATE TABLE checklist (
    id              INT NOT NULL AUTO_INCREMENT,
    consulta_id     INT NOT NULL UNIQUE,

    sin_macroquidia                TINYINT(1) NOT NULL DEFAULT 0,
    sin_face_alongada              TINYINT(1) NOT NULL DEFAULT 0,
    sin_orelhas_proeminentes       TINYINT(1) NOT NULL DEFAULT 0,
    sin_prognatismo                TINYINT(1) NOT NULL DEFAULT 0,
    sin_hipotonia                  TINYINT(1) NOT NULL DEFAULT 0,
    sin_frouxidao                  TINYINT(1) NOT NULL DEFAULT 0,
    sin_palato_ogival              TINYINT(1) NOT NULL DEFAULT 0,

    sin_def_intelectual            TINYINT(1) NOT NULL DEFAULT 0,
    sin_atraso_fala                TINYINT(1) NOT NULL DEFAULT 0,
    sin_hiperatividade             TINYINT(1) NOT NULL DEFAULT 0,
    sin_autismo                    TINYINT(1) NOT NULL DEFAULT 0,
    sin_ansiedade                  TINYINT(1) NOT NULL DEFAULT 0,

    score_total      TINYINT NOT NULL DEFAULT 0,
    encaminhamento   ENUM('observacao', 'auxilio_clinico', 'medicacao')
                     NOT NULL DEFAULT 'observacao',
    criado_em        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_checklist_consulta
        FOREIGN KEY (consulta_id) REFERENCES consultas(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;

CREATE TABLE laudos (
    id            INT NOT NULL AUTO_INCREMENT,
    consulta_id   INT NOT NULL UNIQUE,
    arquivo_pdf   VARCHAR(255) NOT NULL,
    gerado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_laudo_consulta
        FOREIGN KEY (consulta_id) REFERENCES consultas(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB;


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


DELIMITER $$

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


USE psinx;
UPDATE usuarios
SET senha_hash = '$2b$10$Gp.j.7OTTYdk6IkfoxiPiu.2rqj7hU8fJSu1lCgdG.VpLlbhS1AI2'
WHERE email = 'admin@gmail.com';
SELECT * FROM usuarios;
