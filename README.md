# Monitor CT-e (SP/MG)

Monitora o status dos autorizadores de CT-e para UFs definidas e envia alertas (opcional) para Slack quando cair/voltar.

## Requisitos
- Node.js 18+

## InstalaÃ§Ã£o
`ash
npm install
`

## ConfiguraÃ§Ã£o
Crie seu arquivo .env a partir do exemplo:
`ash
cp .env.example .env
`
Preencha as variÃ¡veis conforme necessÃ¡rio (principalmente SLACK_WEBHOOK_URL para notificaÃ§Ãµes via Slack).

VariÃ¡veis disponÃ­veis:
`dotenv
ENDPOINT=https://monitorsefaz.webmaniabr.com/v2/components.json
UFS=SP,MG                 # UFs separadas por vÃ­rgula (ex.: SP,MG,RS)
SCHEDULE=*/5 * * * *      # Cron (padrÃ£o: a cada 5 minutos)
SLACK_WEBHOOK_URL=        # Webhook do Slack (opcional)
# RUN_ONCE=1              # Executa uma checagem e sai (Ãºtil para testes)
`

## ExecuÃ§Ã£o
`ash
npm start
`
O app inicia, faz uma checagem imediata e agenda conforme SCHEDULE.

Para apenas uma checagem (teste/CI):
`ash
RUN_ONCE=1 npm start
`
No Windows PowerShell:
`powershell
="1"; npm start
`

## NotificaÃ§Ãµes no Slack
- Defina SLACK_WEBHOOK_URL no .env.
- Se vazio, o app apenas loga no console.

## ObservaÃ§Ãµes
- O arquivo .env Ã© ignorado pelo Git. NÃ£o comite segredos.
- Caso um segredo tenha sido exposto, revogue/rotacione no provedor (ex.: Slack) e atualize seu .env.
