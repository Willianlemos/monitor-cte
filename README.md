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

## Teste de situaÃ§Ã£o nÃ£o operacional (simulaÃ§Ã£o)
VocÃª pode simular que determinadas UFs nÃ£o estÃ£o operacionais para testar alertas.

Local (uma execuÃ§Ã£o):
`ash
SIMULATE_NON_OPERATIONAL=SP SIMULATE_STATUS=MAJOR_OUTAGE RUN_ONCE=1 npm start
`
PowerShell (Windows):
`powershell
="SP"; ="MAJOR_OUTAGE"; ="1"; npm start
`

No Render (recomendado para teste controlado):
- Adicione env vars temporÃ¡rias:
  - SIMULATE_NON_OPERATIONAL=SP (ou SP,MG)
  - SIMULATE_STATUS=MAJOR_OUTAGE (opcional)
  - RUN_ONCE=1
- FaÃ§a um Deploy; verifique o log/Slack.
- Remova RUN_ONCE e SIMULATE_* apÃ³s o teste para voltar ao comportamento normal.
