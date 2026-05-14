CREATE DATABASE PSINX;
USE PSINX;
CREATE TABLE usuarios;

id INT NOT NULL AUTO_INCREMENT,
nome VARCHAR (150) NOT NULL,
email VARCHAR (150) NOT NULL UNIQUE,
senhahash VARCHAR (255) NOT NULL,
perfil ENUM('admin', 'medico') NOT NULL DEFAULT 'medico',
criadoem TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

PRIMARY KEY(id)
) ENGINE=InnoDB;
-- admin padrao(senha: admin123)
INSERT INTO usuarios (nome, email, senhahash, perfil) VALUES (
 'administrador', 'admin@gmail.com', '$2b$10$Kd5V1e8QwZv3hXnYpLmR4OqT7uBcJfGsNiAeDkWyMxPzCvHoUjSr2', 'admin',
 );
 
 CREATE TABLE pacientes (
 id   INT NOT NULL AUTO_INCREMENT,
 nome VARCHAR (150) NOT NULL,
 cpf   VARCHAR (14) NOT NULL UNIQUE,
 email VARCHAR (150),
 telefone VARCHAR (20),
 datanacimento DATE,
 nomeresponsavel VARCHAR(150) NOT NULL,
 cpfresponsavel VARCHAR (14) NOT NULL,
 telefoneresponsavel VARCHAR (20) NOT NULL,
 medicoid INT NOT NULL,
 criadoem TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
 PRIMARY KEY (id),
 CONSTRAINT fkpacientemedico
 FOREIGN KEY  (medicoid) REFERENCES usuarios(id)
 ON UPDATE CASCADE ON DELETE RESTRICT
 )ENGINE =InnoDB;
 
 
CREATE TABLE consultas (
id INT NOT NULL AUTO_INCREMENT,
pacienteid INT NOT NULL,
medicoid INT NOT NULL,
status ENUM ('pendente', 'realizada', 'cancelada')  NOT NULL DEFAULT 'pendente',
dataconsulta DATE NOT NULL,
observacoes TEXT,
criadoem TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY(id),
CONSTRAINT fkconsultapaciente,
 FOREIGN KEY (pacienteid) REFERENCES pacientes(id)
 ON UPDATE CASCADE ON DELETE RESTRICT,
 CONSTRAINT fkconsultamedico
 FOREIGN KEY (medicoid) REFERENCES usuarios(id)
 ON UPDATE CASCADE ON DELETE RESTRICT
 )ENGINE=InnoDB;
 
 CREATE TABLE  checklist (
 id INT NOT NULL AUTO_INCREMENT,
 consultaid INT NOT NULL UNIQUE,
 sinmacroquidia TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Macrooquidia',
 sinfacealongada TINYINT(1) NOT NULL DEFAULT 0 COMMENT ' Face alongada',
 sinorelhasgrandeseproeminenetes TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Orelhas grandes e proeminentes',
 sinprognatismo TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Prognatismo', 
 sinhipotonia TINYINT(1) NOT NULL DEFAULT 0 COMMENT ' Hipotonia muscular',
 sinfrouxidao TINYINT(1) NOT NULL DEFAULT 0 COMMENT ' Frouxidao ligamentar',
 sinpalatoogival TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Palato ogival',
 sindefintelectual TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Defieiencia intelectual',
 sinatrasofala TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Atraso na fala',
 sinhiperatividade TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Hiperatividade/TDAH',
 sinautismo TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Comportamentos do espectro autista',
 sinansiedade TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Ansiedae/ Timidez extrema',
 scoretotal TINYINT NOT NULL DEFAULT 0 COMMENT 'Soma dos sintomas presentes (0-12)',
 encaminhamento ENUM('observacao', 'auxilioclinico','medicacao') NOT NULL DEFAULT 'observacao',
 
 PRIMARY KEY (id),
 CONSTRAINT fkchecklistconsulta
 FOREIGN KEY (consultaid) REFERENCES consultas(id)
 ON UPDATE CASCADE ON DELETE CASCADE
 ) ENGINE=InnoDB;
 
 CREATE TABLE laudos (
 id INT NOT NULL AUTO_INCREMENT,
 consultaid NOT NULL UNIQUE,
 arquivopdf VARCHAR(255) NOT NULL COMMENT'Caminho do arquivo PDF no servidor',
 geradoem  TIMESTAMP DEFAULT NOT NULL CURRENT_TIMESTAMP,
 
 PRIMARY KEY (id)
 CONSTRAINT fklaudoconsulta
 FOREIGN KEY (consultaid) REFERENCES consultas(id)
 ON UPDATE CASCADE ON DELETE CASCADE
 ) ENGINE=InnoDB;
 
 CREATE VIEW vwconsultacompleta AS SELECT
 c.id,
 c.status,
 c.dataconsulta,
 c.observacoes,
 c.criadoem,
 p.id AS pacienteid,
 p.nome AS pacientenome,
 p.cpf AS pacientecpf,
 m.id AS medicoid,
 m.nome AS mediconome
 
 FROM consultas c
 JOIN  pacientes p ON p.id = c.paciente_id
 JOIN usuarios m ON m.id = c.medicoid;
 
 CREATE VIEW vwchecklistresumo AS SELECT
 ch.consultaid,
 ch.scoretotal,
 ch.encaminhamento,
 p.nome AS pacientenome,
 m.nome AS mediconome,
 c.dataconsulta
 
FROM checklist ch
JOIN consulatas c ON c.id =ch.consultaid
JOIN pacientes p ON p.id = c.pacienteid
JOIN usuarios ON m.id = c.medico_id;
 
 DELIMITER $$ 
 CREATE TRIGGER  trgcalcularscoreinsert
 BEFORE INSERT ON checklist
	FOR EACH ROW BEGIN 
    SET NEW.scoretotal = (
      NEW.sinmicroquidia + NEW.sinfacealongada + NEW.dinorelhasgrande
    + NEW.sinpragnatismo + NEW.sinhiptonia + NEW.sinfrouxo
    + NEW.palatoogival + NEW.sindefintelectual + NEW.sinatrasofla
    + NEW.sinhiperatividade + NEW.sinautismo + NEW.sinansiedade
    );
    
    SET NEW.encaminhamento = CASE
    WHEN NEW.scoretotal <= 3 THEN 'observacao'
    WHEN NEW.scoretotal <= 7 THEN 'auxilioclinico'
	ELSE 'medicao'
    END;
    END $$
    
    CREATE TRIGGER trgcalcularscoreupdate
    BEFORE UPDATE ON checklist
    FOR EACH ROW
    BEGIN 
    SET NEW.scoretotal = (
	  NEW.sinmicroquidia + NEW.sinfacealongada + NEW.dinorelhasgrande
    + NEW.sinpragnatismo + NEW.sinhiptonia + NEW.sinfrouxo
    + NEW.palatoogival + NEW.sindefintelectual + NEW.sinatrasofla
    + NEW.sinhiperatividade + NEW.sinautismo + NEW.sinansiedade
    );
    
    SET NEW.encaminhamento = CASE
    WHEN NEW.encaminhamento = CASE
        WHEN NEW.scoretotal <= 3 THEN 'observacao'
    WHEN NEW.scoretotal <= 7 THEN 'auxilioclinico'
	ELSE 'medicao'
    END;
    END$$
    DELIMITER ;
    
 