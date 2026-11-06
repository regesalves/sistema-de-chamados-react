import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "chamados_alvestech";
const INITIAL_PATH = window.location.pathname.replace(/\/$/, "") || "/";

function Icon({ name, size = 20 }) {
    const paths = {
        support: <><path d="M4 13v-2a8 8 0 0 1 16 0v2"/><path d="M4 13h3v6H6a2 2 0 0 1-2-2zM20 13h-3v6h1a2 2 0 0 0 2-2zM17 19a5 5 0 0 1-5 3"/></>,
        plus: <><path d="M12 5v14M5 12h14"/></>,
        clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
        check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
        pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
        phone: <path d="M7 3h3l2 5-2 1.5a14 14 0 0 0 4.5 4.5L16 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 5 5a2 2 0 0 1 2-2Z"/>,
        inbox: <><path d="M4 4h16v16H4z"/><path d="M4 13h4l2 3h4l2-3h4"/></>,
        home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/></>,
        ticket: <><path d="M4 5h16v4a3 3 0 0 0 0 6v4H4v-4a3 3 0 0 0 0-6z"/><path d="M13 5v2M13 11v2M13 17v2"/></>,
        users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1zM16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1h-3"/></>,
        chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 5-6"/></>,
        settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.2 1-1.2 2.1-1.5-.5a8 8 0 0 1-1.5.9l-.3 1.6h-2.4l-.3-1.6a8 8 0 0 1-1.5-.9l-1.5.5-1.2-2.1 1.2-1a7 7 0 0 1 0-1.8l-1.2-1 1.2-2.1 1.5.5a8 8 0 0 1 1.5-.9l.3-1.6h2.4l.3 1.6a8 8 0 0 1 1.5.9l1.5-.5 1.2 2.1-1.2 1a7 7 0 0 1 0 1.8Z"/></>,
        search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
        calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
        back: <><path d="m15 18-6-6 6-6"/><path d="M9 12h12"/></>,
        eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
        edit: <><path d="m14 5 5 5"/><path d="M4 20h4l11-11a2.1 2.1 0 0 0-4-4L4 16z"/></>,
        download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 17v4h14v-4"/></>,
        trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6"/><path d="M10 11v6m4-6v6"/></>,
    };
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function formatarTelefone(valor) {
    const digitos = valor.replace(/\D/g, "").slice(0, 11);
    if (digitos.length === 0) return "";
    if (digitos.length <= 2) return `(${digitos}`;
    if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    if (digitos.length <= 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function dataLocalInput(data = new Date()) {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

function dataReferenciaChamado(chamado) {
    if (!chamado.dataAtendimento) return new Date(chamado.criadoEm);
    const [ano, mes, dia] = chamado.dataAtendimento.split("-").map(Number);
    return new Date(ano, mes - 1, dia, 12);
}

function identidadeCliente(nome, contato) {
    const nomeNormalizado = (nome || "").trim().toLocaleLowerCase("pt-BR").replace(/\s+/g, " ");
    const telefoneNormalizado = (contato || "").replace(/\D/g, "");
    return nomeNormalizado && telefoneNormalizado ? `${nomeNormalizado}|${telefoneNormalizado}` : "";
}

function tempoDesde(data) {
    const dataAtendimento = new Date(data);
    if (Number.isNaN(dataAtendimento.getTime())) return "Data indisponível";
    const dias = Math.max(0, Math.floor((Date.now() - dataAtendimento.getTime()) / 86400000));
    if (dias === 0) return "Hoje";
    if (dias === 1) return "Ontem";
    if (dias < 30) return `Há ${dias} dias`;
    const meses = Math.floor(dias / 30);
    if (meses < 12) return `Há ${meses} ${meses === 1 ? "mês" : "meses"}`;
    const anos = Math.floor(dias / 365);
    return `Há ${anos} ${anos === 1 ? "ano" : "anos"}`;
}

function DataHora({ valor }) {
    return <time dateTime={valor}>{new Date(valor).toLocaleString("pt-BR")}</time>;
}

function Status({ resolvido }) {
    return <span className={`statusPill ${resolvido ? "resolved" : "pending"}`}>{resolvido ? "Resolvido" : "Pendente"}</span>;
}

function TicketCard({ chamado, onToggle, onDelete, onRequestDelete, onCancelDelete, confirmandoExclusao, onNavigate }) {
    const dataAtendimento = dataReferenciaChamado(chamado);
    const dataAtendimentoKey = chamado.dataAtendimento || dataLocalInput(dataAtendimento);
    const dataCriacao = new Date(chamado.criadoEm);
    const atendimentoHistorico = chamado.dataAtendimento && chamado.dataAtendimento !== dataLocalInput(dataCriacao);
    return <article className={`ticket ${chamado.resolvido ? "resolved" : "pending"}`}>
        <div className="ticketTop"><div className="ticketTitleRow"><strong className="ticketName">{chamado.cliente}</strong><Status resolvido={chamado.resolvido}/></div><div className="ticketMeta"><span>Atendimento em</span><strong><time dateTime={dataAtendimentoKey}>{dataAtendimento.toLocaleDateString("pt-BR")}</time></strong>{atendimentoHistorico && <small className="ticketCreatedAt">Registrado em <DataHora valor={chamado.criadoEm}/></small>}</div></div>
        <div className="ticketContactRow"><span className="metaItem"><Icon name="pin" size={15}/>{chamado.endereco}</span><span className="metaItem"><Icon name="phone" size={14}/>{chamado.contato}</span></div>
        <div className="descriptionCard"><span className="descriptionLabel">Descrição do problema</span><p>{chamado.problema}</p></div>
        <div className="ticketActions"><button type="button" className="buttonTertiary" onClick={() => onNavigate(`/chamados/${chamado.id}`)}><Icon name="eye" size={15}/>Detalhes</button><button type="button" className="buttonSecondary" onClick={() => onToggle(chamado.id)}>{chamado.resolvido ? "Reabrir chamado" : "Concluir chamado"}</button><button type="button" className="buttonDanger" onClick={() => onRequestDelete(chamado.id)}>Excluir</button></div>
        {confirmandoExclusao && <div className="ticketDeleteConfirm" role="alert"><p>Deseja excluir o chamado de <strong>{chamado.cliente}</strong>? Esta ação não pode ser desfeita.</p><div><button type="button" className="buttonDanger" onClick={() => onDelete(chamado.id)}>Excluir chamado</button><button type="button" className="buttonTertiary" onClick={onCancelDelete}>Cancelar</button></div></div>}
    </article>;
}

function EmptyState({ title, description, action, className = "" }) {
    return <div className={`emptyState ${className}`}><span className="emptyIcon"><Icon name="inbox" size={21}/></span><div><strong>{title}</strong><p>{description}</p>{action}</div></div>;
}

const navItems = [
    { label: "Início", icon: "home", href: "/", page: "inicio" },
    { label: "Chamados", icon: "ticket", href: "/chamados", page: "chamados" },
    { label: "Clientes", icon: "users", href: "/clientes", page: "clientes" },
    { label: "Relatórios", icon: "chart", href: "/relatorios", page: "relatorios" },
    { label: "Configurações", icon: "settings", href: "/configuracoes", page: "configuracoes" },
];

export default function App() {
    const [cliente, setCliente] = useState("");
    const [endereco, setEndereco] = useState("");
    const [contato, setContato] = useState("");
    const [problema, setProblema] = useState("");
    const [dataChamado, setDataChamado] = useState(() => dataLocalInput());
    const [chamados, setChamados] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [carregado, setCarregado] = useState(false);
    const [clientesCarregados, setClientesCarregados] = useState(false);
    const [caminho, setCaminho] = useState(INITIAL_PATH);
    const [confirmacaoId, setConfirmacaoId] = useState(null);
    const [exclusaoPendenteId, setExclusaoPendenteId] = useState(null);
    const [busca, setBusca] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("todos");
    const [filtroPeriodo, setFiltroPeriodo] = useState("todos");
    const [filtroReferencia, setFiltroReferencia] = useState(() => dataLocalInput().slice(0, 7));
    const [filtroDia, setFiltroDia] = useState(() => new Date().getDate());
    const [filtroCalendarioAberto, setFiltroCalendarioAberto] = useState(false);
    const [filtroAnoCalendario, setFiltroAnoCalendario] = useState(() => new Date().getFullYear());
    const [clienteSelecionadoId, setClienteSelecionadoId] = useState("");
    const [buscaClientes, setBuscaClientes] = useState("");
    const [nomeNovoCliente, setNomeNovoCliente] = useState("");
    const [enderecoNovoCliente, setEnderecoNovoCliente] = useState("");
    const [contatoNovoCliente, setContatoNovoCliente] = useState("");
    const [clienteEditandoId, setClienteEditandoId] = useState(null);
    const [completandoCadastroCliente, setCompletandoCadastroCliente] = useState(false);
    const [identidadeClienteHistorico, setIdentidadeClienteHistorico] = useState("");
    const [mensagemCliente, setMensagemCliente] = useState("");
    const [relatorioMes, setRelatorioMes] = useState(() => { const hoje = new Date(); return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`; });
    const [relatorioDia, setRelatorioDia] = useState(null);
    const [relatorioPeriodo, setRelatorioPeriodo] = useState("mensal");
    const [anoCalendario, setAnoCalendario] = useState(() => new Date().getFullYear());
    const [calendarioAberto, setCalendarioAberto] = useState(false);
    const [relatorioStatus, setRelatorioStatus] = useState("todos");
    const [relatorioBusca, setRelatorioBusca] = useState("");
    const [limpezaInicio, setLimpezaInicio] = useState("");
    const [limpezaFim, setLimpezaFim] = useState("");
    const [confirmarLimpeza, setConfirmarLimpeza] = useState(false);
    const [mensagemLimpeza, setMensagemLimpeza] = useState("");

    function navegar(destino, options = {}) {
        const { substituir = false } = options;
        if (substituir) window.history.replaceState({}, "", destino);
        else if (window.location.pathname !== destino) window.history.pushState({}, "", destino);
        setCaminho(destino.replace(/\/$/, "") || "/");
        window.scrollTo(0, 0);
    }

    useEffect(() => {
        const onPopState = () => setCaminho(window.location.pathname.replace(/\/$/, "") || "/");
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    useEffect(() => {
        try {
            const dados = localStorage.getItem(STORAGE_KEY);
            if (dados) setChamados(JSON.parse(dados));
        } catch { setChamados([]); }
        setCarregado(true);
    }, []);
    useEffect(() => {
        try {
            const dados = localStorage.getItem("clientes_alvestech");
            if (dados) setClientes(JSON.parse(dados));
        } catch { setClientes([]); }
        setClientesCarregados(true);
    }, []);
    useEffect(() => {
        if (carregado) localStorage.setItem(STORAGE_KEY, JSON.stringify(chamados));
    }, [chamados, carregado]);
    useEffect(() => {
        if (clientesCarregados) localStorage.setItem("clientes_alvestech", JSON.stringify(clientes));
    }, [clientes, clientesCarregados]);

    const { pendentes, resolvidos } = useMemo(() => {
        const pend = [];
        const res = [];
        chamados.forEach((chamado) => (chamado.resolvido ? res : pend).push(chamado));
        return { pendentes: pend, resolvidos: res };
    }, [chamados]);
    const chamadosRecentes = useMemo(() => [...chamados].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)).slice(0, 4), [chamados]);
    const clientesVisiveis = useMemo(() => {
        const chavesRegistradas = new Set(clientes.map((clienteItem) => identidadeCliente(clienteItem.nome, clienteItem.contato)).filter(Boolean));
        const historico = new Map();
        [...chamados].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)).forEach((chamado) => {
            const chave = identidadeCliente(chamado.cliente, chamado.contato);
            if (!chave || chavesRegistradas.has(chave)) return;
            if (!historico.has(chave)) historico.set(chave, { id: `historico-${chave}`, nome: chamado.cliente, contato: chamado.contato, endereco: chamado.endereco, origemHistorico: true });
        });
        return [...clientes, ...historico.values()];
    }, [clientes, chamados]);
    const clientesFiltrados = useMemo(() => {
        const termo = buscaClientes.trim().toLocaleLowerCase("pt-BR");
        return clientesVisiveis.filter((clienteItem) => [clienteItem.nome, clienteItem.endereco, clienteItem.contato].join(" ").toLocaleLowerCase("pt-BR").includes(termo)).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    }, [clientesVisiveis, buscaClientes]);
    const chamadosPorCliente = useMemo(() => {
        const contagem = {};
        clientesVisiveis.forEach((clienteItem) => {
            const identidade = identidadeCliente(clienteItem.nome, clienteItem.contato);
            contagem[clienteItem.id] = chamados.filter((chamado) => chamado.clienteId === clienteItem.id
                || identidadeCliente(chamado.cliente, chamado.contato) === identidade).length;
        });
        return contagem;
    }, [clientesVisiveis, chamados]);
    const calendarioRelatorio = useMemo(() => {
        const [ano, mes] = relatorioMes.split("-").map(Number);
        const primeiroDia = new Date(ano, mes - 1, 1);
        const deslocamento = (primeiroDia.getDay() + 6) % 7;
        const quantidadeDias = new Date(ano, mes, 0).getDate();
        const diasComChamados = chamados.reduce((contagem, chamado) => {
            const data = dataReferenciaChamado(chamado);
            if (data.getFullYear() === ano && data.getMonth() === mes - 1) {
                contagem[data.getDate()] = (contagem[data.getDate()] || 0) + 1;
            }
            return contagem;
        }, {});
        return {
            titulo: primeiroDia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
            dias: [...Array(deslocamento).fill(null), ...Array.from({ length: quantidadeDias }, (_, indice) => indice + 1)],
            diasComChamados,
        };
    }, [relatorioMes, chamados]);
    const relatorioDados = useMemo(() => {
        const [ano, mes] = relatorioMes.split("-").map(Number);
        const inicio = new Date(ano, mes - 1, 1);
        const fim = new Date(ano, mes, 1);
        const termo = relatorioBusca.trim().toLocaleLowerCase("pt-BR");
        const doMes = chamados.filter((chamado) => {
            const data = dataReferenciaChamado(chamado);
            return data >= inicio && data < fim;
        });
        const filtradosDoMes = doMes.filter((chamado) => {
            const correspondeStatus = relatorioStatus === "todos" || (relatorioStatus === "pendentes" ? !chamado.resolvido : chamado.resolvido);
            const texto = [chamado.cliente, chamado.problema].join(" ").toLocaleLowerCase("pt-BR");
            return correspondeStatus && (!termo || texto.includes(termo));
        });
        const filtrados = relatorioDia ? filtradosDoMes.filter((chamado) => dataReferenciaChamado(chamado).getDate() === relatorioDia) : filtradosDoMes;
        const semanas = Array.from({ length: Math.ceil((fim.getDate()) / 7) }, (_, indice) => ({
            label: `${indice * 7 + 1}–${Math.min((indice + 1) * 7, fim.getDate())}`,
            total: filtradosDoMes.filter((chamado) => Math.ceil(dataReferenciaChamado(chamado).getDate() / 7) === indice + 1).length,
        }));
        return {
            chamados: filtrados,
            total: filtrados.length,
            pendentes: filtrados.filter((chamado) => !chamado.resolvido).length,
            resolvidos: filtrados.filter((chamado) => chamado.resolvido).length,
            chamadosNoMes: filtradosDoMes,
            semanas,
        };
    }, [chamados, relatorioMes, relatorioDia, relatorioStatus, relatorioBusca]);

    function navegarMesRelatorio(deslocamento) {
        const [ano, mes] = relatorioMes.split("-").map(Number);
        const novaData = new Date(ano, mes - 1 + deslocamento, 1);
        setRelatorioMes(`${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, "0")}`);
        if (relatorioPeriodo === "diario" && relatorioDia) {
            setRelatorioDia(Math.min(relatorioDia, new Date(novaData.getFullYear(), novaData.getMonth() + 1, 0).getDate()));
        } else setRelatorioDia(null);
    }

    function alterarPeriodoRelatorio(periodo) {
        setRelatorioPeriodo(periodo);
        if (periodo === "mensal") setRelatorioDia(null);
        else {
            const [ano, mes] = relatorioMes.split("-").map(Number);
            const hoje = new Date();
            setRelatorioDia(ano === hoje.getFullYear() && mes === hoje.getMonth() + 1
                ? hoje.getDate()
                : 1);
        }
    }

    function alterarFiltroPeriodo(periodo) {
        setFiltroPeriodo(periodo);
        setFiltroCalendarioAberto(false);
        if (periodo === "diario") {
            const hoje = new Date();
            const [ano, mes] = filtroReferencia.split("-").map(Number);
            setFiltroDia(ano === hoje.getFullYear() && mes === hoje.getMonth() + 1 ? hoje.getDate() : 1);
        }
    }

    function navegarMesFiltro(deslocamento) {
        const [ano, mes] = filtroReferencia.split("-").map(Number);
        const novaData = new Date(ano, mes - 1 + deslocamento, 1);
        setFiltroReferencia(`${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, "0")}`);
        if (filtroPeriodo === "diario") setFiltroDia(Math.min(filtroDia || 1, new Date(novaData.getFullYear(), novaData.getMonth() + 1, 0).getDate()));
    }
    const contatoNormalizado = contato.replace(/\D/g, "");
    const historicoContato = useMemo(() => {
        if (contatoNormalizado.length < 10) return [];
        return chamados
            .filter((chamado) => chamado.contato?.replace(/\D/g, "") === contatoNormalizado)
            .sort((a, b) => dataReferenciaChamado(b) - dataReferenciaChamado(a));
    }, [chamados, contatoNormalizado]);
    const chamadosFiltrados = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        return [...chamados].filter((chamado) => {
            const statusCorresponde = filtroStatus === "todos" || (filtroStatus === "resolvidos" ? chamado.resolvido : !chamado.resolvido);
            const data = dataReferenciaChamado(chamado);
            const [anoReferencia, mesReferencia] = filtroReferencia.split("-").map(Number);
            const dataCorresponde = filtroPeriodo === "todos"
                || (filtroPeriodo === "mensal" && data.getFullYear() === anoReferencia && data.getMonth() === mesReferencia - 1)
                || (filtroPeriodo === "diario" && data.getFullYear() === anoReferencia && data.getMonth() === mesReferencia - 1 && data.getDate() === filtroDia);
            const texto = [chamado.cliente, chamado.endereco, chamado.contato, chamado.problema].join(" ").toLocaleLowerCase("pt-BR");
            return statusCorresponde && dataCorresponde && (!termo || texto.includes(termo));
        }).sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
    }, [chamados, busca, filtroStatus, filtroPeriodo, filtroReferencia, filtroDia]);
    const calendarioChamados = useMemo(() => {
        const [ano, mes] = filtroReferencia.split("-").map(Number);
        const primeiroDia = new Date(ano, mes - 1, 1);
        const deslocamento = (primeiroDia.getDay() + 6) % 7;
        const quantidadeDias = new Date(ano, mes, 0).getDate();
        const diasComChamados = chamados.reduce((contagem, chamado) => {
            const data = dataReferenciaChamado(chamado);
            if (data.getFullYear() === ano && data.getMonth() === mes - 1) contagem[data.getDate()] = (contagem[data.getDate()] || 0) + 1;
            return contagem;
        }, {});
        return {
            titulo: primeiroDia.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
            dias: [...Array(deslocamento).fill(null), ...Array.from({ length: quantidadeDias }, (_, indice) => indice + 1)],
            diasComChamados,
        };
    }, [filtroReferencia, chamados]);

    function registrarChamado(event) {
        event.preventDefault();
        if (!cliente.trim() || !endereco.trim() || !contato.trim() || !problema.trim()) return;
        const novoChamado = {
            id: Date.now(), cliente: cliente.trim(), endereco: endereco.trim(), contato: contato.trim(),
            clienteId: clienteSelecionadoId || null, problema: problema.trim(), resolvido: false, criadoEm: new Date().toISOString(), dataAtendimento: dataChamado,
        };
        setChamados((atuais) => [...atuais, novoChamado]);
        setCliente(""); setEndereco(""); setContato(""); setProblema(""); setClienteSelecionadoId(""); setDataChamado(dataLocalInput());
        setConfirmacaoId(novoChamado.id);
        navegar(`/chamados/${novoChamado.id}`);
    }
    function alternarResolvido(id) { setChamados((atuais) => atuais.map((chamado) => chamado.id === id ? { ...chamado, resolvido: !chamado.resolvido } : chamado)); }
    function excluirChamado(id) {
        setChamados((atuais) => atuais.filter((chamado) => chamado.id !== id));
        setExclusaoPendenteId(null);
        if (caminho === `/chamados/${id}`) navegar("/chamados");
    }

    const chamadoDetalhe = caminho.startsWith("/chamados/") && caminho !== "/chamados/novo"
        ? chamados.find((chamado) => String(chamado.id) === caminho.slice("/chamados/".length))
        : null;
    const intervaloLimpezaValido = Boolean(limpezaInicio && limpezaFim && limpezaInicio <= limpezaFim);
    const chamadosNoIntervaloLimpeza = useMemo(() => {
        if (!intervaloLimpezaValido) return [];
        return chamados.filter((chamado) => {
            const data = dataLocalInput(dataReferenciaChamado(chamado));
            return data >= limpezaInicio && data <= limpezaFim;
        });
    }, [chamados, intervaloLimpezaValido, limpezaInicio, limpezaFim]);
    const paginaAtual = caminho === "/" ? "inicio" : caminho.startsWith("/chamados") ? "chamados" : caminho === "/clientes" ? "clientes" : caminho === "/relatorios" ? "relatorios" : caminho === "/configuracoes" ? "configuracoes" : "inicio";

    function linkProps(href) {
        return { href, onClick: (event) => { event.preventDefault(); navegar(href); } };
    }

    function selecionarCliente(id) {
        setClienteSelecionadoId(id);
        if (!id) {
            setCliente(""); setEndereco(""); setContato("");
            return;
        }
        const clienteEncontrado = clientes.find((clienteItem) => String(clienteItem.id) === id);
        if (clienteEncontrado) {
            setCliente(clienteEncontrado.nome);
            setEndereco(clienteEncontrado.endereco);
            setContato(clienteEncontrado.contato);
        }
    }

    function limparFormularioCliente() {
        setNomeNovoCliente(""); setEnderecoNovoCliente(""); setContatoNovoCliente("");
        setClienteEditandoId(null); setCompletandoCadastroCliente(false); setIdentidadeClienteHistorico(""); setMensagemCliente("");
    }

    function salvarCliente(event) {
        event.preventDefault();
        const nome = nomeNovoCliente.trim();
        const endereco = enderecoNovoCliente.trim();
        const telefone = contatoNovoCliente.trim();
        if (!nome || !endereco || !telefone) {
            setMensagemCliente("Preencha nome, endereço e contato para salvar o cliente.");
            return;
        }
        const digitosTelefone = telefone.replace(/\D/g, "");
        const duplicado = clientes.some((clienteItem) => clienteItem.id !== clienteEditandoId
            && clienteItem.nome.trim().toLocaleLowerCase("pt-BR") === nome.toLocaleLowerCase("pt-BR")
            && clienteItem.contato.replace(/\D/g, "") === digitosTelefone);
        if (duplicado) {
            setMensagemCliente("Já existe um cliente com esse nome e telefone.");
            return;
        }
        if (clienteEditandoId) {
            const clienteAnterior = clientes.find((clienteItem) => clienteItem.id === clienteEditandoId);
            const identidadeAnterior = identidadeCliente(clienteAnterior?.nome, clienteAnterior?.contato);
            setClientes((atuais) => atuais.map((clienteItem) => clienteItem.id === clienteEditandoId
                ? { ...clienteItem, nome, endereco, contato: telefone, atualizadoEm: new Date().toISOString() }
                : clienteItem));
            setChamados((atuais) => atuais.map((chamado) => (
                String(chamado.clienteId) === String(clienteEditandoId)
                || (identidadeAnterior && identidadeCliente(chamado.cliente, chamado.contato) === identidadeAnterior)
            ) ? { ...chamado, clienteId: clienteEditandoId, cliente: nome, endereco, contato: telefone } : chamado));
            setMensagemCliente("Cadastro atualizado.");
        } else {
            const novoCliente = { id: `cliente-${Date.now()}`, nome, endereco, contato: telefone, criadoEm: new Date().toISOString() };
            setClientes((atuais) => [...atuais, novoCliente]);
            if (completandoCadastroCliente && identidadeClienteHistorico) {
                setChamados((atuais) => atuais.map((chamado) => (
                    identidadeCliente(chamado.cliente, chamado.contato) === identidadeClienteHistorico
                ) ? { ...chamado, clienteId: novoCliente.id, cliente: nome, endereco, contato: telefone } : chamado));
            }
            setMensagemCliente("Cliente cadastrado.");
        }
        setNomeNovoCliente(""); setEnderecoNovoCliente(""); setContatoNovoCliente(""); setClienteEditandoId(null); setCompletandoCadastroCliente(false); setIdentidadeClienteHistorico("");
    }

    function editarCliente(clienteItem) {
        setNomeNovoCliente(clienteItem.nome); setEnderecoNovoCliente(clienteItem.endereco);
        setContatoNovoCliente(clienteItem.contato); setClienteEditandoId(clienteItem.id);
        setCompletandoCadastroCliente(false); setIdentidadeClienteHistorico("");
        setMensagemCliente(""); window.scrollTo(0, 0);
    }

    function completarCadastroCliente(clienteItem) {
        setNomeNovoCliente(clienteItem.nome);
        setEnderecoNovoCliente(clienteItem.endereco);
        setContatoNovoCliente(clienteItem.contato);
        setClienteEditandoId(null);
        setCompletandoCadastroCliente(true);
        setIdentidadeClienteHistorico(identidadeCliente(clienteItem.nome, clienteItem.contato));
        setMensagemCliente("");
        window.scrollTo(0, 0);
        document.getElementById("novo-cliente-nome")?.focus({ preventScroll: true });
    }

    function iniciarChamadoParaCliente(id) {
        selecionarCliente(String(id));
        navegar("/chamados/novo");
    }

    function exportarBackup() {
        const conteudo = JSON.stringify({
            formato: "alves-tech-backup", versao: 1, exportadoEm: new Date().toISOString(),
            chamados, clientes,
        }, null, 2);
        const url = URL.createObjectURL(new Blob([conteudo], { type: "application/json" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = `backup-alves-tech-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function excluirChamadosDoIntervalo() {
        if (!intervaloLimpezaValido || chamadosNoIntervaloLimpeza.length === 0) return;
        const idsParaExcluir = new Set(chamadosNoIntervaloLimpeza.map((chamado) => chamado.id));
        const quantidade = idsParaExcluir.size;
        setChamados((atuais) => atuais.filter((chamado) => !idsParaExcluir.has(chamado.id)));
        setConfirmarLimpeza(false);
        setMensagemLimpeza(`${quantidade} ${quantidade === 1 ? "chamado excluído" : "chamados excluídos"}. Os clientes cadastrados foram mantidos.`);
        setLimpezaInicio("");
        setLimpezaFim("");
    }

    return <div className="appShell">
        <aside className="sidebar">
            <a className="sideBrand" {...linkProps("/")}><span className="sideBrandMark"><Icon name="support" size={19}/></span><span>Alves Tech</span></a>
            <span className="navCaption">MENU PRINCIPAL</span>
            <nav className="sideNav" aria-label="Navegação principal">
                {navItems.map((item) => <a key={item.label} {...linkProps(item.href)} className={`navItem ${paginaAtual === item.page ? "active" : ""}`} aria-current={paginaAtual === item.page ? "page" : undefined}><Icon name={item.icon} size={18}/><span>{item.label}</span></a>)}
            </nav>
            <div className="sidebarNote"><span className="sidebarNoteDot"/><span>Área de atendimento</span></div>
        </aside>

        <main className="mainContent">
            {caminho === "/" && <>
                <header className="pageHeader" id="inicio"><div><h1>Gestão de Chamados</h1><p>Acompanhe a situação dos atendimentos e acesse as ações principais.</p></div></header>
                <section className="summaryStrip" aria-label="Resumo dos chamados">
                    <div className="summaryItem"><span className="summaryItemIcon pending"><Icon name="clock" size={17}/></span><span className="summaryItemLabel">Pendentes</span><strong>{pendentes.length}</strong></div>
                    <span className="summaryDivider" aria-hidden="true"/>
                    <div className="summaryItem"><span className="summaryItemIcon resolved"><Icon name="check" size={17}/></span><span className="summaryItemLabel">Resolvidos</span><strong>{resolvidos.length}</strong></div>
                    <span className="summaryDivider" aria-hidden="true"/>
                    <div className="summaryItem"><span className="summaryItemIcon total"><Icon name="inbox" size={17}/></span><span className="summaryItemLabel">Total de chamados</span><strong>{chamados.length}</strong></div>
                </section>
                <section className="homeOverview panel">
                    <div className="overviewHeading"><div><h2>Chamados recentes</h2><p>Acesso rápido aos últimos registros.</p></div></div>
                    {chamadosRecentes.length === 0
                        ? <EmptyState title="Nenhum atendimento registrado" description="Registre um chamado para acompanhar o atendimento e seu status por aqui."/>
                        : <ul className="recentList">{chamadosRecentes.map((chamado) => <li key={chamado.id}><a className="recentItem" {...linkProps(`/chamados/${chamado.id}`)}><span className={`recentStatus ${chamado.resolvido ? "resolved" : "pending"}`}/><span className="recentInfo"><strong>{chamado.cliente}</strong><small>{chamado.problema}</small></span><Status resolvido={chamado.resolvido}/><span className="recentDate"><DataHora valor={chamado.criadoEm}/></span></a></li>)}</ul>}
                    <div className="overviewActions"><a className="submitButton" {...linkProps("/chamados/novo")}><Icon name="plus" size={17}/>Novo chamado</a></div>
                </section>
            </>}

            {caminho === "/chamados" && <>
                <header className="pageHeader pageHeaderWithAction"><div><h1>Chamados</h1><p>Pesquise, filtre e acompanhe os atendimentos registrados.</p></div><a className="submitButton newTicketLink" {...linkProps("/chamados/novo")}><Icon name="plus" size={17}/>Novo chamado</a></header>
                <section className={`panel managementPanel ${chamados.length === 0 ? "isEmpty" : ""}`} aria-label="Gerenciamento de chamados">
                    <div className="filterToolbar">
                        <label className="selectField"><span>Período</span><select value={filtroPeriodo} onChange={(event) => alterarFiltroPeriodo(event.target.value)}><option value="todos">Todo o período</option><option value="diario">Diário</option><option value="mensal">Mensal</option></select></label>
                        <div className="reportCalendarField"><span className="reportFieldLabel">Referência</span><div className="reportCalendarControl">
                            <button type="button" className="reportCalendarTrigger" disabled={filtroPeriodo === "todos"} aria-expanded={filtroCalendarioAberto} aria-haspopup="dialog" onClick={() => { setFiltroAnoCalendario(Number(filtroReferencia.slice(0, 4))); setFiltroCalendarioAberto((aberto) => !aberto); }}><Icon name="calendar" size={17}/><span>{filtroPeriodo === "todos" ? "Selecione o período" : filtroPeriodo === "diario" ? `${String(filtroDia).padStart(2, "0")}/${filtroReferencia.slice(5, 7)}/${filtroReferencia.slice(0, 4)}` : calendarioChamados.titulo}</span><span className="calendarTriggerChevron">⌄</span></button>
                            {filtroCalendarioAberto && filtroPeriodo !== "todos" && <div className="reportCalendarPopover" role="dialog" aria-label={filtroPeriodo === "diario" ? "Selecionar dia para filtrar chamados" : "Selecionar mês para filtrar chamados"} onKeyDown={(event) => { if (event.key === "Escape") setFiltroCalendarioAberto(false); }}>
                                {filtroPeriodo === "mensal"
                                    ? <><div className="calendarPopoverHeading"><button type="button" className="calendarMonthNav" aria-label="Ano anterior" onClick={() => setFiltroAnoCalendario((ano) => ano - 1)}>‹</button><strong>{filtroAnoCalendario}</strong><button type="button" className="calendarMonthNav" aria-label="Próximo ano" onClick={() => setFiltroAnoCalendario((ano) => ano + 1)}>›</button></div><div className="calendarMonths">{["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((nomeMes, indice) => { const chave = `${filtroAnoCalendario}-${String(indice + 1).padStart(2, "0")}`; const selecionado = filtroReferencia === chave; const possuiChamados = chamados.some((chamado) => { const data = dataReferenciaChamado(chamado); return data.getFullYear() === filtroAnoCalendario && data.getMonth() === indice; }); return <button type="button" key={nomeMes} className={`calendarMonth ${selecionado ? "selected" : ""} ${possuiChamados ? "hasTickets" : ""}`} aria-pressed={selecionado} onClick={() => { setFiltroReferencia(chave); setFiltroDia(null); setFiltroCalendarioAberto(false); }}>{nomeMes}{possuiChamados && <i aria-hidden="true"/>}</button>; })}</div></>
                                    : <><div className="calendarPopoverHeading"><button type="button" className="calendarMonthNav" aria-label="Mês anterior" onClick={() => navegarMesFiltro(-1)}>‹</button><strong>{calendarioChamados.titulo}</strong><button type="button" className="calendarMonthNav" aria-label="Próximo mês" onClick={() => navegarMesFiltro(1)}>›</button></div><div className="calendarWeekdays" aria-hidden="true">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia) => <span key={dia}>{dia}</span>)}</div><div className="calendarDays">{calendarioChamados.dias.map((dia, indice) => {
                                        if (!dia) return <span className="calendarDaySpacer" key={`vazio-${indice}`}/>;
                                        const quantidade = calendarioChamados.diasComChamados[dia] || 0;
                                        const selecionado = filtroDia === dia;
                                        const dataLabel = `${dia} de ${calendarioChamados.titulo}${quantidade ? `, ${quantidade} ${quantidade === 1 ? "chamado" : "chamados"}` : ", sem chamados"}`;
                                        return <button type="button" key={dia} className={`calendarDay ${quantidade ? "hasTickets" : ""} ${selecionado ? "selected" : ""}`} aria-label={dataLabel} aria-pressed={selecionado} title={dataLabel} onClick={() => { setFiltroDia(dia); setFiltroCalendarioAberto(false); }}><span>{dia}</span>{quantidade > 0 && <i aria-hidden="true"/>}</button>;
                                    })}</div><button type="button" className="calendarWholeMonth" onClick={() => { setFiltroDia(null); setFiltroPeriodo("mensal"); setFiltroCalendarioAberto(false); }}>Ver mês completo</button></>}
                            </div>}
                        </div></div>
                        <label className="selectField"><span>Situação</span><select value={filtroStatus} onChange={(event) => setFiltroStatus(event.target.value)}><option value="todos">Todas</option><option value="pendentes">Pendentes</option><option value="resolvidos">Resolvidos</option></select></label>
                        <label className="searchField"><Icon name="search" size={17}/><span className="visuallyHidden">Pesquisar chamados</span><input type="search" value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Pesquisar por cliente, contato ou descrição"/></label>
                    </div>
                    {chamadosFiltrados.length > 0 && <div className="managementSummary"><strong>{chamadosFiltrados.length}</strong> {chamadosFiltrados.length === 1 ? "chamado" : "chamados"}</div>}
                    {chamados.length === 0
                        ? <EmptyState className="managementEmpty" title="Sua fila de chamados começa aqui" description="Registre a primeira solicitação para organizar os dados do cliente, acompanhar o status e consultar o histórico do atendimento."/>
                        : chamadosFiltrados.length === 0
                            ? <EmptyState title="Nenhum resultado encontrado" description="Altere a pesquisa ou os filtros para ver outros chamados." action={<button className="buttonTertiary resetFilters" type="button" onClick={() => { setBusca(""); setFiltroStatus("todos"); setFiltroPeriodo("todos"); setFiltroReferencia(dataLocalInput().slice(0, 7)); setFiltroDia(new Date().getDate()); setFiltroCalendarioAberto(false); }}>Limpar filtros</button>}/>
                            : <div className="managementList">{chamadosFiltrados.map((chamado) => <TicketCard key={chamado.id} chamado={chamado} onToggle={alternarResolvido} onDelete={excluirChamado} onRequestDelete={setExclusaoPendenteId} onCancelDelete={() => setExclusaoPendenteId(null)} confirmandoExclusao={String(exclusaoPendenteId) === String(chamado.id)} onNavigate={navegar}/>)}</div>}
                </section>
            </>}

            {caminho === "/clientes" && <>
                <header className="pageHeader"><div><h1>Clientes</h1><p>Cadastre e consulte os contatos usados nos atendimentos.</p></div></header>
                <div className="clientsLayout">
                    <section className="panel clientFormPanel" aria-labelledby="client-form-title">
                        <div className="panelHeading"><span className="panelHeadingIcon"><Icon name={clienteEditandoId || completandoCadastroCliente ? "edit" : "plus"} size={18}/></span><div><h2 id="client-form-title">{clienteEditandoId ? "Editar cliente" : completandoCadastroCliente ? "Completar cadastro" : "Novo cliente"}</h2><p>Os dados poderão ser reutilizados em novos chamados.</p></div></div>
                        <form className="ticketForm" onSubmit={salvarCliente}>
                            <div className="fieldGroup"><label htmlFor="novo-cliente-nome">Nome</label><input id="novo-cliente-nome" value={nomeNovoCliente} onChange={(event) => setNomeNovoCliente(event.target.value)} placeholder="Nome do cliente" required/></div>
                            <div className="fieldGroup"><label htmlFor="novo-cliente-endereco">Endereço</label><input id="novo-cliente-endereco" value={enderecoNovoCliente} onChange={(event) => setEnderecoNovoCliente(event.target.value)} placeholder="Rua, número e bairro" required/></div>
                            <div className="fieldGroup"><label htmlFor="novo-cliente-contato">Contato</label><input id="novo-cliente-contato" type="tel" inputMode="numeric" value={contatoNovoCliente} onChange={(event) => setContatoNovoCliente(formatarTelefone(event.target.value))} placeholder="(00) 00000-0000" required/></div>
                            {mensagemCliente && <p className={`clientFormMessage ${mensagemCliente.includes("cadastrado") || mensagemCliente.includes("atualizado") ? "success" : "error"}`} role="status">{mensagemCliente}</p>}
                            <div className="clientFormActions"><button type="submit" className="submitButton"><Icon name={clienteEditandoId || completandoCadastroCliente ? "check" : "plus"} size={17}/>{clienteEditandoId ? "Salvar alterações" : completandoCadastroCliente ? "Salvar cadastro" : "Cadastrar cliente"}</button>{(clienteEditandoId || completandoCadastroCliente) && <button className="buttonTertiary" type="button" onClick={limparFormularioCliente}>Cancelar</button>}</div>
                        </form>
                        <p className="clientFormNote">Clientes encontrados em chamados antigos aparecem na lista. Cadastre-os para reutilizar seus dados; nomes iguais com telefones diferentes continuam sendo clientes distintos.</p>
                    </section>
                    <section className="panel clientListPanel" aria-labelledby="client-list-title">
                        <div className="clientListHeading"><div><h2 id="client-list-title">Clientes</h2><p>{clientesVisiveis.length} {clientesVisiveis.length === 1 ? "cliente" : "clientes"} cadastrados ou identificados</p></div><label className="searchField"><Icon name="search" size={17}/><span className="visuallyHidden">Pesquisar clientes</span><input type="search" value={buscaClientes} onChange={(event) => setBuscaClientes(event.target.value)} placeholder="Buscar cliente"/></label></div>
                        {clientesFiltrados.length === 0
                            ? <EmptyState title="Nenhum cliente encontrado" description={clientesVisiveis.length === 0 ? "Os clientes aparecerão aqui ao serem cadastrados ou usados em chamados." : "Tente outro nome, telefone ou endereço."}/>
                            : <ul className="clientList">{clientesFiltrados.map((clienteItem) => <li className="clientRow" key={clienteItem.id}><div className="clientAvatar" aria-hidden="true">{clienteItem.nome.trim().charAt(0).toLocaleUpperCase("pt-BR")}</div><div className="clientDetails"><strong>{clienteItem.nome}</strong>{clienteItem.origemHistorico && <small className="clientOrigin">Identificado em chamado</small>}<span>{clienteItem.contato}</span><small>{clienteItem.endereco}</small></div><span className="clientTicketCount">{chamadosPorCliente[clienteItem.id] || 0} {chamadosPorCliente[clienteItem.id] === 1 ? "chamado" : "chamados"}</span><div className="clientActions">{clienteItem.origemHistorico ? <button type="button" className="buttonTertiary" onClick={() => completarCadastroCliente(clienteItem)}><Icon name="edit" size={15}/>Completar cadastro</button> : <><button type="button" className="buttonTertiary" onClick={() => editarCliente(clienteItem)}><Icon name="edit" size={15}/>Editar</button><button type="button" className="buttonSecondary" onClick={() => iniciarChamadoParaCliente(clienteItem.id)}><Icon name="plus" size={15}/>Novo chamado</button></>}</div></li>)}</ul>}
                    </section>
                </div>
            </>}

            {caminho === "/relatorios" && <>
                <header className="pageHeader"><div><h1>Relatórios</h1><p>Analise o volume de chamados e acompanhe a situação dos registros.</p></div></header>
                <section className="panel reportFilters" aria-label="Filtros do relatório">
                    <label className="selectField reportPeriodFilter"><span>Período</span><select value={relatorioPeriodo} onChange={(event) => alterarPeriodoRelatorio(event.target.value)}><option value="diario">Diário</option><option value="mensal">Mensal</option></select></label>
                    <div className="reportCalendarField"><span className="reportFieldLabel">Referência</span><div className="reportCalendarControl">
                        <button type="button" className="reportCalendarTrigger" aria-expanded={calendarioAberto} aria-haspopup="dialog" onClick={() => { setAnoCalendario(Number(relatorioMes.slice(0, 4))); setCalendarioAberto((aberto) => !aberto); }}><Icon name="calendar" size={17}/><span>{relatorioPeriodo === "diario" && relatorioDia ? `${String(relatorioDia).padStart(2, "0")}/${relatorioMes.slice(5, 7)}/${relatorioMes.slice(0, 4)}` : calendarioRelatorio.titulo}</span><span className="calendarTriggerChevron">⌄</span></button>
                        {calendarioAberto && <div className="reportCalendarPopover" role="dialog" aria-label={relatorioPeriodo === "diario" ? "Selecionar dia do relatório" : "Selecionar mês do relatório"} onKeyDown={(event) => { if (event.key === "Escape") setCalendarioAberto(false); }}>
                            {relatorioPeriodo === "mensal"
                                ? <><div className="calendarPopoverHeading"><button type="button" className="calendarMonthNav" aria-label="Ano anterior" onClick={() => setAnoCalendario((ano) => ano - 1)}>‹</button><strong>{anoCalendario}</strong><button type="button" className="calendarMonthNav" aria-label="Próximo ano" onClick={() => setAnoCalendario((ano) => ano + 1)}>›</button></div><div className="calendarMonths">{["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((nomeMes, indice) => { const chave = `${anoCalendario}-${String(indice + 1).padStart(2, "0")}`; const selecionado = relatorioMes === chave; const possuiChamados = chamados.some((chamado) => { const data = dataReferenciaChamado(chamado); return data.getFullYear() === anoCalendario && data.getMonth() === indice; }); return <button type="button" key={nomeMes} className={`calendarMonth ${selecionado ? "selected" : ""} ${possuiChamados ? "hasTickets" : ""}`} aria-pressed={selecionado} onClick={() => { setRelatorioMes(chave); setRelatorioDia(null); setCalendarioAberto(false); }}>{nomeMes}{possuiChamados && <i aria-hidden="true"/>}</button>; })}</div></>
                                : <><div className="calendarPopoverHeading"><button type="button" className="calendarMonthNav" aria-label="Mês anterior" onClick={() => navegarMesRelatorio(-1)}>‹</button><strong>{calendarioRelatorio.titulo}</strong><button type="button" className="calendarMonthNav" aria-label="Próximo mês" onClick={() => navegarMesRelatorio(1)}>›</button></div><div className="calendarWeekdays" aria-hidden="true">{["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia) => <span key={dia}>{dia}</span>)}</div><div className="calendarDays">{calendarioRelatorio.dias.map((dia, indice) => {
                                    if (!dia) return <span className="calendarDaySpacer" key={`vazio-${indice}`}/>;
                                    const quantidade = calendarioRelatorio.diasComChamados[dia] || 0;
                                    const selecionado = relatorioDia === dia;
                                    const dataLabel = `${dia} de ${calendarioRelatorio.titulo}${quantidade ? `, ${quantidade} ${quantidade === 1 ? "chamado" : "chamados"}` : ", sem chamados"}`;
                                    return <button type="button" key={dia} className={`calendarDay ${quantidade ? "hasTickets" : ""} ${selecionado ? "selected" : ""}`} aria-label={dataLabel} aria-pressed={selecionado} title={dataLabel} onClick={() => { setRelatorioDia(dia); setCalendarioAberto(false); }}><span>{dia}</span>{quantidade > 0 && <i aria-hidden="true"/>}</button>;
                                })}</div><button type="button" className="calendarWholeMonth" onClick={() => { setRelatorioDia(null); setRelatorioPeriodo("mensal"); setCalendarioAberto(false); }}>Ver mês completo</button></>}
                        </div>}
                    </div></div>
                    <label className="selectField reportStatusFilter"><span>Situação</span><select value={relatorioStatus} onChange={(event) => setRelatorioStatus(event.target.value)}><option value="todos">Todas</option><option value="pendentes">Pendentes</option><option value="resolvidos">Resolvidos</option></select></label>
                    <label className="searchField"><Icon name="search" size={17}/><span className="visuallyHidden">Buscar por cliente ou descrição</span><input type="search" value={relatorioBusca} onChange={(event) => setRelatorioBusca(event.target.value)} placeholder="Buscar cliente ou descrição"/></label>
                </section>
                <section className="metricsGrid reportMetrics" aria-label="Indicadores de chamados">
                    <article className="metricCard"><span className="metricIcon total"><Icon name="inbox" size={19}/></span><div><span className="metricLabel">{relatorioDia ? "Chamados no dia" : "Abertos no mês"}</span><strong>{relatorioDados.total}</strong></div><span className="metricAccent totalAccent"/></article>
                    <article className="metricCard"><span className="metricIcon pending"><Icon name="clock" size={19}/></span><div><span className="metricLabel">Ainda pendentes</span><strong>{relatorioDados.pendentes}</strong></div><span className="metricAccent pendingAccent"/></article>
                    <article className="metricCard"><span className="metricIcon resolved"><Icon name="check" size={19}/></span><div><span className="metricLabel">Resolvidos</span><strong>{relatorioDados.resolvidos}</strong></div><span className="metricAccent resolvedAccent"/></article>
                </section>
                <div className="reportCharts">
                    <section className="panel reportPanel"><div className="reportHeading"><div><h2>{relatorioDia ? `Chamados de ${relatorioDia} de ${calendarioRelatorio.titulo}` : "Chamados por semana"}</h2><p>{relatorioDia ? "Atendimentos registrados na data selecionada." : "Chamados cadastrados no mês selecionado, agrupados por semana."}</p></div></div>
                        {relatorioDados.total === 0
                            ? <EmptyState title="Nenhum chamado neste recorte" description="Altere o mês, a situação ou a busca para consultar outros registros."/>
                            : relatorioDia
                                ? <ul className="reportDayList">{relatorioDados.chamados.map((chamado) => <li key={chamado.id}><span className={`recentStatus ${chamado.resolvido ? "resolved" : "pending"}`}/><div><strong>{chamado.cliente}</strong><small>{chamado.problema}</small></div><Status resolvido={chamado.resolvido}/><small className="reportRegisteredTime">Registrado às {new Date(chamado.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</small></li>)}</ul>
                                : <div className="monthlyChart weeklyChart" role="img" aria-label={`Chamados por semana: ${relatorioDados.semanas.map((item) => `dias ${item.label}: ${item.total}`).join(", ")}`}>
                                    {relatorioDados.semanas.map((item) => { const maximo = Math.max(1, ...relatorioDados.semanas.map((registro) => registro.total)); const altura = item.total === 0 ? 4 : Math.max(12, Math.round((item.total / maximo) * 100)); return <div className="monthColumn" key={item.label}><strong>{item.total}</strong><div className="monthBarTrack"><span className="monthBar" style={{ height: `${altura}%` }}/></div><span>Dias {item.label}</span></div>; })}
                                </div>}
                    </section>
                    <section className="panel reportPanel"><div className="reportHeading"><div><h2>Situação dos chamados</h2><p>Status atual dos registros dentro dos filtros aplicados.</p></div></div>
                        <div className="statusBreakdown" aria-label="Distribuição por situação">
                            {[{ label: "Pendentes", total: relatorioDados.pendentes, style: "pending" }, { label: "Resolvidos", total: relatorioDados.resolvidos, style: "resolved" }].map((item) => <div className="statusBreakdownRow" key={item.style}><div><span>{item.label}</span><strong>{item.total}</strong></div><div className="statusTrack"><span className={item.style} style={{ width: `${relatorioDados.total ? item.total / relatorioDados.total * 100 : 0}%` }}/></div></div>)}
                        </div>
                    </section>
                </div>
                <p className="reportNote">Os pontos no calendário indicam dias com chamados cadastrados. A situação exibida representa o estado atual de cada registro; o sistema ainda não guarda a data de conclusão.</p>
            </>}

            {caminho === "/configuracoes" && <>
                <header className="pageHeader"><div><h1>Configurações</h1><p>Gerencie uma cópia dos dados armazenados neste navegador.</p></div></header>
                <div className="settingsStack">
                    <section className="panel settingsPanel" aria-labelledby="backup-title">
                        <div className="settingsIcon"><Icon name="download" size={21}/></div><div className="settingsCopy"><h2 id="backup-title">Backup dos dados</h2><p>Exporte chamados e clientes cadastrados em um arquivo JSON para guardar uma cópia local.</p><div className="settingsCounts"><span><strong>{chamados.length}</strong> {chamados.length === 1 ? "chamado" : "chamados"}</span><span><strong>{clientes.length}</strong> {clientes.length === 1 ? "cliente" : "clientes"}</span></div><button type="button" className="submitButton" onClick={exportarBackup}><Icon name="download" size={17}/>Baixar backup</button><small>O arquivo é gerado neste dispositivo. Os dados continuam armazenados no navegador.</small></div>
                    </section>
                    <section className="panel settingsPanel settingsCleanupPanel" aria-labelledby="cleanup-title">
                        <div className="settingsIcon cleanupIcon"><Icon name="trash" size={20}/></div><div className="settingsCopy"><h2 id="cleanup-title">Limpar chamados por período</h2><p>Escolha as datas dos atendimentos que deseja remover. Os clientes cadastrados e os chamados fora do intervalo serão mantidos.</p>
                            <div className="cleanupRange"><label className="fieldGroup" htmlFor="cleanup-start"><span>Data inicial</span><input id="cleanup-start" type="date" value={limpezaInicio} onChange={(event) => { setLimpezaInicio(event.target.value); setConfirmarLimpeza(false); setMensagemLimpeza(""); }}/></label><label className="fieldGroup" htmlFor="cleanup-end"><span>Data final</span><input id="cleanup-end" type="date" value={limpezaFim} onChange={(event) => { setLimpezaFim(event.target.value); setConfirmarLimpeza(false); setMensagemLimpeza(""); }}/></label></div>
                            <p className={`cleanupCount ${limpezaInicio && limpezaFim && !intervaloLimpezaValido ? "error" : ""}`} aria-live="polite">{limpezaInicio && limpezaFim && !intervaloLimpezaValido ? "A data inicial deve ser anterior ou igual à data final." : intervaloLimpezaValido ? `${chamadosNoIntervaloLimpeza.length} ${chamadosNoIntervaloLimpeza.length === 1 ? "chamado encontrado" : "chamados encontrados"} neste intervalo.` : "Selecione as duas datas para consultar os chamados do período."}</p>
                            {mensagemLimpeza && <p className="cleanupFeedback" role="status">{mensagemLimpeza}</p>}
                            {confirmarLimpeza
                                ? <div className="settingsDeleteConfirm" role="alert"><p>Confirme a exclusão permanente de <strong>{chamadosNoIntervaloLimpeza.length} {chamadosNoIntervaloLimpeza.length === 1 ? "chamado" : "chamados"}</strong> entre {new Date(`${limpezaInicio}T12:00:00`).toLocaleDateString("pt-BR")} e {new Date(`${limpezaFim}T12:00:00`).toLocaleDateString("pt-BR")}.</p><div className="settingsDeleteActions"><button type="button" className="buttonDanger" onClick={excluirChamadosDoIntervalo}>Excluir chamados</button><button type="button" className="buttonTertiary" onClick={() => setConfirmarLimpeza(false)}>Cancelar</button></div></div>
                                : <button type="button" className="buttonDanger cleanupReviewButton" disabled={!intervaloLimpezaValido || chamadosNoIntervaloLimpeza.length === 0} onClick={() => { setConfirmarLimpeza(true); setMensagemLimpeza(""); }}>Revisar exclusão</button>}
                            <small>Essa ação remove os registros do navegador e não pode ser desfeita. Baixe um backup antes, se quiser guardar uma cópia.</small>
                        </div>
                    </section>
                </div>
            </>}

            {caminho === "/chamados/novo" && <>
                <header className="pageHeader pageHeaderStack"><a className="backLink" {...linkProps("/chamados")}><Icon name="back" size={17}/>Voltar aos chamados</a><div className="pageHeaderText"><h1>Novo chamado</h1><p>Preencha os dados para registrar uma solicitação.</p></div></header>
                <div className="newTicketLayout"><section className="panel routeFormPanel"><form onSubmit={registrarChamado} className="ticketForm">
                    {clientes.length > 0 && <div className="fieldGroup existingClientField"><label htmlFor="cliente-cadastrado">Usar cliente cadastrado <span>(opcional)</span></label><select id="cliente-cadastrado" value={clienteSelecionadoId} onChange={(event) => selecionarCliente(event.target.value)}><option value="">Preencher dados manualmente</option>{clientes.map((clienteItem) => <option key={clienteItem.id} value={clienteItem.id}>{clienteItem.nome} · {clienteItem.contato}</option>)}</select></div>}
                    <div className="fieldGroup"><label htmlFor="cliente">Cliente</label><input id="cliente" value={cliente} onChange={(event) => setCliente(event.target.value)} placeholder="Nome do cliente" required autoFocus readOnly={Boolean(clienteSelecionadoId)}/></div>
                    <div className="fieldGroup"><label htmlFor="endereco">Endereço</label><input id="endereco" value={endereco} onChange={(event) => setEndereco(event.target.value)} placeholder="Rua, número e bairro" required readOnly={Boolean(clienteSelecionadoId)}/></div>
                    <div className="fieldGroup contactField"><label htmlFor="contato">Contato</label><input id="contato" type="tel" inputMode="numeric" value={contato} onChange={(event) => setContato(formatarTelefone(event.target.value))} placeholder="(00) 00000-0000" required readOnly={Boolean(clienteSelecionadoId)}/></div>
                    <div className="fieldGroup dateField"><label htmlFor="data-chamado">Data do atendimento</label><input id="data-chamado" type="date" value={dataChamado} onChange={(event) => setDataChamado(event.target.value)} required/><small>Informe quando o atendimento ocorreu.</small></div>
                    <div className="fieldGroup descriptionField"><label htmlFor="problema">Descrição do problema</label><textarea id="problema" rows={5} value={problema} onChange={(event) => setProblema(event.target.value)} placeholder="Descreva a solicitação..." required/></div>
                    <div className="formFooter"><span>Todos os campos são obrigatórios.</span><button type="submit" className="submitButton"><Icon name="plus" size={17}/>Registrar chamado</button></div>
                </form></section>
                <aside className="panel contactHistoryPanel" aria-live="polite" aria-labelledby="contact-history-title">
                    <div className="panelHeading"><span className="panelHeadingIcon historyHeadingIcon"><Icon name="clock" size={18}/></span><div><h2 id="contact-history-title">Histórico deste contato</h2><p>Consulta pelo telefone informado.</p></div></div>
                    {!carregado
                        ? <div className="historyState"><span className="historyStateMark"><Icon name="inbox" size={18}/></span><p>Carregando o histórico…</p></div>
                        : contatoNormalizado.length < 10
                            ? <div className="historyState"><span className="historyStateMark"><Icon name="phone" size={18}/></span><p>Informe um telefone completo para consultar chamados anteriores.</p></div>
                            : historicoContato.length === 0
                                ? <div className="historyState"><span className="historyStateMark"><Icon name="check" size={18}/></span><p>Nenhum chamado anterior encontrado para este telefone.</p></div>
                        : <div className="historyResult"><div className="historyCount">{historicoContato.length} {historicoContato.length === 1 ? "chamado anterior" : "chamados anteriores"}</div><div className="historyLatest"><span className="historyDetailLabel">Atendimento mais recente</span><strong>{tempoDesde(dataReferenciaChamado(historicoContato[0]).toISOString())}</strong><span className="historyExactDate">{dataReferenciaChamado(historicoContato[0]).toLocaleDateString("pt-BR")} · registrado às {new Date(historicoContato[0].criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span><Status resolvido={historicoContato[0].resolvido}/></div><div className="historyIssue"><span className="historyDetailLabel">Descrição registrada</span><p>{historicoContato[0].problema}</p></div><a className="historyTicketLink" {...linkProps(`/chamados/${historicoContato[0].id}`)}><Icon name="eye" size={15}/>Ver chamado anterior</a></div>}
                </aside></div>
            </>}

            {caminho.startsWith("/chamados/") && caminho !== "/chamados/novo" && <>
                <header className="pageHeader pageHeaderStack"><a className="backLink" {...linkProps("/chamados")}><Icon name="back" size={17}/>Voltar aos chamados</a><div className="pageHeaderText"><span className="pageEyebrow">DETALHES DO ATENDIMENTO</span><h1>Chamado</h1><p>Consulte as informações e atualize a situação do atendimento.</p></div></header>
                {confirmacaoId && String(confirmacaoId) === caminho.slice("/chamados/".length) && <div className="successMessage" role="status">Chamado registrado com sucesso.</div>}
                {chamadoDetalhe ? <TicketCard chamado={chamadoDetalhe} onToggle={alternarResolvido} onDelete={excluirChamado} onRequestDelete={setExclusaoPendenteId} onCancelDelete={() => setExclusaoPendenteId(null)} confirmandoExclusao={String(exclusaoPendenteId) === String(chamadoDetalhe.id)} onNavigate={navegar}/> : <EmptyState title="Chamado não encontrado" description="O registro pode ter sido removido ou o endereço está incorreto." action={<a className="buttonTertiary resetFilters" {...linkProps("/chamados")}>Ver chamados</a>}/>}
            </>}

            {!(["/", "/chamados", "/chamados/novo", "/clientes", "/relatorios", "/configuracoes"].includes(caminho) || caminho.startsWith("/chamados/")) && <>
                <header className="pageHeader"><div className="pageHeaderText"><span className="pageEyebrow">PÁGINA NÃO ENCONTRADA</span><h1>Endereço inválido</h1><p>Não encontramos essa página.</p></div></header><a className="buttonTertiary resetFilters" {...linkProps("/")}>Voltar ao início</a>
            </>}
        </main>
    </div>;
}
