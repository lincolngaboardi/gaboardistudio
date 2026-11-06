// POST /api/lead  (redirecionado pelo netlify.toml)
//
// Recebe { telefone, nicho, cidade, bairro?, pagina?, confirmacao_url } do modal,
// valida, descarta bots (honeypot) e dispara o aviso de novo lead:
//   1. WhatsApp Cloud API -> mensagem de template para o(s) número(s) da empresa
//   2. WhatsApp Cloud API -> mensagem de template para o cliente ("já vamos te chamar")
//   3. LEAD_WEBHOOK_URL   -> POST JSON (CRM, planilha, n8n/Zapier, etc.)
// Cada canal só roda se as variáveis de ambiente dele estiverem definidas.
//
// Resposta: { ok: true } ou { ok: false, error: "<código>" }.
// Os códigos "Invalid phone" | "Invalid DDD" | "Missing fields" | "Invalid name"
// são "recuperáveis": o front volta ao formulário e mostra a mensagem inline.

const { validarTelefone, paraWhatsApp } = require("../lib/phone")

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v21.0"

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
})

const limpar = (v, max = 120) => String(v || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max)

async function enviarTemplate(para, template, parametros) {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE_LANG = "pt_BR" } = process.env
  const r = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: para,
      type: "template",
      template: {
        name: template,
        language: { code: WHATSAPP_TEMPLATE_LANG },
        components: parametros.length
          ? [{ type: "body", parameters: parametros.map((text) => ({ type: "text", text: text || "-" })) }]
          : [],
      },
    }),
  })
  if (!r.ok) throw new Error(`WhatsApp API ${r.status}: ${await r.text()}`)
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método não permitido" }

  let data
  try {
    data = JSON.parse(event.body || "{}")
  } catch {
    return json(400, { ok: false, error: "Invalid body" })
  }

  // Honeypot: campo invisível que humanos não preenchem. Finge sucesso para o bot.
  if (limpar(data.confirmacao_url)) return json(200, { ok: true })

  if (!data.telefone) return json(400, { ok: false, error: "Missing fields" })
  const erro = validarTelefone(data.telefone)
  if (erro) return json(400, { ok: false, error: erro })

  const lead = {
    telefone: paraWhatsApp(data.telefone),
    nicho: limpar(data.nicho, 40),
    cidade: limpar(data.cidade, 60),
    bairro: limpar(data.bairro, 60),
    pagina: limpar(data.pagina, 200),
    origem: limpar(event.headers.host, 120),
    recebido_em: new Date().toISOString(),
  }

  const env = process.env
  const tarefas = []
  const temWhatsApp = env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID

  if (temWhatsApp && env.WHATSAPP_TEMPLATE_AVISO && env.EMPRESA_WHATSAPP) {
    // EMPRESA_WHATSAPP aceita vários números separados por vírgula (ex.: vendedores)
    for (const numero of env.EMPRESA_WHATSAPP.split(",").map((n) => n.trim()).filter(Boolean)) {
      tarefas.push(
        enviarTemplate(numero, env.WHATSAPP_TEMPLATE_AVISO, [
          lead.telefone,
          lead.bairro || lead.cidade,
          lead.pagina,
        ])
      )
    }
  }
  if (temWhatsApp && env.WHATSAPP_TEMPLATE_CLIENTE) {
    tarefas.push(enviarTemplate(lead.telefone, env.WHATSAPP_TEMPLATE_CLIENTE, []))
  }
  if (env.LEAD_WEBHOOK_URL) {
    tarefas.push(
      fetch(env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      }).then((r) => {
        if (!r.ok) throw new Error(`Webhook ${r.status}`)
      })
    )
  }

  if (tarefas.length === 0) {
    console.warn("Lead recebido mas nenhum canal configurado:", lead)
    return json(500, { ok: false, error: "No channel configured" })
  }

  const resultados = await Promise.allSettled(tarefas)
  resultados.filter((r) => r.status === "rejected").forEach((r) => console.error(r.reason))

  // Basta um canal entregar para o lead não se perder.
  const algumOk = resultados.some((r) => r.status === "fulfilled")
  return algumOk ? json(200, { ok: true }) : json(502, { ok: false, error: "Delivery failed" })
}
