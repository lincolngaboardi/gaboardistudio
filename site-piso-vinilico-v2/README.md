# Piso Vinílico [Cidade]: site de rank & rent

Site de captura de leads de piso vinílico feito para **ranquear numa cidade e
alugar os leads** para um instalador local. Nada no site é de uma empresa
específica: marca, cidade, bairros e provas vêm de `site.config.json`, e trocar
de cidade ou de inquilino é editar esse arquivo e rodar o build.

## Como usar

```
1. Edite site.config.json  (domínio, cidade, UF, bairros com "nota", horário, provas)
2. node build/build.js      (gera public/: home, bairros, serviços, sitemap, robots, llms.txt)
3. Configure no Netlify o destino dos leads (abaixo) e publique
```

O Netlify já roda o build sozinho (`command` no `netlify.toml`), com
**Base directory** = `site-piso-vinilico-v2`.

## O que o build gera

| Página | Para quê |
|---|---|
| `/` | Home: ficha da obra, serviços, cronograma de 5 dias, o que entra no orçamento, FAQ, bairros |
| `/piso-vinilico-<bairro>/` | Uma por bairro **com nota**. O lead sai marcado com o bairro |
| `/servicos/<serviço>/` | Uma por serviço (colado, click, manta, contrapiso, rodapés, reparo), com texto próprio |
| `sitemap.xml`, `robots.txt`, `llms.txt` | Indexação e respostas por IA. Robôs de IA liberados, `/api/` bloqueado |

Toda página tem title e description próprios, canonical, Open Graph, migalhas e
JSON-LD (empresa local com bairros atendidos, `Service`, `FAQPage`, `BreadcrumbList`).
Os textos dos serviços, FAQ e cronograma estão em `build/conteudo.js`.

## Regras para não queimar o domínio

- **Nota de bairro é obrigatória.** Sem ela a página não é gerada. Páginas de
  bairro que só trocam o nome são "doorway pages" e o Google pune o site inteiro.
  Escreva algo verdadeiro sobre cada bairro.
- **Provas só reais.** `provas` (nota, avaliações, obras, garantia) ficam vazias
  até o inquilino fornecer dados verificáveis. Vazio = não aparece.
- **Sem número público por padrão.** O lead vai para o WhatsApp do inquilino pelo
  servidor. Trocar de inquilino = trocar `EMPRESA_WHATSAPP`, sem mexer no site.
- **Perfil no Google** (com o endereço do inquilino) é o que leva ao mapa. O site
  sozinho ranqueia na busca orgânica.

## Visual

"Ficha de obra": papel, tinta e régua. Archivo (largura variável) + IBM Plex Mono
para medidas, uma cor de destaque (laranja de obra), verde só nos botões de
WhatsApp, cantos retos, sem sombras e sem gradientes. A faixa de madeira
(`public/img/madeira.jpg`) é gerada por `build/textura-madeira.py`; troque por foto
real de obra do inquilino quando houver.

## Como funciona o contato "via WhatsApp"

Nenhum botão abre o WhatsApp. Todo botão com `data-lead-trigger` abre um modal
que pede o WhatsApp **do cliente** e envia para `/api/lead`; o instalador é que
chama o cliente. Assim todo contato vira lead registrado e contável, o que é a
base para cobrar o inquilino (por lead ou mensalidade).

```
clique → beacon /api/t (conta toque) → modal → máscara e validação
→ POST /api/lead {telefone, cidade, bairro, pagina} → servidor valida de novo,
  descarta bots (honeypot) → avisa o inquilino (WhatsApp Cloud API) e/ou webhook
→ "Pronto, recebemos seu número" + mostra o número + "Corrigir"
```

Para contar leads por inquilino, aponte `LEAD_WEBHOOK_URL` para uma planilha
(n8n, Make, Zapier): cada linha tem telefone, bairro, página e data.

| Arquivo | Papel |
|---|---|
| `site.config.json` | Tudo que muda por cidade e inquilino |
| `build/build.js`, `build/conteudo.js` | Gerador e textos |
| `public/js/lead.js` | Modal: gatilhos, máscara, validação, estados, beacon, GA4, `?form=1` |
| `public/css/style.css` | Estilos |
| `functions/lead.js`, `w.js`, `t.js` | `/api/lead`, CTA direto para `wa.me`, contador de toques |
| `lib/phone.js` | Validação de telefone BR |

## Para onde vai o lead (variáveis no Netlify)

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

