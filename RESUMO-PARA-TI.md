# Centro de Compras JRC — pacote para TI

## Objetivo

Sistema web interno para acompanhar compras de obras desde o planejamento, concentrando cadastro, orçamento, cotação, pedido, recebimento e acompanhamento financeiro.

## Funcionalidades incluídas

- Cadastro de obras desde o início: SPE/empresa, CNPJ, endereços, responsáveis, horário de recebimento e logo do empreendimento.
- Planejamento de insumos por obra, etapa, centro de custo, quantidade, prazo de compra, preço de referência e acompanhamento do orçamento aprovado.
- Cadastro de produtos e fornecedores, com dados da empresa e responsáveis comercial/financeiro.
- Solicitações de cotação separadas por fornecedor, PDF com identidade JRC, registro e comparação de propostas, aprovação, pedido de compra e recebimento parcial.
- Relatórios gerenciais, follow-up dos pedidos, auditoria e exportações Excel.
- Recebimento manual ou por lote de notas fiscais, integração preparada com Qive/Arquivei e conferência do CNPJ/SPE da obra.
- Projeção gerencial de contas a pagar e fluxo de caixa da obra.
- Tabelas de preços homologadas anexadas por fornecedor. Cada upload `.xlsx` (até 5 MB) cria uma versão com data, horário e responsável, visíveis na tela; as versões antigas ficam disponíveis para download.
- Acesso por usuário e perfil: administrador, engenheiro, comprador, auditor e almoxarife.

## Tecnologias

- Node.js 24+, JavaScript ES modules, servidor HTTP nativo e SQLite (`node:sqlite`).
- Interface web em JavaScript/CSS sem etapa de compilação.
- ExcelJS 4.4.0 para planilhas.
- Docker e Docker Compose para implantação.

## Arquivos principais

- `server.mjs`: rotas HTTP, sessão, integrações e endpoints.
- `domain.mjs`, `works.mjs`, `suppliers.mjs`: regras, banco de dados, obras e fornecedores.
- `excel.mjs`, `invoice-excel.mjs`, `report-export.mjs`: importação/exportação de planilhas e relatórios.
- `pdf.mjs`: geração de PDF das solicitações de cotação.
- `public/`: interface do sistema.
- `test.mjs`: testes automatizados.
- `Dockerfile`, `compose.yml`: execução em contêiner.
- `README.md`: instruções e limites funcionais mais completos.

## Rodar e verificar

Requer Node.js 24 ou superior.

```sh
pnpm install --frozen-lockfile
pnpm start
```

Acesse `http://127.0.0.1:3000`. No primeiro acesso, cadastre o administrador com senha de pelo menos 12 caracteres. Para executar os testes:

```sh
pnpm test
```

## Publicação no Git e implantação

Este pacote contém os arquivos-fonte, mas não contém metadados `.git`. O time de TI pode extrair a pasta `centro-compras`, criar o repositório corporativo e publicar a primeira versão após revisar o conteúdo.

Para a VPS, crie `.env` a partir de `.env.example`, configure as credenciais no servidor, use HTTPS por proxy reverso e mantenha o volume Docker `compras_data`. O serviço Compose publica a porta somente em `127.0.0.1:3000`; o proxy deve encaminhar as requisições HTTPS para essa porta. Domínio e VPS ainda precisam ser configurados pela JRC/ TI.

Variáveis de integração documentadas no `.env.example`: `APP_ORIGIN`, `SETUP_TOKEN`, `RESEND_API_KEY`, `EMAIL_FROM`, `WA_TOKEN`, `WA_PHONE_ID`, `WA_API_VERSION`, `WA_TEMPLATE`, `QIVE_API_ID` e `QIVE_API_KEY`. Os valores reais são segredos de ambiente: preencher apenas no servidor/gerenciador de segredos e nunca no Git.

## O que não acompanha o ZIP

- Banco de dados local, histórico de compras, cadastros, logos enviados e tabelas de preços carregadas.
- Backups SQLite, arquivos temporários, logs, `node_modules` e qualquer `.env` real.

Após implantar, o administrador deve carregar novamente o logo corporativo JRC e, se necessário, enviar os logos das obras e as planilhas homologadas. As credenciais Qive, e-mail e WhatsApp dependem da configuração e liberação dos provedores. Este pacote não representa a publicação na VPS e não realizou disparos externos.

## Pontos para revisão de TI antes de produção

- Confirmar DNS, domínio, HTTPS, firewall e política de backup/restauração.
- Configurar as credenciais reais e testar integrações em ambiente controlado.
- Revisar segurança, retenção de dados, monitoramento e recuperação de acesso.
- Confirmar que os fluxos de aprovação e orçamento atendem à política interna da JRC.
- Planejar PostgreSQL e processamento em fila antes de escalar para múltiplas instâncias; a configuração atual usa SQLite em uma instância.
