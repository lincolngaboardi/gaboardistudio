// Validação de telefone brasileiro — usada pelo front (cópia em public/js/lead.js)
// e pelo back (functions/lead.js). O back NUNCA confia no front.

const VALID_DDDS = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19",
  "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38",
  "41", "42", "43", "44", "45", "46", "47", "48", "49",
  "51", "53", "54", "55",
  "61", "62", "63", "64", "65", "66", "67", "68", "69",
  "71", "73", "74", "75", "77", "79",
  "81", "82", "83", "84", "85", "86", "87", "88", "89",
  "91", "92", "93", "94", "95", "96", "97", "98", "99",
])

// "(45) 9 9999-9999", "+55 45 99999 9999", "045999999999" -> "45999999999"
function normalizarTelefone(input) {
  return String(input || "")
    .replace(/\D/g, "")
    .replace(/^0+/, "")
    .replace(/^55(?=\d{10,11}$)/, "")
}

// Retorna o código de erro (string) ou null se válido.
function validarTelefone(input) {
  const digits = normalizarTelefone(input)
  if (digits.length < 10 || digits.length > 11) return "Invalid phone"
  if (!VALID_DDDS.has(digits.slice(0, 2))) return "Invalid DDD"
  if (/^(\d)\1+$/.test(digits.slice(2))) return "Invalid phone"
  // celular com 11 dígitos precisa começar com 9 depois do DDD
  if (digits.length === 11 && digits[2] !== "9") return "Invalid phone"
  return null
}

// Formato E.164 sem "+", que é o que a API do WhatsApp e o wa.me esperam.
function paraWhatsApp(input) {
  return "55" + normalizarTelefone(input)
}

module.exports = { VALID_DDDS, normalizarTelefone, validarTelefone, paraWhatsApp }
