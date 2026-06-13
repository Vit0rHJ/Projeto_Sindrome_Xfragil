# Eu Digo X — Guia de Uso para Profissionais de Saúde

Este guia explica, passo a passo, como usar o sistema "Eu Digo X" no dia a dia de uma clínica ou unidade de saúde que faz o rastreamento da Síndrome do X Frágil. Não é necessário nenhum conhecimento técnico — basta um navegador de internet.

---

## 1. Acesso ao sistema

1. Abra o navegador e acesse o endereço informado pela equipe técnica (em ambiente de testes: `http://localhost:5173`).
2. Informe seu **e-mail** e **senha** cadastrados pelo administrador do sistema.
3. Após o login, o menu lateral mostra apenas as funções liberadas para o seu perfil.

### Perfis de usuário

| Perfil | O que vê e pode fazer |
| --- | --- |
| **Administrador** | Acesso total: cadastra médicos/secretárias, vê todos os pacientes, relatórios e a trilha de auditoria. |
| **Secretaria** | Vê todos os pacientes e consultas, organiza a fila de pré-checklists e direciona pacientes para os médicos, acessa relatórios. |
| **Médico** | Vê seus próprios pacientes e consultas, faz a avaliação clínica oficial, gera laudos. |
| **Responsável** | Cadastra a si mesmo e a criança/paciente, preenche o pré-checklist em casa. Não vê pontuações nem encaminhamentos — essa parte é de uso clínico. |

---

## 2. Cadastro do paciente

No menu **Novo Paciente**, preencha os dados da criança e do responsável: nome, data de nascimento, sexo, dados de contato, histórico familiar (casos de deficiência intelectual, menopausa precoce, ataxia/tremores na família), se já fez exame genético, entre outros. Esses dados ajudam a contextualizar o resultado do checklist e podem ser atualizados depois.

Para localizar um paciente já cadastrado, use o menu **Pacientes**, que tem busca por nome ou CPF.

> **Por que o sexo do paciente é importante?** O sistema usa o sexo informado para calcular o **score ponderado** (explicado na seção 4), pois a Síndrome do X Frágil costuma se manifestar de forma diferente em meninos e meninas.

---

## 3. Preenchimento do checklist

O checklist tem **12 perguntas** sobre sinais e comportamentos comumente associados à Síndrome do X Frágil, divididos em dois grupos:

- **Cognitivo-comportamentais**: atraso na fala, dificuldade de aprendizado, déficit de atenção, deficiência intelectual, hiperatividade, agressividade, evitar contato visual, evitar contato físico, movimentos repetitivos.
- **Físicos**: frouxidão ligamentar/articular, macroquidia (orelhas/testículos maiores), face alongada.

Cada item é respondido como **presente** ou **ausente**. O checklist passa por duas etapas:

1. **Pré-checklist do responsável** — preenchido em casa, serve apenas de **triagem** para a secretaria entender a situação e direcionar o paciente ao médico adequado. O responsável não vê pontuação, apenas confirma o envio.
2. **Avaliação clínica do médico** — feita durante a consulta. É o registro **oficial**: substitui o pré-checklist e é o que alimenta o laudo. O resultado completo (pontuações e encaminhamento) é exibido na tela.

Cada consulta tem **uma avaliação oficial**. Se for necessário reavaliar o paciente, isso é feito em uma **nova consulta**, o que permite acompanhar a evolução ao longo do tempo (ver seção 5).

---

## 4. Como o sistema calcula o resultado

Ao salvar o checklist, o sistema mostra dois indicadores:

### a) Score Total (0 a 12)
É a simples contagem de quantos dos 12 sinais estão presentes. É um número fácil de comunicar, mas **não considera o sexo do paciente**.

### b) Score Ponderado (0,0000 a 1,0000)
É o indicador clinicamente mais relevante. Cada um dos 12 sinais tem um **peso diferente conforme o sexo do paciente**, refletindo o quanto aquele sinal é característico da síndrome em meninos ou em meninas. A soma dos pesos dos sinais presentes resulta no score ponderado.

O score ponderado é comparado a um **limiar** (linha de corte), também específico por sexo:

- **Meninos**: limiar = **0,56**
- **Meninas**: limiar = **0,55**

A barra exibida na tela mostra visualmente onde o score do paciente está em relação a essa linha.

### c) Encaminhamento sugerido

| Faixa do score ponderado | Encaminhamento |
| --- | --- |
| Abaixo de ~70% do limiar | **Observação** — acompanhamento de rotina |
| Entre ~70% do limiar e o limiar | **Auxílio Clínico Recomendado** |
| Igual ou acima do limiar | **Encaminhamento Prioritário** (avaliação genética recomendada) |

> **Importante**: o resultado do sistema é uma **ferramenta de apoio à triagem**, não substitui o julgamento clínico nem o exame genético confirmatório (DNA/PCR). Os pesos utilizados podem ser recalibrados pela equipe técnica conforme novos dados forem analisados, sem necessidade de reescrever o sistema.

---

## 5. Laudo e evolução do paciente

Na tela **Laudos**, é possível abrir o laudo de qualquer consulta avaliada. O laudo mostra:

- Dados do paciente e do médico responsável.
- Score total, score ponderado, limiar utilizado e encaminhamento, com a explicação do que cada um significa.
- Caso o paciente já tenha mais de uma avaliação registrada, um **gráfico de evolução** mostra como o score ponderado mudou ao longo das consultas, com a linha do limiar marcada para referência.
- Botão para **baixar o laudo em PDF** — um documento de página única com cabeçalho institucional, resultado visual do score, os 12 sintomas avaliados, espaço para assinatura do médico e aviso de conformidade com a LGPD. Pode ser impresso ou anexado ao prontuário do paciente.

---

## 6. Relatórios (Administrador e Secretaria)

A tela **Relatórios** reúne uma visão geral do uso do sistema:

- Totais de pacientes cadastrados, consultas registradas e checklists avaliados.
- Percentual de pacientes com encaminhamento prioritário.
- Gráfico de pizza com a distribuição dos encaminhamentos (observação / auxílio clínico / prioritário).
- Gráfico de evolução mensal do número de avaliações.
- Gráfico comparando o score ponderado médio entre meninos e meninas.
- Gráfico de avaliações realizadas por médico.
- Botão **Exportar CSV**, que baixa uma planilha com todas as avaliações (paciente, sexo, médico, data, scores, limiar e encaminhamento) — útil para análises estatísticas externas ou apresentações.

---

## 7. Trilha de auditoria (somente Administrador)

Para atender à **Lei Geral de Proteção de Dados (LGPD)**, o sistema registra automaticamente:

- Tentativas de login (com sucesso ou falha);
- Cada checklist salvo (e quando a avaliação do médico substitui um pré-checklist);
- Cada laudo gerado.

Esses registros (quem fez, quando, e qual ação) ficam disponíveis na parte inferior da tela **Relatórios**, visível apenas para administradores, permitindo auditar o uso do sistema e identificar acessos indevidos.

---

## 8. Dúvidas frequentes

**O responsável consegue ver o resultado do checklist?**
Não. O responsável apenas confirma que respondeu às 12 perguntas. A interpretação clínica (scores e encaminhamento) é restrita a médico, secretaria e administrador.

**O médico pode avaliar uma consulta que já tem pré-checklist do responsável?**
Sim — esse é o fluxo normal. O pré-checklist é só triagem; a avaliação do médico o substitui e passa a ser o registro oficial da consulta.

**Posso reavaliar o mesmo paciente depois?**
Sim. Basta criar uma nova consulta para o paciente e preencher um novo checklist. O histórico de scores fica disponível no laudo, em forma de gráfico de evolução.

**Os pesos dos sintomas podem mudar?**
Sim. Os pesos e os limiares ficam armazenados no banco de dados (tabela `sintomas_pesos`) e podem ser ajustados pela equipe técnica conforme novas evidências, sem necessidade de alterar o código do sistema. O administrador também pode adicionar novos sintomas e ajustar a gravidade de cada um pela tela **Sintomas**.

---

## 9. Contato — Instituto Buko Kaesemodel

**Endereço:** Rua Fernando Simas, 172 – Bigorrilho, Curitiba-PR
**Telefone:** (41) 3156-0309 · **WhatsApp:** (41) 99103-4847
**E-mail:** contato@eudigox.com.br

**Orientações, solicitações e esclarecimentos sobre a Lei Geral de Proteção de Dados (LGPD):**
Encarregada de Dados: **Luz Maria T. Romero Silva**
Telefone: (41) 3156-0309 / (41) 99103-4847
E-mail: luzmaria@institutobk.org.br
