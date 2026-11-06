# Site de captura via WhatsApp

Réplica da estrutura e do mecanismo de contato de `chaveirofozdoiguacu.com.br`
(analisado em 06/11/2026). Textos, marca e bairros são **genéricos**: troque
pelos dados do cliente antes de publicar.

## Como o site original faz o "contato via WhatsApp"

Ao contrário do que parece, **nenhum botão abre o WhatsApp**. Não existe nenhum
link `wa.me` ou `api.whatsapp.com` na página. O fluxo é de **captura de lead**:

```
 visitante clica em qualquer botão "WhatsApp"   (todos têm data-lead-trigger)
        │
        ├─ sendBeacon  POST /api/t/<host>  {tipo:"formulario", pagina}   ← conta o toque
        ├─ gtag("event","abrir_formulario")                               ← GA4
        ▼
 modal "Central de Atendimentos": pede só o WhatsApp DO CLIENTE
        │  máscara (45) 99999-9999, valida tamanho, DDD real e dígitos repetidos
        │  campo honeypot invisível "confirmacao_url" contra bots
        ▼
 POST /api/lead  {telefone, nicho, cidade, bairro?, confirmacao_url}
        │  "Avisando técnicos..."
        ▼
 back-end ("lead router") repassa o número para o(s) chaveiro(s)
        │  → o técnico é que chama o cliente no WhatsApp
        ▼
 { ok:true } → "Solicitação enviada!" + gtag("event","generate_lead")
 { ok:false, error:"Invalid DDD" | "Invalid phone" | ... } → volta ao form com erro inline
 outro erro → tela "Não foi possível enviar" + "Tentar novamente"
```

Detalhes também observados:

- **Modo "CTA direto"** (`ctaDireto`, desligado no original): o botão vai para
  `/api/w/<host>?b=<bairro>`, que redireciona para o WhatsApp da empresa. Desligado,
  ele devolve `/?form=1&m=desligado`, e `?form=1` reabre o modal sozinho.
- O número da empresa **não aparece no HTML**. Fica só no servidor, o que evita
  robôs de spam e permite trocar ou distribuir técnicos sem mexer no site.
- Por que fazer assim: todo contato vira um lead registrado e medido (toques →
  formulários → leads), mesmo quando o cliente desistiria de mandar a primeira
  mensagem. É o modelo típico de rede de geração de leads (o site tem página
  "fazer parceria"), em que um mesmo site atende vários prestadores.

## O que foi implementado aqui

| Arquivo | Papel |
|---|---|
| `public/index.html` | One-page com as mesmas seções do original (hero, serviços, CTAs, diferenciais, FAQ, contato, bairros, rodapé), botão flutuante e modal |
| `public/js/lead.js` | Mecanismo do modal: gatilhos, máscara, validação, estados, beacon, GA4, `?form=1`, CTA direto |
| `public/css/style.css` | Estilos (responsivo, respeita `prefers-reduced-motion`) |
| `functions/lead.js` | `POST /api/lead`: valida de novo no servidor, honeypot, envia o lead |
| `functions/w.js` | `GET /api/w/*`: redireciona para `wa.me/<empresa>?text=...` (CTA direto) |
| `functions/t.js` | `POST /api/t/*`: contador de toques (log) |
| `lib/phone.js` | Validação de telefone BR compartilhada |
| `netlify.toml` | Publicação e rotas `/api/*` → funções |

Melhoria em relação ao original: o bairro de cada botão (`data-bairro`) também é
enviado no fluxo do formulário, não só no CTA direto.

## Para onde vai o lead (variáveis de ambiente no Netlify)

Configure **pelo menos um** canal:

| Variável | Uso |
|---|---|
| `LEAD_WEBHOOK_URL` | Recebe um POST JSON com o lead (n8n, Zapier, Make, CRM, planilha). É o jeito mais simples |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | Credenciais da WhatsApp Cloud API (Meta) |
| `EMPRESA_WHATSAPP` | Número(s) que recebem o aviso, formato `5545999990000`, separados por vírgula. Também é o destino do CTA direto |
| `WHATSAPP_TEMPLATE_AVISO` | Template aprovado enviado à empresa. Parâmetros: `{{1}}` telefone do cliente, `{{2}}` bairro/cidade, `{{3}}` página |
| `WHATSAPP_TEMPLATE_CLIENTE` | (opcional) Template sem parâmetros enviado ao cliente, ex.: "Recebemos seu pedido, um técnico já vai te chamar" |
| `WHATSAPP_TEMPLATE_LANG` | Padrão `pt_BR` |
| `CIDADE` | Usada no texto do CTA direto |
| `CTA_DIRETO_DESLIGADO` | `true` força o `/api/w` a devolver para o formulário |

> A API do WhatsApp só permite mensagem livre dentro da janela de 24h após o
> contato iniciar a conversa. Por isso os avisos usam **templates aprovados**
> no WhatsApp Manager.

## Deploy

No Netlify: novo site a partir deste repositório com **Base directory** =
`whatsapp-lead-site`, sem comando de build. Configure as variáveis acima e
teste em `/?form=1`.

Para ativar o GA4, descomente o bloco no `<head>` do `index.html`.
