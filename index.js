// index.js — monitora SP/MG, avisa quando cair e quando voltar

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pkg from "cron";
const { CronJob } = pkg;

// ===== Paths & .env =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// ===== Config =====
const ENDPOINT =
  process.env.ENDPOINT ||
  "https://monitorsefaz.webmaniabr.com/v2/components.json";
const UFS = (process.env.UFS || "SP,MG")
  .split(",")
  .map((s) => s.trim().toUpperCase());
const SCHEDULE = process.env.SCHEDULE || "*/5 * * * *"; // padrão: a cada 5 min
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "";
const STATE_FILE = path.join(__dirname, "state.json");

// ===== Estado em memória =====
let lastStatus = {};

// ===== Slack =====
async function notify(message, blocks) {
  console.log(`\n📢 ${message}`);
  if (!SLACK_WEBHOOK_URL) return;

  const payload = blocks ? { text: message, blocks } : { text: message };

  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (!res.ok) console.error(`❌ Slack HTTP ${res.status}: ${text}`);
  } catch (err) {
    console.error("❌ Erro ao enviar para Slack:", err);
  }
}

function slackBlocks(statuses) {
  return statuses.map((s) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text:
        `*CT-e ${s.uf}*: *${s.status}*` +
        (s.incidente ? `\n_${s.incidente}_` : ""),
    },
  }));
}

// ===== Busca e filtragem =====
async function loadStatuses() {
  const res = await fetch(ENDPOINT, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const components = Array.isArray(data.components) ? data.components : data;

  const cte = components.filter(
    (c) => c.group && c.group.name === "Autorizadores de CT-e" && UFS.includes(c.name)
  );

  return UFS.map((uf) => {
    const item = cte.find((x) => x.name === uf);
    return {
      uf,
      status: item?.status || "UNKNOWN",
      incidente: item?.activeIncidents?.[0]?.name || "",
    };
  });
}

// ===== Comparação e alerta =====
async function check() {
  try {
    const snapshot = await loadStatuses();

    for (const s of snapshot) {
      const prev = lastStatus[s.uf] || "UNKNOWN";
      const curr = s.status;

      // Mudança detectada
      if (prev !== curr) {
        if (curr !== "OPERATIONAL") {
          await notify(
            `🚨 CT-e ${s.uf} caiu: ${curr}` +
              (s.incidente ? ` — ${s.incidente}` : ""),
            slackBlocks([s])
          );
        } else {
          await notify(`✅ CT-e ${s.uf} voltou: ${curr}`, slackBlocks([s]));
        }
      }

      // Atualiza estado atual
      lastStatus[s.uf] = curr;
    }

    // Log simplificado
    console.log(
      `🕒 ${new Date().toLocaleString("pt-BR")} | ` +
        snapshot.map((s) => `${s.uf}=${s.status}`).join(" | ")
    );
  } catch (err) {
    await notify(`⚠️ Erro ao consultar monitor: ${err.message}`);
  }
}

// ===== Execução =====
async function main() {
  console.log(
    `Monitor CT-e para [${UFS.join(", ")}] iniciado — intervalo "${SCHEDULE}"`
  );

  if (process.env.RUN_ONCE === "1") {
    await check();
    process.exit(0);
  } else {
    await check();
    new CronJob(SCHEDULE, check, null, true, "America/Sao_Paulo");
  }
}

main();
