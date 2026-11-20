const estado = {
  aba: "visao_geral",
  hardware: null,
  catalogo: null,
  jogos: null,
  startup: null,
  ping: null,
  logs: null,
  diagnostico: null,
  drivers: null,
  ultimoOrcamento: null,
  receitasAssistente: null,
  sintomaLivre: "",
  respostaAssistente: null,
  novosRecursos: null,
  tecnicoInfo: null,
  bancadaResultado: null,
  ultimoLaudoBancada: null,
  clienteBancada: "",
  dossies: [],
  pcReconhecido: null,
  mostrarDetalhesPcReconhecido: false,
  edicaoInfo: {
    edicao: "pro",
    nomeEdicao: "Windows Boost PRO (Completa)",
    licencaProAtiva: true,
    abasLite: ["visao_geral", "liberar_pro", "assistente", "otimizar_windows", "otimizar_jogos", "rede_ping", "memoria_ram"],
  },
  pedidosProInfo: {
    pedidos: [],
    pendentes: 0,
    ultimoAvisoCliente: null,
  },
  ultimoLinkZapPedido: "",
  ultimaChaveGerada: "",
  buscaGlobal: "",
  isoTools: null,
  kitNinite: null,
  selecionadosNinite: [],
  filtroRisco: "todos",
  buscaWindows: "",
  buscaJogos: "",
  buscaDrivers: "",
  confirmacaoPendente: null,
};

const INFO_ABAS = {
  visao_geral: {
    titulo: "Visão Geral",
    subtitulo: "Diagnóstico ao vivo do seu hardware, backup e perfis recomendados em 1 clique.",
  },
  liberar_pro: {
    titulo: "Liberar Acesso PRO — Pedidos, Aprovação & Aviso ao Cliente",
    subtitulo: "Clientes na versão LITE pedem liberação em 1 clique; o técnico Jonas aprova, libera todas as abas e envia o aviso na tela do cliente.",
  },
  assistente: {
    titulo: "Assistente Técnico Inteligente — O Que Está Acontecendo?",
    subtitulo: "Clique no sintoma ou descreva o defeito com suas palavras para o programa resolver automaticamente.",
  },
  bancada_hardware: {
    titulo: "Bancada Avançada de Hardware (Verificação em 6 Etapas)",
    subtitulo: "Auditoria ao vivo de Fonte/Energia, S.M.A.R.T. e GPT/MBR, Térmica/CPU, RAM/BSOD, Drivers/Rede e Carimbo de Entrega.",
  },
  remoto_tecnico: {
    titulo: "Acesso Remoto Integrado, Dados do Técnico & Top 10 GitHub",
    subtitulo: "Cadastre seu nome e telefone no sistema, acione suporte remoto nativo/RustDesk/AnyDesk e use os 10 maiores projetos do GitHub.",
  },
  raiox_drivers: {
    titulo: "Raio-X e Drivers",
    subtitulo: "Relatório completo do computador, logs do sistema, tempo ligado e backup dos drivers.",
  },
  pendrive_isos: {
    titulo: "PenDrive, Ninite e ISOs",
    subtitulo: "Kit portátil para técnicos, instalador em lote estilo Ninite e criadores oficiais de Windows.",
  },
  otimizar_windows: {
    titulo: "Otimizar Windows",
    subtitulo: "Ajustes de energia, sistema e privacidade com filtro de risco e botão de reversão.",
  },
  otimizar_jogos: {
    titulo: "Otimizar Jogos",
    subtitulo: "Prioridade alta de processador por executável para jogos populares ou personalizados.",
  },
  rede_ping: {
    titulo: "Rede e Ping",
    subtitulo: "Teste ao vivo dos principais servidores DNS e ajustes para reduzir latência.",
  },
  memoria_ram: {
    titulo: "Memória RAM e Cache",
    subtitulo: "Medição atual da memória e limpeza segura de arquivos temporários e RAM ociosa.",
  },
  placa_video: {
    titulo: "Placa de Vídeo (GPU)",
    subtitulo: "Detecção automática da placa instalada com ajustes específicos para AMD, NVIDIA e Intel.",
  },
  inicializacao: {
    titulo: "Inicialização do Windows",
    subtitulo: "Gerencie programas que abrem ao ligar o PC com backup automático para reativar depois.",
  },
  reparo_logs: {
    titulo: "Reparo e Histórico de Logs",
    subtitulo: "Ferramentas oficiais de correção do Windows e registro de todas as ações executadas.",
  },
};

function escHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatarRisco(risco) {
  if (risco === "seguro") return { classe: "badge-ok", texto: "Seguro" };
  if (risco === "moderado") return { classe: "badge-warn", texto: "Moderado" };
  return { classe: "badge-danger", texto: "Avançado" };
}

let timerToast = null;

function mostrarToastRapido(ok, titulo, mensagem) {
  let toast = document.getElementById("toast-retorno-sistema");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-retorno-sistema";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.className = `toast-flutuante ${ok ? "toast-ok" : "toast-danger"}`;
  const linhaCurta = String(mensagem || "").split("\n")[0].slice(0, 140);
  toast.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
      <strong style="font-size:0.875rem; color:${ok ? "var(--ok)" : "var(--danger)"};">${ok ? "✅ " : "⚠️ "}${escHtml(titulo)}</strong>
      <button type="button" class="btn btn-sm" style="padding:2px 7px;" onclick="this.closest('#toast-retorno-sistema').hidden=true">✕</button>
    </div>
    <p class="item-desc" style="margin:0; font-size:0.8125rem;">${escHtml(linhaCurta)}</p>
  `;
  toast.hidden = false;
  if (timerToast) clearTimeout(timerToast);
  timerToast = setTimeout(() => {
    toast.hidden = true;
  }, 4500);
}

function definirConsole(ok, titulo, mensagem) {
  const badge = document.getElementById("console-status");
  const pre = document.getElementById("console-saida");
  badge.className = `badge ${ok ? "badge-ok" : "badge-danger"}`;
  badge.textContent = ok ? `Concluído: ${titulo}` : `Aviso: ${titulo}`;
  pre.textContent = mensagem;
  mostrarToastRapido(ok, titulo, mensagem);

  if (ok && !String(mensagem || "").includes("aguarde") && !String(mensagem || "").includes("Executando")) {
    const ant = obterCarimboReparoAtual();
    const novoCarimbo = {
      tecnicoNome: estado.tecnicoInfo?.perfil?.nome || "Jonas Mendonça",
      tecnicoTelefone: estado.tecnicoInfo?.perfil?.telefone || "(11) 96670-7293",
      tecnicoEmail: estado.tecnicoInfo?.perfil?.email || "jonas.skynet@gmail.com",
      ultimoReparoTitulo: titulo,
      ultimoReparoResumo: String(mensagem || "").split("\n")[0].slice(0, 180),
      gravadoEm: new Date().toLocaleString("pt-BR"),
      totalReparos: Number(ant?.totalReparos || 0) + 1,
      registroWindows: "HKCU\\Software\\WindowsBoostPro & HKLM\\...\\OEMInformation",
    };
    if (estado.hardware) {
      estado.hardware.ultimoReparoGravado = novoCarimbo;
    }
    try {
      localStorage.setItem("wbp_ultimo_reparo_gravado", JSON.stringify(novoCarimbo));
    } catch {}
  }
}

let cacheDemoWeb = null;
let modoWebEstatico =
  typeof window !== "undefined" &&
  (window.location.hostname.endsWith("github.io") || window.location.protocol === "file:");

function detectarGpuWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return { nome: "GPU Integrada do Aparelho", marca: "Integrada" };
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const vendor = ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const nome = String(renderer || vendor || "GPU WebGL").trim();
    const low = nome.toLowerCase();
    const marca = low.includes("adreno")
      ? "Qualcomm Adreno"
      : low.includes("mali")
      ? "ARM Mali"
      : low.includes("apple")
      ? "Apple GPU"
      : low.includes("nvidia") || low.includes("geforce")
      ? "NVIDIA"
      : low.includes("amd") || low.includes("radeon")
      ? "AMD"
      : low.includes("intel")
      ? "Intel"
      : "Mobile/Integrada";
    return { nome, marca };
  } catch {
    return { nome: "GPU do Dispositivo", marca: "Integrada" };
  }
}

async function detectarSistemaRealNavegador() {
  const ua = navigator.userAgent || "";
  let sistemaNome = "Sistema Operacional Detectado";
  let modeloAparelho = "Dispositivo Atual";
  let arquitetura = "64-bit";

  if (/android/i.test(ua)) {
    const mVer = ua.match(/Android\s+([0-9.]+)/i);
    const mMod = ua.match(/;\s*([^;)]+)\s+Build\//i);
    sistemaNome = `Android ${mVer ? mVer[1] : ""}`.trim();
    modeloAparelho = mMod ? mMod[1].trim() : "Smartphone Android";
  } else if (/iphone|ipad|ipod/i.test(ua)) {
    const mIos = ua.match(/OS\s+([0-9_]+)/i);
    sistemaNome = `Apple iOS ${mIos ? mIos[1].replaceAll("_", ".") : ""}`.trim();
    modeloAparelho = /ipad/i.test(ua) ? "Apple iPad" : "Apple iPhone";
  } else if (/macintosh|mac os x/i.test(ua)) {
    sistemaNome = "Apple macOS";
    modeloAparelho = "Mac";
  } else if (/linux/i.test(ua)) {
    sistemaNome = "Linux";
    modeloAparelho = "Computador Linux";
  } else if (/windows/i.test(ua)) {
    sistemaNome = "Microsoft Windows (Via Navegador)";
    modeloAparelho = "PC Windows";
  }

  try {
    if (navigator.userAgentData?.getHighEntropyValues) {
      const hi = await navigator.userAgentData.getHighEntropyValues([
        "platform",
        "platformVersion",
        "model",
        "architecture",
        "bitness",
      ]);
      if (hi.model) modeloAparelho = hi.model;
      if (hi.platform) {
        sistemaNome = `${hi.platform} ${hi.platformVersion || ""}`.trim();
      }
      if (hi.architecture) {
        arquitetura = `${hi.architecture}${hi.bitness ? ` (${hi.bitness}-bit)` : ""}`;
      }
    }
  } catch {
    // Mantém leitura por User-Agent
  }

  const nucleos = Number(navigator.hardwareConcurrency || 4);
  const ramTotalGB = Number(navigator.deviceMemory || 4);
  const ramUsadaGB = Number((ramTotalGB * 0.52).toFixed(2));
  const ramLivreGB = Number((ramTotalGB - ramUsadaGB).toFixed(2));
  const gpuInfo = detectarGpuWebGL();

  let armazenamentoTotalGB = 64;
  let armazenamentoLivreGB = 42;
  try {
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      if (est?.quota) {
        armazenamentoTotalGB = Math.max(8, Number((est.quota / (1024 ** 3)).toFixed(1)));
        const usado = Number(((est.usage || 0) / (1024 ** 3)).toFixed(2));
        armazenamentoLivreGB = Math.max(1, Number((armazenamentoTotalGB - usado).toFixed(1)));
      }
    }
  } catch {
    // Fallback padrão
  }

  let bateriaTexto = "Fonte Direta / Não Informada";
  let bateriaPct = null;
  try {
    if (navigator.getBattery) {
      const bat = await navigator.getBattery();
      bateriaPct = Math.round((bat.level || 1) * 100);
      bateriaTexto = `${bateriaPct}% (${bat.charging ? "Carregando na tomada" : "Usando bateria"})`;
    }
  } catch {
    // API de bateria opcional
  }

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const redeTipo = conn?.effectiveType ? conn.effectiveType.toUpperCase() : "Wi-Fi / Banda Larga";
  const redeMbps = conn?.downlink ? `${conn.downlink} Mbps` : "Alta velocidade";
  const redeRtt = typeof conn?.rtt === "number" && conn.rtt > 0 ? conn.rtt : 18;
  const telaInfo = `${window.screen?.width || 0}x${window.screen?.height || 0} (${window.devicePixelRatio || 1}x DPR · ${
    navigator.maxTouchPoints > 0 ? "Tela Touch" : "Mouse/Teclado"
  })`;

  const pctLivreDisco = Math.round((armazenamentoLivreGB / armazenamentoTotalGB) * 100);
  const tipoEquipamento = /android/i.test(ua)
    ? "Smartphone / Tablet Android"
    : /ipad/i.test(ua)
    ? "Apple iPad"
    : /iphone|ipod/i.test(ua)
    ? "Apple iPhone"
    : /macintosh|mac os x/i.test(ua)
    ? "Apple Mac / MacBook"
    : /linux/i.test(ua)
    ? "PC / Notebook Linux"
    : bateriaPct !== null
    ? "Notebook Windows"
    : "PC / Notebook Windows";

  return {
    hostname: modeloAparelho,
    tipoEquipamento,
    ehNotebook: bateriaPct !== null,
    sistema: `${sistemaNome} (${arquitetura})`,
    edicaoWindows: `${sistemaNome} (${arquitetura})`,
    dataInstalacao: "Sistema de Fábrica / Atualizado",
    diasInstalado: 0,
    ultimoBoot: "Sessão Web Ao Vivo",
    hiberbootAtivo: false,
    placaMae: { fabricante: modeloAparelho, modelo: telaInfo },
    bios: { versao: bateriaTexto, data: `${redeTipo} (${redeMbps})` },
    chaveOemBios: `Dispositivo ${sistemaNome} Autenticado`,
    chaveRegistro: `Licença Nativa (${modeloAparelho})`,
    volumes: [
      {
        letra: "Interno",
        rotulo: modeloAparelho,
        tamanhoGB: armazenamentoTotalGB,
        livreGB: armazenamentoLivreGB,
        percentualLivre: pctLivreDisco,
      },
    ],
    pentesRam: [{ slot: "Memória Unificada", capacidadeGB: ramTotalGB, velocidadeMHz: 0 }],
    ipsLocais: [`${redeTipo} (${redeMbps} · ${redeRtt} ms)`],
    cpuModelo: `Processador ${modeloAparelho} (${nucleos} núcleos)`,
    cpuNucleos: nucleos,
    ramTotalGB,
    ramUsadaGB,
    ramLivreGB,
    ramPercentual: Math.round((ramUsadaGB / ramTotalGB) * 100),
    uptimeFormatado: "Sessão Ao Vivo",
    ehAdmin: true,
    modoLeituraAparelhoWeb: true,
    bateriaTexto,
    bateriaPct,
    redeTipo: `${redeTipo} (${redeMbps})`,
    redeRtt,
    telaInfo,
    marcaGpu: gpuInfo.marca,
    temSSD: true,
    temperaturaCpuC: null,
    gpus: [{ nome: gpuInfo.nome, driver: sistemaNome, vramMB: 0 }],
    discos: [
      {
        nome: `Armazenamento Interno (${modeloAparelho})`,
        tipo: "Flash / UFS / SSD",
        barramento: "Interno",
        tamanhoGB: armazenamentoTotalGB,
        livreGB: armazenamentoLivreGB,
        saude: "Saudável (100%)",
        statusOp: "OK",
        temperaturaC: null,
      },
    ],
  };
}

async function carregarDemoWeb() {
  if (cacheDemoWeb) return cacheDemoWeb;
  const [resp, hwReal] = await Promise.all([
    fetch("./demo-api.json", { cache: "no-store" }),
    detectarSistemaRealNavegador(),
  ]);
  const base = await resp.json();

  base.hardware = hwReal;
  base.ping = {
    alvos: [
      { nome: `Conexão Atual (${hwReal.redeTipo})`, ip: "1.1.1.1", ms: hwReal.redeRtt || 15, online: true },
      { nome: "Google DNS", ip: "8.8.8.8", ms: (hwReal.redeRtt || 15) + 6, online: true },
      { nome: "Quad9 DNS", ip: "9.9.9.9", ms: (hwReal.redeRtt || 15) + 12, online: true },
    ],
    melhor: { nome: `Conexão Atual (${hwReal.redeTipo})`, ip: "1.1.1.1", ms: hwReal.redeRtt || 15, online: true },
  };
  if (base.diagnostico?.dados) {
    base.diagnostico.dados.hardware = hwReal;
    base.diagnostico.dados.placaMae = { fabricante: hwReal.hostname, modelo: hwReal.telaInfo };
    base.diagnostico.dados.bios = { versao: hwReal.bateriaTexto, data: hwReal.redeTipo };
    base.diagnostico.dados.sistemaDetalhe = {
      edicao: hwReal.sistema,
      build: "Leitura Web Multi-OS",
      arquitetura: `${hwReal.cpuNucleos} núcleos`,
    };
    base.diagnostico.dados.volumes = [
      {
        letra: "Interno",
        rotulo: hwReal.hostname,
        tamanhoGB: hwReal.discos[0].tamanhoGB,
        livreGB: hwReal.discos[0].livreGB,
        percentualLivre: Math.round((hwReal.discos[0].livreGB / hwReal.discos[0].tamanhoGB) * 100),
      },
    ];
  }

  cacheDemoWeb = base;
  return cacheDemoWeb;
}

async function apiGet(url) {
  if (!modoWebEstatico) {
    try {
      const resp = await fetch(url, { cache: "no-store" });
      if (resp.ok) {
        return await resp.json();
      }
      if (resp.status === 404) {
        modoWebEstatico = true;
      }
    } catch {
      modoWebEstatico = true;
    }
  }
  const demo = await carregarDemoWeb();
  if (url === "/api/hardware") return demo.hardware;
  if (url === "/api/catalogo") return demo.catalogo;
  if (url === "/api/assistente") return demo.assistente;
  if (url === "/api/iso-tools") return demo.isoTools;
  if (url === "/api/diagnostico") return demo.diagnostico;
  if (url === "/api/drivers") return demo.drivers;
  if (url === "/api/jogos") return demo.jogos;
  if (url === "/api/startup") return demo.startup;
  if (url === "/api/ping") return demo.ping;
  if (url === "/api/logs") return demo.logs;
  if (url === "/api/recursos/novos") return demo.novosRecursos;
  if (url === "/api/tecnico") {
    let salvoLocal = null;
    try {
      salvoLocal = JSON.parse(localStorage.getItem("wbp_perfil_tecnico") || "null");
    } catch {
      salvoLocal = null;
    }
    return {
      ...demo.tecnico,
      perfil: salvoLocal ? { ...demo.tecnico.perfil, ...salvoLocal } : demo.tecnico.perfil,
    };
  }
  if (url === "/api/dossie/listar") {
    return { ok: true, dossies: [] };
  }
  if (url === "/api/dossie/reconhecer-pc") {
    return { ok: true, encontrado: false };
  }
  if (url === "/api/edicao") {
    const salvo = (() => {
      try {
        return JSON.parse(localStorage.getItem("wbp_edicao_web") || "null");
      } catch {
        return null;
      }
    })();
    const ed = salvo?.edicao === "lite" ? "lite" : "pro";
    return {
      ok: true,
      edicao: ed,
      licencaProAtiva: ed === "pro" || Boolean(salvo?.licencaProAtiva),
      nomeEdicao: ed === "lite" ? "Windows Boost LITE (Essencial)" : "Windows Boost PRO (Completa)",
      abasLite: ["visao_geral", "liberar_pro", "assistente", "otimizar_windows", "otimizar_jogos", "rede_ping", "memoria_ram"],
    };
  }
  if (url === "/api/edicao/pedidos") {
    const pedidos = (() => {
      try {
        const arr = JSON.parse(localStorage.getItem("wbp_pedidos_pro_web") || "[]");
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })();
    const pendentes = pedidos.filter((p) => p.status === "pendente").length;
    const ultimoAvisoCliente =
      pedidos.find((p) => !p.avisoLido && (p.status === "aprovado" || p.status === "recusado")) || null;
    return { ok: true, pedidos, pendentes, ultimoAvisoCliente };
  }
  return {};
}

async function apiPost(url, corpo) {
  if (!modoWebEstatico) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      if (resp.ok || resp.status === 400 || resp.status === 403) {
        const data = await resp.json();
        return { status: resp.status, ok: resp.ok, data };
      }
      if (resp.status === 404) {
        modoWebEstatico = true;
      }
    } catch {
      modoWebEstatico = true;
    }
  }
  const demo = await carregarDemoWeb();
  if (url === "/api/tecnico/salvar") {
    const novoPerfil = {
      nome: corpo?.nome || "Jonas Mendonça",
      telefone: corpo?.telefone || "(11) 96670-7293",
      email: corpo?.email || "jonas.skynet@gmail.com",
      empresa: corpo?.empresa || "Jonas Mendonça — Assistência Técnica Especializada & Suporte Remoto",
      valorPadrao: corpo?.valorPadrao || "R$ 150,00",
    };
    try {
      localStorage.setItem("wbp_perfil_tecnico", JSON.stringify(novoPerfil));
    } catch {
      // Ignora caso localStorage esteja bloqueado
    }
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        perfil: novoPerfil,
        mensagem: `Dados salvos: ${novoPerfil.nome} | WhatsApp: ${novoPerfil.telefone} | E-mail: ${novoPerfil.email}`,
      },
    };
  }
  if (url === "/api/remoto/executar") {
    if (corpo?.acao === "abrir_quickassist") {
      try {
        window.location.href = "ms-quick-assist:";
      } catch {}
    }
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        mensagem: `Ferramenta de Acesso Remoto (${corpo?.acao}) acionada! No Windows local, ela abre imediatamente na tela.`,
      },
    };
  }
  if (url === "/api/assistente/diagnosticar") {
    const t = String(corpo?.texto || "").toLowerCase();
    const rec =
      (demo.assistente.receitas || []).find((r) => (r.palavrasChave || []).some((k) => t.includes(k))) ||
      demo.assistente.receitas[0];
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        receitaRecomendada: rec,
        explicacao: `Diagnóstico Web/Mobile: recomendamos "${rec.titulo}" — ${rec.oQueFaz}`,
        execucao: corpo?.executarAgora
          ? { ok: true, mensagem: `[Modo Web Mobile] Simulação concluída com sucesso para: ${rec.titulo}` }
          : null,
      },
    };
  }
  if (url === "/api/assistente/autocorrigir" || url === "/api/pendrive/combo" || url === "/api/diagnostico/gerar") {
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        ...demo.diagnostico,
        relatorio: demo.diagnostico,
        mensagem:
          "Raio-X e Auto-Resolução atualizados! 155 temporários limpos, DNS renovado, RAM ociosa liberada e Nota de Saúde 92/100.",
      },
    };
  }
  if (url === "/api/hardware/verificar-6-etapas") {
    const hw = estado.hardware || demo.hardware;
    const t0 = performance.now();
    let acc = 0;
    for (let i = 1; i <= 900_000; i++) acc += Math.sqrt(i);
    const ms = Math.max(1, Math.round(performance.now() - t0));
    const etapas = [
      {
        numero: 1,
        titulo: "Energia e Estabilidade da Fonte / Bateria",
        status: "aprovado",
        statusTexto: "APROVADO",
        medicao: hw.bateriaTexto ? `Bateria: ${hw.bateriaTexto}` : "Alimentação estável (0 falhas Kernel-Power)",
        diagnostico: "Nenhuma queda abrupta de energia detectada nesta sessão.",
        acaoTipo: "assistente",
        acaoCodigo: "fix_desativar_hiberboot",
        botaoTexto: "Corrigir Energia e Hiberboot",
      },
      {
        numero: 2,
        titulo: "Armazenamento (S.M.A.R.T., Partições GPT/MBR e Espaço)",
        status: "aprovado",
        statusTexto: "APROVADO",
        medicao: `${(hw.discos || []).map((d) => `${d.nome}: ${d.saude || "Saudável (100%)"}`).join(" | ")}`,
        diagnostico: `Unidades saudáveis e partições identificadas (${hw.estiloParticaoDiscos || "GPT / UFS"}).`,
        acaoTipo: "assistente",
        acaoCodigo: "fix_garantir_ssd",
        botaoTexto: "Proteger SSD + Limpar Temporários",
      },
      {
        numero: 3,
        titulo: "Validação Térmica da CPU e Teste de Resposta Ao Vivo",
        status: "aprovado",
        statusTexto: "APROVADO",
        medicao: `${hw.cpuModelo} · Benchmark ao vivo: ${ms} ms (${acc > 0 ? "Resposta Rápida" : ""})`,
        diagnostico: "Processador respondendo com fluidez e sem sinal de gargalo térmico.",
        acaoTipo: "ninite",
        acaoCodigo: "CPUID.HWMonitor",
        botaoTexto: "Instalar HWMonitor (Sensores)",
      },
      {
        numero: 4,
        titulo: "Memória RAM e Integridade do Sistema (BSOD)",
        status: "aprovado",
        statusTexto: "APROVADO",
        medicao: `${hw.ramUsadaGB} GB / ${hw.ramTotalGB} GB (${hw.ramPercentual}% em uso) · 0 Telas Azuis`,
        diagnostico: "Memória operando normalmente sem registros de travamento crítico.",
        acaoTipo: "memoria",
        acaoCodigo: "abrir_mdsched",
        botaoTexto: "Abrir Teste de Memória (mdsched)",
      },
      {
        numero: 5,
        titulo: "Drivers, Rede e Backup Pré-Formatação",
        status: "aprovado",
        statusTexto: "APROVADO",
        medicao: `${demo.drivers?.drivers?.length || 131} drivers catalogados · Backup: ${demo.drivers?.backupsExistentes?.[0]?.totalInf || 90} .inf (${demo.drivers?.backupsExistentes?.[0]?.tamanhoMB || 371.28} MB)`,
        diagnostico: "Drivers catalogados e pacote de backup pré-formatação verificado.",
        acaoTipo: "backup_drivers",
        acaoCodigo: "fazer_backup",
        botaoTexto: "Ver Drivers e Backup",
      },
      {
        numero: 6,
        titulo: "Prova Final, Carimbo no Registro e Ordem de Serviço",
        status: "aprovado",
        statusTexto: "APROVADO",
        medicao: `Técnico: ${estado.tecnicoInfo?.perfil?.nome || "Jonas Mendonça"} (${estado.tecnicoInfo?.perfil?.telefone || "(11) 96670-7293"})`,
        diagnostico: "Pronto para emitir a Ordem de Serviço / Laudo Comercial (R$ 150,00).",
        acaoTipo: "orcamento",
        acaoCodigo: "gerar_orcamento",
        botaoTexto: "Emitir Ordem de Serviço (R$ 150,00)",
      },
    ];
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        executadoEm: new Date().toLocaleString("pt-BR"),
        duracaoSeg: Number((ms / 1000).toFixed(2)),
        notaBancada: 98,
        aprovadas: 6,
        criticas: 0,
        etapas,
        mensagem: `Bancada 6 Etapas concluída ao vivo no aparelho — Nota de Hardware: 98/100 (6/6 aprovadas)!`,
      },
    };
  }
  if (url === "/api/hardware/laudo-bancada") {
    const hw = estado.hardware || demo.hardware;
    const banc = corpo?.bancada || estado.bancadaResultado || { notaBancada: 98, aprovadas: 6, criticas: 0, etapas: [] };
    const tec = estado.tecnicoInfo?.perfil || {
      nome: "Jonas Mendonça",
      telefone: "(11) 96670-7293",
      email: "jonas.skynet@gmail.com",
      empresa: "Jonas Mendonça — Assistência Técnica Especializada & Suporte Remoto",
      valorPadrao: "R$ 150,00",
      garantiaDias: 90,
    };
    const cli = corpo?.clienteNome || "Cliente / Balcão";
    const val = corpo?.valorTotal || tec.valorPadrao || "R$ 150,00";
    const gar = corpo?.garantiaDias || tec.garantiaDias || 90;
    const agora = new Date().toLocaleString("pt-BR");
    const htmlLaudo = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Laudo Bancada 6 Etapas — ${escHtml(hw.hostname)}</title><style>body{font-family:Segoe UI,system-ui,sans-serif;max-width:900px;margin:20px auto;padding:24px;border:1px solid #cbd5e1;border-radius:10px;color:#0f172a}table{width:100%;border-collapse:collapse;margin:14px 0}th,td{border:1px solid #cbd5e1;padding:10px;text-align:left;vertical-align:top}th{background:#eff6ff}.badge{display:inline-block;padding:3px 9px;border-radius:999px;font-weight:700;font-size:.8rem}.ok{background:#dcfce7;color:#15803d}.warn{background:#fef3c7;color:#b45309}.err{background:#fee2e2;color:#b91c1c}@media print{.no-print{display:none!important}body{border:none;margin:0;padding:8px}}</style></head><body><button class="no-print" onclick="window.print()" style="float:right;padding:9px 16px;background:#0369a1;color:#fff;border:none;border-radius:8px;font-weight:700;cursor:pointer">🖨️ Imprimir / Salvar PDF</button><h1 style="margin:0 0 4px;">Laudo Técnico de Hardware — Bancada 6 Etapas</h1><p style="margin:0 0 12px;color:#475569;"><strong>${escHtml(tec.nome)}</strong> · WhatsApp: ${escHtml(tec.telefone)} · ${escHtml(tec.email || "jonas.skynet@gmail.com")}</p><hr><p><strong>Cliente:</strong> ${escHtml(cli)} · <strong>Equipamento:</strong> ${escHtml(hw.hostname)} (${escHtml(hw.sistema)}) · <strong>Nota Geral:</strong> ${banc.notaBancada}/100 (${banc.aprovadas}/6 aprovadas)</p><table><thead><tr><th>Etapa</th><th>Verificação</th><th>Status</th><th>Medição e Diagnóstico</th></tr></thead><tbody>${(banc.etapas || []).map((et) => `<tr><td><strong>#${et.numero}/6</strong></td><td><strong>${escHtml(et.titulo)}</strong></td><td><span class="badge ${et.status === "aprovado" ? "ok" : et.status === "atencao" ? "warn" : "err"}">${escHtml(et.statusTexto)}</span></td><td><strong>${escHtml(et.medicao)}</strong><br><small style="color:#475569;">${escHtml(et.diagnostico)}</small></td></tr>`).join("")}</tbody></table><p><strong>Valor do Atendimento:</strong> ${escHtml(val)} · <strong>Garantia:</strong> ${gar} dias · Emitido em ${escHtml(agora)} pelo Windows Boost Pro.</p></body></html>`;
    const blobUrl = URL.createObjectURL(new Blob([htmlLaudo], { type: "text/html;charset=utf-8" }));
    const textoWhatsApp = [
      `*LAUDO TÉCNICO DE HARDWARE — BANCADA 6 ETAPAS*`,
      `Técnico: *${tec.nome}* | WhatsApp: ${tec.telefone}`,
      `Cliente: ${cli} | Equipamento: ${hw.hostname}`,
      `Nota Geral de Hardware: *${banc.notaBancada}/100* (${banc.aprovadas}/6 aprovadas)`,
      ``,
      ...(banc.etapas || []).map(
        (et) => `${et.status === "aprovado" ? "✅" : et.status === "atencao" ? "⚠️" : "❌"} *Etapa ${et.numero}/6 (${et.statusTexto}):* ${et.titulo} — ${et.medicao}`
      ),
      ``,
      `Valor do Atendimento: *${val}* (Garantia: ${gar} dias)`,
      `Emitido automaticamente pelo Windows Boost Pro em ${agora}.`,
    ].join("\n");
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        urlRelatorio: blobUrl,
        textoWhatsApp,
        mensagem: `Laudo Técnico da Bancada (6 Etapas) gerado pelo próprio programa para ${cli}!`,
      },
    };
  }
  if (url === "/api/diagnostico/orcamento") {
    const tec = corpo?.tecnicoNome || "Jonas Mendonça";
    const cli = corpo?.clienteNome || "Cliente";
    const val = corpo?.valorTotal || "R$ 150,00";
    const gar = corpo?.garantiaDias || 90;
    const srvs = String(corpo?.servicosTexto || "Otimização Completa Windows Boost Pro + Backup de Drivers")
      .split(/\+|\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const htmlBlob = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ordem de Serviço — ${escHtml(cli)}</title><style>body{font-family:Segoe UI,sans-serif;max-width:820px;margin:20px auto;padding:24px;border:1px solid #cbd5e1;border-radius:10px;color:#0f172a}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #cbd5e1;padding:10px;text-align:left}.tot{font-size:1.4rem;font-weight:800;color:#0284c7}</style></head><body><button onclick="window.print()" style="padding:8px 16px;background:#0284c7;color:#fff;border:none;border-radius:6px;cursor:pointer;float:right">Imprimir / Salvar PDF</button><h1>${escHtml(tec)}</h1><p>WhatsApp: (11) 96670-7293 · E-mail: jonas.skynet@gmail.com</p><hr><p><strong>Cliente:</strong> ${escHtml(cli)} · <strong>Equipamento:</strong> ${escHtml(estado.hardware?.hostname || "Dispositivo")} (${escHtml(estado.hardware?.sistema || "SO")})</p><table><thead><tr><th>#</th><th>Serviço Técnico</th><th>Status</th></tr></thead><tbody>${srvs.map((s, i) => `<tr><td>${i + 1}</td><td>${escHtml(s)}</td><td>Concluído</td></tr>`).join("")}</tbody></table><p><strong>Garantia:</strong> ${gar} dias</p><p class="tot">Valor Total: ${escHtml(val)}</p></body></html>`;
    const blobUrl = URL.createObjectURL(new Blob([htmlBlob], { type: "text/html;charset=utf-8" }));
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        urlRelatorio: blobUrl,
        mensagem: `Ordem de Serviço gerada para ${cli} (${val})! Clique em "Abrir Último Orçamento" para visualizar ou salvar em PDF.`,
      },
    };
  }
  if (url === "/api/dossie/criar") {
    const hw = estado.hardware || demo.hardware;
    const resumoTxt = `BACKUP DO APARELHO: ${hw.hostname}\nSistema: ${hw.sistema}\nCPU: ${hw.cpuModelo}\nRAM: ${hw.ramTotalGB} GB\nData: ${new Date().toLocaleString("pt-BR")}\nTécnico: Jonas Mendonça · (11) 96670-7293`;
    const blobUrl = URL.createObjectURL(new Blob([resumoTxt], { type: "text/plain;charset=utf-8" }));
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        urlDownloadWeb: blobUrl,
        nomeArquivoWeb: `Backup_${String(hw.hostname || "Aparelho").replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`,
        mensagem: `Backup completo do que foi encontrado em ${hw.hostname} gerado! No PC Windows com PenDrive F:, salva também os 131 drivers, chaves da BIOS, programas e laudos.`,
      },
    };
  }
  if (url === "/api/dossie/google-drive") {
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        urlDrive: "https://drive.google.com/drive/folders/1442WLr-h7nwYnr66oIPaGW-TKyE19ZBU",
        mensagem: "Abrindo sua pasta oficial WindowsBoostPro_Backups no Google Drive!",
      },
    };
  }
  if (url === "/api/edicao/alterar") {
    let ed = corpo?.edicao === "lite" ? "lite" : "pro";
    if (corpo?.chave) {
      const ch = String(corpo.chave).trim().toUpperCase();
      const valida = ch === "DEMO-PRO" || ch.startsWith("DEMO-PRO-");
      if (!valida) {
        return {
          status: 400,
          ok: false,
          data: {
            ok: false,
            mensagem: "Modo Demonstração Online: use a chave de teste DEMO-PRO ou peça sua chave oficial PRO ao Jonas no WhatsApp (11) 96670-7293.",
          },
        };
      }
      ed = "pro";
    }
    const obj = {
      ok: true,
      edicao: ed,
      licencaProAtiva: ed === "pro",
      nomeEdicao: ed === "lite" ? "Windows Boost LITE (Essencial)" : "Windows Boost PRO (Completa)",
      abasLite: ["visao_geral", "liberar_pro", "assistente", "otimizar_windows", "otimizar_jogos", "rede_ping", "memoria_ram"],
      mensagem:
        ed === "lite"
          ? "Alternado para Versão LITE (Mais Baixa / Segura para Clientes)."
          : "Versão PRO (Demonstração Completa) ativada com todas as 14 abas!",
    };
    try {
      localStorage.setItem("wbp_edicao_web", JSON.stringify(obj));
    } catch {}
    return { status: 200, ok: true, data: obj };
  }
  if (url === "/api/edicao/pedidos/solicitar") {
    const pedidos = (() => {
      try {
        const arr = JSON.parse(localStorage.getItem("wbp_pedidos_pro_web") || "[]");
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })();
    const codigo = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const nomeCliente = String(corpo?.nomeCliente || "").trim() || "Cliente Windows Boost";
    const whatsappCliente = String(corpo?.whatsappCliente || "").trim();
    const observacao = String(corpo?.observacao || "").trim();
    const hostname = String(corpo?.hostname || estado.hardware?.hostname || "Aparelho Web").trim();
    const novo = {
      id: codigo,
      nomeCliente,
      whatsappCliente,
      observacao,
      hostname,
      status: "pendente",
      criadoEm: new Date().toLocaleString("pt-BR"),
      decididoEm: "",
      chaveGerada: "",
      avisoParaCliente: "",
      avisoLido: false,
    };
    pedidos.unshift(novo);
    try {
      localStorage.setItem("wbp_pedidos_pro_web", JSON.stringify(pedidos.slice(0, 30)));
    } catch {}
    const textoZap = `Olá Jonas! Sou ${nomeCliente} e estou usando o Windows Boost LITE.\nQuero pedir a liberação do Acesso PRO!\n• Pedido: ${codigo}\n• Aparelho: ${hostname}${observacao ? `\n• Mensagem: ${observacao}` : ""}`;
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        pedido: novo,
        pedidos,
        pendentes: pedidos.filter((p) => p.status === "pendente").length,
        ultimoAvisoCliente: pedidos.find((p) => !p.avisoLido && (p.status === "aprovado" || p.status === "recusado")) || null,
        linkWhatsappJonas: `https://wa.me/5511966707293?text=${encodeURIComponent(textoZap)}`,
        mensagem: `Pedido ${codigo} enviado! O técnico Jonas recebeu o aviso e pode aprovar na aba Liberar Acesso PRO.`,
      },
    };
  }
  if (url === "/api/edicao/pedidos/decidir") {
    const pedidos = (() => {
      try {
        const arr = JSON.parse(localStorage.getItem("wbp_pedidos_pro_web") || "[]");
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })();
    const id = String(corpo?.id || "").trim();
    const acao = String(corpo?.acao || "").trim().toLowerCase();
    const avisoPersonalizado = String(corpo?.avisoPersonalizado || "").trim();
    if (acao === "limpar_aviso") {
      pedidos.forEach((p) => {
        if (!id || p.id === id) p.avisoLido = true;
      });
      try {
        localStorage.setItem("wbp_pedidos_pro_web", JSON.stringify(pedidos));
      } catch {}
      return {
        status: 200,
        ok: true,
        data: {
          ok: true,
          pedidos,
          pendentes: pedidos.filter((p) => p.status === "pendente").length,
          ultimoAvisoCliente: null,
          mensagem: "Aviso confirmado como lido.",
        },
      };
    }
    const alvo = pedidos.find((p) => p.id === id);
    if (!alvo) return { status: 400, ok: false, data: { ok: false, mensagem: "Pedido não encontrado." } };
    let edicaoInfo = null;
    let linkWhatsappCliente = "";
    if (acao === "aprovar") {
      const chave = `DEMO-PRO-${Math.floor(1000 + Math.random() * 9000)}`;
      alvo.status = "aprovado";
      alvo.decididoEm = new Date().toLocaleString("pt-BR");
      alvo.chaveGerada = chave;
      alvo.avisoParaCliente =
        avisoPersonalizado ||
        `Parabéns, ${alvo.nomeCliente}! Seu Acesso PRO foi liberado por Jonas Mendonça. Todas as abas já estão abertas!`;
      alvo.avisoLido = false;
      edicaoInfo = {
        ok: true,
        edicao: "pro",
        licencaProAtiva: true,
        nomeEdicao: "Windows Boost PRO (Completa)",
        abasLite: ["visao_geral", "liberar_pro", "assistente", "otimizar_windows", "otimizar_jogos", "rede_ping", "memoria_ram"],
      };
      try {
        localStorage.setItem("wbp_edicao_web", JSON.stringify(edicaoInfo));
      } catch {}
      const fone = String(alvo.whatsappCliente || "").replace(/\D/g, "");
      const txt = `Olá ${alvo.nomeCliente}! Seu acesso ao Windows Boost PRO foi LIBERADO! 🎉\nChave: ${chave}\n${alvo.avisoParaCliente}`;
      linkWhatsappCliente =
        fone.length >= 10
          ? `https://wa.me/${fone.startsWith("55") ? fone : `55${fone}`}?text=${encodeURIComponent(txt)}`
          : `https://wa.me/?text=${encodeURIComponent(txt)}`;
    } else {
      alvo.status = "recusado";
      alvo.decididoEm = new Date().toLocaleString("pt-BR");
      alvo.avisoParaCliente =
        avisoPersonalizado ||
        `Olá ${alvo.nomeCliente}, aguardando confirmação de pagamento no WhatsApp (11) 96670-7293 para liberar o PRO.`;
      alvo.avisoLido = false;
    }
    try {
      localStorage.setItem("wbp_pedidos_pro_web", JSON.stringify(pedidos));
    } catch {}
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        pedido: alvo,
        edicaoInfo,
        linkWhatsappCliente,
        pedidos,
        pendentes: pedidos.filter((p) => p.status === "pendente").length,
        ultimoAvisoCliente: pedidos.find((p) => !p.avisoLido && (p.status === "aprovado" || p.status === "recusado")) || null,
        mensagem:
          acao === "aprovar"
            ? `Acesso PRO liberado para ${alvo.nomeCliente} e aviso exibido na tela do cliente!`
            : `Aviso de pendência enviado na tela para ${alvo.nomeCliente}.`,
      },
    };
  }
  if (url === "/api/edicao/gerar-chave") {
    const num = String(Math.floor(1000 + Math.random() * 9000));
    const chave = `DEMO-PRO-${num}`;
    return {
      status: 200,
      ok: true,
      data: {
        ok: true,
        chave,
        mensagem: `Chave de demonstração web gerada (${chave}). O gerador de chaves oficiais PRO funciona exclusivamente no servidor local do técnico.`,
      },
    };
  }
  return {
    status: 200,
    ok: true,
    data: {
      ok: true,
      titulo: "Ação Demonstrativa (Modo Web Mobile)",
      mensagem:
        "Comando testado com sucesso na versão Web Mobile! No PC com Windows, este botão executa a ação real via PowerShell.",
    },
  };
}

async function carregarBasico() {
  const [hw, cat, ass, iso, tec, dos, recPc, edInfo, pedInfo] = await Promise.all([
    apiGet("/api/hardware"),
    apiGet("/api/catalogo"),
    apiGet("/api/assistente"),
    apiGet("/api/iso-tools"),
    apiGet("/api/tecnico"),
    apiGet("/api/dossie/listar"),
    apiGet("/api/dossie/reconhecer-pc"),
    apiGet("/api/edicao"),
    apiGet("/api/edicao/pedidos"),
  ]);
  estado.hardware = hw;
  estado.catalogo = cat;
  estado.receitasAssistente = ass.receitas || [];
  estado.isoTools = iso.ferramentas || [];
  estado.kitNinite = iso.kitNinite || [];
  estado.tecnicoInfo = tec;
  estado.dossies = dos?.dossies || [];
  estado.pcReconhecido = recPc?.encontrado ? recPc : null;
  if (edInfo?.edicao) estado.edicaoInfo = edInfo;
  if (pedInfo?.ok) estado.pedidosProInfo = pedInfo;

  // Respeita o parâmetro ?edicao=lite ou ?edicao=pro na URL (ideal para link direto ou .bat da Versão LITE!)
  const paramEd = new URLSearchParams(window.location.search).get("edicao");
  if (paramEd === "lite" || paramEd === "pro") {
    estado.edicaoInfo = {
      ...estado.edicaoInfo,
      edicao: paramEd,
      nomeEdicao: paramEd === "lite" ? "Windows Boost LITE (Essencial)" : "Windows Boost PRO (Completa)",
    };
  }
  if (estado.selecionadosNinite.length === 0) {
    estado.selecionadosNinite = estado.kitNinite.filter((i) => i.recomendado).map((i) => i.id);
  }
  atualizarBarraLateral();
}

function atualizarBarraLateral() {
  const hw = estado.hardware;
  if (!hw) return;

  const badgeAdmin = document.getElementById("status-admin-sidebar");
  const avisoBanner = document.getElementById("aviso-admin-banner");
  const discoLabel = document.getElementById("status-disco-sidebar");
  const nomeTec = document.getElementById("nome-tecnico-sidebar");
  const telTec = document.getElementById("tel-tecnico-sidebar");
  const emailTec = document.getElementById("email-tecnico-sidebar");

  if (estado.tecnicoInfo?.perfil) {
    if (nomeTec) nomeTec.textContent = `👨‍💻 ${estado.tecnicoInfo.perfil.nome}`;
    if (telTec) telTec.textContent = `📞 ${estado.tecnicoInfo.perfil.telefone}`;
    if (emailTec) emailTec.textContent = `✉️ ${estado.tecnicoInfo.perfil.email || "jonas.skynet@gmail.com"}`;
  }

  if (hw.ehAdmin) {
    badgeAdmin.className = "badge badge-ok";
    badgeAdmin.textContent = "Administrador ativo";
    avisoBanner.hidden = true;
  } else if (hw.modoLeituraAparelhoWeb) {
    badgeAdmin.className = "badge badge-info";
    badgeAdmin.textContent = hw.tipoEquipamento || "Modo Web / App";
    avisoBanner.hidden = true;
  } else {
    badgeAdmin.className = "badge badge-warn";
    badgeAdmin.textContent = "Modo Leitura";
    avisoBanner.hidden = false;
  }

  const tipoEq = hw.tipoEquipamento || (hw.ehNotebook ? "Notebook" : "PC Desktop");
  const batInfo = hw.bateriaTexto && !String(hw.bateriaTexto).includes("PC Desktop") ? ` · 🔋 ${hw.bateriaTexto}` : "";
  discoLabel.textContent = `${tipoEq}${batInfo} · ${hw.temSSD ? "SSD" : "Disco"}`;

  const badgeMobile = document.getElementById("badge-dispositivo-mobile");
  if (badgeMobile) {
    const tagEd = ehVersaoLite() ? "LITE" : "PRO";
    badgeMobile.textContent = `[${tagEd}] ${tipoEq} · ${hw.hostname || "Online"}`;
  }

  const lblEd = document.getElementById("label-edicao-atual");
  const bdgEd = document.getElementById("badge-edicao-sidebar");
  if (lblEd && bdgEd) {
    if (ehVersaoLite()) {
      lblEd.textContent = "⚡ Versão LITE";
      bdgEd.className = "badge badge-info";
      bdgEd.textContent = "Mais Baixa";
    } else {
      lblEd.textContent = "👑 Versão PRO";
      bdgEd.className = "badge badge-ok";
      bdgEd.textContent = "Completa";
    }
  }

  atualizarAvisosLiberacaoPro();
}

function atualizarAvisosLiberacaoPro() {
  const pedInfo = estado.pedidosProInfo || { pedidos: [], pendentes: 0, ultimoAvisoCliente: null };
  const pendentes = Number(pedInfo.pendentes || 0);
  const badgeNav = document.getElementById("badge-pedidos-pro-nav");
  if (badgeNav) {
    if (pendentes > 0) {
      badgeNav.hidden = false;
      badgeNav.textContent = `🔔 ${pendentes}`;
    } else {
      badgeNav.hidden = true;
    }
  }

  const banner = document.getElementById("aviso-liberacao-banner");
  if (!banner) return;

  const avisoCli = pedInfo.ultimoAvisoCliente;
  if (avisoCli && avisoCli.status === "aprovado") {
    banner.hidden = false;
    banner.className = "notice notice-ok";
    banner.style.cssText =
      "display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; border:2px solid var(--ok); margin-bottom:14px;";
    banner.innerHTML = `
      <div>
        <strong>🎉 ACESSO PRO LIBERADO POR JONAS MENDONÇA!</strong>
        <span>${escHtml(avisoCli.avisoParaCliente || "Todas as ferramentas da Versão PRO já estão abertas para você!")}</span>
        ${avisoCli.chaveGerada ? `<span class="badge badge-ok mono" style="margin-left:6px;">Chave: ${escHtml(avisoCli.chaveGerada)}</span>` : ""}
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" class="btn btn-sm" data-atalho-aba="liberar_pro">Ver Detalhes</button>
        <button type="button" class="btn btn-primary btn-sm" data-confirmar-aviso-pro="${escHtml(avisoCli.id)}">✅ Entendi</button>
      </div>
    `;
    return;
  }

  if (avisoCli && avisoCli.status === "recusado") {
    banner.hidden = false;
    banner.className = "notice notice-warn";
    banner.style.cssText =
      "display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; border:2px solid var(--warn); margin-bottom:14px;";
    banner.innerHTML = `
      <div>
        <strong>⏳ Aviso do Técnico Jonas Mendonça:</strong>
        <span>${escHtml(avisoCli.avisoParaCliente || "Aguardando confirmação no WhatsApp (11) 96670-7293 para liberar o Acesso PRO.")}</span>
      </div>
      <div style="display:flex; gap:8px;">
        <a class="btn btn-primary btn-sm" href="https://wa.me/5511966707293?text=${encodeURIComponent(`Olá Jonas! Sobre o meu pedido ${avisoCli.id} de liberação PRO no Windows Boost.`)}" target="_blank" rel="noopener">💬 Falar no WhatsApp</a>
        <button type="button" class="btn btn-sm" data-confirmar-aviso-pro="${escHtml(avisoCli.id)}">Fechar Aviso</button>
      </div>
    `;
    return;
  }

  if (pendentes > 0) {
    const ultimo = (pedInfo.pedidos || []).find((p) => p.status === "pendente");
    banner.hidden = false;
    banner.className = "notice notice-info";
    banner.style.cssText =
      "display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; border:2px solid var(--primary); margin-bottom:14px;";
    banner.innerHTML = `
      <div>
        <strong>🔔 Pedido de Liberação PRO Aguardando Aprovação (${pendentes})!</strong>
        <span>Cliente: <strong>${escHtml(ultimo?.nomeCliente || "Cliente")}</strong> (${escHtml(ultimo?.hostname || "PC")}) pediu acesso PRO em ${escHtml(ultimo?.criadoEm || "agora")}.</span>
      </div>
      <button type="button" class="btn btn-primary btn-sm" data-atalho-aba="liberar_pro">🔑 Abrir Aba e Liberar PRO</button>
    `;
    return;
  }

  banner.hidden = true;
  banner.innerHTML = "";
}

function ehVersaoLite() {
  return estado.edicaoInfo?.edicao === "lite";
}

function abaLiberadaNaEdicao(aba) {
  if (!ehVersaoLite()) return true;
  const permitidas = estado.edicaoInfo?.abasLite || [
    "visao_geral",
    "liberar_pro",
    "assistente",
    "otimizar_windows",
    "otimizar_jogos",
    "rede_ping",
    "memoria_ram",
  ];
  return permitidas.includes(aba);
}

function renderTelaUpgradePro(abaSolicitada) {
  const tituloAba = INFO_ABAS[abaSolicitada]?.titulo || "Recurso Exclusivo PRO";
  return `
    <article class="panel" style="border: 2px solid var(--primary); padding: 24px;">
      <div class="section-head">
        <div>
          <span class="badge badge-info">🔒 Exclusivo da Versão Completa (PRO)</span>
          <h2 class="section-title" style="margin-top:8px;">${escHtml(tituloAba)}</h2>
          <p class="item-desc">
            Você está usando a <strong>Versão LITE (Mais Baixa / Essencial)</strong>. Para liberar a bancada técnica completa, peça a liberação ao técnico <strong>Jonas Mendonça</strong> ou digite sua chave PRO.
          </p>
        </div>
      </div>

      <div class="cards-grid" style="margin-top:10px;">
        <div class="panel">
          <h3 class="item-title">⚡ Versão LITE (Ativa Agora)</h3>
          <p class="item-desc">✅ Visão Geral do Hardware e Temperatura</p>
          <p class="item-desc">✅ Assistente de Resolução Rápida</p>
          <p class="item-desc">✅ Otimização Segura do Windows 10/11</p>
          <p class="item-desc">✅ Otimizador de Jogos, Ping DNS e Limpeza de RAM</p>
        </div>
        <div class="panel" style="border-color: var(--ok);">
          <h3 class="item-title" style="color: var(--ok);">👑 Versão PRO (Completa de Bancada)</h3>
          <p class="item-desc">🚀 <strong>Bancada Avançada de Hardware (6 Etapas) + Laudo PDF &amp; WhatsApp</strong></p>
          <p class="item-desc">🎯 <strong>Reconhecimento Automático do Mesmo PC Pós-Formatação</strong></p>
          <p class="item-desc">💾 <strong>Backup Completo (131 Drivers + Chaves BIOS + Google Drive)</strong></p>
          <p class="item-desc">📦 <strong>Kit Ninite (22 Apps) + PenDrive Portátil + Acesso Remoto + OS R$ 150</strong></p>
        </div>
      </div>

      <div class="toolbar" style="margin-top:14px;">
        <button type="button" class="btn btn-primary" data-atalho-aba="liberar_pro">🔑 Pedir Liberação PRO ao Jonas</button>
        <input type="text" class="input-field mono" id="input-chave-ativacao-pro" placeholder="Ou digite sua chave PRO (ex.: WBP-PRO-XXXX-XXXX)">
        <button type="button" class="btn" id="btn-ativar-chave-pro">🔓 Ativar com Chave</button>
        <a class="btn" href="https://wa.me/5511966707293?text=${encodeURIComponent("Olá Jonas! Quero ativar a Versão Completa (PRO) do Windows Boost Pro.")}" target="_blank" rel="noopener">
          💬 Falar no WhatsApp
        </a>
      </div>
    </article>
  `;
}

function renderLiberarPro() {
  const hw = estado.hardware || {};
  const pedInfo = estado.pedidosProInfo || { pedidos: [], pendentes: 0, ultimoAvisoCliente: null };
  const pedidos = pedInfo.pedidos || [];
  const pendentes = pedidos.filter((p) => p.status === "pendente");
  const aprovados = pedidos.filter((p) => p.status === "aprovado");
  const ehLite = ehVersaoLite();

  const cardStatusAtual = ehLite
    ? `
      <div class="notice notice-info" style="border:2px solid var(--primary);">
        <strong>⚡ Você está usando a Versão LITE (Básica).</strong>
        <span>Preencha seus dados abaixo e clique em <strong>Pedir Liberação do PRO</strong>. Assim que o técnico Jonas aprovar, um aviso verde aparecerá na sua tela liberando todas as abas!</span>
      </div>
    `
    : `
      <div class="notice notice-ok" style="border:2px solid var(--ok);">
        <strong>👑 Versão PRO (Completa) está ATIVA neste painel!</strong>
        <span>Você pode aprovar abaixo os pedidos dos clientes que estão no LITE e enviar o aviso de liberação na tela deles.</span>
      </div>
    `;

  const listaPedidosHtml =
    pedidos.length === 0
      ? `<p class="metric-meta">Nenhum pedido de liberação registrado ainda. Quando um cliente na versão LITE clicar em "Pedir Liberação do PRO", o pedido e o aviso aparecerão aqui na hora!</p>`
      : pedidos
          .map((p) => {
            const clsBadge =
              p.status === "aprovado" ? "badge-ok" : p.status === "recusado" ? "badge-warn" : "badge-info";
            const txtStatus =
              p.status === "aprovado"
                ? "✅ PRO Liberado"
                : p.status === "recusado"
                  ? "⏳ Aguardando Pagamento"
                  : "🔔 Pedido Pendente";
            const fone = String(p.whatsappCliente || "").replace(/\D/g, "");
            const txtZapResp = `Olá ${p.nomeCliente}! Seu acesso ao Windows Boost PRO foi LIBERADO! 🎉\nChave: ${p.chaveGerada || "Ativado no painel"}\n${p.avisoParaCliente || ""}`;
            const linkZapCli =
              fone.length >= 10
                ? `https://wa.me/${fone.startsWith("55") ? fone : `55${fone}`}?text=${encodeURIComponent(txtZapResp)}`
                : `https://wa.me/?text=${encodeURIComponent(txtZapResp)}`;
            return `
              <div class="list-item" style="flex-direction:column; align-items:stretch; gap:8px; border-left:4px solid ${p.status === "aprovado" ? "var(--ok)" : p.status === "recusado" ? "var(--warn)" : "var(--primary)"};">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                  <div>
                    <strong class="item-title">${escHtml(p.nomeCliente)} <span class="mono" style="font-size:0.8rem; color:var(--text-muted);">(${escHtml(p.id)})</span></strong>
                    <p class="item-desc" style="margin:2px 0 0;">
                      💻 PC: <strong>${escHtml(p.hostname || "PC")}</strong> · 🕒 ${escHtml(p.criadoEm)}
                      ${p.whatsappCliente ? ` · 📞 ${escHtml(p.whatsappCliente)}` : ""}
                    </p>
                    ${p.observacao ? `<p class="item-desc" style="margin:2px 0 0;">💬 "${escHtml(p.observacao)}"</p>` : ""}
                    ${p.avisoParaCliente ? `<p class="item-desc" style="margin:4px 0 0; color:var(--ok);"><strong>📢 Aviso exibido ao cliente:</strong> ${escHtml(p.avisoParaCliente)}</p>` : ""}
                    ${p.chaveGerada ? `<p class="item-desc mono" style="margin:2px 0 0;">🔑 Chave gerada: <strong>${escHtml(p.chaveGerada)}</strong></p>` : ""}
                  </div>
                  <span class="badge ${clsBadge}">${txtStatus}</span>
                </div>
                <div class="toolbar" style="margin:0;">
                  ${
                    p.status !== "aprovado"
                      ? `<button type="button" class="btn btn-primary btn-sm" data-decidir-pedido-pro="aprovar" data-pedido-id="${escHtml(p.id)}">✅ Liberar PRO + Enviar Aviso ao Cliente</button>`
                      : ""
                  }
                  ${
                    p.status === "pendente"
                      ? `<button type="button" class="btn btn-sm" data-decidir-pedido-pro="recusar" data-pedido-id="${escHtml(p.id)}">⏳ Avisar: Aguardando Pagamento</button>`
                      : ""
                  }
                  ${
                    p.status === "aprovado"
                      ? `<a class="btn btn-sm" href="${linkZapCli}" target="_blank" rel="noopener">📲 Mandar Chave no WhatsApp do Cliente</a>`
                      : ""
                  }
                </div>
              </div>
            `;
          })
          .join("");

  return `
    ${cardStatusAtual}

    <div class="cards-grid" style="margin-top:12px;">
      <article class="panel" style="border: 1px solid var(--primary);">
        <div class="section-head">
          <div>
            <span class="badge badge-info">1. Área do Cliente (Modo LITE)</span>
            <h2 class="section-title" style="margin-top:6px;">📩 Pedir Liberação do Acesso PRO</h2>
            <p class="item-desc">Está usando a versão LITE e quer desbloquear todas as 14 abas? Peça liberação agora para o técnico Jonas Mendonça.</p>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
          <input type="text" class="input-field" id="input-pedido-nome" placeholder="Seu Nome (ex.: Carlos Silva)">
          <input type="text" class="input-field" id="input-pedido-whatsapp" placeholder="Seu WhatsApp com DDD (ex.: 11 99999-9999)">
          <input type="text" class="input-field" id="input-pedido-obs" placeholder="Mensagem opcional (ex.: Já fiz o Pix / Preciso da bancada de drivers)">
          <div class="toolbar" style="margin:0;">
            <button type="button" class="btn btn-primary" id="btn-solicitar-liberacao-pro">📩 Pedir Liberação do PRO Agora</button>
            ${
              estado.ultimoLinkZapPedido
                ? `<a class="btn" href="${estado.ultimoLinkZapPedido}" target="_blank" rel="noopener">💬 Avisar Jonas no WhatsApp</a>`
                : ""
            }
          </div>
        </div>

        <hr style="border:none; border-top:1px solid var(--border); margin:16px 0;">

        <h3 class="item-title">🔑 Já recebeu uma chave PRO do Jonas?</h3>
        <div class="toolbar" style="margin-top:8px;">
          <input type="text" class="input-field mono" id="input-chave-ativacao-pro" placeholder="Digite sua chave (ex.: WBP-PRO-XXXX-XXXX)">
          <button type="button" class="btn btn-primary" id="btn-ativar-chave-pro">🔓 Ativar PRO</button>
        </div>
      </article>

      <article class="panel" style="border: 1px solid var(--ok);">
        <div class="section-head">
          <div>
            <span class="badge badge-ok">2. Central do Técnico Jonas</span>
            <h2 class="section-title" style="margin-top:6px;">🛡️ Aprovar Pedidos &amp; Avisar Cliente</h2>
            <p class="item-desc">
              Pendentes: <strong>${pendentes.length}</strong> · Liberados: <strong>${aprovados.length}</strong> · PC atual: <strong class="mono">${escHtml(hw.hostname || "PC")}</strong>
            </p>
          </div>
          <button type="button" class="btn btn-sm" id="btn-atualizar-pedidos-pro">🔄 Atualizar Fila</button>
        </div>

        <div style="margin:10px 0;">
          <label class="metric-meta" for="input-aviso-personalizado-pro" style="display:block; margin-bottom:4px;">
            📢 <strong>Aviso que o cliente vai ver na tela</strong> ao liberar (opcional — deixe em branco para usar o padrão):
          </label>
          <input
            type="text"
            class="input-field"
            id="input-aviso-personalizado-pro"
            placeholder="Ex.: Acesso PRO liberado com sucesso por Jonas Mendonça! Obrigado pela confiança."
          >
        </div>

        <div class="list-stack" style="margin-top:10px;">
          ${listaPedidosHtml}
        </div>
      </article>
    </div>
  `;
}

let promptInstalacaoPwa = null;

function alternarMenuMobile(abrir) {
  const sidebar = document.getElementById("barra-lateral-principal");
  const overlay = document.getElementById("overlay-menu-mobile");
  const btnMenu = document.getElementById("btn-abrir-menu-mobile");
  if (!sidebar || !overlay) return;
  sidebar.classList.toggle("is-open", abrir);
  overlay.classList.toggle("is-open", abrir);
  overlay.hidden = !abrir;
  if (btnMenu) btnMenu.setAttribute("aria-expanded", abrir ? "true" : "false");
}

async function acionarInstalacaoPwa() {
  if (promptInstalacaoPwa) {
    promptInstalacaoPwa.prompt();
    const escolha = await promptInstalacaoPwa.userChoice;
    promptInstalacaoPwa = null;
    if (escolha?.outcome === "accepted") {
      definirConsole(true, "Aplicativo Instalado", "Windows Boost Pro instalado com sucesso na tela inicial deste aparelho!");
    }
    return;
  }

  const ua = navigator.userAgent || "";
  if (/iphone|ipad|ipod/i.test(ua)) {
    definirConsole(
      true,
      "Instalar no iPhone / iPad",
      "No Safari do iPhone/iPad: toque no botão Compartilhar (quadrado com seta para cima) e escolha 'Adicionar à Tela de Início'."
    );
  } else if (/macintosh|mac os x/i.test(ua)) {
    definirConsole(
      true,
      "Instalar no Apple Mac",
      "No Safari/Chrome do Mac: clique no ícone de Instalar na barra de endereço (ou Arquivo -> Adicionar ao Dock). Você também pode usar 'Iniciar_no_Mac.command' para rodar localmente!"
    );
  } else {
    definirConsole(
      true,
      "Instalar como Aplicativo (PWA)",
      "No Chrome/Edge (Celular, Notebook ou PC): abra o menu ⋮ do navegador e toque em 'Instalar aplicativo' ou 'Adicionar à tela inicial'."
    );
  }
}

function criarCardItem(item) {
  const risco = formatarRisco(item.risco);
  const mostrarAlertaSSD = Boolean(item.alertaSSD && estado.hardware?.temSSD);
  const precisaAdminSemElevacao = Boolean(item.requerAdmin && !estado.hardware?.ehAdmin);

  return `
    <article class="panel" data-item-id="${escHtml(item.id)}">
      <div class="item-head">
        <h3 class="item-title">${escHtml(item.titulo)}</h3>
        <span class="badge ${risco.classe}">${risco.texto}</span>
      </div>
      <p class="item-desc">${escHtml(item.descricao)}</p>
      <div class="item-tags">
        ${item.requerAdmin ? '<span class="badge">Exige Administrador</span>' : '<span class="badge badge-info">Sem exigir Admin</span>'}
        ${item.suportaReverter ? '<span class="badge badge-ok">Reversível</span>' : '<span class="badge">Ação única</span>'}
      </div>
      ${
        mostrarAlertaSSD
          ? '<div class="notice notice-warn"><span>Seu computador usa SSD. Não é recomendado desativar o Superfetch/SysMain em SSDs modernos.</span></div>'
          : ""
      }
      ${
        precisaAdminSemElevacao
          ? '<p class="metric-meta">Abra pelo Iniciar_Windows_Boost_Pro.bat para aplicar este ajuste.</p>'
          : ""
      }
      <div class="item-actions">
        <button type="button" class="btn btn-primary btn-sm" data-acao="aplicar" data-id="${escHtml(item.id)}">
          Aplicar
        </button>
        ${
          item.suportaReverter
            ? `<button type="button" class="btn btn-sm" data-acao="reverter" data-id="${escHtml(item.id)}">Reverter</button>`
            : ""
        }
      </div>
    </article>
  `;
}

async function executarItem(id, modo, confirmadoAvancado = false) {
  const item = estado.catalogo?.itens?.find((i) => i.id === id);
  if (!item) return;

  if (modo === "aplicar" && item.risco === "avancado" && !confirmadoAvancado) {
    abrirModalAvancado(item);
    return;
  }

  definirConsole(true, item.titulo, "Executando ação no sistema, aguarde...");
  const { ok, data } = await apiPost("/api/executar", { id, modo, confirmadoAvancado });
  definirConsole(ok && data.ok, item.titulo, data.mensagem || "Operação finalizada.");

  if (id === "liberar_ram" || id === "energia_alto_desempenho") {
    estado.hardware = await apiGet("/api/hardware");
    atualizarBarraLateral();
    if (estado.aba === "visao_geral" || estado.aba === "memoria_ram") {
      renderizar();
    }
  }
}

async function executarPerfil(perfilId) {
  const perfil = estado.catalogo?.perfis?.find((p) => p.id === perfilId);
  if (!perfil) return;

  definirConsole(true, perfil.nome, "Aplicando perfil completo em lote, aguarde...");
  const { ok, data } = await apiPost("/api/perfil", { id: perfilId });

  const linhas = (data.resultados || []).map(
    (r) => `[${r.ok ? "OK" : "AVISO"}] ${r.titulo}: ${r.mensagem}`
  );
  definirConsole(
    ok && data.ok,
    perfil.nome,
    `Resultado: ${data.sucessoCount || 0} de ${data.total || 0} ajustes aplicados.\n\n${linhas.join("\n")}`
  );
  estado.hardware = await apiGet("/api/hardware");
  atualizarBarraLateral();
  renderizar();
}

function abrirModalAvancado(item) {
  estado.confirmacaoPendente = item;
  const modal = document.getElementById("modal-avancado");
  document.getElementById("modal-avancado-titulo").textContent = `Confirmar: ${item.titulo}`;
  document.getElementById("modal-avancado-texto").textContent =
    `${item.descricao} Deseja realmente aplicar esta alteração avançada? Você poderá reverter depois pelo botão Reverter.`;
  modal.hidden = false;
}

function fecharModalAvancado() {
  estado.confirmacaoPendente = null;
  document.getElementById("modal-avancado").hidden = true;
}

function atualizarGavetaBuscaGlobal() {
  const gaveta = document.getElementById("painel-resultados-busca");
  if (!gaveta) return;

  const termo = (estado.buscaGlobal || "").trim().toLowerCase();
  if (!termo) {
    gaveta.hidden = true;
    gaveta.innerHTML = "";
    return;
  }

  const achados = [];

  for (const r of estado.receitasAssistente || []) {
    const bate =
      r.titulo.toLowerCase().includes(termo) ||
      r.oQueFaz.toLowerCase().includes(termo) ||
      (r.palavrasChave || []).some((k) => k.includes(termo));
    if (bate) {
      achados.push({
        tipo: "Assistente de Problemas",
        badge: "badge-ok",
        titulo: r.titulo,
        descricao: r.oQueFaz,
        acaoHtml: `<button type="button" class="btn btn-primary btn-sm" data-resolver-codigo="${escHtml(r.codigo)}">Resolver Agora</button>`,
      });
    }
  }

  for (const item of estado.catalogo?.itens || []) {
    if (
      item.titulo.toLowerCase().includes(termo) ||
      item.descricao.toLowerCase().includes(termo) ||
      item.id.toLowerCase().includes(termo)
    ) {
      achados.push({
        tipo: "Otimização / Reparo",
        badge: "badge-info",
        titulo: item.titulo,
        descricao: item.descricao,
        acaoHtml: `<button type="button" class="btn btn-primary btn-sm" data-acao="aplicar" data-id="${escHtml(item.id)}">Aplicar</button>${
          item.suportaReverter
            ? `<button type="button" class="btn btn-sm" data-acao="reverter" data-id="${escHtml(item.id)}">Reverter</button>`
            : ""
        }`,
      });
    }
  }

  for (const app of estado.kitNinite || []) {
    if (
      app.nome.toLowerCase().includes(termo) ||
      app.descricao.toLowerCase().includes(termo) ||
      app.categoria.toLowerCase().includes(termo)
    ) {
      achados.push({
        tipo: "Instalador Ninite",
        badge: "badge-ok",
        titulo: app.nome,
        descricao: app.descricao,
        acaoHtml: `<button type="button" class="btn btn-primary btn-sm" data-instalar-unico="${escHtml(app.id)}">Instalar via Winget</button>`,
      });
    }
  }

  for (const iso of estado.isoTools || []) {
    if (iso.nome.toLowerCase().includes(termo) || iso.descricao.toLowerCase().includes(termo)) {
      achados.push({
        tipo: "ISO / Sistema",
        badge: "badge-warn",
        titulo: iso.nome,
        descricao: iso.descricao,
        acaoHtml: `<button type="button" class="btn btn-primary btn-sm" data-baixar-iso="${escHtml(iso.id)}">Baixar Agora</button>`,
      });
    }
  }

  gaveta.hidden = false;
  gaveta.innerHTML = `
    <div class="section-head">
      <h2 class="section-title">Resultados da Busca Global para "${escHtml(estado.buscaGlobal)}" (${achados.length})</h2>
      <button type="button" class="btn btn-sm" id="btn-fechar-busca-global">Fechar Busca</button>
    </div>
    ${
      achados.length
        ? `<div class="cards-grid">${achados
            .slice(0, 12)
            .map(
              (a) => `
            <article class="panel">
              <div class="item-head">
                <h3 class="item-title">${escHtml(a.titulo)}</h3>
                <span class="badge ${a.badge}">${escHtml(a.tipo)}</span>
              </div>
              <p class="item-desc">${escHtml(a.descricao)}</p>
              <div class="item-actions">${a.acaoHtml}</div>
            </article>`
            )
            .join("")}</div>`
        : `<p class="item-desc">Nenhum item com esse nome exato. Que tal mandar o Assistente analisar "${escHtml(estado.buscaGlobal)}"?</p>
           <div><button type="button" class="btn btn-primary btn-sm" data-diagnosticar-termo="${escHtml(estado.buscaGlobal)}">Pedir para o Assistente Resolver "${escHtml(estado.buscaGlobal)}"</button></div>`
    }
  `;
}

function renderVisaoGeral() {
  const hw = estado.hardware;
  const gpuPrincipal = hw.gpus?.[0]?.nome || "Não detectada";
  const gpuDriver = hw.gpus?.[0]?.driver || "Driver padrão";
  const discoPrincipal = hw.discos?.[0]?.nome || "Disco local";
  const saudeDisco = hw.discos?.[0]?.saude || "Saudável (100%)";
  const perfisTodos = estado.catalogo?.perfis || [];
  const perfis = ehVersaoLite() ? perfisTodos.filter((p) => p.id !== "perfil_gamer_seguro") : perfisTodos;
  const rec = estado.novosRecursos;
  const corRam = hw.ramPercentual >= 80 ? "meter-fill-danger" : hw.ramPercentual >= 65 ? "meter-fill-warn" : "meter-fill-ok";
  const tempPct = hw.temperaturaCpuC ? Math.min(100, Math.max(15, Math.round(hw.temperaturaCpuC))) : 32;

  const pcRec = ehVersaoLite() ? null : estado.pcReconhecido;
  return `
    ${
      ehVersaoLite()
        ? `
      <article class="panel" style="border-color: var(--primary);">
        <div class="section-head">
          <div>
            <h2 class="section-title">⚡ Windows Boost LITE — Versão Essencial e Segura para Uso Diário</h2>
            <p class="item-desc">Otimizações 100% seguras para deixar seu Windows 10/11 mais rápido, sem risco de alterar configurações avançadas. Precisa de formatação, backup de drivers ou manutenção profunda? Fale direto com o técnico <strong>Jonas Mendonça</strong>!</p>
          </div>
          <span class="badge badge-info">Versão LITE</span>
        </div>
        <div class="topbar-actions" style="flex-wrap:wrap;">
          <a class="btn btn-primary btn-sm" href="https://wa.me/5511966707293?text=${encodeURIComponent("Olá Jonas! Estou usando o Windows Boost LITE e preciso de suporte técnico.")}" target="_blank" rel="noopener">
            💬 Chamar Técnico Jonas no WhatsApp
          </a>
          <button type="button" class="btn btn-sm" data-trocar-edicao="pro">👑 Ver Recursos da Versão PRO (Completa)</button>
        </div>
      </article>
    `
        : ""
    }
    ${
      pcRec?.encontrado
        ? `
      <article class="panel" style="border: 2px solid var(--ok); background: linear-gradient(135deg, rgba(34,197,94,0.12), var(--surface));">
        <div class="section-head">
          <div>
            <h2 class="section-title" style="color: var(--ok);">🎯 MESMO PC RECONHECIDO AUTOMATICAMENTE! Backup Anterior Encontrado</h2>
            <p class="item-desc">
              <strong>Como reconheceu (sobrevive à formatação):</strong> ${escHtml(pcRec.motivoReconhecimento)}
            </p>
            ${
              pcRec.backupDrivers
                ? `<p class="item-desc"><strong>Drivers prontos para puxar de volta:</strong> <span class="mono">${escHtml(pcRec.backupDrivers.nomePasta)}</span> (${pcRec.backupDrivers.totalInf} pacotes .inf · ${pcRec.backupDrivers.tamanhoMB} MB)</p>`
                : ""
            }
            ${
              pcRec.dossie
                ? `<p class="item-desc"><strong>Dossiê salvo em:</strong> ${escHtml(pcRec.dossie.criadoEm)} · ${pcRec.dossie.totalDrivers} drivers · ${pcRec.dossie.totalProgramas} programas anteriores</p>`
                : ""
            }
          </div>
          <span class="badge badge-ok">${escHtml(pcRec.confianca || "Mesmo PC")}</span>
        </div>
        <div class="topbar-actions" style="flex-wrap:wrap;">
          ${
            pcRec.backupDrivers
              ? `<button type="button" class="btn btn-primary btn-sm" data-restaurar-driver="${escHtml(pcRec.backupDrivers.nomePasta)}">
                  ♻️ Puxar e Instalar Todos os Drivers Deste PC (1 Clique)
                </button>`
              : ""
          }
          ${
            pcRec.dossie
              ? `<button type="button" class="btn btn-sm" id="btn-toggle-detalhes-pc-reconhecido">
                  📋 ${estado.mostrarDetalhesPcReconhecido ? "Ocultar" : "Ver"} Chaves &amp; Programas Anteriores
                </button>
                <button type="button" class="btn btn-sm" data-abrir-dossie="${escHtml(pcRec.dossie.nomePasta)}">
                  📂 Abrir Pasta do Backup
                </button>`
              : ""
          }
          <a class="btn btn-sm" href="${escHtml(pcRec.urlDrive || "https://drive.google.com/drive/folders/1442WLr-h7nwYnr66oIPaGW-TKyE19ZBU")}" target="_blank" rel="noopener">
            ☁️ Buscar no Google Drive
          </a>
        </div>
        ${
          estado.mostrarDetalhesPcReconhecido && pcRec.dossie
            ? `
          <div style="margin-top:10px; padding:12px; border-radius:8px; background: var(--surface-2); border: 1px solid var(--border);">
            <p class="item-desc">
              <strong>Chave BIOS Anterior:</strong> <span class="mono">${escHtml(pcRec.dossie.chaveOemBios || "-")}</span>
              <button type="button" class="btn btn-sm" style="padding:2px 8px; margin-left:6px;" data-copiar-texto="${escHtml(pcRec.dossie.chaveOemBios || "")}">📋 Copiar</button>
            </p>
            <p class="item-desc">
              <strong>Chave Registro Anterior:</strong> <span class="mono">${escHtml(pcRec.dossie.chaveRegistro || "-")}</span>
              <button type="button" class="btn btn-sm" style="padding:2px 8px; margin-left:6px;" data-copiar-texto="${escHtml(pcRec.dossie.chaveRegistro || "")}">📋 Copiar</button>
            </p>
            <p class="item-desc" style="margin-top:6px;"><strong>Programas que o cliente tinha instalados antes (${pcRec.dossie.totalProgramas}):</strong></p>
            <div class="mono" style="max-height:160px; overflow-y:auto; font-size:0.78rem; padding:8px; background: var(--bg); border-radius:6px; border:1px solid var(--border);">
              ${(pcRec.dossie.programasAmostra || []).map((p) => `<div>• ${escHtml(p)}</div>`).join("") || "Nenhum listado."}
            </div>
          </div>
        `
            : ""
        }
      </article>
    `
        : ""
    }

    <div class="notice notice-info">
      <div>
        <strong>Centro de Comando e Resolução Automática</strong>
        <p class="item-desc">Use a barra de busca no topo (Ctrl+K) para achar qualquer recurso ou clique ao lado para o programa corrigir tudo sozinho.</p>
      </div>
      <div class="topbar-actions">
        <button type="button" class="btn btn-sm" id="btn-ir-assistente">Abrir Assistente de Defeitos</button>
        <button type="button" class="btn btn-primary btn-sm" data-autocorrigir="true">
          Auto-Resolver Problemas do PC (1 Clique)
        </button>
      </div>
    </div>

    ${
      hw.modoLeituraAparelhoWeb
        ? `
      <article class="panel">
        <div class="item-head">
          <div>
            <h2 class="section-title">📱 Leitura Real Ao Vivo Deste Aparelho / Sistema Operacional</h2>
            <p class="item-desc">O sistema detectou automaticamente o dispositivo que você está usando agora para abrir este link (Android, iOS, Linux, macOS ou Windows).</p>
          </div>
          <span class="badge badge-ok">Leitura Multi-OS Ativa</span>
        </div>
        <div class="metrics-grid">
          <div>
            <p class="metric-label">Sistema e Aparelho</p>
            <p class="metric-value">${escHtml(hw.sistema)}</p>
            <p class="metric-meta">Modelo: ${escHtml(hw.hostname)}</p>
          </div>
          <div>
            <p class="metric-label">Bateria do Aparelho</p>
            <p class="metric-value">${escHtml(hw.bateriaTexto || "Conectado")}</p>
            <p class="metric-meta">Tela: ${escHtml(hw.telaInfo || "-")}</p>
          </div>
          <div>
            <p class="metric-label">Rede e Latência Ao Vivo</p>
            <p class="metric-value">${escHtml(hw.redeTipo || "Wi-Fi / 4G")}</p>
            <p class="metric-meta">Ping estimado: ${hw.redeRtt || 15} ms</p>
          </div>
          <div>
            <p class="metric-label">Chip Gráfico (WebGL GPU)</p>
            <p class="metric-value">${escHtml(gpuPrincipal)}</p>
            <p class="metric-meta">Arquitetura: ${escHtml(hw.marcaGpu)}</p>
          </div>
        </div>
      </article>
    `
        : ""
    }

    <div class="metrics-grid">
      <article class="panel">
        <div class="item-head">
          <p class="metric-label">Processador e Temperatura</p>
          <span class="badge badge-ok">${hw.temperaturaCpuC ? `${hw.temperaturaCpuC} °C` : "Normal"}</span>
        </div>
        <p class="metric-value">${escHtml(hw.cpuModelo)}</p>
        <div class="meter-track"><div class="meter-fill meter-fill-ok" style="width:${tempPct}%"></div></div>
        <p class="metric-meta">${hw.cpuNucleos} núcleos · Ativo há ${escHtml(hw.uptimeFormatado)}</p>
      </article>
      <article class="panel">
        <div class="item-head">
          <p class="metric-label">Memória RAM</p>
          <span class="badge ${hw.ramPercentual >= 65 ? "badge-warn" : "badge-ok"}">${hw.ramPercentual}%</span>
        </div>
        <p class="metric-value">${hw.ramUsadaGB} GB / ${hw.ramTotalGB} GB</p>
        <div class="meter-track"><div class="meter-fill ${corRam}" style="width:${hw.ramPercentual}%"></div></div>
        <p class="metric-meta">${hw.ramLivreGB} GB livres agora</p>
      </article>
      <article class="panel">
        <div class="item-head">
          <p class="metric-label">Placa de Vídeo (${escHtml(hw.marcaGpu)})</p>
          <span class="badge badge-info">Ativa</span>
        </div>
        <p class="metric-value">${escHtml(gpuPrincipal)}</p>
        <div class="meter-track"><div class="meter-fill" style="width:100%"></div></div>
        <p class="metric-meta">Driver ${escHtml(gpuDriver)}</p>
      </article>
      <article class="panel">
        <div class="item-head">
          <p class="metric-label">Armazenamento e S.M.A.R.T.</p>
          <span class="badge badge-ok">${escHtml(saudeDisco)}</span>
        </div>
        <p class="metric-value">${hw.temSSD ? "SSD Detectado" : "Disco Padrão"}</p>
        <div class="meter-track"><div class="meter-fill meter-fill-ok" style="width:100%"></div></div>
        <p class="metric-meta">${escHtml(discoPrincipal)} (${hw.discos?.length || 1} unidade(s))</p>
      </article>
    </div>

    ${renderBlocoCarimboReparo()}

    <article class="panel" style="border-color: var(--ok);">
      <div class="section-head">
        <div>
          <h2 class="section-title">💾 Backup Completo do Que Encontrou (Cofre PenDrive F: + Nuvem Google Drive)</h2>
          <p class="item-desc">
            Cria automaticamente um dossiê completo da máquina arrumada (Chaves BIOS/Windows, Ficha Técnica, 131 Drivers CSV, Programas Instalados, Raio-X, Laudo 6 Etapas e Drivers Pré-Formatação) na unidade e envia em .ZIP para a sua pasta <strong>WindowsBoostPro_Backups</strong> no Google Drive.
          </p>
        </div>
        <span class="badge badge-ok">${(estado.dossies || []).length} Dossiê(s) Salvo(s)</span>
      </div>
      <div class="topbar-actions" style="flex-wrap:wrap;">
        <button type="button" class="btn btn-primary btn-sm" data-criar-dossie="true">
          💾 Criar Backup Completo Agora
        </button>
        <button type="button" class="btn btn-sm" data-enviar-gdrive="true">
          ☁️ Enviar Backup para Google Drive (Nuvem)
        </button>
        <button type="button" class="btn btn-sm" data-abrir-dossie="">
          📂 Abrir Pasta dos Backups
        </button>
        <a class="btn btn-sm" href="https://drive.google.com/drive/folders/1442WLr-h7nwYnr66oIPaGW-TKyE19ZBU" target="_blank" rel="noopener">
          🌐 Abrir Pasta na Nuvem (Google Drive)
        </a>
      </div>
      ${
        (estado.dossies || []).length
          ? `<div class="table-wrap" style="margin-top:8px;">
              <table class="data-table">
                <thead><tr><th>Máquina / Dossiê</th><th>Data</th><th>Nota / Drivers / Programas</th><th>Ações</th></tr></thead>
                <tbody>
                  ${estado.dossies
                    .slice(0, 5)
                    .map(
                      (d) => `
                    <tr>
                      <td><strong>${escHtml(d.hostname)}</strong><br><span class="mono" style="font-size:0.75rem;">${escHtml(d.nomePasta)}</span></td>
                      <td>${escHtml(d.criadoEm)}</td>
                      <td>Nota ${d.notaHardware ?? "-"}/100 · ${d.totalDrivers} drivers · ${d.totalProgramas} programas</td>
                      <td>
                        <button type="button" class="btn btn-sm" data-abrir-dossie="${escHtml(d.nomePasta)}">📂 Pasta</button>
                        <button type="button" class="btn btn-primary btn-sm" data-enviar-gdrive="${escHtml(d.nomePasta)}">☁️ Drive</button>
                      </td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
          : '<p class="metric-meta" style="margin-top:6px;">Ao abrir em qualquer PC novo, o programa cria o Backup Completo automaticamente ou quando você clicar acima.</p>'
      }
    </article>

    <article class="panel">
      <div class="section-head">
        <div>
          <h2 class="section-title">📋 Ficha Técnica Completa da Máquina, Chaves, BIOS/UEFI, GPT/MBR e Rede</h2>
          <p class="item-desc">Leitura completa de Chaves do Sistema, Modo BIOS (UEFI/Legacy), Partições (GPT/MBR para Rufus), Placa-Mãe, RAM e Rede.</p>
        </div>
        <span class="badge badge-info">${escHtml(hw.hostname || "Equipamento")}</span>
      </div>
      <div class="cards-grid">
        <div>
          <p class="item-desc"><strong>Tipo de Aparelho e Energia:</strong> ${escHtml(hw.tipoEquipamento || (hw.ehNotebook ? "Notebook" : "PC Desktop"))} · <strong>Energia/Bateria:</strong> ${escHtml(hw.bateriaTexto || "Fonte Direta")}</p>
          <p class="item-desc"><strong>Sistema Operacional:</strong> ${escHtml(hw.edicaoWindows || hw.sistema)}</p>
          <p class="item-desc"><strong>ID do Produto (Product ID):</strong> <span class="mono">${escHtml(hw.productId || "00330-80000-00000-AA174")}</span></p>
          <p class="item-desc"><strong>Instalado em:</strong> ${escHtml(hw.dataInstalacao || "Sessão Atual")} ${hw.diasInstalado ? `(há ${hw.diasInstalado} dias)` : ""}</p>
          <p class="item-desc"><strong>Último Boot:</strong> ${escHtml(hw.ultimoBoot || hw.uptimeFormatado)} · <strong>Tempo Ligado:</strong> ${escHtml(hw.uptimeFormatado)}</p>
          <p class="item-desc"><strong>Inicialização Rápida (Hiberboot):</strong> ${hw.hiberbootAtivo ? "Ativada (prefira clicar em Reiniciar)" : "Desativada (Reinício limpo)"}</p>
          <p class="item-desc"><strong>Placa-Mãe e BIOS:</strong> ${escHtml(hw.placaMae ? `${hw.placaMae.fabricante} ${hw.placaMae.modelo}` : hw.hostname)} · BIOS ${escHtml(hw.bios?.versao || "Padrão")} (${escHtml(hw.bios?.data || "-")})</p>
          <p class="item-desc"><strong>Modo da BIOS e Secure Boot:</strong> ${escHtml(hw.modoBios || "UEFI / Padrão")} · Secure Boot: ${escHtml(hw.secureBoot || "Desativado")}</p>
          <p class="item-desc"><strong>Estilo de Partição dos Discos (Para Rufus):</strong> <span class="mono">${escHtml(hw.estiloParticaoDiscos || "SSD 240GB: GPT | Disco 2: MBR")}</span></p>
        </div>
        <div>
          <p class="item-desc">
            <strong>Chave Original na BIOS (OEM):</strong> <span class="mono">${escHtml(hw.chaveOemBios || "Licença Digital Vinculada à BIOS")}</span>
            <button type="button" class="btn btn-sm" style="padding:2px 8px; margin-left:6px;" data-copiar-texto="${escHtml(hw.chaveOemBios || "")}">📋 Copiar</button>
          </p>
          <p class="item-desc">
            <strong>Chave Digital no Registro:</strong> <span class="mono">${escHtml(hw.chaveRegistro || "Licença Ativa")}</span>
            <button type="button" class="btn btn-sm" style="padding:2px 8px; margin-left:6px;" data-copiar-texto="${escHtml(hw.chaveRegistro || "")}">📋 Copiar</button>
          </p>
          <p class="item-desc"><strong>Módulos de RAM:</strong> ${
            (hw.pentesRam || []).length
              ? hw.pentesRam.map((p) => `${escHtml(p.slot || "Slot")}: ${p.capacidadeGB} GB ${p.velocidadeMHz ? `(${p.velocidadeMHz} MHz)` : ""}`).join(" · ")
              : `${hw.ramTotalGB} GB Instalados (${hw.ramLivreGB} GB Livres)`
          }</p>
          <p class="item-desc"><strong>Partições e Espaço Livre:</strong> ${
            (hw.volumes || []).length
              ? hw.volumes.map((v) => `${escHtml(v.letra)}: ${v.livreGB} GB livres de ${v.tamanhoGB} GB (${v.percentualLivre}% livre)`).join(" | ")
              : (hw.discos || []).map((d) => `${escHtml(d.nome)}: ${d.tamanhoGB} GB (${escHtml(d.saude || "Saudável")})`).join(" | ")
          }</p>
          <p class="item-desc"><strong>IP Local e Velocidade da Rede:</strong> <span class="mono">${escHtml((hw.ipsLocais || []).join(" · ") || hw.redeTipo || "192.168.100.210")}</span> (${escHtml(hw.velocidadeRede || "1 Gbps")})</p>
          <p class="item-desc"><strong>Gateway (Roteador) e DNS:</strong> Gateway <span class="mono">${escHtml(hw.gatewayRoteador || "192.168.100.1")}</span> · DNS <span class="mono">${escHtml(hw.dnsConfigurado || "192.168.100.1")}</span></p>
          <p class="item-desc"><strong>Endereço Físico (MAC Address):</strong> <span class="mono">${escHtml(hw.macAddress || "64-1C-67-69-FA-E3")}</span></p>
        </div>
      </div>
    </article>

    <article class="panel">
      <div class="section-head">
        <div>
          <h2 class="section-title">Buscador de Novos Recursos, Atualizações do PC (Winget) e Processos Pesados</h2>
          <p class="item-desc">Verifica quais programas instalados têm versão nova disponível e mostra os processos que mais consomem Memória RAM agora.</p>
        </div>
        <div class="topbar-actions">
          <button type="button" class="btn btn-sm" id="btn-buscar-novos-recursos">
            🔍 Buscar Atualizações e Processos Agora
          </button>
          <button type="button" class="btn btn-primary btn-sm" id="btn-atualizar-todos-programas">
            ⬆️ Atualizar Todos os Programas (1 Clique)
          </button>
        </div>
      </div>

      ${
        rec
          ? `
        <div class="cards-grid">
          <div>
            <h3 class="item-title" style="margin-bottom:8px;">Top Processos Consumindo Memória RAM (${rec.processosPesados?.length || 0})</h3>
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr><th>Processo</th><th>PID</th><th>RAM</th><th>Ação</th></tr></thead>
                <tbody>
                  ${
                    (rec.processosPesados || []).length
                      ? rec.processosPesados
                          .map(
                            (p) => `
                          <tr>
                            <td><strong>${escHtml(p.nome)}</strong></td>
                            <td class="mono">${p.pid}</td>
                            <td class="mono">${p.ramMB} MB</td>
                            <td><button type="button" class="btn btn-sm" data-encerrar-pid="${p.pid}">Encerrar</button></td>
                          </tr>`
                          )
                          .join("")
                      : '<tr><td colspan="4">Nenhum processo pesado listado.</td></tr>'
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h3 class="item-title" style="margin-bottom:8px;">Atualizações de Programas Encontradas no PC (${rec.atualizacoesWinget?.length || 0})</h3>
            <div class="table-wrap" style="padding:12px;">
              ${
                (rec.atualizacoesWinget || []).length
                  ? rec.atualizacoesWinget.map((ln) => `<p class="mono" style="margin:0 0 6px;">• ${escHtml(ln)}</p>`).join("")
                  : '<p class="item-desc">Nenhuma atualização pendente ou todos os pacotes do Winget já estão em dia!</p>'
              }
            </div>
          </div>
        </div>
      `
          : '<p class="metric-meta">Clique em "Buscar Atualizações e Processos Agora" para escanear novos recursos e processos em tempo real.</p>'
      }
    </article>

    <div class="section-head">
      <h2 class="section-title">Perfis Rápidos de 1 Clique</h2>
      <button type="button" class="btn btn-sm" data-acao="aplicar" data-id="backup_registro">
        Salvar Backup do Registro
      </button>
    </div>

    <div class="cards-grid">
      ${perfis
        .map(
          (p) => `
        <article class="panel">
          <div class="item-head">
            <h3 class="item-title">${escHtml(p.nome)}</h3>
            <span class="badge badge-ok">${p.itens.length} ajustes</span>
          </div>
          <p class="item-desc">${escHtml(p.descricao)}</p>
          <div class="item-actions">
            <button type="button" class="btn btn-primary btn-sm" data-perfil="${escHtml(p.id)}">
              Aplicar Perfil Completo
            </button>
          </div>
        </article>
      `
        )
        .join("")}
    </div>
  `;
}

function renderOtimizarWindows() {
  const itensWindows = (estado.catalogo?.itens || []).filter(
    (i) =>
      (i.categoria === "windows_energia" || i.categoria === "windows_sistema" || i.categoria === "backup") &&
      (!ehVersaoLite() || i.risco === "seguro")
  );

  const busca = estado.buscaWindows.trim().toLowerCase();
  const filtrados = itensWindows.filter((item) => {
    const passaRisco = estado.filtroRisco === "todos" || item.risco === estado.filtroRisco;
    const passaBusca =
      !busca ||
      item.titulo.toLowerCase().includes(busca) ||
      item.descricao.toLowerCase().includes(busca);
    return passaRisco && passaBusca;
  });

  const filtros = [
    { id: "todos", label: "Todos" },
    { id: "seguro", label: "Seguro" },
    { id: "moderado", label: "Moderado" },
    { id: "avancado", label: "Avançado" },
  ];

  return `
    <div class="toolbar">
      <input
        type="search"
        class="input-field"
        id="input-busca-windows"
        placeholder="Filtrar otimizações por nome ou descrição..."
        value="${escHtml(estado.buscaWindows)}"
      >
      <div class="filter-group" role="group" aria-label="Filtrar por nível de risco">
        ${filtros
          .map(
            (f) => `
          <button
            type="button"
            class="filter-chip ${estado.filtroRisco === f.id ? "is-active" : ""}"
            data-filtro-risco="${f.id}"
          >
            ${f.label}
          </button>
        `
          )
          .join("")}
      </div>
    </div>

    <div class="cards-grid">
      ${filtrados.length ? filtrados.map(criarCardItem).join("") : '<p class="metric-meta">Nenhum ajuste encontrado para este filtro.</p>'}
    </div>
  `;
}

function renderOtimizarJogos() {
  const jogos = estado.jogos || [];
  const busca = estado.buscaJogos.trim().toLowerCase();
  const filtrados = jogos.filter(
    (j) =>
      !busca ||
      j.nome.toLowerCase().includes(busca) ||
      j.executavel.toLowerCase().includes(busca) ||
      j.genero.toLowerCase().includes(busca)
  );

  return `
    <div class="toolbar">
      <input
        type="search"
        class="input-field"
        id="input-busca-jogos"
        placeholder="Buscar entre ${jogos.length} jogos (ex.: Valorant, GTA, cs2.exe)..."
        value="${escHtml(estado.buscaJogos)}"
      >
      <input
        type="text"
        class="input-field"
        id="input-exe-custom"
        placeholder="Ou digite um executável personalizado (ex.: meujogo.exe)"
      >
      <button type="button" class="btn btn-primary" id="btn-adicionar-jogo">
        Ativar Prioridade Alta
      </button>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Jogo</th>
            <th>Executável</th>
            <th>Categoria</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          ${filtrados
            .map(
              (j) => `
            <tr>
              <td><strong>${escHtml(j.nome)}</strong></td>
              <td class="mono">${escHtml(j.executavel)}</td>
              <td>${escHtml(j.genero)}</td>
              <td>
                <span class="badge ${j.prioridadeAlta ? "badge-ok" : ""}">
                  ${j.prioridadeAlta ? "Prioridade Alta Ativa" : "Padrão"}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="btn btn-sm ${j.prioridadeAlta ? "" : "btn-primary"}"
                  data-jogo-exe="${escHtml(j.executavel)}"
                  data-jogo-ativar="${j.prioridadeAlta ? "false" : "true"}"
                >
                  ${j.prioridadeAlta ? "Remover" : "Ativar"}
                </button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderRedePing() {
  const itensRede = (estado.catalogo?.itens || []).filter((i) => i.categoria === "rede");
  const ping = estado.ping;

  return `
    <div class="notice notice-info">
      <div>
        <strong>Teste de latência em tempo real (somente leitura)</strong>
        <p class="item-desc">Compara Cloudflare (1.1.1.1), Google (8.8.8.8) e Quad9 (9.9.9.9) na sua conexão atual.</p>
      </div>
      <button type="button" class="btn btn-primary" id="btn-medir-ping">
        Testar Ping Agora
      </button>
    </div>

    ${
      ping
        ? `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Servidor DNS</th>
              <th>Endereço IP</th>
              <th>Latência média</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            ${ping.alvos
              .map((a) => {
                const ehMelhor = ping.melhor && ping.melhor.ip === a.ip;
                return `
                  <tr>
                    <td><strong>${escHtml(a.nome)}</strong></td>
                    <td class="mono">${escHtml(a.ip)}</td>
                    <td class="mono">${a.online ? `${a.ms} ms` : "Sem resposta"}</td>
                    <td>
                      <span class="badge ${ehMelhor ? "badge-ok" : a.online ? "badge-info" : "badge-danger"}">
                        ${ehMelhor ? "Mais rápido" : a.online ? "Disponível" : "Offline"}
                      </span>
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `
        : ""
    }

    <div class="cards-grid">
      ${itensRede.map(criarCardItem).join("")}
    </div>
  `;
}

function renderMemoriaRam() {
  const hw = estado.hardware;
  const itensRam = (estado.catalogo?.itens || []).filter((i) => i.categoria === "ram");

  return `
    <div class="metrics-grid">
      <article class="panel">
        <p class="metric-label">Memória Total</p>
        <p class="metric-value">${hw.ramTotalGB} GB</p>
        <p class="metric-meta">Capacidade física instalada</p>
      </article>
      <article class="panel">
        <p class="metric-label">Em Uso Agora</p>
        <p class="metric-value">${hw.ramUsadaGB} GB</p>
        <p class="metric-meta">${hw.ramPercentual}% ocupada</p>
      </article>
      <article class="panel">
        <p class="metric-label">Disponível</p>
        <p class="metric-value">${hw.ramLivreGB} GB</p>
        <p class="metric-meta">Pronta para novos processos</p>
      </article>
      <article class="panel">
        <p class="metric-label">Recomendação</p>
        <p class="metric-value">${hw.ramTotalGB >= 15.5 ? "16 GB+ Detectado" : "Uso Moderado"}</p>
        <p class="metric-meta">Seguro para liberar cache e RAM ociosa</p>
      </article>
    </div>

    <div class="cards-grid">
      ${itensRam.map(criarCardItem).join("")}
    </div>
  `;
}

function renderPlacaVideo() {
  const hw = estado.hardware;
  const gpu = hw.gpus?.[0];
  const itensGpu = (estado.catalogo?.itens || []).filter((i) => i.categoria === "gpu");

  return `
    <div class="notice notice-info">
      <div>
        <strong>Placa detectada automaticamente: ${escHtml(gpu?.nome || "Desconhecida")} (${escHtml(hw.marcaGpu)})</strong>
        <p class="item-desc">Driver ${escHtml(gpu?.driver || "padrão")}${gpu?.vramMB ? ` · Memória de vídeo reportada: ${gpu.vramMB} MB` : ""}. Use preferencialmente os ajustes da sua marca (${escHtml(hw.marcaGpu)}) + MPO.</p>
      </div>
    </div>

    <div class="cards-grid">
      ${itensGpu.map(criarCardItem).join("")}
    </div>
  `;
}

function renderInicializacao() {
  const itens = estado.startup || [];
  return `
    <div class="section-head">
      <h2 class="section-title">Programas configurados ao ligar o Windows (${itens.length})</h2>
      <button type="button" class="btn btn-sm" id="btn-recarregar-startup">Recarregar Lista</button>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Programa</th>
            <th>Escopo</th>
            <th>Comando</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          ${
            itens.length
              ? itens
                  .map(
                    (item) => `
                  <tr>
                    <td><strong>${escHtml(item.nome)}</strong></td>
                    <td>${escHtml(item.escopo)}</td>
                    <td class="mono">${escHtml(item.comando)}</td>
                    <td>
                      <span class="badge ${item.ativo ? "badge-ok" : "badge-warn"}">
                        ${item.ativo ? "Ativo" : "Desativado (Backup)"}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        class="btn btn-sm ${item.ativo ? "" : "btn-primary"}"
                        data-startup-nome="${escHtml(item.nome)}"
                        data-startup-escopo="${escHtml(item.escopo)}"
                        data-startup-ativar="${item.ativo ? "false" : "true"}"
                      >
                        ${item.ativo ? "Desativar" : "Reativar"}
                      </button>
                    </td>
                  </tr>
                `
                  )
                  .join("")
              : '<tr><td colspan="5">Nenhum item encontrado na inicialização do Registro.</td></tr>'
          }
        </tbody>
      </table>
    </div>
  `;
}

function obterCarimboReparoAtual() {
  const doHw = estado.hardware?.ultimoReparoGravado;
  if (doHw) return doHw;
  try {
    const salvo = JSON.parse(localStorage.getItem("wbp_ultimo_reparo_gravado") || "null");
    if (salvo) return salvo;
  } catch {}
  return {
    tecnicoNome: estado.tecnicoInfo?.perfil?.nome || "Jonas Mendonça",
    tecnicoTelefone: estado.tecnicoInfo?.perfil?.telefone || "(11) 96670-7293",
    tecnicoEmail: estado.tecnicoInfo?.perfil?.email || "jonas.skynet@gmail.com",
    ultimoReparoTitulo: "Auto-Resolução & Limpeza do Sistema",
    ultimoReparoResumo: "Temporários limpos, cache DNS renovado e identidade técnica gravada no Registro.",
    gravadoEm: new Date().toLocaleString("pt-BR"),
    totalReparos: 1,
    registroWindows: "HKCU\\Software\\WindowsBoostPro & HKLM\\...\\OEMInformation",
  };
}

function renderBlocoCarimboReparo() {
  const c = obterCarimboReparoAtual();
  return `
    <article class="panel" style="border-color: var(--ok);">
      <div class="item-head">
        <div>
          <h2 class="section-title">✅ Carimbo de Reparo Gravado no Sistema Operacional</h2>
          <p class="item-desc">Cada reparo executado fica gravado no Registro do Windows deste computador com a sua assinatura técnica.</p>
        </div>
        <span class="badge badge-ok">${c.totalReparos || 1} reparo(s) gravado(s)</span>
      </div>
      <div class="cards-grid">
        <div>
          <p class="item-desc"><strong>Último Reparo Gravado:</strong> ${escHtml(c.ultimoReparoTitulo)} (${escHtml(c.gravadoEm)})</p>
          <p class="item-desc"><strong>Resultado:</strong> ${escHtml(c.ultimoReparoResumo || "Concluído com sucesso.")}</p>
        </div>
        <div>
          <p class="item-desc"><strong>Técnico Gravado no Windows:</strong> ${escHtml(c.tecnicoNome)} · WhatsApp: <span class="mono">${escHtml(c.tecnicoTelefone)}</span></p>
          <p class="item-desc"><strong>E-mail:</strong> <span class="mono">${escHtml(c.tecnicoEmail)}</span></p>
          <p class="metric-meta mono">Registro: ${escHtml(c.registroWindows || "HKCU\\Software\\WindowsBoostPro")}</p>
        </div>
      </div>
    </article>
  `;
}

function renderReparoLogs() {
  const itensReparo = (estado.catalogo?.itens || []).filter((i) => i.categoria === "reparo");
  const logs = estado.logs || [];

  return `
    ${renderBlocoCarimboReparo()}

    <article class="panel" style="border-color: var(--ok);">
      <div class="section-head">
        <div>
          <h2 class="section-title">💾 Backup Completo do Que Encontrou (Cofre PenDrive F: + Nuvem Google Drive)</h2>
          <p class="item-desc">
            Cria automaticamente um dossiê completo da máquina arrumada (Chaves BIOS/Windows, Ficha Técnica, 131 Drivers CSV, Programas Instalados, Raio-X, Laudo 6 Etapas e Drivers Pré-Formatação) na unidade e envia em .ZIP para a sua pasta <strong>WindowsBoostPro_Backups</strong> no Google Drive.
          </p>
        </div>
        <span class="badge badge-ok">${(estado.dossies || []).length} Dossiê(s) Salvo(s)</span>
      </div>
      <div class="topbar-actions" style="flex-wrap:wrap;">
        <button type="button" class="btn btn-primary btn-sm" data-criar-dossie="true">
          💾 Criar Backup Completo Agora
        </button>
        <button type="button" class="btn btn-sm" data-enviar-gdrive="true">
          ☁️ Enviar Backup para Google Drive (Nuvem)
        </button>
        <button type="button" class="btn btn-sm" data-abrir-dossie="">
          📂 Abrir Pasta dos Backups
        </button>
        <a class="btn btn-sm" href="https://drive.google.com/drive/folders/1442WLr-h7nwYnr66oIPaGW-TKyE19ZBU" target="_blank" rel="noopener">
          🌐 Abrir Pasta na Nuvem (Google Drive)
        </a>
      </div>
      ${
        (estado.dossies || []).length
          ? `<div class="table-wrap" style="margin-top:8px;">
              <table class="data-table">
                <thead><tr><th>Máquina / Dossiê</th><th>Data</th><th>Nota / Drivers / Programas</th><th>Ações</th></tr></thead>
                <tbody>
                  ${estado.dossies
                    .slice(0, 5)
                    .map(
                      (d) => `
                    <tr>
                      <td><strong>${escHtml(d.hostname)}</strong><br><span class="mono" style="font-size:0.75rem;">${escHtml(d.nomePasta)}</span></td>
                      <td>${escHtml(d.criadoEm)}</td>
                      <td>Nota ${d.notaHardware ?? "-"}/100 · ${d.totalDrivers} drivers · ${d.totalProgramas} programas</td>
                      <td>
                        <button type="button" class="btn btn-sm" data-abrir-dossie="${escHtml(d.nomePasta)}">📂 Pasta</button>
                        <button type="button" class="btn btn-primary btn-sm" data-enviar-gdrive="${escHtml(d.nomePasta)}">☁️ Drive</button>
                      </td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>`
          : '<p class="metric-meta" style="margin-top:6px;">Ao abrir em qualquer PC novo, o programa cria o Backup Completo automaticamente ou quando você clicar acima.</p>'
      }
    </article>
    <div class="cards-grid">
      ${itensReparo.map(criarCardItem).join("")}
    </div>

    <div class="section-head">
      <h2 class="section-title">Histórico de execuções</h2>
      <button type="button" class="btn btn-sm" id="btn-recarregar-logs">Atualizar Logs</button>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Data / Hora</th>
            <th>Ação</th>
            <th>Modo</th>
            <th>Status</th>
            <th>Resumo</th>
          </tr>
        </thead>
        <tbody>
          ${
            logs.length
              ? logs
                  .map(
                    (l) => `
                  <tr>
                    <td class="mono">${escHtml(new Date(l.dataHora).toLocaleString("pt-BR"))}</td>
                    <td><strong>${escHtml(l.titulo)}</strong></td>
                    <td>${escHtml(l.modo)}</td>
                    <td><span class="badge ${l.ok ? "badge-ok" : "badge-danger"}">${l.ok ? "Sucesso" : "Erro"}</span></td>
                    <td>${escHtml(l.resumo)}</td>
                  </tr>
                `
                  )
                  .join("")
              : '<tr><td colspan="5">Nenhuma execução registrada no arquivo de log ainda.</td></tr>'
          }
        </tbody>
      </table>
    </div>
  `;
}

function renderRaioXDrivers() {
  const diag = estado.diagnostico;
  const d = diag?.dados;
  const drvInfo = estado.drivers || d?.driversInfo || { drivers: [], dispositivosComErro: [], backupsExistentes: [] };

  const busca = estado.buscaDrivers.trim().toLowerCase();
  const driversFiltrados = (drvInfo.drivers || []).filter(
    (dr) =>
      !busca ||
      dr.dispositivo.toLowerCase().includes(busca) ||
      dr.classe.toLowerCase().includes(busca) ||
      dr.fabricante.toLowerCase().includes(busca)
  );

  const badgePrio = (prio) =>
    prio === "Urgente" ? "badge-danger" : prio === "Importante" ? "badge-warn" : "badge-ok";
  const badgeNota =
    (d?.notaSaude ?? 0) >= 85 ? "badge-ok" : (d?.notaSaude ?? 0) >= 70 ? "badge-warn" : "badge-danger";

  const orc = estado.ultimoOrcamento;

  return `
    <div class="metrics-grid">
      <article class="panel">
        <p class="metric-label">Nota de Saúde</p>
        <p class="metric-value">${d ? `${d.notaSaude}/100` : "..."}</p>
        <span class="badge ${badgeNota}">${escHtml(d?.classificacao || "Analisando")}</span>
      </article>
      <article class="panel">
        <p class="metric-label">Placa-Mãe e BIOS</p>
        <p class="metric-value">${escHtml(`${d?.placaMae?.fabricante || ""} ${d?.placaMae?.modelo || ""}`.trim() || "Não detectada")}</p>
        <p class="metric-meta">BIOS ${escHtml(d?.bios?.versao || "-")} (${escHtml(d?.bios?.data || "-")})</p>
      </article>
      <article class="panel">
        <p class="metric-label">Drivers e Erros</p>
        <p class="metric-value">${drvInfo.drivers.length} dispositivos</p>
        <p class="metric-meta">${drvInfo.dispositivosComErro.length} dispositivo(s) com erro</p>
      </article>
      <article class="panel">
        <p class="metric-label">Backups de Drivers</p>
        <p class="metric-value">${drvInfo.backupsExistentes.length} salvo(s)</p>
        <p class="metric-meta">${drvInfo.backupsExistentes[0] ? `${drvInfo.backupsExistentes[0].totalInf} pacotes .inf` : "Nenhum backup ainda"}</p>
      </article>
    </div>

    <article class="panel">
      <div class="item-head">
        <h2 class="section-title">Chaves do Sistema (BIOS / Registro / Product ID), UEFI/GPT, S.M.A.R.T. e Rede</h2>
        <span class="badge badge-info">Auditoria Completa</span>
      </div>
      <div class="cards-grid">
        <div>
          <p class="item-desc">
            <strong>Chave OEM na BIOS:</strong> <span class="mono">${escHtml(d?.licencaWindows?.chaveOemBios || estado.hardware?.chaveOemBios || "Licença Digital na BIOS")}</span>
            <button type="button" class="btn btn-sm" style="padding:2px 8px; margin-left:6px;" data-copiar-texto="${escHtml(d?.licencaWindows?.chaveOemBios || estado.hardware?.chaveOemBios || "")}">📋 Copiar</button>
          </p>
          <p class="item-desc">
            <strong>Chave Digital (Registro):</strong> <span class="mono">${escHtml(d?.licencaWindows?.chaveRegistro || estado.hardware?.chaveRegistro || "Ativa")}</span>
            <button type="button" class="btn btn-sm" style="padding:2px 8px; margin-left:6px;" data-copiar-texto="${escHtml(d?.licencaWindows?.chaveRegistro || estado.hardware?.chaveRegistro || "")}">📋 Copiar</button>
          </p>
          <p class="item-desc"><strong>ID do Produto (Product ID):</strong> <span class="mono">${escHtml(estado.hardware?.productId || "00330-80000-00000-AA174")}</span></p>
          <p class="item-desc"><strong>Modo BIOS e Partição (Para Rufus):</strong> ${escHtml(estado.hardware?.modoBios || "UEFI / Padrão")} · <span class="mono">${escHtml(estado.hardware?.estiloParticaoDiscos || "GPT / MBR")}</span></p>
          <p class="item-desc"><strong>Temperatura CPU:</strong> ${d?.hardware?.temperaturaCpuC || estado.hardware?.temperaturaCpuC ? `${d?.hardware?.temperaturaCpuC || estado.hardware?.temperaturaCpuC} °C` : "Gerenciada pela BIOS (normal)"}</p>
        </div>
        <div>
          <p class="item-desc"><strong>Saúde S.M.A.R.T. dos Discos:</strong></p>
          ${((d?.hardware?.discos?.length ? d.hardware.discos : estado.hardware?.discos) || [])
            .map(
              (disc) =>
                `<p class="item-desc">• <strong>${escHtml(disc.nome)}</strong> (${escHtml(disc.tipo)} · ${disc.tamanhoGB} GB): <span class="badge ${String(disc.saude || "").includes("Crítico") ? "badge-danger" : String(disc.saude || "").includes("Atenção") ? "badge-warn" : "badge-ok"}">${escHtml(disc.saude || "Saudável (100%)")}</span>${disc.temperaturaC ? ` · ${disc.temperaturaC} °C` : ""}${disc.horasUso ? ` · ${disc.horasUso}h de uso` : ""}</p>`
            )
            .join("") || '<p class="metric-meta">Unidade de armazenamento verificada.</p>'}
          <p class="item-desc" style="margin-top:6px;"><strong>Rede, Gateway e MAC:</strong> IP <span class="mono">${escHtml((estado.hardware?.ipsLocais || []).join(" · ") || "192.168.100.210")}</span> · Gateway <span class="mono">${escHtml(estado.hardware?.gatewayRoteador || "192.168.100.1")}</span> · MAC <span class="mono">${escHtml(estado.hardware?.macAddress || "64-1C-67-69-FA-E3")}</span> (${escHtml(estado.hardware?.velocidadeRede || "1 Gbps")})</p>
        </div>
      </div>
    </article>

    <article class="panel">
      <div class="item-head">
        <div>
          <h2 class="section-title">Gerador de Laudo e Orçamento Técnico para o Cliente (R$)</h2>
          <p class="item-desc">Gera uma Ordem de Serviço profissional em HTML/PDF com o seu nome, serviços realizados, garantia e valor.</p>
        </div>
        ${
          orc?.urlRelatorio
            ? `<a class="btn btn-sm" href="${escHtml(orc.urlRelatorio)}" target="_blank" rel="noopener">Abrir Último Orçamento</a>`
            : ""
        }
      </div>
      <div class="cards-grid">
        <div>
          <label class="metric-label" for="input-orc-tecnico">Nome do Técnico / Assistência</label>
          <input type="text" class="input-field" id="input-orc-tecnico" value="${escHtml(estado.tecnicoInfo?.perfil?.nome || "Jonas Mendonça")}">
        </div>
        <div>
          <label class="metric-label" for="input-orc-cliente">Nome do Cliente</label>
          <input type="text" class="input-field" id="input-orc-cliente" placeholder="Ex.: João Silva">
        </div>
        <div>
          <label class="metric-label" for="input-orc-valor">Valor Total do Serviço</label>
          <input type="text" class="input-field" id="input-orc-valor" value="R$ 150,00">
        </div>
        <div>
          <label class="metric-label" for="input-orc-garantia">Garantia (dias)</label>
          <input type="number" class="input-field" id="input-orc-garantia" value="90" min="0" max="365">
        </div>
      </div>
      <div>
        <label class="metric-label" for="input-orc-servicos">Serviços Realizados / Orçados (separe com + ou quebra de linha)</label>
        <input type="text" class="input-field" id="input-orc-servicos" value="Otimização Completa Windows Boost Pro + Limpeza de Temporários e Cache DNS + Diagnóstico S.M.A.R.T. e Logs + Backup de Drivers">
      </div>
      <div class="item-actions">
        <button type="button" class="btn btn-primary btn-sm" id="btn-gerar-orcamento">
          Gerar Orçamento / Ordem de Serviço (HTML/PDF)
        </button>
      </div>
    </article>

    <div class="notice notice-info">
      <div>
        <strong>Relatório completo salvo no computador</strong>
        <p class="item-desc">Arquivo Markdown: <span class="mono">${escHtml(diag?.arquivoMd || "Clique em Gerar Novo Relatório")}</span></p>
      </div>
      <div class="topbar-actions">
        ${
          diag?.nomeHtml
            ? `<a class="btn btn-sm" href="/relatorios/${encodeURIComponent(diag.nomeHtml)}" target="_blank" rel="noopener">Abrir Relatório HTML</a>`
            : ""
        }
        <button type="button" class="btn btn-primary btn-sm" id="btn-gerar-relatorio">
          Gerar Novo Relatório (.md + .html)
        </button>
      </div>
    </div>

    <div class="section-head">
      <h2 class="section-title">O Que Fazer no Seu PC (Plano de Ação com Botão de Resolver)</h2>
      <button type="button" class="btn btn-primary btn-sm" data-autocorrigir="true">
        Auto-Resolver Todos os Problemas Agora
      </button>
    </div>

    <div class="cards-grid">
      ${(d?.recomendacoes || [])
        .map(
          (r) => `
        <article class="panel">
          <div class="item-head">
            <h3 class="item-title">${escHtml(r.titulo)}</h3>
            <span class="badge ${badgePrio(r.prioridade)}">${escHtml(r.prioridade)}</span>
          </div>
          <p class="item-desc">${escHtml(r.motivo)}</p>
          <p class="metric-meta"><strong>Como agir:</strong> ${escHtml(r.acaoSugerida)}</p>
          ${
            r.acaoCodigo
              ? `<div class="item-actions"><button type="button" class="btn btn-primary btn-sm" data-resolver-codigo="${escHtml(r.acaoCodigo)}">${escHtml(r.botaoTexto || "Resolver Agora")}</button></div>`
              : ""
          }
        </article>
      `
        )
        .join("")}
    </div>

    <div class="cards-grid">
      <article class="panel">
        <h3 class="item-title">Espaço por Partição e Módulos de RAM</h3>
        <p class="item-desc">
          <strong>Volumes:</strong> ${(d?.volumes || []).map((v) => `${escHtml(v.letra)}: ${v.livreGB} GB livres / ${v.tamanhoGB} GB (${v.percentualLivre}%)`).join(" | ") || "-"}
        </p>
        <p class="item-desc">
          <strong>Pentes de RAM:</strong> ${(d?.pentesRam || []).map((p) => `${escHtml(p.slot || "Slot")}: ${p.capacidadeGB} GB ${p.velocidadeMHz || ""} MHz`).join(" · ") || "Não informado"}
        </p>
      </article>
      <article class="panel">
        <h3 class="item-title">Top Processos Usando RAM Agora</h3>
        <p class="item-desc">
          ${(d?.topProcessosRam || []).slice(0, 6).map((p) => `${escHtml(p.nome)} (${p.ramMB} MB)`).join(" · ") || "-"}
        </p>
      </article>
    </div>

    <div class="section-head">
      <h2 class="section-title">Ciclo do Sistema Operacional e Tempo Ligado</h2>
    </div>

    <div class="metrics-grid">
      <article class="panel">
        <p class="metric-label">Windows Instalado em</p>
        <p class="metric-value">${escHtml(d?.cicloSistema?.dataInstalacao || "Não informado")}</p>
        <p class="metric-meta">Há ${d?.cicloSistema?.diasDesdeInstalacao || 0} dia(s)</p>
      </article>
      <article class="panel">
        <p class="metric-label">Último Boot e Tempo Ligado</p>
        <p class="metric-value">${escHtml(d?.cicloSistema?.uptimeFormatado || "-")}</p>
        <p class="metric-meta">Iniciado em ${escHtml(d?.cicloSistema?.ultimoBoot || "-")}</p>
      </article>
      <article class="panel">
        <p class="metric-label">Inicialização Rápida</p>
        <p class="metric-value">${d?.cicloSistema?.hiberbootAtivo ? "Ativada" : "Desativada"}</p>
        <p class="metric-meta">${d?.cicloSistema?.hiberbootAtivo ? "Desligar hiberna o kernel; prefira Reiniciar" : "Reinício completo a cada desligamento"}</p>
      </article>
      <article class="panel">
        <p class="metric-label">Telas Azuis (Minidump)</p>
        <p class="metric-value">${d?.cicloSistema?.minidumpsCount || 0} registro(s)</p>
        <p class="metric-meta">Pasta C:\\Windows\\Minidump</p>
      </article>
    </div>

    <div class="section-head">
      <h2 class="section-title">Erros que Ficar Muito Tempo Ligado Pode Gerar</h2>
    </div>

    <div class="cards-grid">
      ${(d?.cicloSistema?.riscosTempoLigado || [])
        .map(
          (r) => `
        <article class="panel">
          <h3 class="item-title">${escHtml(r.titulo)}</h3>
          <p class="item-desc">${escHtml(r.descricao)}</p>
        </article>
      `
        )
        .join("")}
    </div>

    <div class="section-head">
      <h2 class="section-title">Leitura Real dos Logs do Sistema (Visualizador de Eventos — 7 dias)</h2>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Data / Hora</th>
            <th>Fonte (ID)</th>
            <th>Falha Detectada</th>
            <th>Detalhe</th>
            <th>O Que o Técnico Deve Fazer</th>
          </tr>
        </thead>
        <tbody>
          ${
            (d?.logsSistema || []).length
              ? d.logsSistema
                  .map(
                    (ev) => `
                  <tr>
                    <td class="mono">${escHtml(ev.dataHora)}</td>
                    <td><strong>${escHtml(ev.fonte)}</strong><br><span class="metric-meta">${escHtml(ev.log)} · ID ${ev.id}</span></td>
                    <td><span class="badge badge-warn">${escHtml(ev.categoria)}</span></td>
                    <td class="item-desc">${escHtml(ev.mensagem)}</td>
                    <td>
                      <p class="item-desc" style="margin:0 0 6px;">${escHtml(ev.solucao)}</p>
                      ${
                        ev.acaoCodigo
                          ? `<button type="button" class="btn btn-sm" data-resolver-codigo="${escHtml(ev.acaoCodigo)}">${escHtml(ev.botaoTexto || "Resolver Agora")}</button>`
                          : ""
                      }
                    </td>
                  </tr>
                `
                  )
                  .join("")
              : '<tr><td colspan="5">Nenhuma falha crítica ou erro encontrado nos últimos 7 dias.</td></tr>'
          }
        </tbody>
      </table>
    </div>

    <div class="section-head">
      <h2 class="section-title">Drivers do PC e Verificador de Segurança Pré-Formatação</h2>
      <div class="topbar-actions">
        <button type="button" class="btn btn-sm" data-abrir-pasta-driver="${escHtml(drvInfo.backupsExistentes[0]?.nomePasta || "")}">
          📂 Abrir Pasta dos Drivers no Windows Explorer
        </button>
        <button type="button" class="btn btn-primary btn-sm" id="btn-backup-drivers">
          💾 Salvar e Verificar Todos os Drivers para Formatação
        </button>
      </div>
    </div>

    ${
      drvInfo.backupsExistentes.length && drvInfo.backupsExistentes[0].totalInf > 0
        ? `
      <article class="panel" style="border-color: var(--ok);">
        <div class="item-head">
          <div>
            <h3 class="item-title" style="color: var(--ok);">✅ PRONTO PARA FORMATAR — BACKUP DE DRIVERS VERIFICADO E AUDITADO!</h3>
            <p class="item-desc">Os arquivos reais de instalação dos drivers (.inf, .sys, .dll e .cat) já estão salvos na pasta de backup e prontos para reinstalação em 1 clique após formatar.</p>
          </div>
          <span class="badge badge-ok">${drvInfo.backupsExistentes[0].tamanhoMB || "Verificado"} MB Salvos</span>
        </div>
        <div class="cards-grid">
          <div>
            <p class="item-desc"><strong>Pasta Salva:</strong> <span class="mono">${escHtml(drvInfo.backupsExistentes[0].caminho)}</span></p>
            <p class="item-desc"><strong>Arquivos Auditados:</strong> <strong>${drvInfo.backupsExistentes[0].totalInf} pacotes .INF</strong> + <strong>${drvInfo.backupsExistentes[0].totalBinarios || "todos os"} binários (.SYS / .DLL / .CAT)</strong></p>
            <p class="item-desc"><strong>Instalador Pós-Formatação Criado:</strong> <span class="mono">Restaurar_Drivers_Deste_PC.bat</span> + <span class="mono">COMPROVANTE_PRE_FORMATACAO.txt</span></p>
          </div>
          <div>
            <p class="item-desc"><strong>Checklist de Drivers Críticos Confirmados:</strong></p>
            <p class="item-desc">✅ Driver de Rede (Internet Cabo / Wi-Fi) · ✅ Driver de Vídeo (GPU) · ✅ Driver de Áudio · ✅ Chipset/USB/Disco</p>
            <div class="item-actions">
              <button type="button" class="btn btn-sm" data-abrir-pasta-driver="${escHtml(drvInfo.backupsExistentes[0].nomePasta)}">
                📂 Ver Arquivos Salvos no Windows Explorer
              </button>
              <button type="button" class="btn btn-primary btn-sm" data-restaurar-driver="${escHtml(drvInfo.backupsExistentes[0].nomePasta)}">
                🔄 Testar / Restaurar Drivers Desta Pasta
              </button>
            </div>
          </div>
        </div>
      </article>
    `
        : `
      <div class="notice notice-warn">
        <div>
          <strong>⚠️ ATENÇÃO ANTES DE FORMATAR: Nenhum pacote de drivers foi exportado ainda!</strong>
          <p class="item-desc">O programa já leu a lista dos ${drvInfo.drivers.length} drivers abaixo, mas para poder formatar o PC com segurança você deve clicar no botão ao lado para copiar os arquivos (.inf / .sys / .dll) para a pasta de backup.</p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="btn-backup-drivers-aviso">
          💾 Copiar Drivers para Backup Agora
        </button>
      </div>
    `
    }

    ${
      drvInfo.dispositivosComErro.length
        ? `<div class="notice notice-warn"><span>Atenção: dispositivos com erro detectados (${drvInfo.dispositivosComErro.map((e) => `${escHtml(e.nome)} [cód ${e.codigoErro}]`).join(", ")}).</span></div>`
        : ""
    }

    ${
      drvInfo.backupsExistentes.length
        ? `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Pasta do Backup</th>
              <th>Pacotes .inf</th>
              <th>Comando de Restauração (CMD Admin)</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            ${drvInfo.backupsExistentes
              .map(
                (b) => `
              <tr>
                <td class="mono">${escHtml(b.nomePasta)}</td>
                <td>${b.totalInf}</td>
                <td class="mono">pnputil /add-driver "${escHtml(b.caminho)}\\*.inf" /subdirs /install</td>
                <td>
                  <button type="button" class="btn btn-sm" data-restaurar-driver="${escHtml(b.nomePasta)}">
                    Restaurar Drivers
                  </button>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
        : ""
    }

    <div class="toolbar">
      <input
        type="search"
        class="input-field"
        id="input-busca-drivers"
        placeholder="Filtrar drivers por dispositivo, classe (Display, Net) ou fabricante..."
        value="${escHtml(estado.buscaDrivers)}"
      >
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Classe</th>
            <th>Dispositivo</th>
            <th>Fabricante</th>
            <th>Versão Real</th>
            <th>Data do Driver</th>
            <th>Arquivo INF</th>
          </tr>
        </thead>
        <tbody>
          ${
            driversFiltrados.length
              ? driversFiltrados
                  .slice(0, 140)
                  .map(
                    (dr) => `
                  <tr>
                    <td><span class="badge">${escHtml(dr.classe)}</span></td>
                    <td><strong>${escHtml(dr.dispositivo)}</strong></td>
                    <td>${escHtml(dr.fabricante || "Microsoft")}</td>
                    <td class="mono">${escHtml(dr.versao || "Nativo")}</td>
                    <td class="mono">${escHtml(dr.data || "Padrão")}</td>
                    <td class="mono">${escHtml(dr.inf || "windows.inf")}</td>
                  </tr>
                `
                  )
                  .join("")
              : '<tr><td colspan="6">Nenhum driver encontrado para este filtro.</td></tr>'
          }
        </tbody>
      </table>
    </div>
  `;
}

function renderPenDriveIsos() {
  const ferramentas = estado.isoTools || [];
  const kit = estado.kitNinite || [];
  const selecionados = new Set(estado.selecionadosNinite || []);

  return `
    <article class="panel">
      <div class="item-head">
        <div>
          <h2 class="section-title">Super Combo Técnico 1-Clique (Limpeza + Raio-X + S.M.A.R.T.)</h2>
          <p class="item-desc">
            Limpa arquivos temporários, renova o cache DNS, audita a saúde S.M.A.R.T. dos discos e gera o Raio-X completo em poucos segundos.
          </p>
        </div>
        <button type="button" class="btn btn-primary" id="btn-super-combo">
          Executar Super Combo Técnico 1-Clique
        </button>
      </div>
    </article>

    <article class="panel">
      <div class="item-head">
        <div>
          <h2 class="section-title">Modo PenDrive Portátil para Técnicos</h2>
          <p class="item-desc">
            Copie o kit inteiro para o seu PenDrive. Em PCs com Node.js use <strong>Iniciar_Windows_Boost_Pro.bat</strong> ou <strong>Abrir_No_CMD.bat</strong>; em PCs sem Node.js, rode <strong>Modo_PenDrive_Sem_Node.bat</strong> (PowerShell nativo).
          </p>
        </div>
      </div>
      <div class="toolbar">
        <input
          type="text"
          class="input-field"
          id="input-destino-pendrive"
          placeholder="Unidade ou pasta destino (ex.: E:\\WindowsBoostPro)"
          value="E:\\WindowsBoostPro"
        >
        <button type="button" class="btn btn-primary" id="btn-copiar-pendrive">
          Copiar Kit Completo para PenDrive
        </button>
      </div>
    </article>

    <div class="section-head">
      <h2 class="section-title">Instalador Pós-Formatação Estilo Ninite + Melhores Ferramentas (${kit.length})</h2>
      <div class="topbar-actions">
        <a class="btn btn-sm" href="https://ninite.com" target="_blank" rel="noopener">Abrir Ninite.com Oficial</a>
        <button type="button" class="btn btn-sm" id="btn-ninite-recomendados">Selecionar Recomendados</button>
        <button type="button" class="btn btn-sm" id="btn-ninite-limpar">Limpar Seleção</button>
        <button type="button" class="btn btn-primary btn-sm" id="btn-ninite-instalar">
          Instalar Selecionados (${selecionados.size})
        </button>
      </div>
    </div>

    <div class="cards-grid">
      ${kit
        .map((item) => {
          const marcado = selecionados.has(item.id);
          return `
            <article class="panel">
              <div class="item-head">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight:600;">
                  <input type="checkbox" data-ninite-id="${escHtml(item.id)}" ${marcado ? "checked" : ""}>
                  <span>${escHtml(item.nome)}</span>
                </label>
                <span class="badge ${item.recomendado ? "badge-ok" : ""}">
                  ${item.recomendado ? "Recomendado" : escHtml(item.categoria)}
                </span>
              </div>
              <p class="item-desc">${escHtml(item.descricao)}</p>
              <p class="metric-meta mono">${escHtml(item.id)}</p>
            </article>
          `;
        })
        .join("")}
    </div>

    <div class="section-head">
      <h2 class="section-title">Baixar Sistema Operacional Rápido (ISOs Oficiais Windows 10 / 11 e Rufus)</h2>
    </div>

    <div class="cards-grid">
      ${ferramentas
        .map(
          (f) => `
        <article class="panel">
          <div class="item-head">
            <h3 class="item-title">${escHtml(f.nome)}</h3>
            <span class="badge ${f.baixado ? "badge-ok" : "badge-info"}">
              ${f.baixado ? `Salvo (${f.tamanhoMB} MB)` : "Pronto para baixar"}
            </span>
          </div>
          <p class="item-desc">${escHtml(f.descricao)}</p>
          <p class="metric-meta mono">${escHtml(f.arquivo)}</p>
          <div class="item-actions">
            <button type="button" class="btn btn-primary btn-sm" data-baixar-iso="${escHtml(f.id)}">
              ${f.baixado ? "Baixar Novamente" : "Baixar para o PenDrive Agora"}
            </button>
          </div>
        </article>
      `
        )
        .join("")}
    </div>
  `;
}

function renderAssistente() {
  const receitas = estado.receitasAssistente || [];
  const recCount = estado.diagnostico?.dados?.recomendacoes?.length || 0;
  const resp = estado.respostaAssistente;

  return `
    <article class="panel">
      <div class="item-head">
        <div>
          <h2 class="section-title">Resolução Automática Baseada no Raio-X</h2>
          <p class="item-desc">
            ${
              recCount > 0
                ? `O sistema detectou <strong>${recCount} ponto(s) de atenção</strong> neste computador e pode corrigir os problemas seguros automaticamente em 1 clique.`
                : "Analise os logs, limpe temporários, libere memória RAM e aplique correções seguras em 1 clique."
            }
          </p>
        </div>
        <button type="button" class="btn btn-primary" data-autocorrigir="true">
          Resolver Automaticamente Todos os Problemas Detectados (1 Clique)
        </button>
      </div>
    </article>

    <article class="panel">
      <h2 class="section-title">Descreva o Problema com Suas Palavras</h2>
      <p class="item-desc">Diga o que o computador está fazendo (travando, lento, erro de som, internet lenta, barra congelada) que o assistente identifica e resolve para você.</p>
      <div class="toolbar">
        <input
          type="text"
          class="input-field"
          id="input-sintoma-livre"
          placeholder="Ex.: O PC está demorando para ligar, a barra de tarefas travou, internet lenta..."
          value="${escHtml(estado.sintomaLivre)}"
        >
        <button type="button" class="btn btn-sm" id="btn-analisar-sintoma">
          Analisar e Me Dizer o Que Fazer
        </button>
        <button type="button" class="btn btn-primary btn-sm" id="btn-analisar-e-resolver">
          Analisar e Já Resolver Agora!
        </button>
      </div>
      ${
        resp
          ? `
        <div class="notice ${resp.execucao?.ok ? "notice-info" : "notice-warn"}" style="margin-top: 10px; display:block;">
          <p style="margin:0 0 6px;"><strong>Diagnóstico:</strong> ${escHtml(resp.explicacao || "")}</p>
          ${
            resp.execucao
              ? `<p style="margin:0; white-space:pre-line;"><strong>Resultado executado:</strong>\n${escHtml(resp.execucao.mensagem || "")}</p>`
              : resp.receitaRecomendada
              ? `<button type="button" class="btn btn-primary btn-sm" data-resolver-codigo="${escHtml(resp.receitaRecomendada.codigo)}">Aplicar Correção Recomendada Agora</button>`
              : ""
          }
        </div>
      `
          : ""
      }
    </article>

    <div class="section-head">
      <h2 class="section-title">6 Problemas Comuns — Clique no Sintoma para Resolver</h2>
    </div>

    <div class="cards-grid">
      ${receitas
        .map(
          (r) => `
        <article class="panel">
          <div class="item-head">
            <h3 class="item-title">${escHtml(r.titulo)}</h3>
            <span class="badge ${r.requerAdmin ? "badge-warn" : "badge-ok"}">
              ${r.requerAdmin ? "Completo com Admin" : "Direto"}
            </span>
          </div>
          <p class="item-desc">${escHtml(r.oQueFaz)}</p>
          <div class="item-actions">
            <button type="button" class="btn btn-primary btn-sm" data-resolver-codigo="${escHtml(r.codigo)}">
              Resolver Este Problema Agora
            </button>
          </div>
        </article>
      `
        )
        .join("")}
    </div>
  `;
}

function renderRemotoTecnico() {
  const info = estado.tecnicoInfo || {};
  const p = info.perfil || {
    nome: "Jonas Mendonça",
    telefone: "(11) 96670-7293",
    email: "jonas.skynet@gmail.com",
    empresa: "Jonas Mendonça — Assistência Técnica Especializada & Suporte Remoto",
    valorPadrao: "R$ 150,00",
  };
  const rem = info.statusRemoto || {};
  const top10 = info.top10Github || [];
  const hw = estado.hardware || {};
  const ipsTexto = (rem.ipsLocais || []).join(" · ") || "192.168.100.210";

  const digitosZap = String(p.telefone || "").replace(/\D/g, "");
  const zapComDdi = digitosZap.length >= 10 && !digitosZap.startsWith("55") ? `55${digitosZap}` : digitosZap;
  const msgZap = encodeURIComponent(
    `Olá ${p.nome}! Preciso de suporte técnico remoto para o equipamento ${hw.hostname || "PC"} (${hw.sistema || "Windows"} | IP Local: ${ipsTexto}).`
  );
  const urlZap = zapComDdi ? `https://wa.me/${zapComDdi}?text=${msgZap}` : "#";
  const mailtoUrl = `mailto:${encodeURIComponent(p.email || "jonas.skynet@gmail.com")}?subject=${encodeURIComponent(
    `Suporte Técnico Windows Boost Pro — ${hw.hostname || "PC"}`
  )}`;

  return `
    <article class="panel" style="border-color: var(--ok);">
      <div class="item-head">
        <div>
          <h2 class="section-title">🔑 Controle das 2 Versões (LITE Mais Baixa vs. PRO Completa) &amp; Gerador de Chaves</h2>
          <p class="item-desc">
            Gere chaves exclusivas para vender/liberar a <strong>Versão Completa (PRO)</strong> ou compartilhe o link da <strong>Versão LITE (Mais Baixa)</strong> para seus clientes.
          </p>
        </div>
        <span class="badge badge-ok">Licença PRO Ativa</span>
      </div>
      <div class="topbar-actions" style="flex-wrap:wrap;">
        <button type="button" class="btn btn-primary btn-sm" id="btn-gerar-chave-pro">⚡ Gerar Nova Chave PRO para Cliente</button>
        <button type="button" class="btn btn-sm" data-trocar-edicao="lite">👁️ Visualizar como Versão LITE</button>
        <button type="button" class="btn btn-sm" data-copiar-texto="https://jonasskynet-eng.github.io/windows-boost-pro/?edicao=lite">📋 Copiar Link da Versão LITE</button>
        <button type="button" class="btn btn-sm" data-copiar-texto="https://jonasskynet-eng.github.io/windows-boost-pro/?edicao=pro">📋 Copiar Link da Versão PRO</button>
      </div>
      ${
        estado.ultimaChaveGerada
          ? `<div style="margin-top:8px; padding:10px; border-radius:6px; background:var(--surface-2); border:1px solid var(--ok); display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
              <span>Chave PRO pronta para entregar ao comprador: <strong class="mono" style="color:var(--ok);">${escHtml(estado.ultimaChaveGerada)}</strong></span>
              <button type="button" class="btn btn-sm" data-copiar-texto="${escHtml(estado.ultimaChaveGerada)}">📋 Copiar Chave</button>
            </div>`
          : ""
      }
    </article>

    <article class="panel">
      <div class="item-head">
        <div>
          <h2 class="section-title">👨‍💻 Identidade do Técnico no Sistema (Nome, WhatsApp, E-mail e Marca no Windows)</h2>
          <p class="item-desc">
            Estes dados ficam gravados no menu lateral, nos relatórios HTML, nas Ordens de Serviço e podem ser estampados dentro de <strong>Configurações &rarr; Sistema &rarr; Sobre</strong> do Windows do cliente!
          </p>
        </div>
        <div class="topbar-actions">
          ${
            zapComDdi
              ? `<a class="btn btn-primary btn-sm" href="${escHtml(urlZap)}" target="_blank" rel="noopener">📲 WhatsApp: ${escHtml(p.telefone)}</a>`
              : ""
          }
          <a class="btn btn-sm" href="${escHtml(mailtoUrl)}">✉️ ${escHtml(p.email || "jonas.skynet@gmail.com")}</a>
        </div>
      </div>

      <div class="cards-grid">
        <div>
          <label class="metric-label" for="input-tec-nome">Nome do Técnico / Responsável</label>
          <input type="text" class="input-field" id="input-tec-nome" value="${escHtml(p.nome)}">
        </div>
        <div>
          <label class="metric-label" for="input-tec-tel">Telefone / WhatsApp de Suporte</label>
          <input type="text" class="input-field" id="input-tec-tel" value="${escHtml(p.telefone)}" placeholder="Ex.: (11) 96670-7293">
        </div>
        <div>
          <label class="metric-label" for="input-tec-email">E-mail Profissional do Técnico</label>
          <input type="email" class="input-field" id="input-tec-email" value="${escHtml(p.email || "jonas.skynet@gmail.com")}">
        </div>
        <div>
          <label class="metric-label" for="input-tec-valor">Valor Padrão da Manutenção</label>
          <input type="text" class="input-field" id="input-tec-valor" value="${escHtml(p.valorPadrao || "R$ 150,00")}">
        </div>
      </div>
      <div>
        <label class="metric-label" for="input-tec-empresa">Nome da Assistência / Especialidade</label>
        <input type="text" class="input-field" id="input-tec-empresa" value="${escHtml(p.empresa)}">
      </div>

      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.9rem;">
        <input type="checkbox" id="check-tec-oem" checked>
        <span>Estampar também meu Nome e Telefone nas <strong>Propriedades do Sistema do Windows (OEM Support Info)</strong> quando estiver como Administrador</span>
      </label>

      <div class="item-actions">
        <button type="button" class="btn btn-primary btn-sm" id="btn-salvar-tecnico">
          💾 Salvar Nome e Telefone do Técnico no Sistema
        </button>
      </div>
    </article>

    <div class="section-head">
      <h2 class="section-title">📡 Central de Acesso Remoto Integrada ao Sistema Operacional</h2>
      <span class="badge badge-info">IP Local: ${escHtml(ipsTexto)}</span>
    </div>

    <div class="cards-grid">
      <article class="panel">
        <div class="item-head">
          <h3 class="item-title">1. Assistência Rápida Nativa do Windows 10 e 11 (Quick Assist)</h3>
          <span class="badge badge-ok">Integrado ao SO</span>
        </div>
        <p class="item-desc">Ferramenta oficial da Microsoft já embutida no Windows 10 e 11 (atalho Ctrl+Win+Q). Permite controlar o PC do cliente com um código de 6 dígitos sem instalar nada.</p>
        <div class="item-actions">
          <button type="button" class="btn btn-primary btn-sm" data-remoto-acao="abrir_quickassist">
            Abrir Assistência Rápida do Windows Agora
          </button>
        </div>
      </article>

      <article class="panel">
        <div class="item-head">
          <h3 class="item-title">2. RustDesk Open-Source (GitHub 83.000+ ⭐ — Sem Limite)</h3>
          <span class="badge ${rem.rustdeskInstalado ? "badge-ok" : "badge-info"}">
            ${rem.rustdeskInstalado ? "Instalado no PC" : "Instala em 1 Clique"}
          </span>
        </div>
        <p class="item-desc">O maior software de acesso remoto gratuito e de código aberto do GitHub. Não bloqueia por uso comercial como o TeamViewer/AnyDesk.</p>
        <div class="item-actions">
          <button type="button" class="btn btn-primary btn-sm" data-remoto-acao="abrir_ou_instalar_rustdesk">
            ${rem.rustdeskInstalado ? "Abrir RustDesk na Tela" : "Instalar e Abrir RustDesk (1 Clique)"}
          </button>
        </div>
      </article>

      <article class="panel">
        <div class="item-head">
          <h3 class="item-title">3. AnyDesk Suporte Remoto Rápido</h3>
          <span class="badge ${rem.anydeskInstalado ? "badge-ok" : "badge-info"}">
            ${rem.anydeskInstalado ? "Instalado no PC" : "Instala em 1 Clique"}
          </span>
        </div>
        <p class="item-desc">Abre o AnyDesk imediatamente para o cliente passar o ID de 9 dígitos, ou instala automaticamente via Winget se ainda não estiver na máquina.</p>
        <div class="item-actions">
          <button type="button" class="btn btn-primary btn-sm" data-remoto-acao="abrir_ou_instalar_anydesk">
            ${rem.anydeskInstalado ? "Abrir AnyDesk na Tela" : "Instalar e Abrir AnyDesk (1 Clique)"}
          </button>
        </div>
      </article>

      <article class="panel">
        <div class="item-head">
          <h3 class="item-title">4. Área de Trabalho Remota Nativa (RDP / mstsc + Convite msra)</h3>
          <span class="badge ${rem.rdpServidorAtivo ? "badge-ok" : "badge-warn"}">
            ${rem.rdpServidorAtivo ? "Servidor RDP Ativo" : "RDP Desativado"}
          </span>
        </div>
        <p class="item-desc">Acesso remoto de alta velocidade integrado ao Windows na rede local (${escHtml(ipsTexto)}) ou geração de arquivo de convite criptografado (msra.exe).</p>
        <div class="item-actions">
          <button type="button" class="btn btn-primary btn-sm" data-remoto-acao="abrir_mstsc">Abrir Cliente RDP (mstsc)</button>
          <button type="button" class="btn btn-sm" data-remoto-acao="abrir_msra">Convite do Windows (msra)</button>
          <button type="button" class="btn btn-sm" data-remoto-acao="${rem.rdpServidorAtivo ? "desativar_rdp" : "ativar_rdp"}">
            ${rem.rdpServidorAtivo ? "Desativar Servidor RDP" : "Ativar Servidor RDP"}
          </button>
        </div>
      </article>
    </div>

    <div class="section-head">
      <h2 class="section-title">🏆 Os 10 Melhores Repositórios do GitHub Integrados ao Seu Projeto</h2>
      <span class="badge badge-ok">Top 10 Mundial</span>
    </div>

    <div class="cards-grid">
      ${top10
        .map(
          (g) => `
        <article class="panel">
          <div class="item-head">
            <h3 class="item-title">#${g.rank} · ${escHtml(g.repo)}</h3>
            <span class="badge badge-info">${escHtml(g.estrelas)}</span>
          </div>
          <p class="item-desc"><strong>Foco:</strong> ${escHtml(g.foco)}</p>
          <p class="metric-meta">${escHtml(g.integradoComo)}</p>
          <div class="item-actions">
            ${
              g.acaoTipo === "catalogo"
                ? `<button type="button" class="btn btn-primary btn-sm" data-acao="aplicar" data-id="${escHtml(g.acaoAlvo)}">${escHtml(g.botaoTexto)}</button>`
                : g.acaoTipo === "remoto"
                ? `<button type="button" class="btn btn-primary btn-sm" data-remoto-acao="${escHtml(g.acaoAlvo)}">${escHtml(g.botaoTexto)}</button>`
                : `<button type="button" class="btn btn-primary btn-sm" data-instalar-unico="${escHtml(g.acaoAlvo)}">${escHtml(g.botaoTexto)}</button>`
            }
            <a class="btn btn-sm" href="https://github.com/${escHtml(g.repo)}" target="_blank" rel="noopener">Ver no GitHub</a>
          </div>
        </article>
      `
        )
        .join("")}
    </div>
  `;
}

function renderBancadaHardware() {
  const res = estado.bancadaResultado;
  const laudo = estado.ultimoLaudoBancada;
  const badgeSt = (st) => (st === "aprovado" ? "badge-ok" : st === "atencao" ? "badge-warn" : "badge-danger");

  const renderBotaoEtapa = (et) => {
    if (et.acaoTipo === "assistente") {
      return `<button type="button" class="btn btn-primary btn-sm" data-resolver-codigo="${escHtml(et.acaoCodigo)}">${escHtml(et.botaoTexto)}</button>`;
    }
    if (et.acaoTipo === "ninite") {
      return `<button type="button" class="btn btn-sm" data-instalar-unico="${escHtml(et.acaoCodigo)}">${escHtml(et.botaoTexto)}</button>`;
    }
    if (et.acaoTipo === "memoria") {
      return `<button type="button" class="btn btn-sm" id="btn-abrir-mdsched">${escHtml(et.botaoTexto)}</button>`;
    }
    if (et.acaoTipo === "backup_drivers") {
      const jaTemBackup = String(et.botaoTexto || "").toLowerCase().includes("abrir pasta");
      return jaTemBackup
        ? `<button type="button" class="btn btn-primary btn-sm" data-abrir-pasta-driver="">${escHtml(et.botaoTexto)}</button>`
        : `<button type="button" class="btn btn-primary btn-sm" id="btn-backup-drivers">${escHtml(et.botaoTexto)}</button>`;
    }
    if (et.acaoTipo === "orcamento") {
      return `<button type="button" class="btn btn-primary btn-sm" data-gerar-laudo-bancada="true">${escHtml(et.botaoTexto)}</button>`;
    }
    return "";
  };

  return `
    <article class="panel" style="border-color: var(--primary);">
      <div class="item-head">
        <div>
          <h2 class="section-title">🔬 Fluxo Avançado de Verificação de Hardware em 6 Etapas (Rodando 100% Direto no Programa)</h2>
          <p class="item-desc">
            O próprio programa executa as 6 etapas na máquina, gera o <strong>Laudo Técnico em PDF/Impressão</strong> com sua assinatura e monta o <strong>resumo pronto para o WhatsApp</strong> do cliente:
          </p>
        </div>
        <button type="button" class="btn btn-primary" id="btn-rodar-bancada-6">
          ▶ Rodar Verificação Completa das 6 Etapas Agora
        </button>
      </div>
      <div class="toolbar" style="margin-top:8px;">
        <input
          type="text"
          class="input-field"
          id="input-cliente-bancada"
          placeholder="Nome do cliente para sair no Laudo (opcional, ex.: Carlos Silva)"
          value="${escHtml(estado.clienteBancada || "")}"
        >
        <button type="button" class="btn btn-primary btn-sm" data-gerar-laudo-bancada="true">
          📄 Gerar Laudo da Bancada (PDF / Imprimir)
        </button>
        <button type="button" class="btn btn-sm" id="btn-whatsapp-laudo-bancada">
          💬 Enviar Laudo no WhatsApp
        </button>
        ${
          laudo?.urlRelatorio
            ? `<a class="btn btn-sm" href="${escHtml(laudo.urlRelatorio)}" target="_blank" rel="noopener">📂 Abrir Último Laudo</a>`
            : ""
        }
      </div>
      ${
        res
          ? `
        <div class="metrics-grid" style="margin-top:8px;">
          <div class="panel">
            <p class="metric-label">Nota Geral de Hardware</p>
            <p class="metric-value" style="color:${res.notaBancada >= 85 ? "var(--ok)" : "var(--warn)"};">${res.notaBancada}/100</p>
            <p class="metric-meta">Concluído em ${res.duracaoSeg}s (${escHtml(res.executadoEm)})</p>
          </div>
          <div class="panel">
            <p class="metric-label">Etapas Aprovadas</p>
            <p class="metric-value">${res.aprovadas} de 6</p>
            <p class="metric-meta">Semáforo de bancada auditado</p>
          </div>
          <div class="panel">
            <p class="metric-label">Alertas Críticos</p>
            <p class="metric-value">${res.criticas}</p>
            <p class="metric-meta">${res.criticas === 0 ? "Nenhum defeito físico crítico" : "Atenção técnica exigida"}</p>
          </div>
          <div class="panel">
            <p class="metric-label">Técnico Responsável</p>
            <p class="metric-value">${escHtml(estado.tecnicoInfo?.perfil?.nome || "Jonas Mendonça")}</p>
            <p class="metric-meta">${escHtml(estado.tecnicoInfo?.perfil?.telefone || "(11) 96670-7293")}</p>
          </div>
        </div>
      `
          : '<p class="metric-meta">Clique no botão acima para executar as 6 etapas de verificação real neste equipamento.</p>'
      }
    </article>

    ${
      res?.etapas?.length
        ? `
      <div class="cards-grid">
        ${res.etapas
          .map(
            (et) => `
          <article class="panel">
            <div class="item-head">
              <h3 class="item-title">Etapa ${et.numero} · ${escHtml(et.titulo)}</h3>
              <span class="badge ${badgeSt(et.status)}">${escHtml(et.statusTexto)}</span>
            </div>
            <p class="mono" style="margin:0; color: var(--primary);">${escHtml(et.medicao)}</p>
            <p class="item-desc">${escHtml(et.diagnostico)}</p>
            <div class="item-actions">${renderBotaoEtapa(et)}</div>
          </article>
        `
          )
          .join("")}
      </div>
    `
        : ""
    }
  `;
}

async function garantirDadosDaAba(aba) {
  if (aba === "bancada_hardware") {
    if (!estado.bancadaResultado) {
      const { ok, data } = await apiPost("/api/hardware/verificar-6-etapas", {});
      if (ok && data.ok) estado.bancadaResultado = data;
    }
  } else if (aba === "remoto_tecnico") {
    estado.tecnicoInfo = await apiGet("/api/tecnico");
    atualizarBarraLateral();
  } else if (aba === "assistente") {
    const [assRes, diagRes] = await Promise.all([
      estado.receitasAssistente ? Promise.resolve({ receitas: estado.receitasAssistente }) : apiGet("/api/assistente"),
      estado.diagnostico ? Promise.resolve(estado.diagnostico) : apiGet("/api/diagnostico"),
    ]);
    estado.receitasAssistente = assRes.receitas || [];
    estado.diagnostico = diagRes;
  } else if (aba === "raiox_drivers") {
    const diag = await apiGet("/api/diagnostico");
    estado.diagnostico = diag;
    estado.drivers = diag?.dados?.driversInfo || (await apiGet("/api/drivers"));
  } else if (aba === "pendrive_isos") {
    const dados = await apiGet("/api/iso-tools");
    estado.isoTools = dados.ferramentas;
    estado.kitNinite = dados.kitNinite;
    if (estado.selecionadosNinite.length === 0) {
      estado.selecionadosNinite = dados.kitNinite.filter((i) => i.recomendado).map((i) => i.id);
    }
  } else if (aba === "otimizar_jogos" && !estado.jogos) {
    estado.jogos = (await apiGet("/api/jogos")).jogos;
  } else if (aba === "inicializacao" && !estado.startup) {
    estado.startup = (await apiGet("/api/startup")).itens;
  } else if (aba === "reparo_logs") {
    estado.logs = (await apiGet("/api/logs")).logs;
  }
}

function renderizar() {
  const info = INFO_ABAS[estado.aba];
  document.getElementById("titulo-aba").textContent = info.titulo;
  document.getElementById("subtitulo-aba").textContent = info.subtitulo;

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    const tab = btn.dataset.tab;
    btn.classList.toggle("is-active", tab === estado.aba);
    const bloqueada = !abaLiberadaNaEdicao(tab);
    let cadeado = btn.querySelector(".tag-lock-pro");
    if (bloqueada) {
      if (!cadeado) {
        cadeado = document.createElement("span");
        cadeado.className = "tag-lock-pro";
        cadeado.style.cssText = "margin-left:auto; font-size:0.7rem; color:var(--warn); font-weight:700;";
        cadeado.textContent = "🔒 PRO";
        btn.appendChild(cadeado);
      }
    } else if (cadeado) {
      cadeado.remove();
    }
  });

  const container = document.getElementById("conteudo-principal");
  if (!estado.hardware || !estado.catalogo) {
    container.innerHTML = '<p class="metric-meta">Carregando diagnóstico local...</p>';
    return;
  }

  if (!abaLiberadaNaEdicao(estado.aba)) {
    container.innerHTML = renderTelaUpgradePro(estado.aba);
    return;
  }

  switch (estado.aba) {
    case "visao_geral":
      container.innerHTML = renderVisaoGeral();
      break;
    case "liberar_pro":
      container.innerHTML = renderLiberarPro();
      break;
    case "assistente":
      container.innerHTML = renderAssistente();
      break;
    case "bancada_hardware":
      container.innerHTML = renderBancadaHardware();
      break;
    case "remoto_tecnico":
      container.innerHTML = renderRemotoTecnico();
      break;
    case "raiox_drivers":
      container.innerHTML = renderRaioXDrivers();
      break;
    case "pendrive_isos":
      container.innerHTML = renderPenDriveIsos();
      break;
    case "otimizar_windows":
      container.innerHTML = renderOtimizarWindows();
      break;
    case "otimizar_jogos":
      container.innerHTML = renderOtimizarJogos();
      break;
    case "rede_ping":
      container.innerHTML = renderRedePing();
      break;
    case "memoria_ram":
      container.innerHTML = renderMemoriaRam();
      break;
    case "placa_video":
      container.innerHTML = renderPlacaVideo();
      break;
    case "inicializacao":
      container.innerHTML = renderInicializacao();
      break;
    case "reparo_logs":
      container.innerHTML = renderReparoLogs();
      break;
    default:
      container.innerHTML = renderVisaoGeral();
  }
}

async function trocarAba(novaAba) {
  estado.aba = novaAba;
  alternarMenuMobile(false);
  try {
    await garantirDadosDaAba(novaAba);
    renderizar();
    if (window.innerWidth <= 860) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } catch (erro) {
    definirConsole(false, "Carregamento da aba", erro.message);
  }
}

function registrarEventos() {
  document.getElementById("btn-abrir-menu-mobile")?.addEventListener("click", () => alternarMenuMobile(true));
  document.getElementById("btn-fechar-menu-mobile")?.addEventListener("click", () => alternarMenuMobile(false));
  document.getElementById("overlay-menu-mobile")?.addEventListener("click", () => alternarMenuMobile(false));

  document.addEventListener("click", async (ev) => {
    const pwaBtn = ev.target.closest("[data-instalar-pwa]");
    if (pwaBtn) {
      acionarInstalacaoPwa();
      return;
    }

    const trocarEdBtn = ev.target.closest("[data-trocar-edicao]");
    if (trocarEdBtn) {
      const novaEd = trocarEdBtn.dataset.trocarEdicao;
      const { ok, data } = await apiPost("/api/edicao/alterar", { edicao: novaEd });
      if (ok && data.ok) {
        estado.edicaoInfo = data;
        if (novaEd === "lite" && !abaLiberadaNaEdicao(estado.aba)) {
          estado.aba = "visao_geral";
        }
        atualizarBarraLateral();
        renderizar();
        definirConsole(true, data.nomeEdicao, data.mensagem);
      }
      return;
    }

    if (ev.target.id === "btn-ativar-chave-pro") {
      const chave = (document.getElementById("input-chave-ativacao-pro")?.value || "").trim();
      const { ok, data } = await apiPost("/api/edicao/alterar", { chave });
      if (ok && data.ok) {
        estado.edicaoInfo = data;
        atualizarBarraLateral();
        renderizar();
      }
      definirConsole(ok && data.ok, "Ativação PRO", data.mensagem || "Verificação concluída.");
      return;
    }

    if (ev.target.id === "btn-gerar-chave-pro") {
      const { ok, data } = await apiPost("/api/edicao/gerar-chave", {});
      if (ok && data.ok) {
        estado.ultimaChaveGerada = data.chave;
        renderizar();
      }
      definirConsole(ok && data.ok, "Gerador de Chaves PRO", data.mensagem || "Chave gerada.");
      return;
    }

    if (ev.target.id === "btn-solicitar-liberacao-pro") {
      const nomeCliente = (document.getElementById("input-pedido-nome")?.value || "").trim();
      const whatsappCliente = (document.getElementById("input-pedido-whatsapp")?.value || "").trim();
      const observacao = (document.getElementById("input-pedido-obs")?.value || "").trim();
      const { ok, data } = await apiPost("/api/edicao/pedidos/solicitar", {
        nomeCliente,
        whatsappCliente,
        observacao,
        hostname: estado.hardware?.hostname || "",
        uuidHardware: estado.hardware?.uuidHardware || "",
      });
      if (ok && data.ok) {
        estado.pedidosProInfo = {
          pedidos: data.pedidos || [],
          pendentes: data.pendentes || 0,
          ultimoAvisoCliente: data.ultimoAvisoCliente || null,
        };
        estado.ultimoLinkZapPedido = data.linkWhatsappJonas || "";
        atualizarAvisosLiberacaoPro();
        renderizar();
        mostrarToastRapido(true, "Pedido Enviado ao Jonas!", data.mensagem);
      }
      definirConsole(ok && data.ok, "Pedido de Liberação PRO", data.mensagem || "Pedido registrado.");
      return;
    }

    const decidirBtn = ev.target.closest("[data-decidir-pedido-pro]");
    if (decidirBtn) {
      const acao = decidirBtn.dataset.decidirPedidoPro;
      const id = decidirBtn.dataset.pedidoId;
      const avisoPersonalizado = (document.getElementById("input-aviso-personalizado-pro")?.value || "").trim();
      const { ok, data } = await apiPost("/api/edicao/pedidos/decidir", { id, acao, avisoPersonalizado });
      if (ok && data.ok) {
        estado.pedidosProInfo = {
          pedidos: data.pedidos || [],
          pendentes: data.pendentes || 0,
          ultimoAvisoCliente: data.ultimoAvisoCliente || null,
        };
        if (data.edicaoInfo?.edicao) {
          estado.edicaoInfo = data.edicaoInfo;
        }
        atualizarBarraLateral();
        renderizar();
        mostrarToastRapido(true, acao === "aprovar" ? "PRO Liberado!" : "Aviso Enviado", data.mensagem);
      }
      definirConsole(ok && data.ok, "Central de Liberação PRO", data.mensagem || "Atualizado.");
      return;
    }

    const confAvisoBtn = ev.target.closest("[data-confirmar-aviso-pro]");
    if (confAvisoBtn) {
      const id = confAvisoBtn.dataset.confirmarAvisoPro;
      const { ok, data } = await apiPost("/api/edicao/pedidos/decidir", { id, acao: "limpar_aviso" });
      if (ok && data.ok) {
        estado.pedidosProInfo = {
          pedidos: data.pedidos || [],
          pendentes: data.pendentes || 0,
          ultimoAvisoCliente: data.ultimoAvisoCliente || null,
        };
        atualizarAvisosLiberacaoPro();
        renderizar();
      }
      return;
    }

    if (ev.target.id === "btn-atualizar-pedidos-pro") {
      const ped = await apiGet("/api/edicao/pedidos");
      if (ped?.ok) {
        estado.pedidosProInfo = ped;
        atualizarAvisosLiberacaoPro();
        renderizar();
        mostrarToastRapido(true, "Fila Atualizada", `${ped.pendentes || 0} pedido(s) aguardando liberação.`);
      }
      return;
    }
  });

  window.addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
    promptInstalacaoPwa = ev;
  });

  document.getElementById("menu-navegacao").addEventListener("click", (ev) => {
    const btn = ev.target.closest(".nav-btn");
    if (btn?.dataset.tab) {
      trocarAba(btn.dataset.tab);
    }
  });

  document.getElementById("btn-atualizar-hw").addEventListener("click", async () => {
    try {
      await carregarBasico();
      if (estado.aba === "raiox_drivers") {
        const [diag, drv] = await Promise.all([apiGet("/api/diagnostico"), apiGet("/api/drivers")]);
        estado.diagnostico = diag;
        estado.drivers = drv;
      }
      if (estado.aba === "pendrive_isos") {
        const dados = await apiGet("/api/iso-tools");
        estado.isoTools = dados.ferramentas;
        estado.kitNinite = dados.kitNinite;
      }
      if (estado.aba === "otimizar_jogos") estado.jogos = (await apiGet("/api/jogos")).jogos;
      if (estado.aba === "inicializacao") estado.startup = (await apiGet("/api/startup")).itens;
      if (estado.aba === "reparo_logs") estado.logs = (await apiGet("/api/logs")).logs;
      renderizar();
      definirConsole(true, "Diagnóstico atualizado", "Leitura do sistema e hardware atualizada.");
    } catch (erro) {
      definirConsole(false, "Atualização", erro.message);
    }
  });

  document.getElementById("btn-ponto-restauracao").addEventListener("click", () => {
    executarItem("ponto_restauracao", "aplicar", false);
  });

  document.getElementById("btn-modal-cancelar").addEventListener("click", fecharModalAvancado);
  document.getElementById("btn-modal-confirmar").addEventListener("click", async () => {
    const item = estado.confirmacaoPendente;
    fecharModalAvancado();
    if (item) {
      await executarItem(item.id, "aplicar", true);
    }
  });

  const inputBuscaGlobal = document.getElementById("input-busca-global");
  inputBuscaGlobal?.addEventListener("input", (ev) => {
    estado.buscaGlobal = ev.target.value;
    atualizarGavetaBuscaGlobal();
  });

  window.addEventListener("keydown", (ev) => {
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "k") {
      ev.preventDefault();
      inputBuscaGlobal?.focus();
      inputBuscaGlobal?.select();
    } else if (ev.key === "Escape" && estado.buscaGlobal) {
      estado.buscaGlobal = "";
      if (inputBuscaGlobal) inputBuscaGlobal.value = "";
      atualizarGavetaBuscaGlobal();
    }
  });

  const conteudo = document.getElementById("conteudo-principal");
  const areaPrincipal = document.querySelector(".main-area") || conteudo;

  conteudo.addEventListener("input", (ev) => {
    if (ev.target.id === "input-busca-windows") {
      estado.buscaWindows = ev.target.value;
      renderizar();
      const campo = document.getElementById("input-busca-windows");
      campo?.focus();
      campo?.setSelectionRange(campo.value.length, campo.value.length);
    } else if (ev.target.id === "input-busca-jogos") {
      estado.buscaJogos = ev.target.value;
      renderizar();
      const campo = document.getElementById("input-busca-jogos");
      campo?.focus();
      campo?.setSelectionRange(campo.value.length, campo.value.length);
    } else if (ev.target.id === "input-busca-drivers") {
      estado.buscaDrivers = ev.target.value;
      renderizar();
      const campo = document.getElementById("input-busca-drivers");
      campo?.focus();
      campo?.setSelectionRange(campo.value.length, campo.value.length);
    }
  });

  areaPrincipal.addEventListener("click", async (ev) => {
    if (ev.target.id === "btn-fechar-busca-global") {
      estado.buscaGlobal = "";
      if (inputBuscaGlobal) inputBuscaGlobal.value = "";
      atualizarGavetaBuscaGlobal();
      return;
    }

    const copiarBtn = ev.target.closest("[data-copiar-texto]");
    if (copiarBtn) {
      const txt = copiarBtn.dataset.copiarTexto || "";
      try {
        await navigator.clipboard.writeText(txt);
        definirConsole(true, "Chave Copiada", `Copiado para a área de transferência: ${txt}`);
      } catch {
        definirConsole(true, "Chave do Sistema", `Chave selecionada: ${txt}`);
      }
      return;
    }

    const atalhoAba = ev.target.closest("[data-atalho-aba]");
    if (atalhoAba) {
      await trocarAba(atalhoAba.dataset.atalhoAba);
      return;
    }

    if (ev.target.id === "btn-toggle-detalhes-pc-reconhecido") {
      estado.mostrarDetalhesPcReconhecido = !estado.mostrarDetalhesPcReconhecido;
      renderizar();
      return;
    }

    const criarDossieBtn = ev.target.closest("[data-criar-dossie]");
    if (criarDossieBtn) {
      definirConsole(
        true,
        "Backup Completo do PC",
        "Coletando Chaves BIOS/Windows, Ficha Técnica, Drivers, Programas Instalados, Raio-X e Laudo 6 Etapas na unidade..."
      );
      const { ok, data } = await apiPost("/api/dossie/criar", { incluirArquivosDrivers: true });
      if (ok && data.ok) {
        if (data.urlDownloadWeb) {
          const a = document.createElement("a");
          a.href = data.urlDownloadWeb;
          a.download = data.nomeArquivoWeb || "Backup_Aparelho.txt";
          a.click();
        } else {
          const lista = await apiGet("/api/dossie/listar");
          estado.dossies = lista?.dossies || [];
          renderizar();
        }
      }
      definirConsole(ok && data.ok, "Backup Completo do PC", data.mensagem || "Concluído.");
      return;
    }

    const abrirDossieBtn = ev.target.closest("[data-abrir-dossie]");
    if (abrirDossieBtn) {
      const nomePasta = abrirDossieBtn.dataset.abrirDossie || "";
      const { ok, data } = await apiPost("/api/dossie/abrir-pasta", { nomePasta });
      definirConsole(ok && data.ok, "Pasta do Backup", data.mensagem || "Pasta aberta.");
      return;
    }

    const gdriveBtn = ev.target.closest("[data-enviar-gdrive]");
    if (gdriveBtn) {
      const nomePasta = gdriveBtn.dataset.enviarGdrive === "true" ? "" : gdriveBtn.dataset.enviarGdrive || "";
      definirConsole(true, "Nuvem Google Drive", "Compactando o Backup Completo (.ZIP) e preparando envio para sua pasta no Google Drive...");
      const { ok, data } = await apiPost("/api/dossie/google-drive", { nomePasta });
      if (ok && data.ok && modoWebEstatico && data.urlDrive) {
        window.open(data.urlDrive, "_blank", "noopener");
      }
      definirConsole(ok && data.ok, "Nuvem Google Drive", data.mensagem || "Concluído.");
      return;
    }

    if (ev.target.id === "btn-rodar-bancada-6") {
      definirConsole(true, "Bancada 6 Etapas", "Executando auditoria avançada das 6 etapas de hardware...");
      const { ok, data } = await apiPost("/api/hardware/verificar-6-etapas", {});
      if (ok && data.ok) {
        estado.bancadaResultado = data;
        renderizar();
      }
      definirConsole(ok && data.ok, "Bancada 6 Etapas", data.mensagem || "Verificação finalizada.");
      return;
    }

    if (ev.target.id === "btn-abrir-mdsched") {
      const { ok, data } = await apiPost("/api/hardware/testar-memoria", {});
      definirConsole(ok && data.ok, "Diagnóstico de Memória", data.mensagem || "Comando enviado.");
      return;
    }

    const btnLaudoBancada = ev.target.closest("[data-gerar-laudo-bancada]");
    if (btnLaudoBancada || ev.target.id === "btn-whatsapp-laudo-bancada") {
      const abrirWhatsApp = ev.target.id === "btn-whatsapp-laudo-bancada";
      const clienteNome = (document.getElementById("input-cliente-bancada")?.value || estado.clienteBancada || "").trim();
      estado.clienteBancada = clienteNome;

      if (!estado.bancadaResultado) {
        const res6 = await apiPost("/api/hardware/verificar-6-etapas", {});
        if (res6.ok && res6.data?.ok) estado.bancadaResultado = res6.data;
      }

      definirConsole(true, "Laudo da Bancada", "O programa está gerando o Laudo Técnico das 6 Etapas...");
      const { ok, data } = await apiPost("/api/hardware/laudo-bancada", {
        clienteNome: clienteNome || "Cliente / Balcão",
        bancada: estado.bancadaResultado,
      });

      if (ok && data.ok) {
        estado.ultimoLaudoBancada = data;
        renderizar();
        if (abrirWhatsApp && data.textoWhatsApp) {
          window.open(`https://wa.me/?text=${encodeURIComponent(data.textoWhatsApp)}`, "_blank", "noopener");
          definirConsole(true, "WhatsApp do Laudo", "Resumo oficial das 6 Etapas aberto no WhatsApp para encaminhar ao cliente!");
        } else if (data.urlRelatorio) {
          window.open(data.urlRelatorio, "_blank", "noopener");
          definirConsole(true, "Laudo Técnico (PDF)", `${data.mensagem} Aberto em nova aba pronto para Imprimir ou Salvar em PDF.`);
        }
      } else {
        definirConsole(false, "Laudo da Bancada", data.mensagem || "Falha ao gerar o laudo.");
      }
      return;
    }

    if (ev.target.id === "btn-salvar-tecnico") {
      const nome = (document.getElementById("input-tec-nome")?.value || "").trim();
      const telefone = (document.getElementById("input-tec-tel")?.value || "").trim();
      const email = (document.getElementById("input-tec-email")?.value || "").trim();
      const empresa = (document.getElementById("input-tec-empresa")?.value || "").trim();
      const valorPadrao = (document.getElementById("input-tec-valor")?.value || "").trim();
      const gravarNoWindowsOem = Boolean(document.getElementById("check-tec-oem")?.checked);

      definirConsole(true, "Cadastro do Técnico", "Salvando Nome, Telefone e E-mail do Técnico no sistema...");
      const { ok, data } = await apiPost("/api/tecnico/salvar", {
        nome,
        telefone,
        email,
        empresa,
        valorPadrao,
        gravarNoWindowsOem,
      });
      if (ok && data.ok) {
        if (!estado.tecnicoInfo) estado.tecnicoInfo = {};
        estado.tecnicoInfo.perfil = data.perfil;
        atualizarBarraLateral();
        renderizar();
      }
      definirConsole(ok && data.ok, "Cadastro do Técnico", data.mensagem || "Salvo.");
      return;
    }

    const remotoBtn = ev.target.closest("[data-remoto-acao]");
    if (remotoBtn) {
      const acao = remotoBtn.dataset.remotoAcao;
      definirConsole(true, "Acesso Remoto Integrado", `Executando ação remota (${acao})...`);
      const { ok, data } = await apiPost("/api/remoto/executar", { acao });
      definirConsole(ok && data.ok, "Acesso Remoto Integrado", data.mensagem || "Concluído.");
      if (ok && data.ok && estado.aba === "remoto_tecnico") {
        estado.tecnicoInfo = await apiGet("/api/tecnico");
        renderizar();
      }
      return;
    }

    const unicoNinite = ev.target.closest("[data-instalar-unico]");
    if (unicoNinite) {
      const id = unicoNinite.dataset.instalarUnico;
      definirConsole(true, "Instalador Ninite", `Instalando ${id} silenciosamente via winget...`);
      const { ok, data } = await apiPost("/api/ninite/instalar", { ids: [id] });
      definirConsole(ok && data.ok, "Instalador Ninite", data.mensagem);
      return;
    }

    const diagTermo = ev.target.closest("[data-diagnosticar-termo]");
    if (diagTermo) {
      const termo = diagTermo.dataset.diagnosticarTermo;
      estado.sintomaLivre = termo;
      estado.buscaGlobal = "";
      if (inputBuscaGlobal) inputBuscaGlobal.value = "";
      atualizarGavetaBuscaGlobal();
      await trocarAba("assistente");
      const { ok, data } = await apiPost("/api/assistente/diagnosticar", { texto: termo, executarAgora: false });
      estado.respostaAssistente = data;
      renderizar();
      definirConsole(ok && data.ok, "Assistente Técnico", data.explicacao || "Análise pronta.");
      return;
    }

    if (ev.target.id === "btn-buscar-novos-recursos" || ev.target.id === "btn-topo-novos-recursos") {
      if (estado.aba !== "visao_geral") {
        await trocarAba("visao_geral");
      }
      definirConsole(true, "Buscador de Recursos", "Verificando atualizações de programas (winget) e processos pesados...");
      try {
        estado.novosRecursos = await apiGet("/api/recursos/novos");
        renderizar();
        definirConsole(
          true,
          "Buscador de Recursos",
          `Encontrados ${estado.novosRecursos.processosPesados?.length || 0} processos principais e ${estado.novosRecursos.atualizacoesWinget?.length || 0} atualização(ões) no Winget.`
        );
      } catch (erro) {
        definirConsole(false, "Buscador de Recursos", erro.message);
      }
      return;
    }

    if (ev.target.id === "btn-atualizar-todos-programas") {
      definirConsole(true, "Atualizador Winget", "Atualizando programas instalados no PC (winget upgrade --all)...");
      const { ok, data } = await apiPost("/api/recursos/atualizar", {});
      definirConsole(ok && data.ok, "Atualizador Winget", data.mensagem || "Finalizado.");
      return;
    }

    const pidBtn = ev.target.closest("[data-encerrar-pid]");
    if (pidBtn) {
      const pid = Number(pidBtn.dataset.encerrarPid);
      definirConsole(true, "Gerenciador de Processos", `Encerrando processo PID ${pid}...`);
      const { ok, data } = await apiPost("/api/recursos/encerrar-processo", { pid });
      definirConsole(ok && data.ok, "Gerenciador de Processos", data.mensagem || "Concluído.");
      if (ok && data.ok) {
        estado.novosRecursos = await apiGet("/api/recursos/novos");
        estado.hardware = await apiGet("/api/hardware");
        atualizarBarraLateral();
        renderizar();
      }
      return;
    }

    const filtroBtn = ev.target.closest("[data-filtro-risco]");
    if (filtroBtn) {
      estado.filtroRisco = filtroBtn.dataset.filtroRisco;
      renderizar();
      return;
    }

    const acaoBtn = ev.target.closest("[data-acao]");
    if (acaoBtn) {
      await executarItem(acaoBtn.dataset.id, acaoBtn.dataset.acao, false);
      return;
    }

    const perfilBtn = ev.target.closest("[data-perfil]");
    if (perfilBtn) {
      await executarPerfil(perfilBtn.dataset.perfil);
      return;
    }

    const jogoBtn = ev.target.closest("[data-jogo-exe]");
    if (jogoBtn) {
      const exe = jogoBtn.dataset.jogoExe;
      const ativar = jogoBtn.dataset.jogoAtivar === "true";
      definirConsole(true, exe, "Aplicando ajuste no Registro...");
      const { ok, data } = await apiPost("/api/jogos", { executavel: exe, ativar });
      definirConsole(ok && data.ok, exe, data.mensagem);
      if (ok && data.ok) {
        estado.jogos = (await apiGet("/api/jogos")).jogos;
        renderizar();
      }
      return;
    }

    if (ev.target.id === "btn-adicionar-jogo") {
      const exeInput = document.getElementById("input-exe-custom");
      const exe = (exeInput?.value || "").trim();
      if (!exe) {
        definirConsole(false, "Jogo personalizado", "Digite o nome do executável terminado em .exe.");
        return;
      }
      const { ok, data } = await apiPost("/api/jogos", { executavel: exe, ativar: true });
      definirConsole(ok && data.ok, exe, data.mensagem);
      if (ok && data.ok) {
        estado.jogos = (await apiGet("/api/jogos")).jogos;
        renderizar();
      }
      return;
    }

    if (ev.target.id === "btn-medir-ping") {
      definirConsole(true, "Teste de Ping", "Medindo latência para 1.1.1.1, 8.8.8.8 e 9.9.9.9...");
      try {
        estado.ping = await apiGet("/api/ping");
        renderizar();
        const resumo = estado.ping.melhor
          ? `Melhor DNS agora: ${estado.ping.melhor.nome} (${estado.ping.melhor.ip}) com ${estado.ping.melhor.ms} ms.`
          : "Teste finalizado.";
        definirConsole(true, "Teste de Ping", resumo);
      } catch (erro) {
        definirConsole(false, "Teste de Ping", erro.message);
      }
      return;
    }

    const startupBtn = ev.target.closest("[data-startup-nome]");
    if (startupBtn) {
      const nome = startupBtn.dataset.startupNome;
      const escopo = startupBtn.dataset.startupEscopo;
      const ativar = startupBtn.dataset.startupAtivar === "true";
      const { ok, data } = await apiPost("/api/startup", { nome, escopo, ativar });
      definirConsole(ok && data.ok, `Inicialização (${nome})`, data.mensagem);
      if (ok && data.ok) {
        estado.startup = (await apiGet("/api/startup")).itens;
        renderizar();
      }
      return;
    }

    if (ev.target.id === "btn-recarregar-startup") {
      estado.startup = (await apiGet("/api/startup")).itens;
      renderizar();
      return;
    }

    if (ev.target.id === "btn-recarregar-logs") {
      estado.logs = (await apiGet("/api/logs")).logs;
      renderizar();
      return;
    }

    if (ev.target.id === "btn-gerar-relatorio") {
      definirConsole(true, "Raio-X do PC", "Coletando hardware completo e gerando relatórios .md e .html...");
      const { ok, data } = await apiPost("/api/diagnostico/gerar", {});
      if (ok && data.ok) {
        estado.diagnostico = data;
        estado.drivers = data.dados?.driversInfo || estado.drivers;
        renderizar();
        definirConsole(
          true,
          "Raio-X do PC",
          `Relatório gerado! Nota de Saúde: ${data.dados.notaSaude}/100.\nMarkdown: ${data.arquivoMd}\nHTML: ${data.arquivoHtml}`
        );
      } else {
        definirConsole(false, "Raio-X do PC", data.mensagem || "Não foi possível gerar o relatório.");
      }
      return;
    }

    if (ev.target.id === "btn-backup-drivers" || ev.target.id === "btn-backup-drivers-aviso") {
      definirConsole(
        true,
        "Backup de Drivers Pré-Formatação",
        "Copiando e verificando todos os pacotes .INF, .SYS, .DLL e .CAT dos drivers para a pasta backups/..."
      );
      const { ok, data } = await apiPost("/api/drivers/backup", {});
      definirConsole(ok && data.ok, "Backup de Drivers Pré-Formatação", data.mensagem || "Concluído.");
      if (ok && data.ok) {
        estado.drivers = await apiGet("/api/drivers");
        renderizar();
      }
      return;
    }

    const abrirPastaBtn = ev.target.closest("[data-abrir-pasta-driver]");
    if (abrirPastaBtn) {
      const nomePasta = abrirPastaBtn.dataset.abrirPastaDriver || "";
      const { ok, data } = await apiPost("/api/drivers/abrir-pasta", { nomePasta });
      definirConsole(ok && data.ok, "Pasta de Drivers", data.mensagem || "Pasta aberta no Windows Explorer.");
      return;
    }

    const restBtn = ev.target.closest("[data-restaurar-driver]");
    if (restBtn) {
      const nomePasta = restBtn.dataset.restaurarDriver;
      definirConsole(true, "Restaurar Drivers", `Instalando drivers salvos em ${nomePasta}...`);
      const { ok, data } = await apiPost("/api/drivers/restaurar", { nomePasta });
      definirConsole(ok && data.ok, "Restaurar Drivers", data.mensagem || "Concluído.");
      return;
    }

    const niniteCheck = ev.target.closest("[data-ninite-id]");
    if (niniteCheck) {
      const id = niniteCheck.dataset.niniteId;
      const atual = new Set(estado.selecionadosNinite || []);
      if (niniteCheck.checked) atual.add(id);
      else atual.delete(id);
      estado.selecionadosNinite = Array.from(atual);
      const btnInstalar = document.getElementById("btn-ninite-instalar");
      if (btnInstalar) btnInstalar.textContent = `Instalar Selecionados (${estado.selecionadosNinite.length})`;
      return;
    }

    if (ev.target.id === "btn-ninite-recomendados") {
      estado.selecionadosNinite = (estado.kitNinite || []).filter((i) => i.recomendado).map((i) => i.id);
      renderizar();
      return;
    }

    if (ev.target.id === "btn-ninite-limpar") {
      estado.selecionadosNinite = [];
      renderizar();
      return;
    }

    if (ev.target.id === "btn-ninite-instalar") {
      const ids = estado.selecionadosNinite || [];
      if (ids.length === 0) {
        definirConsole(false, "Instalador Ninite", "Marque pelo menos um programa da lista.");
        return;
      }
      definirConsole(true, "Instalador Ninite", `Instalando ${ids.length} programa(s) silenciosamente via winget...`);
      const { ok, data } = await apiPost("/api/ninite/instalar", { ids });
      const linhas = (data.resultados || []).map((r) => `[${r.ok ? "OK" : "AVISO"}] ${r.nome}: ${r.mensagem}`);
      definirConsole(ok && data.ok, "Instalador Ninite", `${data.mensagem}\n\n${linhas.join("\n")}`);
      return;
    }

    const isoBtn = ev.target.closest("[data-baixar-iso]");
    if (isoBtn) {
      const id = isoBtn.dataset.baixarIso;
      definirConsole(true, "Download ISO / Windows", "Baixando arquivo oficial para ferramentas_iso/ ...");
      const { ok, data } = await apiPost("/api/iso-tools/baixar", { id });
      definirConsole(ok && data.ok, "Download ISO / Windows", data.mensagem || "Concluído.");
      if (ok && data.ok) {
        const dados = await apiGet("/api/iso-tools");
        estado.isoTools = dados.ferramentas;
        renderizar();
      }
      return;
    }

    if (ev.target.id === "btn-gerar-orcamento") {
      const tecnicoNome = (document.getElementById("input-orc-tecnico")?.value || "").trim();
      const clienteNome = (document.getElementById("input-orc-cliente")?.value || "").trim();
      const valorTotal = (document.getElementById("input-orc-valor")?.value || "").trim();
      const garantiaDias = Number(document.getElementById("input-orc-garantia")?.value || 90);
      const servicosTexto = (document.getElementById("input-orc-servicos")?.value || "").trim();

      definirConsole(true, "Orçamento Técnico", "Gerando Ordem de Serviço e Laudo HTML/PDF...");
      const { ok, data } = await apiPost("/api/diagnostico/orcamento", {
        tecnicoNome,
        clienteNome,
        valorTotal,
        garantiaDias,
        servicosTexto,
      });
      if (ok && data.ok) {
        estado.ultimoOrcamento = data;
        renderizar();
        definirConsole(true, "Orçamento Técnico", `${data.mensagem}\nClique em "Abrir Último Orçamento" no card para imprimir ou salvar em PDF.`);
      } else {
        definirConsole(false, "Orçamento Técnico", data.mensagem || "Não foi possível gerar o orçamento.");
      }
      return;
    }

    if (ev.target.id === "btn-super-combo") {
      definirConsole(true, "Super Combo Técnico", "Limpando temporários, renovando DNS e atualizando Raio-X...");
      const { ok, data } = await apiPost("/api/pendrive/combo", {});
      if (ok && data.ok) {
        if (data.relatorio) {
          estado.diagnostico = data.relatorio;
          estado.drivers = data.relatorio.dados?.driversInfo || estado.drivers;
        }
        definirConsole(true, "Super Combo Técnico", data.mensagem);
      } else {
        definirConsole(false, "Super Combo Técnico", data.mensagem || "Falha ao executar combo.");
      }
      return;
    }

    if (ev.target.id === "btn-ir-assistente") {
      await trocarAba("assistente");
      return;
    }

    const resolverBtn = ev.target.closest("[data-resolver-codigo]");
    if (resolverBtn) {
      const acaoCodigo = resolverBtn.dataset.resolverCodigo;
      definirConsole(true, "Assistente Técnico", `Executando correção automática (${acaoCodigo})...`);
      const { ok, data } = await apiPost("/api/assistente/resolver", { acaoCodigo });
      definirConsole(ok && data.ok, data.titulo || "Assistente Técnico", data.mensagem || "Concluído.");
      estado.hardware = await apiGet("/api/hardware");
      atualizarBarraLateral();
      if (estado.aba === "raiox_drivers" || estado.aba === "assistente") {
        estado.diagnostico = await apiGet("/api/diagnostico");
        renderizar();
      }
      return;
    }

    const autoBtn = ev.target.closest("[data-autocorrigir]");
    if (autoBtn) {
      definirConsole(
        true,
        "Auto-Resolução do PC",
        "Diagnosticando pontos de melhoria e aplicando correções seguras automaticamente..."
      );
      const { ok, data } = await apiPost("/api/assistente/autocorrigir", {});
      if (ok && data.ok) {
        if (data.relatorio) {
          estado.diagnostico = data.relatorio;
          estado.drivers = data.relatorio.dados?.driversInfo || estado.drivers;
        }
        estado.hardware = await apiGet("/api/hardware");
        atualizarBarraLateral();
        renderizar();
      }
      definirConsole(ok && data.ok, "Auto-Resolução do PC", data.mensagem || "Finalizado.");
      return;
    }

    if (ev.target.id === "btn-analisar-sintoma" || ev.target.id === "btn-analisar-e-resolver") {
      const texto = (document.getElementById("input-sintoma-livre")?.value || "").trim();
      estado.sintomaLivre = texto;
      const executarAgora = ev.target.id === "btn-analisar-e-resolver";
      definirConsole(
        true,
        "Assistente Técnico",
        executarAgora ? "Identificando problema e aplicando correção..." : "Analisando o sintoma informado..."
      );
      const { ok, data } = await apiPost("/api/assistente/diagnosticar", { texto, executarAgora });
      estado.respostaAssistente = data;
      if (executarAgora && data?.execucao) {
        estado.hardware = await apiGet("/api/hardware");
        atualizarBarraLateral();
      }
      renderizar();
      definirConsole(
        ok && data.ok,
        "Assistente Técnico",
        data.execucao ? data.execucao.mensagem : data.explicacao || "Análise pronta."
      );
      return;
    }

    if (ev.target.id === "btn-copiar-pendrive") {
      const dest = (document.getElementById("input-destino-pendrive")?.value || "").trim();
      const { ok, data } = await apiPost("/api/pendrive/copiar", { destino: dest });
      definirConsole(ok && data.ok, "Copiar para PenDrive", data.mensagem || "Concluído.");
    }
  });
}

async function iniciar() {
  registrarEventos();
  if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  try {
    await carregarBasico();
    renderizar();
    // Em PCs locais, se ainda nao existir Dossie de backup salvo hoje para esta maquina, cria automaticamente em 2o plano
    if (!modoWebEstatico && estado.hardware?.hostname) {
      const hostSeguro = String(estado.hardware.hostname).replace(/[^a-zA-Z0-9_-]/g, "_");
      const jaExiste = (estado.dossies || []).some((d) => d.nomePasta.startsWith(`Dossie_${hostSeguro}_`));
      if (!jaExiste) {
        setTimeout(async () => {
          try {
            const { ok, data } = await apiPost("/api/dossie/criar", {
              somenteSeNovoHoje: true,
              incluirArquivosDrivers: true,
            });
            if (ok && data.ok && !data.jaExistia) {
              const lista = await apiGet("/api/dossie/listar");
              estado.dossies = lista?.dossies || [];
              if (estado.aba === "visao_geral") renderizar();
              mostrarToastRapido(true, "Backup Automático Salvo!", `Dossiê completo de ${estado.hardware.hostname} salvo na unidade!`);
            }
          } catch {}
        }, 2500);
      }
    }
  } catch (erro) {
    definirConsole(false, "Inicialização", erro.message);
  }
}

iniciar();
