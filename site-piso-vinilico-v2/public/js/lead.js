// Mecanismo de contato "via WhatsApp".
//
// O visitante NÃO é mandado para o WhatsApp. Qualquer elemento com
// [data-lead-trigger] abre um modal que pede o WhatsApp DO CLIENTE; o número vai
// por POST para /api/lead e a empresa é que chama o cliente no WhatsApp.
// Assim o lead fica registrado mesmo que o cliente não mande mensagem.
//
// Configuração vem de window.LEAD_CONFIG (definido no index.html).
;(function () {
  const cfg = Object.assign(
    {
      routerBase: "/api",
      nicho: "",
      cidade: "",
      bairroDaPagina: "",
      ctaDireto: false, // true = pula o modal e vai para wa.me via /api/w
      mensagemSucesso: "Vamos chamar você no WhatsApp {telefone} em horário comercial.",
    },
    window.LEAD_CONFIG || {}
  )

  const modal = document.querySelector("[data-lead-modal]")
  if (!modal) return

  const form = modal.querySelector("[data-lead-form]")
  const header = modal.querySelector(".lead-modal-header")
  const erroInline = modal.querySelector("[data-lead-erro]")
  const telInput = form.querySelector('input[name="telefone"]')
  const estados = {
    loading: modal.querySelector(".lead-state-loading"),
    success: modal.querySelector(".lead-state-success"),
    error: modal.querySelector(".lead-state-error"),
  }

  // --- validação (espelho de lib/phone.js) ---------------------------------
  const VALID_DDDS = new Set(
    "11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(" ")
  )
  const MENSAGENS_ERRO = {
    "Invalid phone": "Esse número não parece válido. Confira o DDD e os dígitos.",
    "Invalid DDD": "Esse DDD não existe. Confira o código de área.",
    "Missing fields": "Preencha o telefone.",
    "Invalid name": "Nome inválido.",
  }
  const soDigitos = (v) =>
    String(v || "").replace(/\D/g, "").replace(/^0+/, "").replace(/^55(?=\d{10,11}$)/, "").slice(0, 11)

  function validarTelefone(v) {
    const d = soDigitos(v)
    if (d.length < 10 || d.length > 11) return "Telefone incompleto. Use (XX) 9XXXX-XXXX."
    if (!VALID_DDDS.has(d.slice(0, 2))) return "Esse DDD não existe. Confira o código de área."
    if (/^(\d)\1+$/.test(d.slice(2))) return "Esse número tem todos os dígitos iguais. Digite seu WhatsApp."
    if (d.length === 11 && d[2] !== "9") return "Celular deve começar com 9 depois do DDD."
    return null
  }

  // máscara (45) 99999-9999 enquanto digita
  function formatar(d) {
    if (!d) return ""
    if (d.length <= 2) return "(" + d
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`
  }
  let ultimo = ""
  telInput.addEventListener("input", (e) => {
    const novo = soDigitos(e.target.value)
    const apagando = (e.inputType && e.inputType.startsWith("delete")) || novo.length < soDigitos(ultimo).length
    if (!apagando) e.target.value = formatar(novo)
    ultimo = e.target.value
    esconderErro()
  })
  telInput.addEventListener("blur", (e) => {
    e.target.value = formatar(soDigitos(e.target.value))
    ultimo = e.target.value
  })

  // --- estados do modal ----------------------------------------------------
  function mostrar(nome) {
    form.hidden = nome !== "form"
    header.hidden = nome !== "form"
    Object.entries(estados).forEach(([k, el]) => (el.hidden = k !== nome))
  }
  function mostrarErro(msg) {
    erroInline.textContent = msg
    erroInline.hidden = false
  }
  function esconderErro() {
    erroInline.hidden = true
  }
  const focar = () => setTimeout(() => telInput.focus(), 50)

  let gatilho = null
  let ultimoEnviado = ""
  let bairroAtual = cfg.bairroDaPagina
  function abrir(origem) {
    gatilho = origem || document.activeElement
    bairroAtual = (origem && origem.dataset && origem.dataset.bairro) || cfg.bairroDaPagina
    form.reset()
    esconderErro()
    mostrar("form")
    modal.hidden = false
    document.body.style.overflow = "hidden"
    focar()
  }
  function fechar() {
    modal.hidden = true
    document.body.style.overflow = ""
    if (gatilho && gatilho.focus) gatilho.focus()
  }

  // --- métricas: conta toques (beacon) + evento GA4 -----------------------
  function contarToque(tipo) {
    try {
      if (cfg.routerBase && navigator.sendBeacon)
        navigator.sendBeacon(
          `${cfg.routerBase}/t/${location.hostname}`,
          JSON.stringify({ tipo, pagina: location.pathname })
        )
    } catch (_) {}
    try {
      if (typeof window.gtag === "function") window.gtag("event", "abrir_formulario", { tipo })
    } catch (_) {}
  }

  // --- gatilhos ------------------------------------------------------------
  // Delegação: qualquer botão com data-lead-trigger, inclusive os criados depois.
  document.addEventListener("click", (e) => {
    const alvo = e.target.closest("[data-lead-trigger]")
    if (!alvo) return
    e.preventDefault()
    if (cfg.ctaDireto && cfg.routerBase) {
      const b = alvo.dataset.bairro || cfg.bairroDaPagina
      location.href = `${cfg.routerBase}/w/${location.hostname}${b ? "?b=" + encodeURIComponent(b) : ""}`
      return
    }
    contarToque("formulario")
    abrir(alvo)
  })

  // ?form=1 abre o modal ao carregar (usado pelo /api/w quando o CTA direto está desligado)
  if (new URLSearchParams(location.search).get("form") === "1") {
    contarToque("volta")
    abrir()
  }

  modal.querySelectorAll("[data-lead-close]").forEach((el) => el.addEventListener("click", fechar))
  modal.querySelector("[data-retry]").addEventListener("click", () => {
    mostrar("form")
    focar()
  })
  // "Número errado? Corrigir" na tela de sucesso: volta ao formulário com o número preenchido
  const corrigir = modal.querySelector("[data-corrigir]")
  if (corrigir)
    corrigir.addEventListener("click", () => {
      mostrar("form")
      telInput.value = ultimoEnviado
      ultimo = ultimoEnviado
      focar()
    })
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) fechar()
  })

  // --- envio ---------------------------------------------------------------
  async function enviar(telefone, honeypot) {
    mostrar("loading")
    try {
      const r = await fetch(`${cfg.routerBase}/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone,
          nicho: cfg.nicho,
          cidade: cfg.cidade,
          ...(bairroAtual ? { bairro: bairroAtual } : {}),
          pagina: location.pathname,
          confirmacao_url: honeypot,
        }),
      })
      const data = await r.json().catch(() => ({}))
      if (r.ok && data.ok) {
        try {
          if (typeof window.gtag === "function") window.gtag("event", "generate_lead")
        } catch (_) {}
        ultimoEnviado = formatar(soDigitos(telefone))
        modal.querySelector("[data-success-msg]").textContent = cfg.mensagemSucesso.replace("{telefone}", ultimoEnviado)
        mostrar("success")
        return
      }
      const codigo = typeof data.error === "string" ? data.error : null
      if (codigo && MENSAGENS_ERRO[codigo]) {
        mostrar("form")
        mostrarErro(MENSAGENS_ERRO[codigo])
        focar()
      } else {
        console.error("Erro no /lead:", data)
        mostrar("error")
      }
    } catch (err) {
      console.error("Falha ao enviar lead:", err)
      mostrar("error")
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const fd = new FormData(form)
    const telefone = String(fd.get("telefone") || "").trim()
    if (!telefone) return
    const erro = validarTelefone(telefone)
    if (erro) return mostrarErro(erro)
    esconderErro()
    enviar(telefone, String(fd.get("confirmacao_url") || "").trim())
  })
})()
