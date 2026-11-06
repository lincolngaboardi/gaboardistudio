// POST /api/t/<host>  — contador de toques (navigator.sendBeacon)
// Registra cada abertura do modal: { tipo: "formulario" | "volta", pagina }.
// Aqui só vai para o log da função; troque por um banco/analytics se quiser relatório.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "" }
  try {
    const { tipo, pagina } = JSON.parse(event.body || "{}")
    console.log(JSON.stringify({ evento: "toque", tipo, pagina, host: event.headers.host, em: new Date().toISOString() }))
  } catch {
    // corpo inválido: ignora
  }
  return { statusCode: 204, body: "" }
}
