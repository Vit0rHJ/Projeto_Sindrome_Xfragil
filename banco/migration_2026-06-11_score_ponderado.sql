-- =====================================================================
-- Migração: Score ponderado por sexo, relatórios e auditoria (LGPD)
-- Data: 2026-06-11
--
-- Esta migração é INCREMENTAL (não derruba o banco nem apaga dados).
-- Pode ser executada em uma base "psinx" já existente.
--
-- O que ela faz:
--  1. Cria a tabela `sintomas_pesos`, com os pesos de cada sintoma do
--     checklist por sexo (RF11/RF12/RNF16). Os pesos somam 1.00 para
--     cada sexo e podem ser ajustados depois SEM alterar código,
--     bastando atualizar os valores nesta tabela.
--  2. Adiciona as colunas `score_ponderado` e `limiar_usado` na tabela
--     `checklist`.
--  3. Recria as triggers de `checklist` para que continuem calculando
--     o `score_total` (soma simples 0-12, mantida para exibição),
--     mas deixem de sobrescrever `encaminhamento` — esse campo passa a
--     ser calculado pela aplicação a partir do score ponderado e do
--     limiar específico do sexo do paciente.
--  4. Atualiza a view `vw_checklist_resumo` para expor o sexo do
--     paciente, o score ponderado e o limiar usado.
--  5. Cria a tabela `logs_auditoria` (RNF08 - trilha de auditoria/LGPD).
-- =====================================================================

USE psinx;

-- ---------------------------------------------------------------------
-- 1) Tabela de pesos dos sintomas por sexo
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sintomas_pesos (
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

-- Pesos iniciais (somam 1.00 por sexo). Baseados no perfil clínico
-- típico descrito para a Síndrome do X Frágil: indivíduos do sexo
-- masculino tendem a apresentar quadro mais acentuado de deficiência
-- intelectual, atraso de fala e características físicas marcantes,
-- enquanto no sexo feminino predominam dificuldades de aprendizagem,
-- déficit de atenção e ansiedade/comportamento de evitação.
-- Estes valores são um ponto de partida documentado e podem ser
-- substituídos pelos pesos reais obtidos via Random Forest sobre a
-- coorte do IBK, sem qualquer alteração de código (RNF16).
INSERT INTO sintomas_pesos (codigo, nome, categoria, peso_masculino, peso_feminino) VALUES
    ('sin_atraso_fala',            'Atraso na fala',                         'cognitivo_comportamental', 0.12, 0.07),
    ('sin_dif_aprendizado',        'Dificuldade de aprendizado',             'cognitivo_comportamental', 0.07, 0.15),
    ('sin_deficit_atencao',        'Déficit de atenção',                     'cognitivo_comportamental', 0.06, 0.15),
    ('sin_def_intelectual',        'Deficiência intelectual',                'cognitivo_comportamental', 0.14, 0.09),
    ('sin_hiperatividade',         'Hiperatividade',                         'cognitivo_comportamental', 0.10, 0.07),
    ('sin_agressividade',          'Agressividade',                          'cognitivo_comportamental', 0.04, 0.05),
    ('sin_evita_contato_visual',   'Evita contato visual',                   'cognitivo_comportamental', 0.09, 0.10),
    ('sin_evita_contato_fisico',   'Evita contato físico',                   'cognitivo_comportamental', 0.02, 0.08),
    ('sin_movimentos_repetitivos', 'Movimentos repetitivos',                 'cognitivo_comportamental', 0.09, 0.06),
    ('sin_frouxidao',              'Frouxidão ligamentar/articular',         'fisico',                   0.08, 0.09),
    ('sin_macroquidia',            'Macroquidia (orelhas/testículos grandes)','fisico',                  0.10, 0.05),
    ('sin_face_alongada',          'Face alongada',                          'fisico',                   0.09, 0.04)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    categoria = VALUES(categoria),
    peso_masculino = VALUES(peso_masculino),
    peso_feminino = VALUES(peso_feminino);

-- ---------------------------------------------------------------------
-- 2) Novas colunas em `checklist`
-- ---------------------------------------------------------------------
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'checklist' AND COLUMN_NAME = 'score_ponderado'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE checklist ADD COLUMN score_ponderado DECIMAL(5,4) NOT NULL DEFAULT 0 AFTER score_total',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'checklist' AND COLUMN_NAME = 'limiar_usado'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE checklist ADD COLUMN limiar_usado DECIMAL(5,4) NOT NULL DEFAULT 0.555 AFTER score_ponderado',
    'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- 3) Triggers: mantêm apenas o cálculo do score_total (0-12).
--    encaminhamento e score_ponderado passam a ser calculados na API.
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_calcular_score_insert;
DROP TRIGGER IF EXISTS trg_calcular_score_update;

DELIMITER $$
CREATE TRIGGER trg_calcular_score_insert BEFORE INSERT ON checklist
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
END$$

CREATE TRIGGER trg_calcular_score_update BEFORE UPDATE ON checklist
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
END$$
DELIMITER ;

-- ---------------------------------------------------------------------
-- 4) View vw_checklist_resumo (com score ponderado/limiar/sexo)
-- ---------------------------------------------------------------------
DROP VIEW IF EXISTS vw_checklist_resumo;
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
-- 5) Tabela de auditoria (RNF08 - LGPD)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs_auditoria (
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
    CONSTRAINT fk_logs_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------
-- 6) Recalcula score_ponderado/limiar_usado/encaminhamento para os
--    checklists já existentes, usando os pesos cadastrados acima.
-- ---------------------------------------------------------------------
UPDATE checklist ch
JOIN consultas c ON c.id = ch.consulta_id
JOIN pacientes p ON p.id = c.paciente_id
SET
    ch.score_ponderado = ROUND(
          ch.sin_atraso_fala            * (CASE WHEN p.sexo = 'F' THEN 0.07 ELSE 0.12 END)
        + ch.sin_dif_aprendizado        * (CASE WHEN p.sexo = 'F' THEN 0.15 ELSE 0.07 END)
        + ch.sin_deficit_atencao        * (CASE WHEN p.sexo = 'F' THEN 0.15 ELSE 0.06 END)
        + ch.sin_def_intelectual        * (CASE WHEN p.sexo = 'F' THEN 0.09 ELSE 0.14 END)
        + ch.sin_hiperatividade         * (CASE WHEN p.sexo = 'F' THEN 0.07 ELSE 0.10 END)
        + ch.sin_agressividade          * (CASE WHEN p.sexo = 'F' THEN 0.05 ELSE 0.04 END)
        + ch.sin_evita_contato_visual   * (CASE WHEN p.sexo = 'F' THEN 0.10 ELSE 0.09 END)
        + ch.sin_evita_contato_fisico   * (CASE WHEN p.sexo = 'F' THEN 0.08 ELSE 0.02 END)
        + ch.sin_movimentos_repetitivos * (CASE WHEN p.sexo = 'F' THEN 0.06 ELSE 0.09 END)
        + ch.sin_frouxidao              * (CASE WHEN p.sexo = 'F' THEN 0.09 ELSE 0.08 END)
        + ch.sin_macroquidia            * (CASE WHEN p.sexo = 'F' THEN 0.05 ELSE 0.10 END)
        + ch.sin_face_alongada          * (CASE WHEN p.sexo = 'F' THEN 0.04 ELSE 0.09 END)
    , 4),
    ch.limiar_usado = CASE WHEN p.sexo = 'F' THEN 0.5500 ELSE 0.5600 END;

UPDATE checklist
SET encaminhamento = CASE
    WHEN score_ponderado >= limiar_usado THEN 'medicacao'
    WHEN score_ponderado >= limiar_usado * 0.7 THEN 'auxilio_clinico'
    ELSE 'observacao'
END;
