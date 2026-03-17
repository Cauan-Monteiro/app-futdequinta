import { useState, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from '../components/AuthContext';
import type { OutletToastCtx } from '../components/LayoutInterno';
import '../App.css'

const API_URL = import.meta.env.VITE_API_URL;

interface Jogador {
    id: number;
    nome: string;
    posicao: "Goleiro" | "Linha";
    pontos: number;
    partidas: number;
    vitorias: number;
    empates: number;
    derrotas: number;
    fotoUrl: string | null;
}

interface SorteioProps {
    jogadores: Jogador[];
}

export default function Sorteio({ jogadores }: SorteioProps) {
    const { addToast } = useOutletContext<OutletToastCtx>();
    const { equipeAtiva } = useContext(AuthContext);
    const [salvando, setSalvando] = useState(false);

    const [sortJogadores, setSortJogadores] = useState<Jogador[]>([]);
    const [sortGoleiros, setSortGoleiros] = useState<Jogador[]>([]);
    const [erroSorteio, setErroSorteio] = useState<string | null>(null);

    const [timeAzul, setTimeAzul] = useState<Jogador[]>([]);
    const [timeVermelho, setTimeVermelho] = useState<Jogador[]>([]);
    const [jogadorSelecionado, setJogadorSelecionado] = useState<{ jogador: Jogador; time: "Azul" | "Vermelho" } | null>(null);

    const scoreJogador = (jogador: Jogador) => {
        if (jogador.partidas === 0) {
            return 0.00.toFixed(2);
        } else if (jogador.partidas <= 2) {
            return 50.00.toFixed(2);
        } else {
            const pontosPossiveis = jogador.partidas * 3;
            return ((jogador.pontos / pontosPossiveis) * 100).toFixed(2);
        }
    }

    const scoreJogadorNum = (jogador: Jogador): number => {
        if (jogador.partidas === 0) return 0;
        if (jogador.partidas <= 2) return 50;
        return (jogador.pontos / (jogador.partidas * 3)) * 100;
    };

    const getSugestoesTroca = (jogador: Jogador, time: "Azul" | "Vermelho"): Jogador[] => {
        const adversarios = time === "Azul" ? timeVermelho : timeAzul;
        const meuScore = scoreJogadorNum(jogador);
        return adversarios
            .filter(j => j.posicao === jogador.posicao)
            .sort((a, b) => Math.abs(scoreJogadorNum(a) - meuScore) - Math.abs(scoreJogadorNum(b) - meuScore))
            .slice(0, 2);
    };

    const realizarTroca = (jogadorSel: Jogador, jogadorAlvo: Jogador) => {
        setTimeAzul(prev => prev.map(j => j.id === jogadorSel.id ? jogadorAlvo : j.id === jogadorAlvo.id ? jogadorSel : j));
        setTimeVermelho(prev => prev.map(j => j.id === jogadorSel.id ? jogadorAlvo : j.id === jogadorAlvo.id ? jogadorSel : j));
        setJogadorSelecionado(null);
    };

    const salvarTimeSorteado = async () => {
        if (!equipeAtiva) return;
        setSalvando(true);
        try {
            const res = await fetch(`${API_URL}/times-sorteados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token_acesso')}`
                },
                body: JSON.stringify({
                    companyId: parseInt(equipeAtiva.id),
                    jogadoresAzul: timeAzul.map(j => j.id),
                    jogadoresVermelho: timeVermelho.map(j => j.id)
                })
            });
            if (!res.ok) throw new Error();
            addToast('Time sorteado salvo com sucesso!', 'success');
        } catch {
            addToast('Erro ao salvar o time sorteado.', 'error');
        } finally {
            setSalvando(false);
        }
    };

    const realizarSorteio = () => {
        setErroSorteio(null);

        if (sortGoleiros.length < 2) {
            setErroSorteio("Selecione pelo menos 2 goleiros para realizar o sorteio.");
            return;
        }
        if (sortJogadores.length < 8) {
            setErroSorteio("Selecione pelo menos 8 jogadores de linha para realizar o sorteio.");
            return;
        }

        const jogadoresOrdenados = [...sortJogadores].sort((a, b) => {
            return parseFloat(scoreJogador(b)) - parseFloat(scoreJogador(a));
        });
        const goleirosOrdenados = [...sortGoleiros].sort((a, b) => {
            return parseFloat(scoreJogador(b)) - parseFloat(scoreJogador(a));
        });

        const timeAzulGoleiro = goleirosOrdenados[0];
        const timeVermelhoGoleiro = goleirosOrdenados[1];

        const novoAzul: Jogador[] = timeAzulGoleiro ? [timeAzulGoleiro] : [];
        const novoVermelho: Jogador[] = timeVermelhoGoleiro ? [timeVermelhoGoleiro] : [];
        jogadoresOrdenados.forEach((jogador, index) => {
            if (index % 4 === 0 || index % 4 === 3) {
                novoAzul.push(jogador);
            } else {
                novoVermelho.push(jogador);
            }
        });
        setTimeAzul(novoAzul);
        setTimeVermelho(novoVermelho);
    }

    const toggleJogadorSorteio = (jogadorClicado: Jogador) => {
        setSortJogadores(prev => {
            const estaNoSorteio = prev.some(j => j.id === jogadorClicado.id);
            if (estaNoSorteio) {
                return prev.filter(j => j.id !== jogadorClicado.id);
            } else {
                return [...prev, jogadorClicado];
            }
        });
    };

    const toggleGoleiroSorteio = (jogadorClicado: Jogador) => {
        setSortGoleiros(prev => {
            const estaNoSorteio = prev.some(j => j.id === jogadorClicado.id);
            if (estaNoSorteio) {
                return prev.filter(j => j.id !== jogadorClicado.id);
            } else {
                return [...prev, jogadorClicado];
            }
        });
    };

    const goleiros = jogadores.filter(j => j.posicao === "Goleiro");
    const linhas = jogadores.filter(j => j.posicao === "Linha");

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-white mb-6">Sorteador de Times</h2>

            <div className="bg-gray-800 rounded-xl p-6 mb-8 border-t-4 border-cyan-500">
                <h3 className="text-xl font-bold text-blue-400 mb-4">
                    Goleiros Presentes ({sortGoleiros.length})
                </h3>

                {goleiros.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">Nenhum goleiro cadastrado.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                        {goleiros.map(jogador => {
                            const estaPresente = sortGoleiros.some(j => j.id === jogador.id);

                            return (
                                <div
                                    key={jogador.id}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                        estaPresente ? 'bg-green-900 border border-green-500' : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
                                    }`}
                                    onClick={() => toggleGoleiroSorteio(jogador)}
                                >
                                    <div>
                                        <span className="text-white font-medium">{jogador.nome}</span>
                                        <span className="text-gray-400 text-sm ml-2">Score: {scoreJogador(jogador)}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={estaPresente}
                                        readOnly
                                        className="w-5 h-5 accent-green-500 cursor-pointer"
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="bg-gray-800 rounded-xl p-6 mb-8 border-t-4 border-green-500">
                <h3 className="text-xl font-bold text-blue-400 mb-4">
                    Jogadores Presentes ({sortJogadores.length})
                </h3>

                {linhas.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">Nenhum jogador de linha cadastrado.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                        {linhas.map(jogador => {
                            const estaPresente = sortJogadores.some(j => j.id === jogador.id);

                            return (
                                <div
                                    key={jogador.id}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                                        estaPresente ? 'bg-green-900 border border-green-500' : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
                                    }`}
                                    onClick={() => toggleJogadorSorteio(jogador)}
                                >
                                    <div>
                                        <span className="text-white font-medium">{jogador.nome}</span>
                                        <span className="text-gray-400 text-sm ml-2">Score: {scoreJogador(jogador)}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={estaPresente}
                                        readOnly
                                        className="w-5 h-5 accent-green-500 cursor-pointer"
                                    />
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {timeAzul.length === 0 && (
                <div className="flex flex-col items-center gap-3 mt-6">
                    {erroSorteio && (
                        <p className="text-red-400 text-sm text-center">{erroSorteio}</p>
                    )}
                    <button
                        onClick={realizarSorteio}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg tracking-wide transition-colors cursor-pointer"
                    >
                        Sortear Times
                    </button>
                </div>
            )}

            {timeAzul.length > 0 && (
                <div className="mt-8 animate-fadeIn">
                    <h3 className="text-2xl font-bold text-white mb-6 text-center">🏆 Times Sorteados</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* CARD DO TIME AZUL */}
                        <div className="bg-gray-800 border-t-4 border-blue-500 rounded-xl p-6 shadow-xl">
                            <h4 className="text-xl font-bold text-blue-400 mb-4 text-center">Time Azul</h4>
                            {timeAzul.map((j) => (
                                <div
                                    key={j.id}
                                    onClick={() => setJogadorSelecionado({ jogador: j, time: "Azul" })}
                                    className={`flex items-center justify-between bg-gray-700 p-3 rounded mb-2 text-white cursor-pointer hover:bg-gray-600 transition-colors ${jogadorSelecionado?.jogador.id === j.id ? 'ring-2 ring-blue-400' : ''}`}
                                >
                                    <span>{j.nome}</span>
                                    <span className="text-xs text-gray-400 ml-2">Score: {scoreJogador(j)}</span>
                                </div>
                            ))}
                        </div>

                        {/* CARD DO TIME VERMELHO */}
                        <div className="bg-gray-800 border-t-4 border-red-500 rounded-xl p-6 shadow-xl">
                            <h4 className="text-xl font-bold text-red-400 mb-4 text-center">Time Vermelho</h4>
                            {timeVermelho.map((j) => (
                                <div
                                    key={j.id}
                                    onClick={() => setJogadorSelecionado({ jogador: j, time: "Vermelho" })}
                                    className={`flex items-center justify-between bg-gray-700 p-3 rounded mb-2 text-white cursor-pointer hover:bg-gray-600 transition-colors ${jogadorSelecionado?.jogador.id === j.id ? 'ring-2 ring-red-400' : ''}`}
                                >
                                    <span>{j.nome}</span>
                                    <span className="text-xs text-gray-400 ml-2">Score: {scoreJogador(j)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                        <button onClick={salvarTimeSorteado} disabled={salvando}
                            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded shadow-lg transition-colors cursor-pointer">
                            {salvando ? 'Salvando...' : 'Salvar Time'}
                        </button>
                        <button
                            onClick={() => {
                                setTimeAzul([]);
                                setTimeVermelho([]);
                            }}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded transition-colors cursor-pointer"
                        >
                            Voltar / Editar Lista
                        </button>
                    </div>
                </div>
            )}

            {jogadorSelecionado && (() => {
                const sugestoes = getSugestoesTroca(jogadorSelecionado.jogador, jogadorSelecionado.time);
                const timeOposto = jogadorSelecionado.time === "Azul" ? "Vermelho" : "Azul";
                return (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setJogadorSelecionado(null)}>
                        <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
                            <h3 className="text-lg font-bold text-white mb-1">
                                Sugestões de troca para <span className="text-blue-300">{jogadorSelecionado.jogador.nome}</span>
                            </h3>
                            <p className="text-gray-400 text-sm mb-1">Score: {scoreJogador(jogadorSelecionado.jogador)}</p>
                            <p className="text-gray-400 text-sm mb-4">Selecione um jogador do Time {timeOposto} para trocar:</p>
                            {sugestoes.length === 0 && (
                                <p className="text-gray-500 text-sm mb-4">Nenhum jogador elegível no time adversário.</p>
                            )}
                            {sugestoes.map(s => {
                                return (
                                    <div key={s.id} className="flex items-center justify-between bg-gray-700 rounded p-3 mb-2">
                                        <span className="text-white text-sm">
                                            {s.nome} — Score: {scoreJogador(s)}
                                        </span>
                                        <button
                                            onClick={() => realizarTroca(jogadorSelecionado.jogador, s)}
                                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 px-3 rounded ml-2 cursor-pointer transition-colors"
                                        >
                                            Trocar
                                        </button>
                                    </div>
                                );
                            })}
                            <button
                                onClick={() => setJogadorSelecionado(null)}
                                className="mt-2 w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded cursor-pointer transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
