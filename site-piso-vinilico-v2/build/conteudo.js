// Textos do site. {cidade} e {regiao} são trocados pelo build.
// Tudo aqui é sobre o serviço, nada sobre uma empresa específica, para o site
// poder ser alugado para qualquer instalador da cidade.

exports.servicos = [
  {
    slug: "piso-vinilico-colado",
    nome: "Piso vinílico colado",
    curto: "Réguas de 2 a 3 mm coladas sobre a base nivelada. O mais usado em apartamentos e sobre cerâmica.",
    titulo: "Piso vinílico colado em {cidade}",
    descricao: "Instalação de piso vinílico colado em {cidade}, com primer e autonivelante, sobre a cerâmica antiga. Medição grátis e orçamento pelo WhatsApp.",
    corpo: [
      "O vinílico colado é o tipo mais instalado em apartamentos porque é fino: com 2 a 3 mm, não muda a altura das portas nem dos rodapés e vai direto sobre a cerâmica, sem quebrar nada.",
      "Por ser fino, ele copia qualquer defeito da base. Rejunte, peça trincada ou desnível aparecem no piso novo. Por isso a instalação correta tem três camadas: primer para dar aderência, massa autonivelante para deixar a superfície lisa e, só depois, a cola e as réguas.",
      "A cola usada é acrílica, aplicada com desempenadeira de dente fino. As réguas descansam no ambiente por 24 horas antes de colar, para se adaptar à temperatura e não abrir depois.",
    ],
    ficha: [["Espessura", "2 a 3 mm"], ["Base", "Primer + autonivelante"], ["Mão de obra", "≈ 25 min/m² com a base"], ["Liberação", "Tráfego leve em 24 h"]],
    faq: ["Precisa de massa autonivelante para instalar piso vinílico?", "Dá para instalar em cima da cerâmica?", "Quando posso pisar e limpar o piso novo?"],
  },
  {
    slug: "piso-vinilico-click",
    nome: "Piso vinílico click",
    curto: "Réguas com encaixe, sem cola. Mais espessas, toleram pequenas imperfeições da base.",
    titulo: "Piso vinílico click em {cidade}",
    descricao: "Instalação de piso vinílico click (encaixe, sem cola) em {cidade}. Obra rápida, com manta acústica e rodapé. Medição grátis pelo WhatsApp.",
    corpo: [
      "No vinílico click as réguas se encaixam umas nas outras pelas bordas e ficam flutuando sobre a base, sem cola. A instalação é mais rápida e o piso pode ser removido no futuro sem estragar o que está embaixo.",
      "As réguas são mais espessas (4 a 6 mm, muitas já com manta acústica), então pequenas irregularidades da base não aparecem. Desníveis maiores que 2 mm em 1 metro ainda precisam ser corrigidos antes.",
      "Como o piso flutua, deixamos uma folga de dilatação junto às paredes, escondida pelo rodapé. Em ambientes acima de 8 a 10 metros de comprimento, usamos perfis de dilatação.",
    ],
    ficha: [["Espessura", "4 a 6 mm"], ["Fixação", "Encaixe, sem cola"], ["Base", "Firme, desnível até 2 mm/m"], ["Liberação", "Uso imediato"]],
    faq: ["Qual a diferença entre piso vinílico colado e click?", "Dá para instalar em cima da cerâmica?"],
  },
  {
    slug: "piso-vinilico-em-manta",
    nome: "Piso vinílico em manta",
    curto: "Rolos sem emendas aparentes. Indicado para clínicas, escolas e áreas comerciais.",
    titulo: "Piso vinílico em manta em {cidade}",
    descricao: "Instalação de piso vinílico em manta em {cidade} para clínicas, consultórios, escolas e comércio. Solda a quente, sem emendas. Orçamento pelo WhatsApp.",
    corpo: [
      "A manta vinílica vem em rolos de até 2 metros de largura e cobre o ambiente quase sem emendas. As juntas que existem são soldadas a quente com cordão vinílico, o que impede a entrada de água e sujeira.",
      "É o piso exigido em muitos ambientes de saúde, porque é fácil de higienizar e pode subir pela parede em meia-cana, sem cantos para acumular sujeira.",
      "A base precisa estar perfeitamente lisa: toda manta é instalada sobre primer e autonivelante. Em obra comercial, dá para programar o serviço em fins de semana para não parar o atendimento.",
    ],
    ficha: [["Largura do rolo", "Até 2 m"], ["Emendas", "Soldadas a quente"], ["Base", "Primer + autonivelante"], ["Uso", "Saúde, escolas, comércio"]],
    faq: ["Piso vinílico pode molhar? É bom para pets?", "Quanto custa instalar piso vinílico por m²?"],
  },
  {
    slug: "preparacao-de-contrapiso-autonivelante",
    nome: "Contrapiso com autonivelante",
    curto: "Primer e massa autonivelante de secagem rápida para deixar a base lisa e seca.",
    titulo: "Nivelamento de contrapiso com autonivelante em {cidade}",
    descricao: "Preparação de contrapiso com primer e massa autonivelante em {cidade}, para instalar piso vinílico sobre cerâmica ou concreto. Cura em 24 h.",
    corpo: [
      "A massa autonivelante é uma argamassa fluida que se espalha sozinha e cria uma superfície lisa de poucos milímetros. Ela cobre rejuntes e pequenos desníveis da cerâmica e deixa a base pronta para o vinílico colado.",
      "Antes dela vai o primer, que sela a base e garante a aderência. Sem primer, a massa pode descolar ou formar bolhas.",
      "Usamos massa de secagem rápida: em cerca de 24 horas a base está pronta. Mesmo assim, só colamos o piso depois de medir a umidade com higrômetro. O limite é 2,5%, como pede a norma de instalação de vinílicos (NBR 14917).",
    ],
    ficha: [["Espessura", "2 a 5 mm"], ["Cura", "≈ 24 h (secagem rápida)"], ["Umidade máx.", "2,5% (higrômetro)"], ["Mão de obra", "≈ 0,15 h/m² com primer"]],
    faq: ["Precisa de massa autonivelante para instalar piso vinílico?", "Quanto tempo leva a instalação?"],
  },
  {
    slug: "rodapes-e-acabamentos",
    nome: "Rodapés e acabamentos",
    curto: "Rodapé de poliestireno ou MDF, perfis de transição e soleiras.",
    titulo: "Rodapé e acabamento para piso vinílico em {cidade}",
    descricao: "Rodapés de poliestireno e MDF, perfis e soleiras para piso vinílico em {cidade}. Acabamento completo no último dia da obra.",
    corpo: [
      "O rodapé esconde a folga junto à parede e dá o acabamento final. O de poliestireno é o mais usado com vinílico: não incha com umidade e aceita pintura. O de MDF é mais barato, mas precisa ficar longe de áreas molhadas.",
      "Nas passagens para outros pisos usamos perfis de transição, e nas portas, soleiras ou perfis de acabamento, para a borda da régua não ficar exposta.",
      "No cronograma de 5 dias, o último dia é reservado para rodapés, perfis e a conferência final com o cliente.",
    ],
    ficha: [["Rodapé", "Poliestireno ou MDF"], ["Alturas comuns", "7, 10 e 15 cm"], ["Fixação", "Cola e pino"], ["Quando", "Último dia da obra"]],
    faq: ["Quanto tempo leva a instalação?"],
  },
  {
    slug: "reparo-e-troca-de-reguas",
    nome: "Reparo e troca de réguas",
    curto: "Substituição de réguas riscadas, manchadas ou soltas, sem refazer o piso todo.",
    titulo: "Reparo de piso vinílico em {cidade}",
    descricao: "Troca de réguas de piso vinílico danificadas, soltas ou manchadas em {cidade}, sem refazer o ambiente. Orçamento pelo WhatsApp.",
    corpo: [
      "Uma vantagem do vinílico é que dá para trocar só a régua danificada. No colado, a régua é aquecida, removida e substituída por uma nova com cola. No click, o piso é desmontado até a régua e montado de novo.",
      "Régua que solta ou levanta quase sempre indica umidade na base ou cola mal aplicada. Antes de trocar, verificamos a causa para o problema não voltar.",
      "Se você guardou sobras da instalação, usamos as mesmas réguas. Se não, ajudamos a achar a linha mais parecida.",
    ],
    ficha: [["Colado", "Régua aquecida e trocada"], ["Click", "Desmontagem até a régua"], ["Causa comum", "Umidade na base"], ["Dica", "Guarde sobras da obra"]],
    faq: ["Piso vinílico pode molhar? É bom para pets?"],
  },
]

exports.cronograma = [
  ["Dia 1", "Primer e autonivelante", "Base limpa, primer aplicado e massa de secagem rápida espalhada."],
  ["Dia 2", "Cura e aclimatação", "A massa cura por 24 h. As réguas descansam no ambiente. Umidade medida antes de colar."],
  ["Dias 3–4", "Piso colado", "Cola acrílica e réguas, cerca de 25 min de mão de obra por m², com duas equipes."],
  ["Dia 5", "Rodapés e entrega", "Rodapés, perfis, limpeza e conferência final com você."],
]

exports.faq = [
  ["Quanto custa instalar piso vinílico por m²?", "O valor depende de quatro coisas: o tipo de piso (colado, click ou manta), o estado da base (se precisa de autonivelante), a metragem e os acabamentos (rodapés, perfis e soleiras). Por isso a medição é grátis e vem antes do orçamento, que sai fechado e com o nivelamento discriminado à parte."],
  ["Quanto tempo leva a instalação?", "Em 100 m², com duas equipes, são 5 dias: no 1º, primer e autonivelante de secagem rápida; no 2º, a massa cura (24 h, e só colamos com umidade da base até 2,5%) enquanto as réguas se adaptam ao ambiente; no 3º e 4º, o piso colado, com cerca de 25 minutos de mão de obra por m²; no 5º, rodapés, acabamento e conferência."],
  ["Precisa de massa autonivelante para instalar piso vinílico?", "No vinílico colado, quase sempre sim. As réguas têm 2 a 3 mm e copiam qualquer rejunte ou desnível da base. O primer garante a aderência e o autonivelante deixa a superfície lisa. Sobre cerâmica firme, isso dispensa quebrar o piso antigo."],
  ["Dá para instalar em cima da cerâmica?", "Sim, se a cerâmica estiver firme. Peças soltas ou ocas são refixadas ou removidas antes, e o autonivelante cobre os rejuntes."],
  ["Qual a diferença entre piso vinílico colado e click?", "O colado é mais fino, fixado com cola sobre a base nivelada, e é o mais indicado para apartamentos e sobre cerâmica. O click tem encaixe entre as réguas, dispensa cola, é mais espesso e tolera pequenas imperfeições da base."],
  ["Quando posso pisar e limpar o piso novo?", "Tráfego leve 24 horas depois da instalação, móveis pesados após 48 horas e a primeira limpeza com pano úmido só depois de 7 dias, para a cola terminar de curar."],
  ["Piso vinílico pode molhar? É bom para pets?", "Pode ser limpo com pano úmido e resiste bem a unhas de pets no dia a dia. Não é indicado para áreas externas nem para lugares com água parada."],
  ["Como funciona o orçamento pelo WhatsApp?", "Você deixa seu número e um instalador chama você no WhatsApp para entender o ambiente, combinar a medição grátis e mandar o orçamento."],
]

exports.oQueEntra = [
  ["Tipo de piso", "Colado, click ou manta, e a linha escolhida."],
  ["Estado da base", "Se precisa de primer e autonivelante, e quantos milímetros."],
  ["Metragem", "Área real medida no local, mais a perda de corte (5 a 10%)."],
  ["Acabamentos", "Metros de rodapé, perfis de transição e soleiras."],
  ["Remoção", "Se algum piso antigo precisa sair (carpete, taco solto)."],
]
