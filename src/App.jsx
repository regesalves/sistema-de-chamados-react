import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "chamados_alvestech";

function formatarTelefone(valor) {
    const digitos = valor.replace(/\D/g, "").slice(0, 11);

    if (digitos.length === 0) return "";
    if (digitos.length <= 2) return `(${digitos}`;
    if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    if (digitos.length <= 10) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

function ListaChamados({ titulo, itens, vazio, resolvido, onToggle, onDelete }) {
    return (
        <section className="panel listPanel">
            <div className="panelHeader">
                <h2>{titulo}</h2>
                <span className="countBadge">{itens.length}</span>
            </div>

            {itens.length === 0 ? (
                <p className="vazio">{vazio}</p>
            ) : (
                <ul className="lista">
                    {itens.map((c) => (
                        <li
                            key={c.id}
                            className={`ticket ${resolvido ? "resolved" : "pending"}`}
                        >
                            <div className="ticketTop">
                                <div className="ticketTitleRow">
                                    <strong className="ticketName">{c.cliente}</strong>
                                    <span className={`statusPill ${resolvido ? "resolved" : "pending"}`}>
                                        {resolvido ? "Resolvido" : "Pendente"}
                                    </span>
                                </div>

                                <div className="ticketMeta">
                                    <span>Aberto em</span>
                                    <strong>
                                        {new Date(c.criadoEm).toLocaleString("pt-BR")}
                                    </strong>
                                </div>
                            </div>

                            <div className="ticketContactRow">
                                <span className="metaItem">
                                    <span className="metaIcon">⌖</span>
                                    <span>{c.endereco}</span>
                                </span>

                                <span className="metaDivider" />

                                <span className="metaItem">
                                    <span className="metaIcon">☎</span>
                                    <span>{c.contato}</span>
                                </span>
                            </div>

                            <div className="descricaoCard">
                                <span className="descricaoLabel">Descrição</span>
                                <p className="descricaoTexto">{c.problema}</p>
                            </div>

                            <div className="acoes acoesDireita">
                                <button
                                    type="button"
                                    className="btnOutline btnSuccess"
                                    onClick={() => onToggle(c.id)}
                                >
                                    {resolvido ? "Reabrir" : "Concluir"}
                                </button>

                                <button
                                    type="button"
                                    className="btnOutline btnDanger"
                                    onClick={() => onDelete(c.id)}
                                >
                                    Excluir
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function App() {
    const [cliente, setCliente] = useState("");
    const [endereco, setEndereco] = useState("");
    const [contato, setContato] = useState("");
    const [problema, setProblema] = useState("");

    const [chamados, setChamados] = useState([]);
    const [carregado, setCarregado] = useState(false);

    useEffect(() => {
        const dados = localStorage.getItem(STORAGE_KEY);
        if (dados) {
            setChamados(JSON.parse(dados));
        }
        setCarregado(true);
    }, []);

    useEffect(() => {
        if (!carregado) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chamados));
    }, [chamados, carregado]);

    const { pendentes, resolvidos } = useMemo(() => {
        const pend = [];
        const res = [];
        chamados.forEach((c) => (c.resolvido ? res : pend).push(c));
        return { pendentes: pend, resolvidos: res };
    }, [chamados]);

    function registrarChamado(e) {
        e.preventDefault();

        if (
            !cliente.trim() ||
            !endereco.trim() ||
            !contato.trim() ||
            !problema.trim()
        ) {
            return;
        }

        const novo = {
            id: Date.now(),
            cliente: cliente.trim(),
            endereco: endereco.trim(),
            contato: contato.trim(),
            problema: problema.trim(),
            resolvido: false,
            criadoEm: new Date().toISOString(),
        };

        setChamados((prev) => [...prev, novo]);
        setCliente("");
        setEndereco("");
        setContato("");
        setProblema("");
    }

    function alternarResolvido(id) {
        setChamados((prev) =>
            prev.map((c) => (c.id === id ? { ...c, resolvido: !c.resolvido } : c))
        );
    }

    function excluirChamado(id) {
        setChamados((prev) => prev.filter((c) => c.id !== id));
    }

    return (
        <div className="container">
            <header className="topo">
                <div className="tituloBox">
                    <h1>Sistema de Chamados</h1>
                    <p>Cadastre e acompanhe seus chamados em um só lugar.</p>
                </div>
            </header>

            <div className="grid">
                <form className="panel formPanel" onSubmit={registrarChamado}>
                    <div className="formHeading">
                        <span className="formIcon">🗒</span>
                        <div>
                            <h2>Novo atendimento</h2>
                            <p>Preencha os dados para registrar um chamado.</p>
                        </div>
                    </div>

                    <label>Cliente</label>
                    <input
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        placeholder="Ex.: João - Notebook"
                    />

                    <label>Endereço</label>
                    <input
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        placeholder="Ex.: Rua A, 123 - Bairro"
                    />

                    <label>Contato</label>
                    <input
                        type="tel"
                        value={contato}
                        onChange={(e) => setContato(formatarTelefone(e.target.value))}
                        inputMode="numeric"
                        placeholder="(38) 99999-0000"
                    />

                    <label>Descrição</label>
                    <textarea
                        value={problema}
                        onChange={(e) => setProblema(e.target.value)}
                        placeholder="Descreva o problema..."
                        rows={6}
                    />

                    <button type="submit">+ Registrar atendimento</button>
                </form>

                <div className="colunaListas">
                    <ListaChamados
                        titulo="Chamados pendentes"
                        itens={pendentes}
                        vazio="Nenhum chamado pendente."
                        resolvido={false}
                        onToggle={alternarResolvido}
                        onDelete={excluirChamado}
                    />

                    <ListaChamados
                        titulo="Chamados resolvidos"
                        itens={resolvidos}
                        vazio="Nenhum chamado resolvido ainda."
                        resolvido={true}
                        onToggle={alternarResolvido}
                        onDelete={excluirChamado}
                    />
                </div>
            </div>
        </div>
    );
}
