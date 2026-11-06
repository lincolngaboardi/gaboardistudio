# Casa Vinílica: site de orçamento de piso vinílico

One-page de captura de leads pelo WhatsApp para uma empresa de piso vinílico.
"Casa Vinílica", "Sua Cidade" e os bairros são **provisórios**: troque pelos
dados do cliente antes de publicar.

## Como funciona o "contato via WhatsApp"

Ao contrário do que parece, **nenhum botão abre o WhatsApp**. O fluxo é de
**captura de lead**:

```
 visitante clica em qualquer botão "WhatsApp"   (todos têm data-lead-trigger)
        │
        ├─ sendBeacon  POST /api/t/<host>  {tipo:"formulario", pagina}   ← conta o toque
        ├─ gtag("event","abrir_formulario")                               ← GA4
        ▼
 modal "Orçamento de Piso Vinílico": pede só o WhatsApp DO CLIENTE
        │  máscara (45) 99999-9999, valida tamanho, DDD real e dígitos repetidos
        │  campo honeypot invisível "confirmacao_url" contra bots
        ▼
 POST /api/lead  {telefone, nicho, cidade, bairro?, confirmacao_url}
        │  "Enviando para nossa equipe..."
        ▼
 back-end repassa o número para a equipe comercial
        │  → a empresa é que chama o cliente no WhatsApp
        ▼
 { ok:true } → "Solicitação enviada!" + gtag("event","generate_lead")
 { ok:false, error:"Invalid DDD" | "Invalid phone" | ... } → volta ao form com erro inline
 outro erro → tela "Não foi possível enviar" + "Tentar novamente"
```

Outros detalhes:

- **Modo "CTA direto"** (`ctaDireto`, desligado por padrão): o botão vai para
  `/api/w/<host>?b=<bairro>`, que redireciona para o WhatsApp da empresa. Desligado,
  ele devolve `/?form=1&m=desligado`, e `?form=1` reabre o modal sozinho.
- O número da empresa **não aparece no HTML**. Fica só no servidor, o que evita
  robôs de spam e permite trocar ou distribuir vendedores sem mexer no site.
- Por que fazer assim: todo contato vira um lead registrado e medido (toques →
  formulários → leads), mesmo quando o cliente desistiria de mandar a primeira
  mensagem. É o modelo típico de rede de geração de leads (o site tem página
  "fazer parceria"), em que um mesmo site atende vários prestadores.

## O que foi implementado aqui

| Arquivo | Papel |
|---|---|
| `public/index.html` | One-page (hero, serviços, CTAs, diferenciais, FAQ, contato, bairros, rodapé), botão flutuante e modal |
| `public/js/lead.js` | Mecanismo do modal: gatilhos, máscara, validação, estados, beacon, GA4, `?form=1`, CTA direto |
| `public/css/style.css` | Estilos (responsivo, respeita `prefers-reduced-motion`) |
| `functions/lead.js` | `POST /api/lead`: valida de novo no servidor, honeypot, envia o lead |
| `functions/w.js` | `GET /api/w/*`: redireciona para `wa.me/<empresa>?text=...` (CTA direto) |
| `functions/t.js` | `POST /api/t/*`: contador de toques (log) |
| `lib/phone.js` | Validação de telefone BR compartilhada |
| `netlify.toml` | Publicação e rotas `/api/*` → funções |

O bairro de cada botão (`data-bairro`) é enviado junto com o pedido.

## Para onde vai o lead (variáveis de ambiente no Netlify)

Configure **pelo menos um** canal:

| Variável | Uso |
|---|---|
| `LEAD_WEBHOOK_URL` | Recebe um POST JSON com o lead (n8n, Zapier, Make, CRM, planilha). É o jeito mais simples |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Credenciais da WhatsApp Cloud API (Meta) |
| `EMPRESA_WHATSAPP` | Número(s) que recebem o aviso, formato `5545999990000`, separados por vírgula. Também é o destino do CTA direto |
| `WHATSAPP_TEMPLATE_AVISO` | Template aprovado enviado à empresa. Parâmetros: `{{1}}` telefone do cliente, `{{2}}` bairro/cidade, `{{3}}` página |
| `WHATSAPP_TEMPLATE_CLIENTE` | (opcional) Template sem parâmetros enviado ao cliente, ex.: "Recebemos seu pedido, nossa equipe já vai te chamar para o orçamento" |
| `WHATSAPP_TEMPLATE_LANG` | Padrão `pt_BR` |
| `CIDADE` | Usada no texto do CTA direto |
| `CTA_DIRETO_DESLIGADO` | `true` força o `/api/w` a devolver para o formulário |

> A API do WhatsApp só permite mensagem livre dentro da janela de 24h após o
> contato iniciar a conversa. Por isso os avisos usam **templates aprovados**
> no WhatsApp Manager.

## Deploy

No Netlify: novo site a partir deste repositório com **Base directory** =
`site-piso-vinilico-v2`, sem comando de build. Configure as variáveis acima e
teste em `/?form=1`.

Para ativar o GA4, descomente o bloco no `<head>` do `index.html`.

## SEO e GEO (buscadores e respostas por IA)

Antes de publicar, troque `https://www.seudominio.com.br` pelo domínio real em
`public/index.html`, `public/robots.txt`, `public/sitemap.xml` e `public/llms.txt`,
e preencha cidade, UF e horário no JSON-LD (`HomeAndConstructionBusiness`).

| Item | Onde |
|---|---|
| Title, description, canonical, Open Graph e imagem de compartilhamento | `<head>` do `index.html`, `img/og-casa-vinilica.png` |
| Dados estruturados: empresa local, site, página e FAQ | `<script type="application/ld+json">` no `index.html` |
| Resumo em fatos com data de atualização | seção `#resumo` |
| Perguntas frequentes (também no `FAQPage`) | seção `#faq`; ao mudar o texto, mude também o JSON-LD |
| Robôs de busca e de IA liberados, `/api/` bloqueado | `public/robots.txt` |
| Sitemap | `public/sitemap.xml` |
| Resumo para assistentes de IA | `public/llms.txt` |
| Cache dos estáticos | `[[headers]]` no `netlify.toml` |

Não incluímos `aggregateRating` no JSON-LD: o Google não exibe estrelas de
avaliações publicadas pela própria empresa, e a nota precisa ser real.
Para estrelas e mapa, use o Perfil da Empresa no Google.
