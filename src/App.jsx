import { useEffect, useMemo, useState } from "react";
import "./App.css";
import logo from "./assets/logo.png";

const STORAGE_KEY = "chamados_alvestech";

/* ===================== LISTA ===================== */
function ListaChamados({ titulo, itens, vazio, resolvido, onToggle, onDelete }) {
    return (
        <div className="card">
            <h2>
                {titulo} ({itens.length})
            </h2>

            {itens.length === 0 ? (
                <p className="vazio">{vazio}</p>
            ) : (
                <ul className="lista">
                    {itens.map((c) => (
                        <li key={c.id} className={resolvido ? "ok" : ""}>
                            <div className="itemInfo">
                                <strong>{c.cliente}</strong>

                                <div className="linhaContato">
                                    <span>📍 {c.endereco}</span>
                                    <span>📞 {c.contato}</span>
                                </div>

                                <div className="problema">{c.problema}</div>
                            </div>

                            <div className="itemData">
                                {new Date(c.criadoEm).toLocaleString("pt-BR")}
                            </div>

                            <div className="acoes">
                                <button
                                    type="button"
                                    className="btnSec"
                                    onClick={() => onToggle(c.id)}
                                >
                                    {resolvido ? "Reabrir" : "Concluir"}
                                </button>

                                <button
                                    type="button"
                                    className="btnDanger"
                                    onClick={() => onDelete(c.id)}
                                >
                                    Excluir
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* ===================== APP ===================== */
export default function App() {
    const [cliente, setCliente] = useState("");
    const [endereco, setEndereco] = useState("");
    const [contato, setContato] = useState("");
    const [problema, setProblema] = useState("");

    const [chamados, setChamados] = useState([]);
    const [carregado, setCarregado] = useState(false);

    /* ===== LER DO LOCALSTORAGE ===== */
    useEffect(() => {
        const dados = localStorage.getItem(STORAGE_KEY);
        if (dados) {
            setChamados(JSON.parse(dados));
        }
        setCarregado(true);
    }, []);

    /* ===== SALVAR NO LOCALSTORAGE ===== */
    useEffect(() => {
        if (!carregado) return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chamados));
    }, [chamados, carregado]);

    /* ===== SEPARAR LISTAS ===== */
    const { pendentes, resolvidos } = useMemo(() => {
        const pend = [];
        const res = [];
        chamados.forEach((c) => (c.resolvido ? res : pend).push(c));
        return { pendentes: pend, resolvidos: res };
    }, [chamados]);

    /* ===== REGISTRAR ===== */
    function registrarChamado(e) {
        e.preventDefault();

        if (
            !cliente.trim() ||
            !endereco.trim() ||
            !contato.trim() ||
            !problema.trim()
        )
            return;

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
            prev.map((c) =>
                c.id === id ? { ...c, resolvido: !c.resolvido } : c
            )
        );
    }

    function excluirChamado(id) {
        setChamados((prev) => prev.filter((c) => c.id !== id));
    }

    return (
        <div className="container">
            {/* TOPO */}
            <header className="topo">
                <img src={logo} alt="Alves Tech" className="logo" />
                <div className="tituloBox">
                    <h1>REGISTRO SIMPLES DE ATENDIMENTOS</h1>
                </div>
                <div />
            </header>

            <div className="grid">
                {/* FORM */}
                <form className="card" onSubmit={registrarChamado}>
                    <input
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        placeholder="Cliente (ex: João - Notebook)"
                    />

                    <input
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        placeholder="Endereço (ex: Rua A, 123 - Bairro)"
                    />

                    <input
                        value={contato}
                        onChange={(e) => setContato(e.target.value)}
                        placeholder="Contato (ex: 38 99999-0000)"
                    />

                    <textarea
                        value={problema}
                        onChange={(e) => setProblema(e.target.value)}
                        placeholder="Descreva o problema"
                        rows={4}
                    />

                    <button type="submit">Registrar</button>
                </form>

                {/* LISTAS */}
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
