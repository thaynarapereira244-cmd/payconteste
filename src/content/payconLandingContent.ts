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
  description: string;
  highlight?: string;
  features?: string[];
  cta?: { label: string; placement: string };
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  companySector: string;
  quote: string;
  photo: string;
};

export type MethodStep = {
  step: number;
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
    headline: "Transforme tarefas em um clique",
    subheadline:
      "Automações jurídicas sob medida integradas ao sistema que você já usa.",
    body:
      "Muitos oferecem novos sistemas que trazem novas complicações. Na Paycon, fazemos o oposto: implementamos inteligência dentro das ferramentas que você já possui.",
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
          "Nossas soluções nascem de dentro do jurídico — não são adaptações de tecnologia genérica.",
      },
      {
        title: "P2P: De Pessoa para Pessoa",
        description:
          "Tecnologia de Advogados para Advogados: conhecemos a complexidade operacional porque vivemos isso na prática. Somos uma empresa de tecnologia criada por advogados. Nossas soluções são desenhadas para fazer sentido absoluto no dia a dia jurídico.",
      },
      {
        title: "Eficiência Dentro de Casa",
        description:
          "Tudo é construído para rodar dentro das ferramentas que você já possui, eliminando a curva de aprendizado.",
      },
    ],
  },

  solutions: [
    {
      id: "insights",
      title: "Insights: Inteligência para Baixa de Provisão",
      description:
        "Com o serviço de Insights, identificamos oportunidades reais para baixa de provisão diretamente no seu banco de dados.",
      highlight: "15 a 25% da base atual de processos costuma ser encerrada na primeira rodagem",
      cta: { label: "SOLICITAR DEMONSTRAÇÃO", placement: "solutions" },
    },
    {
      id: "baixa-de-provisao",
      title: "Baixa de provisão",
      description:
        "Identificamos casos para baixa de provisão e acuracidade no seu resultado.",
    },
    {
      id: "dados-qualificados",
      title: "Dados Qualificados",
      description:
        "Mais do que dados do CNJ, entregamos Inteligência de dados com uma classificação e qualificação ímpar.",
    },
    {
      id: "contratos",
      title: "Contratos",
      description: "Gestão inteligente de contratos, do cadastro ao vencimento.",
      features: [
        "Contratos automáticos",
        "Organizador de documentos",
        "Gerador automático",
        "Painel com vencimentos, nomes das partes, multa etc.",
      ],
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
    },
    {
      id: "controladoria",
      title: "Controladoria",
      description: "Previsibilidade e controle financeiro do jurídico.",
      features: [
        "Fechamento Contábil",
        "Modelo de previsibilidade de pagamentos",
        "Orçamento",
        "Cockpit - seu painel automático de indicadores",
        "APP para controle e elaboração dos exercícios",
        "Cockpit robusto em Excel",
      ],
    },
    {
      id: "societario",
      title: "Societário",
      description: "Governança societária organizada e rastreável.",
      features: [
        "Gerador de procurações e substabelecimentos",
        "Árvore de decisão (quem pode assinar um documento?)",
        "Painel com as informações das empresas (CNPJ, nome, endereço, capital social etc.)",
      ],
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
      role: "Gerente de Planejamento Jurídico",
      company: "Braskem",
      companySector: "Industrial",
      quote:
        "O Robô de pagamentos desenvolvido pela Paycon trouxe um maior controle e segurança para os pagamentos de despesas legais",
      photo: "/assets/testimonials/testimonial-luiz-tassitani.png",
    },
    {
      id: "andreia-nunes",
      name: "Andréia Nunes",
      role: "Gerente de Inovação Jurídica",
      company: "Claro",
      companySector: "Telecomunicações",
      quote:
        "Com uma acuracidade impressionante de 99% de similaridade em relação aos resultados oficiais da contabilidade, conseguimos gerar prévias confiáveis",
      photo: "/assets/testimonials/testimonial-andreia-nunes.png",
    },
    {
      id: "ana-luiza",
      name: "Ana Luiza",
      role: "Supervisora de Legal Ops",
      company: "Afya",
      companySector: "Educação",
      quote:
        "O resultado foi muito positivo, pois conseguimos encerrar muitos processos e ter resultado significativo na provisão",
      photo: "/assets/testimonials/testimonial-ana-luiza.png",
    },
    {
      id: "spc-brasil",
      name: "Equipe Jurídica",
      role: "Time Jurídico",
      company: "SPC Brasil",
      companySector: "Serviços",
      quote:
        "A automação otimizou a gestão de ofícios no SPC Brasil. Hoje, o time jurídico ganhou tempo",
      photo: "/assets/testimonials/testimonial-spc-brasil.png",
    },
    {
      id: "renata-lopes",
      name: "Renata Lopes",
      role: "Coordenadora de Seguros",
      company: "Braskem",
      companySector: "Seguros",
      quote:
        "Antes, nosso controle de sinistros era feito em planilhas, o que exigia muito esforço manual",
      photo: "/assets/testimonials/testimonial-renata-lopes.png",
    },
    {
      id: "marilia-saito",
      name: "Marília Saito",
      role: "Intellectual Property",
      company: "Braskem",
      companySector: "Propriedade Intelectual",
      quote:
        "Com a atuação da Paycon, conseguimos replicar o modelo da primeira fase para esses novos tipos documentais",
      photo: "/assets/testimonials/testimonial-marilia-saito.jpg",
    },
    {
      id: "rafael-gomes",
      name: "Rafael Rodrigues Neves Gomes",
      role: "Coordenador Eficiência Jurídica",
      company: "Energisa",
      companySector: "Energia",
      quote:
        "No final do dia, acredito que o grande ganho aqui não está apenas na questão operacional",
      photo: "/assets/testimonials/testimonial-rafael-gomes.jpg",
    },
    {
      id: "julianne-lacerda",
      name: "Julianne Nunes de Lacerda",
      role: "Advogada Tributarista",
      company: "Braskem",
      companySector: "Tributário",
      quote:
        "Com a ferramenta desenvolvida pela Paycon, conseguimos transformar um processo que era totalmente manual",
      photo: "/assets/testimonials/testimonial-julianne-lacerda.png",
    },
    {
      id: "vanessa-joaquim",
      name: "Vanessa Cardoso Joaquim",
      role: "Coordenadora Jurídica",
      company: "Atacadão",
      companySector: "Varejo",
      quote:
        "Esse foi o projeto mais emocionante da minha vida profissional. O fechamento era minha maior dor",
      photo: "/assets/testimonials/testimonial-vanessa-joaquim.png",
    },
    {
      id: "guilherme-briggs",
      name: "Guilherme Briggs",
      role: "Analista de Operações Jurídicas",
      company: "Prudential",
      companySector: "Seguros",
      quote:
        "A solução desenvolvida pela Paycon trouxe uma verdadeira otimização de processos, gerando mais eficiência",
      photo: "/assets/testimonials/testimonial-guilherme-briggs.png",
    },
    {
      id: "jessica-ferreira",
      name: "Jessica Ferreira",
      role: "Coordenadora Jurídica",
      company: "Monte Rodovias",
      companySector: "Infraestrutura",
      quote:
        "Antes eu chegava a gastar um dia inteiro cruzando manualmente relatórios de base geral",
      photo: "/assets/testimonials/testimonial-jessica-ferreira.png",
    },
    {
      id: "elys-musso",
      name: "Elys Musso",
      role: "Equipe de Legal Ops",
      company: "Ford",
      companySector: "Industrial",
      quote:
        "Antes da ferramenta da Paycon, o cálculo do ticket médio era uma rotina bastante complexa e manual",
      photo: "/assets/testimonials/testimonial-elys-musso.png",
    },
    {
      id: "giulia-franco",
      name: "Giulia Franco",
      role: "",
      company: "Carrefour",
      companySector: "Varejo",
      quote: "Antes, 8 pessoas perdiam tempo em uma tarefa simples. Agora, com um clique, o robô faz tudo",
      photo: "/assets/testimonials/testimonial-giulia-franco.png",
    },
  ] satisfies Testimonial[],

  method: {
    title: "Método PAYCON de automação jurídica",
    subtitle: "Tecnologia que se conecta à realidade do seu jurídico",
    steps: [
      {
        step: 1,
        title: "Diagnóstico",
        description:
          "Entendemos como você e sua equipe realmente trabalham e quais são os desafios operacionais que as automações poderiam resolver",
      },
      {
        step: 2,
        title: "Desenho da solução",
        description: "Mapeamos e desenvolvemos automações que fazem sentido",
      },
      {
        step: 3,
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
      bio: "Advogado, consultor, auditor. Experiência com consultivo e contencioso trabalhista. Especialista em Design Thinking de sistemas jurídicos",
      photo: "/assets/team/team-ivan-rocha.png",
    },
    {
      id: "thiago-palma",
      name: "Thiago Palma",
      role: "Sócio Administrador",
      bio: "Advogado, especialista em automação de tarefas e gestão de projetos",
      photo: "/assets/team/team-thiago-palma.png",
    },
    {
      id: "thiago-teles",
      name: "Thiago Teles",
      role: "Sócio",
      bio: "Advogado programador, responsável pela gestão das rotinas e planejamento de projetos contínuos",
      photo: "/assets/team/team-thiago-teles.png",
    },
  ] satisfies TeamMember[],

  partners: [
    { id: "carrefour", name: "Carrefour", logo: "/assets/partners/partner-carrefour.png" },
    { id: "claro", name: "Claro", logo: "/assets/partners/partner-claro.png" },
    { id: "atacadao", name: "Atacadão", logo: "/assets/partners/partner-atacadao.png" },
    { id: "cbmm", name: "CBMM", logo: "/assets/partners/partner-cbmm.png" },
    { id: "cea", name: "C&A", logo: "/assets/partners/partner-cea.png" },
    { id: "braskem", name: "Braskem", logo: "/assets/partners/partner-braskem.png" },
    { id: "bat-brasil", name: "BAT Brasil", logo: "/assets/partners/partner-bat-brasil.png" },
    { id: "ambev", name: "Ambev", logo: "/assets/partners/partner-ambev.png" },
    { id: "cogna", name: "Cogna", logo: "/assets/partners/partner-cogna.png" },
    { id: "lactalis", name: "Lactalis", logo: "/assets/partners/partner-lactalis.png" },
    { id: "hyundai", name: "Hyundai", logo: "/assets/partners/partner-hyundai.png" },
    { id: "heinz", name: "Heinz", logo: "/assets/partners/partner-heinz.png" },
    { id: "gpa", name: "GPA", logo: "/assets/partners/partner-gpa.png" },
    { id: "gerdau", name: "Gerdau", logo: "/assets/partners/partner-gerdau.png" },
    { id: "ford", name: "Ford", logo: "/assets/partners/partner-ford.png" },
    { id: "energisa", name: "Energisa", logo: "/assets/partners/partner-energisa.png" },
    { id: "cosan", name: "Cosan", logo: "/assets/partners/partner-cosan.png" },
    { id: "dasa", name: "Dasa", logo: "/assets/partners/partner-dasa.png" },
    { id: "solar-coca-cola", name: "Solar Coca-Cola", logo: "/assets/partners/partner-solar-coca-cola.png" },
    { id: "samsung", name: "Samsung", logo: "/assets/partners/partner-samsung.webp" },
    { id: "prudential", name: "Prudential", logo: "/assets/partners/partner-prudential.png" },
    { id: "mondelez", name: "Mondelēz", logo: "/assets/partners/partner-mondelez.png" },
    { id: "motorola", name: "Motorola", logo: "/assets/partners/partner-motorola.png" },
    { id: "loggi", name: "Loggi", logo: "/assets/partners/partner-loggi.png" },
    { id: "lenovo", name: "Lenovo", logo: "/assets/partners/partner-lenovo.png" },
    { id: "tim", name: "TIM", logo: "/assets/partners/partner-tim.png" },
    { id: "suzano", name: "Suzano", logo: "/assets/partners/partner-suzano.png" },
    { id: "sabesp", name: "Sabesp", logo: "/assets/partners/partner-sabesp.png" },
    { id: "votorantim", name: "Votorantim", logo: "/assets/partners/partner-votorantim.png" },
    { id: "afya", name: "Afya", logo: "/assets/partners/partner-afya.png" },
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
      { id: "name", name: "name", label: "Nome", type: "text", required: true },
      { id: "email", name: "email", label: "E-mail", type: "email", required: true },
      { id: "phone", name: "celular", label: "Celular", type: "tel", required: true },
      { id: "company", name: "empresa", label: "Nome da empresa", type: "text", required: true },
      { id: "role", name: "cargo", label: "Cargo", type: "text", required: true, placeholder: "Seu cargo" },
      {
        id: "sector",
        name: "atua_em",
        label: "Você atua em",
        type: "select",
        required: true,
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
    tagline: "Transformando a prática jurídica com automações inteligentes e inteligência artificial",
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
    copyright: "© 2026 Automações Jurídicas. Todos os direitos reservados",
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
