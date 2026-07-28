/**
 * Geração das nuvens de pontos usadas pelo ParticleStage.
 *
 * Todas as formas são geradas proceduralmente. Nenhuma imagem de referência é
 * traçada, mascarada ou usada como textura.
 *
 * Coordenadas normalizadas: x/y aproximadamente em [-1, 1], escaladas em runtime.
 * Buffers são Float32Array intercalados [x0,y0,x1,y1,...] para evitar alocação
 * por frame no loop de render.
 */

export type PointBuffer = Float32Array;

/** Divisão de papéis: lado humano, lado tecnológico, núcleo. */
export const ROLE_SPLIT = { human: 0.37, tech: 0.37 } as const;

export type RoleRanges = {
  humanCount: number;
  techCount: number;
  coreCount: number;
};

export function computeRoles(count: number): RoleRanges {
  const humanCount = Math.round(count * ROLE_SPLIT.human);
  const techCount = Math.round(count * ROLE_SPLIT.tech);
  return { humanCount, techCount, coreCount: count - humanCount - techCount };
}

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * NUVEM QUE SEGUE O CURSOR — forma principal da hero.
 *
 * Substitui as mãos/dedos. A referência em vídeo mostra uma massa luminosa de
 * partículas, com núcleo denso e corpo difuso, que acompanha o ponteiro e se
 * deforma ao se deslocar (medi o centro migrando ~35% da largura entre t=2s e
 * t=6s mantendo a escala).
 *
 * Retorna OFFSETS em relação ao centro da nuvem (o centro é posicionado em
 * runtime, seguindo o cursor) e um fator de ATRASO por partícula: as de dentro
 * acompanham rápido, as de fora ficam atrás — é o atraso desigual que produz o
 * rastro e a deformação, não uma animação de rastro explícita.
 */
export function buildCloud(count: number, seed = 1201) {
  const rand = mulberry(seed);
  const points = new Float32Array(count * 2);
  const lag = new Float32Array(count);
  const size = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // raio com viés para o centro (sqrt duplo → núcleo bem mais denso)
    const u = rand();
    const r = Math.pow(u, 1.9);
    const a = rand() * Math.PI * 2;
    // leve achatamento horizontal: a nuvem lê como massa, não como círculo
    points[i * 2] = Math.cos(a) * r * 1.25;
    points[i * 2 + 1] = Math.sin(a) * r * 0.85;
    // quanto mais longe do centro, mais atrasada
    lag[i] = 1 - Math.min(1, r * 0.9);
    // e menor
    size[i] = 1.15 - r * 0.55;
  }
  return { points, lag, size };
}

/** Núcleo Paycon: fragmentos modulares em anéis — forma original, não esférica. */
export function buildCore(count: number, seed = 303): PointBuffer {
  const rand = mulberry(seed);
  const buf = new Float32Array(count * 2);
  const blades = 6;
  for (let i = 0; i < count; i++) {
    const blade = i % blades;
    const along = rand();
    const baseAngle = (blade / blades) * Math.PI * 2;
    // lâminas radiais com espessura, formando um núcleo facetado
    const radius = 0.22 + along * 0.5;
    const spread = (1 - along) * 0.16 + 0.03;
    const a = baseAngle + (rand() - 0.5) * spread;
    buf[i * 2] = Math.cos(a) * radius;
    buf[i * 2 + 1] = Math.sin(a) * radius * 0.82;
  }
  return buf;
}

/** Campo disperso amplo (estado inicial / dissolução). */
export function buildDispersed(count: number, seed = 404): PointBuffer {
  const rand = mulberry(seed);
  const buf = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.35 + Math.sqrt(rand()) * 1.15;
    buf[i * 2] = Math.cos(a) * r * 1.35;
    buf[i * 2 + 1] = Math.sin(a) * r;
  }
  return buf;
}

/**
 * Estrutura de dados para a cena de escaneamento.
 *
 * A versão anterior distribuía TODAS as partículas em 11 linhas horizontais
 * finas. Com blending aditivo, cada linha acumulava ~236 sprites sobrepostos num
 * mesmo strip de poucos pixels e estourava em branco — eram as faixas
 * horizontais luminosas do bug (medi 58–74 pixels saturados por linha).
 *
 * Agora os pontos formam uma GRADE 2D de módulos com vãos: muito mais linhas,
 * menos pontos por linha e espaçamento vertical real. A densidade por pixel cai
 * uma ordem de magnitude e a leitura passa a ser de estrutura de dados.
 */
export function buildScanner(count: number, seed = 505): PointBuffer {
  const rand = mulberry(seed);
  const buf = new Float32Array(count * 2);
  const rows = 26;
  const cols = 14;
  for (let i = 0; i < count; i++) {
    const r = i % rows;
    const c = Math.floor(i / rows) % cols;
    // algumas linhas são "cabeçalhos" mais curtos → leitura de documento
    const isHeader = r % 6 === 0;
    const rowWidth = isHeader ? 0.42 : 0.84;
    const y = -0.78 + (r / (rows - 1)) * 1.56;
    const x = (-1 + (c / (cols - 1)) * 2) * rowWidth;
    // jitter pequeno: mantém os módulos separados em vez de virar linha contínua
    buf[i * 2] = x + (rand() - 0.5) * 0.03;
    buf[i * 2 + 1] = y + (rand() - 0.5) * 0.018;
  }
  return buf;
}

/** Molduras de cards em profundidade: retângulos concêntricos deslocados. */
export function buildCardFrames(count: number, seed = 606): PointBuffer {
  const rand = mulberry(seed);
  const buf = new Float32Array(count * 2);
  const frames = 4;
  for (let i = 0; i < count; i++) {
    const f = i % frames;
    const w = 0.5 + f * 0.16;
    const h = 0.34 + f * 0.1;
    const ox = (f - 1.5) * 0.14;
    const oy = (f - 1.5) * 0.07;
    // percorre o perímetro
    const t = rand() * 4;
    let x: number;
    let y: number;
    if (t < 1) {
      x = -w + t * 2 * w;
      y = -h;
    } else if (t < 2) {
      x = w;
      y = -h + (t - 1) * 2 * h;
    } else if (t < 3) {
      x = w - (t - 2) * 2 * w;
      y = h;
    } else {
      x = -w;
      y = h - (t - 3) * 2 * h;
    }
    buf[i * 2] = x + ox;
    buf[i * 2 + 1] = y + oy;
  }
  return buf;
}

/** Módulos de mosaico: grade irregular de blocos. */
export function buildMosaic(count: number, seed = 707): PointBuffer {
  const rand = mulberry(seed);
  const buf = new Float32Array(count * 2);
  const mods = [
    { x: -0.78, y: -0.42, w: 0.5, h: 0.26 },
    { x: -0.14, y: -0.5, w: 0.32, h: 0.18 },
    { x: 0.36, y: -0.44, w: 0.46, h: 0.3 },
    { x: -0.72, y: 0.06, w: 0.34, h: 0.34 },
    { x: -0.2, y: 0.0, w: 0.44, h: 0.22 },
    { x: 0.42, y: 0.08, w: 0.38, h: 0.36 },
    { x: -0.5, y: 0.52, w: 0.56, h: 0.2 },
    { x: 0.28, y: 0.56, w: 0.4, h: 0.18 },
  ];
  for (let i = 0; i < count; i++) {
    const m = mods[i % mods.length];
    // maioria no perímetro do módulo, alguns no interior
    if (rand() < 0.72) {
      const t = rand() * 4;
      if (t < 1) {
        buf[i * 2] = m.x - m.w + t * 2 * m.w;
        buf[i * 2 + 1] = m.y - m.h;
      } else if (t < 2) {
        buf[i * 2] = m.x + m.w;
        buf[i * 2 + 1] = m.y - m.h + (t - 1) * 2 * m.h;
      } else if (t < 3) {
        buf[i * 2] = m.x + m.w - (t - 2) * 2 * m.w;
        buf[i * 2 + 1] = m.y + m.h;
      } else {
        buf[i * 2] = m.x - m.w;
        buf[i * 2 + 1] = m.y + m.h - (t - 3) * 2 * m.h;
      }
    } else {
      buf[i * 2] = m.x + (rand() * 2 - 1) * m.w;
      buf[i * 2 + 1] = m.y + (rand() * 2 - 1) * m.h;
    }
  }
  return buf;
}

/** Rede de parceiros: nós em grade + pontos ao longo das conexões. */
export function buildNetwork(count: number, seed = 808): PointBuffer {
  const rand = mulberry(seed);
  const buf = new Float32Array(count * 2);
  const cols = 6;
  const rows = 4;
  const nodes: Array<[number, number]> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      nodes.push([
        -1.0 + (c / (cols - 1)) * 2.0 + (rand() - 0.5) * 0.08,
        -0.6 + (r / (rows - 1)) * 1.2 + (rand() - 0.5) * 0.08,
      ]);
    }
  }
  for (let i = 0; i < count; i++) {
    if (rand() < 0.45) {
      // aglomerado no nó
      const n = nodes[Math.floor(rand() * nodes.length)];
      const a = rand() * Math.PI * 2;
      const r = rand() * 0.05;
      buf[i * 2] = n[0] + Math.cos(a) * r;
      buf[i * 2 + 1] = n[1] + Math.sin(a) * r;
    } else {
      // ponto ao longo de uma conexão horizontal entre nós vizinhos
      const idx = Math.floor(rand() * nodes.length);
      const a = nodes[idx];
      const b = nodes[(idx + 1) % nodes.length];
      const t = rand();
      buf[i * 2] = a[0] + (b[0] - a[0]) * t;
      buf[i * 2 + 1] = a[1] + (b[1] - a[1]) * t;
    }
  }
  return buf;
}

/**
 * WORDMARK PAYCON amostrado do ARQUIVO OFICIAL da logo.
 *
 * Antes o wordmark era digitado como texto em Inter e amostrado — o que
 * aproximava a tipografia em vez de usar a real. Agora a fonte da verdade é
 * `public/assets/identity/paycon-logo-source.jpg`, o próprio arquivo da marca.
 *
 * Detalhes que importam:
 *  - O arquivo tem FUNDO BRANCO (não é PNG com alpha), então o critério de
 *    "tinta" é luminância baixa, não canal alpha.
 *  - PAY/CON são separados pela COR REAL dos pixels (azul tem b−r alto; cinza é
 *    neutro), não por um palpite de largura. É a atribuição exata da marca.
 *  - A imagem é redesenhada ampliada com suavização antes da amostragem: os
 *    ~735 pixels de tinta do original a 150×150 dariam alvos muito grosseiros.
 *  - Só a caixa delimitadora da tinta é normalizada, preservando proporção e
 *    espaçamento entre letras — nunca a moldura transparente/branca em volta.
 *
 * O carregamento é assíncrono; os buffers são preenchidos EM PLACE quando a
 * imagem chega, e `ready.value` passa a true. A coreografia usa o núcleo como
 * estado de espera até lá.
 */
export type WordmarkTarget = {
  points: Float32Array;
  isPay: Uint8Array;
  /** altura / largura da caixa de tinta, para não esticar a tipografia */
  aspect: { value: number };
  ready: { value: boolean };
};

const LOGO_SRC = `${import.meta.env.BASE_URL ?? "/"}assets/identity/paycon-logo-source.jpg`;

export function loadOfficialWordmark(count: number, seed = 909): WordmarkTarget {
  const target: WordmarkTarget = {
    points: new Float32Array(count * 2),
    isPay: new Uint8Array(count),
    aspect: { value: 0.26 },
    ready: { value: false },
  };
  if (typeof document === "undefined") return target;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    try {
      /**
       * Amplia SEM suavização (nearest-neighbor).
       * Com suavização, o halo entre letra e fundo branco entrava como tinta e
       * engordava as formas; e como o cinza da marca (#B0B0B0) tem luminância
       * ~176, muito perto do fundo, a combinação halo+limiar apertado apagava
       * quase todo o "CON". Pixels crus mantêm as letras exatas — e a
       * granulação não aparece, porque as partículas já quantizam a forma.
       */
      const scale = 6;
      const W = Math.round(img.naturalWidth * scale);
      const H = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, W, H);
      const data = ctx.getImageData(0, 0, W, H).data;

      // 1) caixa da tinta + coleta dos pixels
      type Ink = { x: number; y: number; pay: boolean };
      const ink: Ink[] = [];
      let minX = W;
      let maxX = -1;
      let minY = H;
      let maxY = -1;
      const step = Math.max(1, Math.round(scale / 2));
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const i = (y * W + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = r * 0.299 + g * 0.587 + b * 0.114;
          // 215 e não 186: o cinza "CON" fica em ~176 de luminância, quase no
          // fundo. Medido no arquivo: x 28–70 sai 100% azul (PAY) e x 74–119
          // 100% cinza (CON), com separação de cor perfeita.
          if (lum > 215) continue; // fundo branco
          // azul da marca: componente azul bem acima do vermelho
          ink.push({ x, y, pay: b - r > 14 });
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      if (ink.length === 0 || maxX <= minX || maxY <= minY) return;

      // 2) normaliza pela caixa de tinta, preservando proporção
      const bw = maxX - minX;
      const bh = maxY - minY;
      target.aspect.value = bh / bw;
      const rand = mulberry(seed);
      for (let i = 0; i < count; i++) {
        const pt = ink[Math.floor(rand() * ink.length)];
        const nx = ((pt.x - minX) / bw) * 2 - 1;
        const ny = ((pt.y - minY) / bh) * 2 - 1;
        // jitter mínimo: o suficiente para os pontos não se empilharem, sem
        // desmanchar a borda das letras
        target.points[i * 2] = nx + (rand() - 0.5) * 0.006;
        // y negado: ver a nota de ORIENTAÇÃO em `sampleHalftone`
        target.points[i * 2 + 1] = -(ny + (rand() - 0.5) * 0.018);
        target.isPay[i] = pt.pay ? 1 : 0;
      }
      target.ready.value = true;
    } catch {
      // se o canvas for contaminado ou a imagem falhar, o palco segue no núcleo
    }
  };
  img.src = LOGO_SRC;
  return target;
}

export type ShapeLibrary = {
  /** Offsets da nuvem em relação ao seu centro. */
  cloud: PointBuffer;
  /** Fator de acompanhamento por partícula (1 = segue rápido, 0 = fica atrás). */
  cloudLag: Float32Array;
  /** Tamanho relativo por partícula da nuvem. */
  cloudSize: Float32Array;
  core: PointBuffer;
  coreFull: PointBuffer;
  dispersed: PointBuffer;
  scanner: PointBuffer;
  cardFrames: PointBuffer;
  mosaic: PointBuffer;
  network: PointBuffer;
  logo: PointBuffer;
  logoIsPay: Uint8Array;
  /** proporção (altura/largura) da caixa de tinta do wordmark oficial */
  logoAspect: { value: number };
  /** false até a imagem oficial ser carregada e amostrada */
  logoReady: { value: boolean };
  roles: RoleRanges;
};

const libraryCache = new Map<number, ShapeLibrary>();

/** Constrói (e memoiza) todas as formas para uma dada contagem de partículas. */
export function getShapeLibrary(count: number): ShapeLibrary {
  const cached = libraryCache.get(count);
  if (cached) return cached;

  const roles = computeRoles(count);
  const wordmark = loadOfficialWordmark(count);
  const cloud = buildCloud(count);
  const library: ShapeLibrary = {
    cloud: cloud.points,
    cloudLag: cloud.lag,
    cloudSize: cloud.size,
    core: buildCore(roles.coreCount),
    coreFull: buildCore(count, 313),
    dispersed: buildDispersed(count),
    scanner: buildScanner(count),
    cardFrames: buildCardFrames(count),
    mosaic: buildMosaic(count),
    network: buildNetwork(count),
    logo: wordmark.points,
    logoIsPay: wordmark.isPay,
    logoAspect: wordmark.aspect,
    logoReady: wordmark.ready,
    roles,
  };
  libraryCache.set(count, library);
  return library;
}
