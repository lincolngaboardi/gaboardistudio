// GET /api/w/<host>?b=<bairro>  — "CTA direto"
//
// Usado quando CTA_DIRETO=true no front: o botão pula o formulário e vai direto
// para o WhatsApp da empresa (wa.me) com uma mensagem já preenchida.
// Se não houver número configurado (modo "desligado"), devolve o visitante para
// o site com ?form=1, o que reabre o modal de captura automaticamente.

exports.handler = async (event) => {
  const numero = (process.env.EMPRESA_WHATSAPP || "").split(",")[0].trim()
  const host = event.headers.host || ""
  const bairro = (event.queryStringParameters && event.queryStringParameters.b) || ""

  if (!numero || process.env.CTA_DIRETO_DESLIGADO === "true") {
    return { statusCode: 302, headers: { Location: `https://${host}/?form=1&m=desligado` } }
  }

  const cidade = process.env.CIDADE || ""
  const texto = [
    "Olá! Vim pelo site e quero um orçamento de piso vinílico",
    bairro ? `no bairro ${bairro}` : cidade ? `em ${cidade}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .concat(".")

  return {
    statusCode: 302,
    headers: {
      Location: `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`,
      "Cache-Control": "no-store",
    },
  }
}
