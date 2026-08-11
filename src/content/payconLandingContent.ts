/**
 * Fonte única da copy comercial da Paycon.
 * Extraído verbatim de https://lp.payconautomacoes.com.br/ em 2026-07-27.
 * Não reescrever, resumir ou inventar conteúdo aqui — apenas reorganizar visualmente
 * nos componentes que consomem este arquivo. Ver README para o processo de atualização.
 */

export type NavLink = {
  href: string;
  label: string;
};

export type Metric = {
  value: string;
  label: string;
};

export type SolutionProduct = {
  id: string;
  title: string;
  /**
   * Opcional: "Controladoria" e "Societário" não têm frase de abertura no site
   * oficial — o card vai direto do título para a lista de recursos.
   */
  description?: string;
  highlight?: string;
  features?: string[];
  cta?: { label: string; placement: string };
};

export type Testimonial = {
  id: string;
  name: string;
  /** Linha de atribuição EXATA do site oficial (ex.: "Gerente de Planejamento Jurídico da Braskem"). */
  attribution: string;
  /** Tag de setor exibida acima da citação no site oficial (ex.: "Na indústria"). */
  sectorTag: string;
  quote: string;
  photo: string;
};

export type MethodStep = {
  step: number;
  /** Rótulo exato do site oficial (ex.: "PASSO 01"). */
  stepLabel: string;
  title: string;
  description: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
};

export type Partner = {
  id: string;
  name: string;
  logo: string;
};

export type FormFieldOption = { value: string; label: string };

export type FormField = {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "select";
  required: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
};

export const payconLandingContent = {
  metadata: {
    title: "Paycon | Automações Jurídicas",
    description:
      "Soluções de automação jurídica personalizadas que eliminam retrabalhos, reduzem custos e devolvem tempo à sua carreira.",
    ogTitle: "Paycon | Automações Jurídicas sob medida",
    ogDescription:
      "Soluções de automação jurídica personalizadas que eliminam retrabalho e devolvem tempo estratégico.",
    ogImage: "https://lp.payconautomacoes.com.br/preview-1200x630-paycon-3.png",
    lang: "pt-BR",
  },

  navigation: [
    { href: "#home", label: "HOME" },
    { href: "#solucoes", label: "SOLUÇÕES" },
    { href: "#contato", label: "DEMONSTRAÇÃO GRATUITA" },
    { href: "#clientes", label: "CLIENTES" },
    { href: "#diferenciais", label: "DIFERENCIAIS" },
    { href: "#depoimentos", label: "DEPOIMENTOS" },
    { href: "#metodo", label: "NOSSO MÉTODO" },
    { href: "#sobre", label: "QUEM SOMOS" },
    { href: "#fale-conosco", label: "FALE CONOSCO" },
  ] satisfies NavLink[],

  hero: {
    headline: "Transforme tarefas do departamento jurídico em um clique",
    subheadline:
      "Automações jurídicas sob medida integradas ao sistema que você já usa.",
    body:
      "Muitos oferecem novos sistemas que trazem novas complicações. Na Paycon, fazemos o oposto: implementamos inteligência dentro das ferramentas que você já possui. Nós não substituímos suas ferramentas; nós extraímos o máximo potencial do que já está instalado na sua máquina.",
    cta: { label: "QUERO SABER MAIS", href: "#solucoes", placement: "hero" },
  },

  metrics: [
    { value: "+80%", label: "de acuracidade na previsão de pagamentos judiciais" },
    { value: "15%", label: "de encerramentos da sua base ativa" },
    { value: "-25%", label: "de tempo alocado em atividades operacionais" },
  ] satisfies Metric[],

  solutionsIntro: {
    label: "Soluções P2P",
    title: "Soluções P2P: Tecnologia de Pessoa para Pessoa",
    principles: [
      {
        title: "DNA Jurídico e Inteligência sob Medida",
        description:
          "Entregamos inteligência aplicada à sua necessidade real. Desenvolvemos cada automação pensando em como devolver fluidez à sua rotina, garantindo que a tecnologia seja um meio para o seu desenvolvimento profissional.",
      },
      {
        title: "P2P: De Pessoa para Pessoa",
        description:
          "Acreditamos em tecnologia humanizada e personalizada, construída a partir da sua necessidade específica e não de modelos prontos.",
      },
      {
        title: "Tecnologia de Advogados para Advogados",
        description:
          "Conhecemos a complexidade operacional porque vivemos isso na prática. Somos uma empresa de tecnologia criada por advogados. Nossas soluções são desenhadas para fazer sentido absoluto no dia a dia jurídico.",
      },
      {
        title: "Eficiência Dentro de Casa",
        description:
          "Tudo é construído para rodar dentro das ferramentas que você já possui, eliminando a curva de aprendizado e respeitando o seu sistema atual.",
      },
    ],
  },

  solutions: [
    {
      id: "insights",
      title: "Insights: Inteligência para Baixa de Provisão",
      description:
        "Com o serviço de Insights, identificamos oportunidades reais para baixa de provisão diretamente no seu banco de dados. Através de uma análise técnica e precisa, garantimos que o seu balanço jurídico reflita a realidade, eliminando distorções financeiras.",
      highlight: "15 a 25% da base atual de processos costuma ser encerrada na primeira rodagem.",
      cta: { label: "SOLICITAR DEMONSTRAÇÃO", placement: "solutions" },
    },
    {
      id: "baixa-de-provisao",
      title: "Baixa de provisão",
      description:
        "Identificamos casos para baixa de provisão e acuracidade no seu resultado",
      cta: { label: "SOLICITAR DEMONSTRAÇÃO", placement: "solutions" },
    },
    {
      id: "dados-qualificados",
      title: "Dados Qualificados",
      description:
        "Mais do que dados do CNJ, entregamos Inteligência de dados com uma classificação e qualificação ímpar.",
      cta: { label: "SOLICITAR DEMONSTRAÇÃO", placement: "solutions" },
    },
    {
      id: "contratos",
      title: "Contratos",
      description:
        "Apenas com o acesso ao local onde estão os contratos, extraímos, interpretamos, classificamos e organizamos os seus contratos.",
      features: [
        "Contratos automáticos",
        "Organizador de documentos",
        "Gerador automático",
        "Painel com vencimentos, nomes das partes, multa etc",
      ],
      cta: { label: "SOLICITAR DEMONSTRAÇÃO", placement: "solutions" },
    },
    {
      id: "contencioso",
      title: "Contencioso",
      description: "Seu jurídico massificado rodando com velocidade e segurança.",
      features: [
        "Extração de todos os pedidos da inicial",
        "Busca inteligente de subsídios",
        "Crosscheck entre os fatos da inicial e contestação",
        "Elaboração automática da contestação",
        "Leitura das atas de audiência",
        "Matriz de decisão para acordo/defesa",
        "Fluxo para aprovação de recurso",
        "Painel de contingências",
        "Atualização de índice de juros e correção monetária",
      ],
      cta: { label: "SOLICITAR DEMONSTRAÇÃO", placement: "solutions" },
    },
    {
      id: "esocialpro",
      title: "esocialPro",
      description: "Você rodando sua operação sem surpresas.",
      features: [
        "Envio automático de eventos (S-2500, S-2501 e S-2555)",
        "Conversão para XML com validação prévia",
        "Painéis de gestão e controle",
        "Integração com os seus sistemas",
      ],
      cta: { label: "SOLICITAR DEMONSTRAÇÃO", placement: "solutions" },
    },
    {
      id: "controladoria",
      title: "Controladoria",
      // sem frase de abertura no site oficial — vai direto para os recursos
      features: [
        "Fechamento Contábil",
        "Modelo de previsibilidade de pagamentos",
        "Orçamento",
        "Cockpit - seu painel automático de indicadores",
        "seu APP para controle e elaboração dos exercícios",
        "ou um cockpit robusto em Excel",
      ],
      cta: { label: "SOLICITAR DEMONSTRAÇÃO", placement: "solutions" },
    },
    {
      id: "societario",
      title: "Societário",
      // sem frase de abertura no site oficial — vai direto para os recursos
      features: [
        "Gerador de procurações e substabelecimentos",
        "Árvore de decisão (quem pode assinar um documento?)",
        "Painel com as informações das empresas (CNPJ, nome, endereço, capital social etc.)",
      ],
      cta: { label: "SOLICITAR DEMONSTRAÇÃO", placement: "solutions" },
    },
  ] satisfies SolutionProduct[],

  differentiators: {
    title: "Tecnologia que respeita seu investimento atual e potencializa seus resultados",
    items: [
      "Tecnologia adaptada ao seu ambiente tecnológico, sem necessidade de grandes mudanças na infraestrutura",
      "Tecnologia feita de advogados para advogados, facilitando sua rotina e desenvolvendo sua carreira",
    ],
  },

  testimonials: [
    {
      id: "luiz-tassitani",
      name: "Luiz Felipe Tassitani",
      attribution: "Gerente de Planejamento Jurídico da Braskem",
      sectorTag: "Na indústria",
      // "SLA" repetido é do próprio site oficial (verificado no DOM ao vivo), não erro de transcrição
      quote:
        "O Robô de pagamentos desenvolvido pela Paycon trouxe um maior controle e segurança para os pagamentos de despesas legais, além da redução efetiva do SLA redução efetiva do SLA de pagamentos.",
      photo: "/assets/testimonials/testimonial-luiz-tassitani.webp",
    },
    {
      id: "andreia-nunes",
      name: "Andréia Nunes",
      attribution: "Gerente de Inovação Jurídica da Claro",
      sectorTag: "Na telefonia",
      quote:
        "Com uma acuracidade impressionante de 99% de similaridade em relação aos resultados oficiais da contabilidade, conseguimos gerar prévias confiáveis e antecipadas, o que nos trouxe previsibilidade e segurança. Ter o fechamento 'na mão' antes da consolidação oficial nos proporcionou a tranquilidade necessária para atuar com mais estratégia e menos urgência.",
      photo: "/assets/testimonials/testimonial-andreia-nunes.webp",
    },
    {
      id: "ana-luiza",
      name: "Ana Luiza",
      attribution: "Supervisora de Legal Ops na Afya Educacional",
      sectorTag: "No educacional",
      quote:
        "O resultado foi muito positivo, pois conseguimos encerrar muitos processos e ter resultado significativo na provisão.",
      photo: "/assets/testimonials/testimonial-ana-luiza.webp",
    },
    {
      id: "spc-brasil",
      name: "Equipe Jurídica",
      // site oficial não atribui cargo aqui — só o nome do cliente abaixo do nome
      attribution: "SPC Brasil",
      sectorTag: "No SPC Brasil",
      quote:
        "A automação otimizou a gestão de ofícios no SPC Brasil. Hoje, o time jurídico ganhou tempo, reduziu riscos e melhorou a eficiência operacional. O que antes exigia 4 pessoas por 2 dias inteiros, agora acontece de forma simples, rápida e precisa. Missão cumprida!",
      photo: "/assets/testimonials/testimonial-spc-brasil.webp",
    },
    {
      id: "renata-lopes",
      name: "Renata Lopes",
      attribution: "Coordenadora de Seguros na Braskem",
      sectorTag: "Na indústria",
      quote:
        "Antes, nosso controle de sinistros era feito em planilhas, o que exigia muito esforço manual e gerava riscos de erros e perda de prazos. Com a Paycon, conseguimos transformar essa realidade: eles entenderam nossas necessidades, traduziram uma demanda complexa em um sistema robusto no Power Apps e entregaram uma solução que hoje é essencial para nossa gestão. Ganhamos agilidade, segurança e visibilidade estratégica para decisões mais assertivas.",
      photo: "/assets/testimonials/testimonial-renata-lopes.webp",
    },
    {
      id: "marilia-saito",
      name: "Marília Saito",
      attribution: "Intellectual Property – Braskem",
      sectorTag: "Na indústria",
      quote:
        "Com a atuação da Paycon, conseguimos replicar o modelo da primeira fase para esses novos tipos documentais, melhorando significativamente a organização e facilitando o acesso às informações. Hoje, encontramos rapidamente os documentos e temos muito mais segurança e eficiência nos processos.",
      photo: "/assets/testimonials/testimonial-marilia-saito.webp",
    },
    {
      id: "rafael-gomes",
      name: "Rafael Rodrigues Neves Gomes",
      attribution: "Coordenador Eficiência Jurídica - Energisa",
      sectorTag: "Na energia",
      quote:
        "No final do dia, acredito que o grande ganho aqui não está apenas na questão operacional ou na execução das atividades em si. O verdadeiro valor está na segurança, na compliance e na mitigação de riscos em auditorias. Essa ferramenta trouxe uma estrutura robusta para o processo, garantindo que os pagamentos aos fornecedores sejam feitos corretamente, sempre dentro das regras contratuais e sem qualquer desvio de remuneração. Esse, sem dúvida, foi o principal ganho que esperávamos.",
      photo: "/assets/testimonials/testimonial-rafael-gomes.webp",
    },
    {
      id: "julianne-lacerda",
      name: "Julianne Nunes de Lacerda",
      attribution: "Advogada Tributarista na Braskem",
      sectorTag: "Na indústria",
      quote:
        "Com a ferramenta desenvolvida pela Paycon, conseguimos transformar um processo que era totalmente manual e descentralizado em um sistema inteligente, intuitivo e 100% seguro. Hoje temos total controle sobre nossos documentos jurídicos, com padronização, rastreabilidade e autonomia para toda a equipe. A visualização em tempo real nos permite tomar decisões com mais rapidez e confiança. É uma solução que realmente trouxe agilidade e nos libertou de retrabalhos e dependência de outras áreas.",
      photo: "/assets/testimonials/testimonial-julianne-lacerda.webp",
    },
    {
      id: "vanessa-joaquim",
      name: "Vanessa Cardoso Joaquim",
      attribution: "Coordenadora Jurídica no Atacadão",
      sectorTag: "No varejo",
      quote:
        "Esse foi o projeto mais emocionante da minha vida profissional. O fechamento era minha maior dor, e hoje consigo gerar tudo sozinha, com precisão e tranquilidade. Ganhamos tempo, segurança e previsibilidade.",
      photo: "/assets/testimonials/testimonial-vanessa-joaquim.webp",
    },
    {
      id: "guilherme-briggs",
      name: "Guilherme Briggs",
      attribution: "Analista de Operações Jurídicas na Prudential",
      sectorTag: "No setor de seguros",
      quote:
        "A solução desenvolvida pela Paycon trouxe uma verdadeira otimização de processos, gerando mais eficiência e eficácia em toda a nossa rotina de faturamento. Ganhamos em organização, controle e produtividade — com impactos diretos na qualidade do nosso dia a dia.",
      photo: "/assets/testimonials/testimonial-guilherme-briggs.webp",
    },
    {
      id: "jessica-ferreira",
      name: "Jessica Ferreira",
      attribution: "Coordenadora Jurídica da Monte Rodovias",
      sectorTag: "Em infraestrutura",
      quote:
        "Antes eu chegava a gastar um dia inteiro cruzando manualmente relatórios de base geral e contingência — ainda assim corríamos risco de erro. Com a nova ferramenta, toda a base de processos e valores está reunida em um único lugar, sem retrabalho e sem margem para falhas. Hoje faço leituras estratégicas em minutos, obtenho uma visão objetiva do contencioso e tomo decisões com muito mais rapidez e segurança.",
      photo: "/assets/testimonials/testimonial-jessica-ferreira.webp",
    },
    {
      id: "elys-musso",
      name: "Elys Musso",
      attribution: "Equipe de Legal Ops - Ford",
      sectorTag: "Na indústria",
      quote:
        "Antes da ferramenta da Paycon, o cálculo do ticket médio era uma rotina bastante complexa e manual, que tomava cerca de um dia e meio entre extração de bases, validações e conferências. Hoje, com a solução automatizada, conseguimos realizar toda a análise em cerca de 3 horas, com muito mais precisão e governança, podendo dedicar mais tempo em outras atividades estratégicas que realmente exigem a atuação humana. A ferramenta trouxe agilidade, confiabilidade e nos permite compartilhar os resultados rapidamente com os envolvidos. Foi um projeto que trouxe mudança significativa no dia a dia do Legal Ops.",
      photo: "/assets/testimonials/testimonial-elys-musso.webp",
    },
    {
      id: "giulia-franco",
      name: "Giulia Franco",
      // site oficial não atribui cargo aqui — só o nome do cliente
      attribution: "Carrefour",
      sectorTag: "No varejo",
      quote: "Antes, 8 pessoas perdiam tempo em uma tarefa simples. Agora, com um clique, o robô faz tudo. Ganhamos tempo e segurança jurídica.",
      photo: "/assets/testimonials/testimonial-giulia-franco.webp",
    },
  ] satisfies Testimonial[],

  method: {
    title: "Método PAYCON de automação jurídica",
    subtitle: "Tecnologia que se conecta à realidade do seu jurídico",
    steps: [
      {
        step: 1,
        stepLabel: "PASSO 01",
        title: "Diagnóstico",
        description:
          "Entendemos como você e sua equipe realmente trabalham e quais são os desafios operacionais que as automações poderiam resolver",
      },
      {
        step: 2,
        stepLabel: "PASSO 02",
        title: "Desenho da solução",
        description: "Mapeamos e desenvolvemos automações que fazem sentido",
      },
      {
        step: 3,
        stepLabel: "PASSO 03",
        title: "Implementação",
        description:
          "Sem traumas, respeitando seu ambiente tecnológico já existente, adaptamos as automações gerando rápida adesão e rápidos resultados",
      },
    ] satisfies MethodStep[],
    cta: { label: "QUERO UM DIAGNÓSTICO GRATUITO", placement: "metodo" },
  },

  about: {
    title: "Sobre a PAYCON",
    history:
      "Fundada em 2011 com foco em RH, a Paycon expandiu sua atuação em 2020 para as automações jurídicas, passando a trabalhar lado a lado com os clientes no diagnóstico, implementação e sustentação de soluções para elevar a eficiência do jurídico.",
    growthMetric:
      "Nos últimos três anos, saltamos de 3 para mais de 40 clientes, incluindo companhias como Carrefour, Samsung, Heinz, Motorola, TIM, Ford, Ambev, Atacadão, Natura e tantas outras.",
    philosophy: [
      "Desenvolvemos tecnologias que atendem a realidade do jurídico corporativo sem firulas ou promessas vazias. Tudo simples e eficiente.",
      "Nosso time é formado por advogados que conhecem, na prática, a pressão por prazos, o volume de processos, a complexidade das provisões e o peso das tarefas operacionais no dia a dia.",
      "Em vez de sermos um time de tecnologia 'traduzindo' soluções para o jurídico, somos profissionais do Direito criando tecnologia, com um time altamente técnico, para advogados.",
    ],
    mission:
      "Nosso objetivo, de advogado para advogado, é que a tecnologia não seja um fim em si mesma, mas o meio para algo maior: mudar a forma como você vive o próprio trabalho.",
    impact:
      "Quando uma tarefa repetitiva deixa de existir, não é só um processo que melhora. É uma carreira que ganha fôlego.",
    legacy:
      "Nesses quase 15 anos de atuação, a Paycon já provou ser um vetor de transformação de carreiras e departamentos jurídicos, sempre preservando aquilo que nos diferencia: a combinação de tecnologia humanizada, proximidade com o cliente e resultados concretos.",
  },

  team: [
    {
      id: "ivan-rocha",
      name: "Ivan Rocha",
      role: "Sócio Administrador",
      bio: "Ivan Rocha é sócio-administrador da Paycon e atua na interseção entre Direito, gestão de processos e inovação tecnológica. Advogado, consultor e auditor, possui experiência em consultivo e contencioso trabalhista, análise de operações jurídicas e estruturação de soluções voltadas à eficiência, segurança e mitigação de riscos.\n\nEspecialista em Design Thinking aplicado a sistemas jurídicos, contribui para a compreensão das necessidades dos departamentos jurídicos e para o desenho de soluções aderentes à realidade dos profissionais que utilizarão a tecnologia, além do RH e Financeiro. Com experiência anterior em auditoria e consultoria, participou da liderança de projetos de grande porte relacionados à identificação e recuperação de depósitos judiciais, combinando análise documental, atuação jurídica e estruturação de controles financeiros.",
      photo: "/assets/team/team-ivan-rocha.webp",
    },
    {
      id: "thiago-palma",
      name: "Thiago Palma",
      role: "CEO",
      bio: "Thiago Palma é CEO da Paycon e atua na interseção entre Direito, tecnologia, gestão de projetos e transformação de processos.\n\nAdvogado e especialista em automação, possui experiência na identificação de atividades manuais, no redesenho de fluxos operacionais e na implementação de soluções tecnológicas voltadas principalmente para departamentos jurídicos e escritórios de advocacia. Com atuação voltada à automação de processos, gestão de projetos e inteligência de dados, lidera a estruturação de soluções que conectam pessoas, processos e tecnologia. Seu trabalho envolve o diagnóstico de operações complexas, o redesenho de fluxos, a definição de regras de negócio e a implantação de automações capazes de gerar produtividade, governança, rastreabilidade e segurança para departamentos jurídicos e empresas.",
      photo: "/assets/team/team-thiago-palma.webp",
    },
    {
      id: "thiago-teles",
      name: "Thiago Teles",
      role: "Sócio",
      bio: "Thiago Teles Rodrigues é sócio da Paycon e atua na convergência entre Direito, programação, gestão operacional e desenvolvimento de pessoas.\n\nAdvogado programador, possui experiência na estruturação de rotinas, planejamento de projetos contínuos e desenvolvimento de soluções tecnológicas voltadas à automação de processos jurídicos e administrativos.\n\nNa Paycon, participa da organização e evolução das operações, contribuindo para a definição de padrões de desenvolvimento, distribuição das atividades, acompanhamento dos projetos e melhoria contínua das soluções entregues aos clientes. Combina conhecimento jurídico, programação e visão operacional para estruturar processos, orientar equipes e assegurar a evolução contínua das soluções desenvolvidas pela empresa.\n\nNa Paycon, contribui para transformar necessidades complexas em projetos tecnicamente organizados, escaláveis e orientados à eficiência, atuando também na formação dos analistas responsáveis pela construção e sustentação das automações.",
      photo: "/assets/team/team-thiago-teles.webp",
    },
  ] satisfies TeamMember[],

  /**
   * Título/subtítulo dedicados da seção de clientes — existem no site oficial
   * como H2 + parágrafo próprios daquela seção. Antes, `PartnersScene`
   * reaproveitava a frase de `about.growthMetric` como título (conteúdo real,
   * mas do bloco "Sobre a PAYCON", não desta seção).
   */
  partnersIntro: {
    title: "+ de 40 empresas confiaram na Paycon para automatizar suas tarefas",
    subtitle: "Junte-se a nós e torne seu operacional mais fácil, eficiente e prazeroso.",
  },

  partners: [
    { id: "carrefour", name: "Carrefour", logo: "/assets/partners/partner-carrefour.webp" },
    { id: "claro", name: "Claro", logo: "/assets/partners/partner-claro.webp" },
    { id: "atacadao", name: "Atacadão", logo: "/assets/partners/partner-atacadao.webp" },
    { id: "cbmm", name: "CBMM", logo: "/assets/partners/partner-cbmm.webp" },
    { id: "cea", name: "C&A", logo: "/assets/partners/partner-cea.webp" },
    { id: "braskem", name: "Braskem", logo: "/assets/partners/partner-braskem.webp" },
    { id: "bat-brasil", name: "BAT Brasil", logo: "/assets/partners/partner-bat-brasil.webp" },
    { id: "atvos", name: "Atvos", logo: "/assets/partners/partner-atvos.png" },
    { id: "ambev", name: "Ambev", logo: "/assets/partners/partner-ambev.webp" },
    { id: "cogna", name: "Cogna", logo: "/assets/partners/partner-cogna.webp" },
    { id: "lactalis", name: "Lactalis", logo: "/assets/partners/partner-lactalis.webp" },
    { id: "hyundai", name: "Hyundai", logo: "/assets/partners/partner-hyundai.webp" },
    { id: "heinz", name: "Heinz", logo: "/assets/partners/partner-heinz.webp" },
    { id: "gpa", name: "GPA", logo: "/assets/partners/partner-gpa.webp" },
    { id: "gerdau", name: "Gerdau", logo: "/assets/partners/partner-gerdau.webp" },
    { id: "ford", name: "Ford", logo: "/assets/partners/partner-ford.webp" },
    { id: "energisa", name: "Energisa", logo: "/assets/partners/partner-energisa.webp" },
    { id: "cosan", name: "Cosan", logo: "/assets/partners/partner-cosan.webp" },
    { id: "dasa", name: "Dasa", logo: "/assets/partners/partner-dasa.webp" },
    { id: "solar-coca-cola", name: "Solar Coca-Cola", logo: "/assets/partners/partner-solar-coca-cola.webp" },
    { id: "samsung", name: "Samsung", logo: "/assets/partners/partner-samsung.webp" },
    { id: "prudential", name: "Prudential", logo: "/assets/partners/partner-prudential.webp" },
    { id: "owens-illinois", name: "Owens-Illinois", logo: "/assets/partners/partner-owens-illinois.png" },
    { id: "mondelez", name: "Mondelēz", logo: "/assets/partners/partner-mondelez.webp" },
    { id: "motorola", name: "Motorola", logo: "/assets/partners/partner-motorola.webp" },
    { id: "loggi", name: "Loggi", logo: "/assets/partners/partner-loggi.webp" },
    { id: "lenovo", name: "Lenovo", logo: "/assets/partners/partner-lenovo.webp" },
    { id: "tim", name: "TIM", logo: "/assets/partners/partner-tim.webp" },
    { id: "suzano", name: "Suzano", logo: "/assets/partners/partner-suzano.webp" },
    { id: "sabesp", name: "Sabesp", logo: "/assets/partners/partner-sabesp.webp" },
    { id: "votorantim", name: "Votorantim", logo: "/assets/partners/partner-votorantim.webp" },
    { id: "afya", name: "Afya", logo: "/assets/partners/partner-afya.webp" },
  ] satisfies Partner[],

  finalCta: {
    headline: "Pronto para transformar seu jurídico e sua carreira?",
    body: "Fale com a nossa equipe e entenda como as nossas soluções em automações funcionam na prática.",
    cta: {
      label: "AGENDAR REUNIÃO",
      href: "https://wa.me/5511914070729?text=Oi%2C%20vim%20pelo%20Linkedin%20e%20quero%20saber%20mais%20sobre%20provis%C3%A3o",
      placement: "final",
      external: true,
    },
  },

  form: {
    title:
      "Preencha seus dados e veja como podemos te ajudar a otimizar seus fluxos jurídicos na prática",
    supportingCopy: "Nossa equipe entrará em contato rapidamente!",
    submitLabel: "SOLICITAR DEMONSTRAÇÃO GRATUITA",
    submittingLabel: "ENVIANDO...",
    successTitle: "Enviado!",
    successBody: "Nossa equipe entrará em contato em breve.",
    errorTitle: "Erro ao enviar",
    errorBody: "Não foi possível enviar. Tente novamente.",
    fields: [
      { id: "name", name: "name", label: "Nome:", type: "text", required: true },
      { id: "email", name: "email", label: "E-mail:", type: "email", required: true },
      { id: "phone", name: "celular", label: "Celular:", type: "tel", required: true },
      { id: "company", name: "empresa", label: "Nome da empresa:", type: "text", required: true },
      // Cargo e Você atua em não têm asterisco/`required` no site oficial (verificado no DOM: <input required=false>)
      { id: "role", name: "cargo", label: "Cargo:", type: "text", required: false, placeholder: "Seu cargo" },
      {
        id: "sector",
        name: "atua_em",
        label: "Você atua em:",
        type: "select",
        required: false,
        placeholder: "Selecione uma opção",
        options: [
          { value: "privada", label: "Empresa privada/departamento jurídico" },
          { value: "escritorio", label: "Escritório de advocacia" },
          { value: "publica", label: "Empresa pública" },
          { value: "outro", label: "Outro" },
        ],
      },
    ] satisfies FormField[],
    integration: {
      provider: "supabase-edge-function",
      supabaseUrl: "https://ratdvdatfbbxlrozdioi.supabase.co",
      supabaseAnonKey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhdGR2ZGF0ZmJieGxyb3pkaW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDY4ODcsImV4cCI6MjA4Mzk4Mjg4N30.eKK5wVsR142slLFid2hwFsFvmnZUtqIwlnGsFee1p3Q",
      functionName: "submit-lead",
      source: "home",
    },
  },

  footer: {
    title: "Automações Jurídicas",
    tagline: "Transformando a prática jurídica com automações inteligentes e inteligência artificial.",
    quickLinks: [
      { href: "#solucoes", label: "Soluções" },
      { href: "#diferenciais", label: "Diferenciais" },
      { href: "#metodo", label: "Nosso Método" },
      { href: "#sobre", label: "Quem Somos" },
    ] satisfies NavLink[],
    contact: {
      email: "contato@automacoesjuridicas.com.br",
      phone: "(11) 3675-7990",
      location: "São Paulo, SP - Brasil",
    },
    copyright: "© 2026 Automações Jurídicas. Todos os direitos reservados.",
  },

  analytics: {
    gtmId: "GTM-TNX4TPXC",
    linkedInInsightScriptSrc: "https://snap.licdn.com/li.lms-analytics/insight.min.js",
    clarityId: "uwshe4qqkz",
    mantoraTrackerSrc: "https://mantoraof.netlify.app/trck.js?cid=95b4b23b-6cdc-4b47-b9bf-829ff512c5b3",
    ctaEventName: "paycon_cta_click",
  },
};

export type PayconLandingContent = typeof payconLandingContent;
