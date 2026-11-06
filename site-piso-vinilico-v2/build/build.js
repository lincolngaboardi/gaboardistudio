#!/usr/bin/env node
// Gera o site estático em public/ a partir de site.config.json + build/conteudo.js.
// Uso: node build/build.js
// Páginas: home, uma por bairro (com "nota") e uma por serviço, além de sitemap.xml,
// robots.txt e llms.txt. CSS, JS e imagens em public/ não são tocados.

const fs = require("fs")
const path = require("path")

const RAIZ = path.join(__dirname, "..")
const PUB = path.join(RAIZ, "public")
const cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, "site.config.json"), "utf8"))
const C = require("./conteudo")
const HOJE = new Date().toISOString().slice(0, 10)

// ---------------------------------------------------------------- utilidades
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const sub = (s) => String(s).replace(/\{cidade\}/g, cfg.cidade).replace(/\{regiao\}/g, cfg.regiao)
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
const D = cfg.dominio.replace(/\/$/, "")
const local = `${cfg.cidade}/${cfg.uf}`
const bairros = cfg.bairros.filter((b) => b.nome && b.nota).map((b) => ({ ...b, slug: "piso-vinilico-" + slug(b.nome) }))
const prep = (nome) => (/^(Centro|Jardim|Parque|Bairro|Distrito|Setor|Polo|Conjunto|Residencial)/i.test(nome) ? "no" : "na")
const dataBR = new Date(HOJE + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
const P = cfg.prazo
const prova = cfg.provas || {}
// Title até ~60 caracteres: o sufixo só entra se couber
const tit = (base, sufixo) => (base + sufixo).length <= 60 ? base + sufixo : base

function escrever(rel, conteudo) {
  const f = path.join(PUB, rel)
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, conteudo)
}

// ---------------------------------------------------------------- blocos
const waIco = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><use href="#wa"/></svg>`
const seta = `<span class="seta" aria-hidden="true">→</span>`

function botaoWA(texto = "Pedir orçamento no WhatsApp", extra = "", attrs = "") {
  return `<button type="button" class="btn btn-wa ${extra}" data-lead-trigger ${attrs}>${waIco}<span>${texto}</span></button>`
}

function ficha(linhas, titulo = "Ficha da obra") {
  return `<div class="ficha">
  <p class="ficha-tit">${titulo}</p>
  <dl>${linhas.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
</div>`
}

const fichaPadrao = () =>
  ficha([
    ["Área de referência", P.area],
    ["Prazo", P.dias + "*"],
    ["Equipes", P.equipes],
    ["Mão de obra", P.maoDeObra],
    ["Cura do autonivelante", P.cura],
    ["Umidade da base", P.umidade],
    ["Quebra-quebra", "Não"],
  ])

function provasHtml() {
  const itens = []
  if (prova.nota) itens.push(`<li><b>${esc(prova.nota)}</b> de nota${prova.avaliacoes ? ` em ${esc(prova.avaliacoes)} avaliações` : ""}${prova.linkAvaliacoes ? ` · <a href="${esc(prova.linkAvaliacoes)}" rel="noopener" target="_blank">ver no Google</a>` : ""}</li>`)
  if (prova.obras) itens.push(`<li><b>${esc(prova.obras)}</b> obras entregues</li>`)
  if (prova.garantia) itens.push(`<li>Garantia de <b>${esc(prova.garantia)}</b> na instalação</li>`)
  return itens.length ? `<ul class="provas">${itens.join("")}</ul>` : ""
}

function cabecalhoSecao(num, rotulo, titulo, extra = "") {
  return `<header class="sec-head"><p class="sec-num"><span>${num}</span>${rotulo}</p><h2>${titulo}</h2>${extra}</header>`
}

function listaServicos(excluir) {
  return `<ol class="servicos">${C.servicos
    .filter((s) => s.slug !== excluir)
    .map(
      (s, i) => `<li><a href="/servicos/${s.slug}/"><span class="s-num">${String(i + 1).padStart(2, "0")}</span><span class="s-nome">${esc(s.nome)}</span><span class="s-desc">${esc(s.curto)}</span>${seta}</a></li>`
    )
    .join("")}</ol>`
}

function cronogramaHtml() {
  return `<div class="obra">
  <ol class="cronograma">${C.cronograma.map(([d, t, x]) => `<li><span class="c-dia">${d}</span><b>${t}</b><p>${x}</p></li>`).join("")}</ol>
  <figure class="camadas">
    <img src="/img/camadas-instalacao.svg" width="340" height="156" loading="lazy" alt="Corte das camadas: contrapiso ou piso antigo, primer, autonivelante e piso vinílico colado">
    <figcaption><ol>
      <li><i style="--c:#9a6b44"></i>Piso vinílico colado</li>
      <li><i style="--c:#d6d0c6"></i>Autonivelante (2 a 5 mm)</li>
      <li><i style="--c:#6f9fb5"></i>Primer</li>
      <li><i style="--c:#8f877c"></i>Contrapiso ou piso antigo</li>
    </ol></figcaption>
  </figure>
</div>
<p class="nota">*Com ${P.equipes} e base firme. O prazo exato é confirmado na medição.</p>`
}

function faqHtml(perguntas) {
  const lista = perguntas ? C.faq.filter(([q]) => perguntas.includes(q)) : C.faq
  return { html: `<div class="faq">${lista.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>`, lista }
}

function bairrosHtml(atual) {
  const outros = bairros.filter((b) => b.nome !== atual)
  return `<ul class="bairros">${outros.map((b) => `<li><a href="/${b.slug}/">${esc(b.nome)}</a></li>`).join("")}<li><button type="button" class="link" data-lead-trigger>Outro bairro? Fale com a gente</button></li></ul>`
}

function migalhas(itens) {
  return `<nav class="migalhas" aria-label="Você está em"><ol>${itens.map(([n, u], i) => (i < itens.length - 1 ? `<li><a href="${u}">${esc(n)}</a></li>` : `<li aria-current="page">${esc(n)}</li>`)).join("")}</ol></nav>`
}

function ctaFinal(titulo) {
  return `<section class="cta-final">
  <div class="wrap cta-final-in">
    <h2>${titulo}</h2>
    <p>Deixe seu WhatsApp. Um instalador chama você para marcar a medição grátis.</p>
    ${botaoWA("Pedir orçamento no WhatsApp", "btn-lg")}
  </div>
</section>`
}

// ---------------------------------------------------------------- schema
function schemaEmpresa() {
  return {
    "@type": "HomeAndConstructionBusiness",
    "@id": D + "/#empresa",
    name: cfg.marca,
    url: D + "/",
    description: `Instalação de piso vinílico colado, click e em manta em ${local}, com primer, massa autonivelante, rodapés e acabamento.`,
    image: D + "/img/og.png",
    logo: D + "/img/favicon.svg",
    address: { "@type": "PostalAddress", addressLocality: cfg.cidade, addressRegion: cfg.uf, addressCountry: "BR" },
    areaServed: [{ "@type": "City", name: cfg.cidade }, ...bairros.map((b) => ({ "@type": "Place", name: `${b.nome}, ${cfg.cidade}` }))],
    openingHoursSpecification: cfg.horario.schema.map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: h.dias, opens: h.abre, closes: h.fecha })),
    paymentAccepted: cfg.pagamento,
    knowsAbout: ["piso vinílico colado", "piso vinílico click", "piso vinílico em manta", "massa autonivelante", "primer", "rodapé"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Serviços de piso vinílico",
      itemListElement: C.servicos.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.nome, url: `${D}/servicos/${s.slug}/` } })),
    },
  }
}
const schemaFaq = (lista, url) => ({
  "@type": "FAQPage",
  "@id": url + "#faq",
  mainEntity: lista.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
})
const schemaMigalhas = (itens) => ({
  "@type": "BreadcrumbList",
  itemListElement: itens.map(([n, u], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: D + u })),
})

// ---------------------------------------------------------------- página
function pagina({ caminho, titulo, descricao, bairro = "", conteudo, schema }) {
  const url = D + caminho
  const grafo = {
    "@context": "https://schema.org",
    "@graph": [
      schemaEmpresa(),
      { "@type": "WebSite", "@id": D + "/#site", url: D + "/", name: cfg.marca, inLanguage: "pt-BR", publisher: { "@id": D + "/#empresa" } },
      { "@type": "WebPage", "@id": url + "#pagina", url, name: titulo, description: descricao, isPartOf: { "@id": D + "/#site" }, about: { "@id": D + "/#empresa" }, inLanguage: "pt-BR", dateModified: HOJE },
      ...schema,
    ],
  }
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titulo)}</title>
  <meta name="description" content="${esc(descricao)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="theme-color" content="#1c1a16">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${esc(cfg.marca)}">
  <meta property="og:title" content="${esc(titulo)}">
  <meta property="og:description" content="${esc(descricao)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${D}/img/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <script type="application/ld+json">${JSON.stringify(grafo)}</script>
  <script>
    window.LEAD_CONFIG = { routerBase: "/api", nicho: "piso-vinilico", cidade: ${JSON.stringify(cfg.cidade)}, bairroDaPagina: ${JSON.stringify(bairro)}, ctaDireto: false };
  </script>
</head>
<body>
<div class="topo">
  <div class="wrap topo-in">
    <span>Instalação de piso vinílico em ${esc(local)}</span>
    <span class="topo-hor">${esc(cfg.horario.texto)}</span>
  </div>
</div>
<header class="cab">
  <div class="wrap cab-in">
    <a href="/" class="marca" aria-label="${esc(cfg.marca)}, página inicial"><span class="marca-a">Piso Vinílico</span><span class="marca-b">${esc(cfg.cidade)}</span></a>
    <nav class="menu" id="menu" aria-label="Principal">
      <a href="/#servicos">Serviços</a>
      <a href="/#obra">Como é a obra</a>
      <a href="/#orcamento">Orçamento</a>
      <a href="/#bairros">Bairros</a>
      <a href="/#duvidas">Dúvidas</a>
    </nav>
    <button type="button" class="btn btn-tinta cab-cta" data-lead-trigger>Pedir orçamento</button>
    <button type="button" class="menu-btn" id="menuBtn" aria-controls="menu" aria-expanded="false">Menu</button>
  </div>
</header>

<main>
${conteudo}
</main>

<footer class="rodape">
  <div class="wrap rodape-in">
    <div>
      <p class="marca marca--rodape"><span class="marca-a">Piso Vinílico</span><span class="marca-b">${esc(cfg.cidade)}</span></p>
      <p>Instalação de piso vinílico colado, click e em manta em ${esc(cfg.regiao)}.<br>${esc(cfg.horario.texto)} · Atendimento pelo WhatsApp.</p>
    </div>
    <div>
      <p class="rodape-tit">Serviços</p>
      <ul>${C.servicos.map((s) => `<li><a href="/servicos/${s.slug}/">${esc(s.nome)}</a></li>`).join("")}</ul>
    </div>
    <div>
      <p class="rodape-tit">Bairros</p>
      <ul>${bairros.map((b) => `<li><a href="/${b.slug}/">${esc(b.nome)}</a></li>`).join("")}</ul>
    </div>
  </div>
  <div class="wrap rodape-base"><span>© ${HOJE.slice(0, 4)} ${esc(cfg.marca)}</span><span>Atualizado em <time datetime="${HOJE}">${dataBR}</time></span></div>
</footer>

<button type="button" class="wa-flutua" data-lead-trigger aria-label="Pedir orçamento pelo WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#wa"/></svg></button>

<div class="lead-modal" data-lead-modal hidden role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
  <div class="lead-modal-backdrop" data-lead-close></div>
  <div class="lead-modal-card">
    <div class="lead-modal-banner">
      <h2 id="lead-modal-title">Orçamento de piso vinílico</h2>
      <button type="button" class="lead-modal-close" data-lead-close aria-label="Fechar">×</button>
    </div>
    <div class="lead-modal-header">
      <p>Deixe seu WhatsApp. Um instalador chama você para combinar a medição grátis.</p>
    </div>
    <form class="lead-form" data-lead-form novalidate>
      <div class="lead-form-erro" data-lead-erro hidden role="alert" aria-live="polite"></div>
      <label>
        <span>Seu WhatsApp com DDD</span>
        <input type="tel" name="telefone" inputmode="tel" autocomplete="tel-national" required placeholder="(00) 99999-9999">
      </label>
      <input type="text" name="confirmacao_url" tabindex="-1" autocomplete="off" class="lead-form-honeypot" aria-hidden="true">
      <button type="submit" class="lead-form-submit">${waIco}<span>Pedir orçamento</span></button>
      <p class="lead-form-proof">Sem compromisso. Seu número não é divulgado.</p>
    </form>
    <div class="lead-state lead-state-loading" hidden><div class="spinner"></div><p>Enviando seu número…</p></div>
    <div class="lead-state lead-state-success" hidden>
      <p class="lead-state-icon ok" aria-hidden="true">✓</p>
      <h3>Pronto, recebemos seu número</h3>
      <p data-success-msg></p>
      <p><button type="button" class="link" data-corrigir>Número errado? Corrigir</button></p>
      <button type="button" class="lead-form-submit" data-lead-close>Fechar</button>
    </div>
    <div class="lead-state lead-state-error" hidden>
      <p class="lead-state-icon err" aria-hidden="true">!</p>
      <h3>Seu número não foi enviado</h3>
      <p>Pode ter sido a conexão. Confira sua internet e tente de novo.</p>
      <button type="button" class="lead-form-submit" data-retry>Tentar de novo</button>
      <button type="button" class="btn-ghost" data-lead-close>Fechar</button>
    </div>
  </div>
</div>

<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="wa" viewBox="0 0 24 24"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.19 8.19 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.07-.1-.23-.17-.48-.29-.25-.12-1.47-.72-1.69-.8-.23-.08-.37-.12-.56.12-.18.25-.64.8-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.3-.01-.47-.01"/></symbol>
</svg>

<script src="/js/lead.js" defer></script>
<script>
  (function () {
    var b = document.getElementById("menuBtn"), m = document.getElementById("menu");
    b.addEventListener("click", function () {
      var aberto = m.classList.toggle("aberto");
      b.setAttribute("aria-expanded", aberto);
      b.textContent = aberto ? "Fechar" : "Menu";
    });
    m.addEventListener("click", function (e) { if (e.target.tagName === "A") { m.classList.remove("aberto"); b.setAttribute("aria-expanded", false); b.textContent = "Menu"; } });
  })();
</script>
</body>
</html>
`
}

// ---------------------------------------------------------------- home
function home() {
  const { html: faq, lista } = faqHtml()
  const conteudo = `<section class="hero">
  <div class="wrap hero-in">
    <div class="hero-txt">
      <p class="rotulo">Piso vinílico · ${esc(local)}</p>
      <h1>Piso vinílico novo sobre o piso antigo. <em>${P.area} em ${P.dias}.</em></h1>
      <p class="hero-sub">Primer, massa autonivelante e piso vinílico colado, sem quebrar a cerâmica e sem entulho. Medição grátis em ${esc(cfg.cidade)} e orçamento fechado antes de começar.</p>
      <div class="hero-acoes">
        ${botaoWA("Pedir orçamento no WhatsApp", "btn-lg")}
        <a href="#obra" class="link-seta">Como é a obra, dia a dia ${seta}</a>
      </div>
      ${provasHtml()}
    </div>
    ${fichaPadrao()}
  </div>
  <figure class="amostra">
    <img src="/img/madeira.jpg" width="1600" height="560" alt="Réguas de piso vinílico amadeirado instaladas, vistas de cima" fetchpriority="high">
    <figcaption class="wrap"><span class="regua" aria-hidden="true"></span>Vinílico colado · réguas de 18 × 122 cm, juntas desencontradas</figcaption>
  </figure>
</section>

<section class="sec" id="resumo">
  <div class="wrap resumo">
    ${cabecalhoSecao("00", "Em resumo", `Instalação de piso vinílico em ${esc(cfg.cidade)}`)}
    <p class="resumo-txt">Instalamos piso vinílico colado, click e em manta em ${esc(cfg.regiao)}, com a base preparada (primer e massa autonivelante de secagem rápida), rodapés e acabamento. Com ${P.equipes}, ${P.area} ficam prontos em ${P.dias}, direto sobre o piso antigo. A medição é grátis e o orçamento é combinado pelo WhatsApp.</p>
  </div>
</section>

<section class="sec" id="servicos">
  <div class="wrap">
    ${cabecalhoSecao("01", "Serviços", "O que fazemos")}
    ${listaServicos()}
  </div>
</section>

<section class="sec sec--papel2" id="obra">
  <div class="wrap">
    ${cabecalhoSecao("02", "A obra", `${P.area} em ${P.dias}, dia a dia`, `<p class="sec-intro">A conta: cerca de 25 minutos de mão de obra por m² (primer, autonivelante e piso colado), 24 h de cura da massa e um dia para rodapés e acabamento.</p>`)}
    ${cronogramaHtml()}
  </div>
</section>

<section class="sec" id="orcamento">
  <div class="wrap orc">
    ${cabecalhoSecao("03", "Orçamento", "O que entra no preço", `<p class="sec-intro">O orçamento sai depois da medição, fechado e com cada item separado. Estes são os pontos que mudam o valor:</p>`)}
    <dl class="orc-lista">${C.oQueEntra.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
    <div class="orc-cta">${botaoWA("Agendar medição grátis")}<p>${esc(cfg.pagamento)}.</p></div>
  </div>
</section>

<section class="sec sec--papel2" id="duvidas">
  <div class="wrap estreito">
    ${cabecalhoSecao("04", "Dúvidas", "Perguntas frequentes sobre piso vinílico")}
    ${faq}
  </div>
</section>

<section class="sec" id="bairros">
  <div class="wrap">
    ${cabecalhoSecao("05", "Onde atendemos", `Bairros de ${esc(cfg.cidade)}`)}
    ${bairrosHtml()}
  </div>
</section>

${ctaFinal(`Medição grátis em ${esc(cfg.cidade)}.`)}`
  return pagina({
    caminho: "/",
    titulo: `Piso Vinílico em ${cfg.cidade}: ${P.area} em ${P.dias} | Instalação`,
    descricao: `Instalação de piso vinílico colado, click e manta em ${cfg.cidade}, com autonivelante e primer, sem quebra-quebra. Medição grátis: peça seu orçamento.`,
    conteudo,
    schema: [schemaFaq(lista, D + "/")],
  })
}

// ---------------------------------------------------------------- bairro
function paginaBairro(b) {
  const em = `${prep(b.nome)} ${b.nome}`
  const cam = `/${b.slug}/`
  const trilha = [["Início", "/"], ["Bairros", "/#bairros"], [b.nome, cam]]
  const { html: faq, lista } = faqHtml(["Quanto custa instalar piso vinílico por m²?", "Quanto tempo leva a instalação?", "Dá para instalar em cima da cerâmica?", "Como funciona o orçamento pelo WhatsApp?"])
  const conteudo = `<section class="hero hero--interna">
  <div class="wrap">${migalhas(trilha)}</div>
  <div class="wrap hero-in">
    <div class="hero-txt">
      <p class="rotulo">Piso vinílico · ${esc(b.nome)} · ${esc(local)}</p>
      <h1>Piso vinílico ${esc(em)}, ${esc(cfg.cidade)}</h1>
      <p class="hero-sub">${esc(b.nota)}</p>
      <div class="hero-acoes">${botaoWA(`Pedir orçamento ${em}`, "btn-lg", `data-bairro="${esc(b.nome)}"`)}</div>
    </div>
    ${fichaPadrao()}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${cabecalhoSecao("01", "Serviços", `O que instalamos ${esc(em)}`)}
    ${listaServicos()}
  </div>
</section>

<section class="sec sec--papel2">
  <div class="wrap">
    ${cabecalhoSecao("02", "A obra", `${P.area} em ${P.dias}, dia a dia`)}
    ${cronogramaHtml()}
  </div>
</section>

<section class="sec">
  <div class="wrap estreito">
    ${cabecalhoSecao("03", "Dúvidas", `Perguntas de quem mora ${esc(em)}`)}
    ${faq}
  </div>
</section>

<section class="sec sec--papel2">
  <div class="wrap">
    ${cabecalhoSecao("04", "Perto daqui", "Outros bairros atendidos")}
    ${bairrosHtml(b.nome)}
  </div>
</section>

${ctaFinal(`Medição grátis ${esc(em)}.`)}`
  return pagina({
    caminho: cam,
    titulo: tit(`Piso Vinílico ${em}, ${cfg.cidade}`, ` | Instalação em ${P.dias}`),
    descricao: `Instalação de piso vinílico ${em} (${cfg.cidade}): colado, click e manta, com autonivelante e sem quebra-quebra. Medição grátis pelo WhatsApp.`,
    bairro: b.nome,
    conteudo,
    schema: [schemaFaq(lista, D + cam), schemaMigalhas(trilha)],
  })
}

// ---------------------------------------------------------------- serviço
function paginaServico(s) {
  const cam = `/servicos/${s.slug}/`
  const trilha = [["Início", "/"], ["Serviços", "/#servicos"], [s.nome, cam]]
  const { html: faq, lista } = faqHtml(s.faq)
  const conteudo = `<section class="hero hero--interna">
  <div class="wrap">${migalhas(trilha)}</div>
  <div class="wrap hero-in">
    <div class="hero-txt">
      <p class="rotulo">Serviço · ${esc(local)}</p>
      <h1>${esc(sub(s.titulo))}</h1>
      <p class="hero-sub">${esc(s.curto)}</p>
      <div class="hero-acoes">${botaoWA("Pedir orçamento no WhatsApp", "btn-lg")}</div>
    </div>
    ${ficha(s.ficha, "Ficha técnica")}
  </div>
</section>

<section class="sec">
  <div class="wrap estreito texto">
    ${s.corpo.map((p) => `<p>${esc(p)}</p>`).join("\n    ")}
  </div>
</section>

<section class="sec sec--papel2">
  <div class="wrap">
    ${cabecalhoSecao("01", "A obra", "Como funciona o cronograma")}
    ${cronogramaHtml()}
  </div>
</section>

${lista.length ? `<section class="sec"><div class="wrap estreito">${cabecalhoSecao("02", "Dúvidas", "Perguntas frequentes")}${faq}</div></section>` : ""}

<section class="sec sec--papel2">
  <div class="wrap">
    ${cabecalhoSecao("03", "Outros serviços", "Também fazemos")}
    ${listaServicos(s.slug)}
  </div>
</section>

${ctaFinal(`${esc(s.nome)} em ${esc(cfg.cidade)}: medição grátis.`)}`
  return pagina({
    caminho: cam,
    titulo: tit(sub(s.titulo), " | Medição grátis"),
    descricao: sub(s.descricao),
    conteudo,
    schema: [
      { "@type": "Service", name: s.nome, serviceType: "Instalação de piso vinílico", url: D + cam, provider: { "@id": D + "/#empresa" }, areaServed: { "@type": "City", name: cfg.cidade }, description: sub(s.descricao) },
      ...(lista.length ? [schemaFaq(lista, D + cam)] : []),
      schemaMigalhas(trilha),
    ],
  })
}

// ---------------------------------------------------------------- saída
const urls = ["/"]
escrever("index.html", home())
for (const b of bairros) {
  escrever(`${b.slug}/index.html`, paginaBairro(b))
  urls.push(`/${b.slug}/`)
}
for (const s of C.servicos) {
  escrever(`servicos/${s.slug}/index.html`, paginaServico(s))
  urls.push(`/servicos/${s.slug}/`)
}

escrever(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${D}${u}</loc><lastmod>${HOJE}</lastmod></url>`).join("\n")}
</urlset>
`
)

escrever(
  "robots.txt",
  `# Buscadores e assistentes de IA podem ler o site; a API não.
User-agent: *
Allow: /
Disallow: /api/

User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: Bingbot
Allow: /
Disallow: /api/

Sitemap: ${D}/sitemap.xml
`
)

escrever(
  "llms.txt",
  `# ${cfg.marca}

> Instalação de piso vinílico em ${local} (Brasil): colado, click e em manta, com preparação da base (primer e massa autonivelante de secagem rápida), rodapés e acabamento, direto sobre o piso antigo e sem quebra-quebra. Medição grátis e orçamento pelo WhatsApp.

## Fatos

- Prazo: ${P.area} em ${P.dias} com ${P.equipes}. ${C.cronograma.map(([d, t]) => `${d}: ${t.toLowerCase()}`).join("; ")}.
- Mão de obra: ${P.maoDeObra} somando primer, autonivelante e piso colado.
- Cura do autonivelante: ${P.cura}; umidade da base ${P.umidade}, medida com higrômetro.
- Tráfego leve 24 h após a instalação; primeira limpeza úmida após 7 dias.
- Bairros atendidos: ${bairros.map((b) => b.nome).join(", ")}.
- Horário: ${cfg.horario.texto}. Pagamento: ${cfg.pagamento}.

## Páginas

- [Início](${D}/): serviços, cronograma da obra, o que entra no orçamento e perguntas frequentes.
${C.servicos.map((s) => `- [${s.nome}](${D}/servicos/${s.slug}/): ${s.curto}`).join("\n")}
${bairros.map((b) => `- [Piso vinílico ${prep(b.nome)} ${b.nome}](${D}/${b.slug}/)`).join("\n")}
`
)

console.log(`Gerado: ${urls.length} páginas para ${local} (${D})`)
