import { useState, useContext, useRef } from 'react';
import { toPng } from 'html-to-image';
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
    fisico: number
    pontos: number;
    partidas: number;
    vitorias: number;
    empates: number;
    derrotas: number;
    fotoUrl: string | null;
    atributos: {
        attack: number | null;
        defense: number | null;
        shot: number | null;
        pass: number | null;
        physical: number;
        pace: number | null
    };
}

interface SorteioProps {
    jogadores: Jogador[];
}

export default function Sorteio({ jogadores }: SorteioProps) {
    const { addToast } = useOutletContext<OutletToastCtx>();
    const { equipeAtiva } = useContext(AuthContext);
    const [salvando, setSalvando] = useState(false);
    const sorteadosRef = useRef<HTMLDivElement>(null);

    const [sortJogadores, setSortJogadores] = useState<Jogador[]>([]);
    const [sortGoleiros, setSortGoleiros] = useState<Jogador[]>([]);
    const [erroSorteio, setErroSorteio] = useState<string | null>(null);

    const [timeAzul, setTimeAzul] = useState<Jogador[]>([]);
    const [timeVermelho, setTimeVermelho] = useState<Jogador[]>([]);
    const [jogadorSelecionado, setJogadorSelecionado] = useState<{ jogador: Jogador; time: "Azul" | "Vermelho" } | null>(null);
    const [trocasRealizadas, setTrocasRealizadas] = useState<String[] | null>(null)
    const [countTrocas, setCountTrocas] = useState<number>(0)

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
        if (countTrocas >= 2){
            return addToast('Número máximo de trocas atingido!', 'error');
        }

        setTimeAzul(prev => prev.map(j => j.id === jogadorSel.id ? jogadorAlvo : j.id === jogadorAlvo.id ? jogadorSel : j));
        setTimeVermelho(prev => prev.map(j => j.id === jogadorSel.id ? jogadorAlvo : j.id === jogadorAlvo.id ? jogadorSel : j));
        setTrocasRealizadas(prev => [
            ...(prev ?? []),
            `${jogadorSel.nome}  ⇄  ${jogadorAlvo.nome}`,
        ]);
        setCountTrocas(prev => prev + 1);
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

    const compartilharFoto = async () => {
        if (!sorteadosRef.current) return;
        try {
            const dataUrl = await toPng(sorteadosRef.current, { cacheBust: true });

            const blob = await (await fetch(dataUrl)).blob();
            const file = new File([blob], 'times-sorteados.png', { type: 'image/png' });
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], title: 'Times Sorteados' });
                return;
            }

            const link = document.createElement('a');
            link.download = 'times-sorteados.png';
            link.href = dataUrl;
            link.click();
        } catch {
            addToast('Erro ao gerar a imagem.', 'error');
        }
    };

    const notaGeral = (f: number, s: number) => {
        return (s * 0.8) + ((f * 10) * 0.2);
    }


    const realizarSorteio = () => {
        setErroSorteio(null);
        setTrocasRealizadas(null);
        setCountTrocas(0);

        if (sortJogadores.length < 8) {
            setErroSorteio("Selecione pelo menos 8 jogadores de linha para realizar o sorteio.");
            return;
        }

        const jogadoresOrdenados = [...sortJogadores].sort((a, b) => {
            let grA = notaGeral(a.fisico, parseFloat(scoreJogador(a)))
            let grB = notaGeral(b.fisico, parseFloat(scoreJogador(b)))
            return grB - grA;
        });
        const goleirosOrdenados = [...sortGoleiros].sort((a, b) => {
            return parseFloat(scoreJogador(b)) - parseFloat(scoreJogador(a));
        });

        let novoAzul: Jogador[];
        let novoVermelho: Jogador[];

        if (sortGoleiros.length === 1) {
            // Vermelho recebe o único GK mas fica com menos 1 jogador de linha como compensação
            novoVermelho = [goleirosOrdenados[0]];
            novoAzul = [];

            const N = jogadoresOrdenados.length;
            const vermelhoTarget = Math.ceil(N / 2) - 1;
            let vermelhoCount = 0;

            jogadoresOrdenados.forEach((jogador, index) => {
                const posInGroup = index % 4;
                const wouldGoVermelho = posInGroup === 1 || posInGroup === 2;
                if (wouldGoVermelho && vermelhoCount < vermelhoTarget) {
                    novoVermelho.push(jogador);
                    vermelhoCount++;
                } else {
                    novoAzul.push(jogador);
                }
            });
        } else {
            // Caso 0 GK ou 2+ GKs: snake-draft padrão
            const timeAzulGoleiro = goleirosOrdenados[1];
            const timeVermelhoGoleiro = goleirosOrdenados[0];

            novoAzul = timeAzulGoleiro ? [timeAzulGoleiro] : [];
            novoVermelho = timeVermelhoGoleiro ? [timeVermelhoGoleiro] : [];

            jogadoresOrdenados.forEach((jogador, index) => {
                if (index % 4 === 0 || index % 4 === 3) {
                    novoAzul.push(jogador);
                } else {
                    novoVermelho.push(jogador);
                }
            });
        }

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

                    <div ref={sorteadosRef} className="bg-gray-900 p-4 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* CARD DO TIME AZUL */}
                        <div className="bg-gray-800 border-t-4 border-blue-500 rounded-xl p-6 shadow-xl">
                            <h4 className="text-xl font-bold text-blue-400 mb-4 text-center">Time Azul</h4>
                            {timeAzul.map((j) => (
                                <div
                                    key={j.id}
                                    onClick={() => countTrocas < 2 && setJogadorSelecionado({ jogador: j, time: "Azul" })}
                                    className={`flex items-center justify-between bg-gray-700 p-3 rounded mb-2 text-white transition-colors
                                        ${countTrocas < 2 ? 'cursor-pointer hover:bg-gray-600' : 'cursor-not-allowed opacity-70'}
                                        ${jogadorSelecionado?.jogador.id === j.id ? 'ring-2 ring-blue-400' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${j.posicao === 'Goleiro' ? 'bg-yellow-700 text-yellow-200' : 'bg-blue-900 text-blue-200'}`}>
                                            {j.posicao === 'Goleiro' ? 'GL' : 'LN'}
                                        </span>
                                        <span>{j.nome}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Score: {scoreJogador(j)}</span>
                                </div>
                            ))}
                        </div>

                        {/* CARD DO TIME VERMELHO */}
                        <div className="bg-gray-800 border-t-4 border-red-500 rounded-xl p-6 shadow-xl">
                            <h4 className="text-xl font-bold text-red-400 mb-4 text-center">Time Vermelho</h4>
                            {timeVermelho.map((j) => (
                                <div
                                    key={j.id}
                                    onClick={() => countTrocas < 2 && setJogadorSelecionado({ jogador: j, time: "Vermelho" })}
                                    className={`flex items-center justify-between bg-gray-700 p-3 rounded mb-2 text-white transition-colors
                                        ${countTrocas < 2 ? 'cursor-pointer hover:bg-gray-600' : 'cursor-not-allowed opacity-70'}
                                        ${jogadorSelecionado?.jogador.id === j.id ? 'ring-2 ring-red-400' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${j.posicao === 'Goleiro' ? 'bg-yellow-700 text-yellow-200' : 'bg-red-900 text-red-200'}`}>
                                            {j.posicao === 'Goleiro' ? 'GL' : 'LN'}
                                        </span>
                                        <span>{j.nome}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">Score: {scoreJogador(j)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CARD DE TROCAS REALIZADAS — largura total abaixo dos times */}
                    <div className="bg-gray-800 border-t-4 border-cyan-500 rounded-xl p-6 shadow-xl mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-cyan-400">Trocas Realizadas</h4>
                            <div className="flex gap-1.5">
                                {[0, 1].map(i => (
                                    <span
                                        key={i}
                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                                            ${i < countTrocas
                                                ? 'bg-cyan-600 border-cyan-400 text-white'
                                                : 'bg-gray-700 border-gray-500 text-gray-500'}`}
                                    >
                                        {i + 1}
                                    </span>
                                ))}
                                <span className={`ml-2 text-sm font-medium self-center ${countTrocas >= 2 ? 'text-red-400' : 'text-gray-400'}`}>
                                    {countTrocas}/2 utilizadas
                                </span>
                            </div>
                        </div>

                        {!trocasRealizadas || trocasRealizadas.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-2">
                                {countTrocas >= 2 ? 'Limite de trocas atingido.' : 'Nenhuma troca realizada ainda. Clique em um jogador para trocar.'}
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {trocasRealizadas.map((t, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-gray-700 rounded-lg px-4 py-2.5">
                                        <span className="w-5 h-5 rounded-full bg-cyan-700 text-cyan-100 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                        <span className="text-gray-200 text-sm">{t}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {countTrocas >= 2 && (
                            <p className="text-red-400 text-xs text-center mt-3 font-medium">
                                Limite de 2 trocas atingido. Para mais ajustes, refaça o sorteio.
                            </p>
                        )}
                    </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                        <button onClick={salvarTimeSorteado} disabled={salvando}
                            className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded shadow-lg transition-colors cursor-pointer">
                            {salvando ? 'Salvando...' : 'Salvar Time'}
                        </button>
                        <button
                            onClick={compartilharFoto}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded shadow-lg transition-colors cursor-pointer"
                        >
                            Compartilhar Foto
                        </button>
                        <button
                            onClick={() => {
                                setTimeAzul([]);
                                setTimeVermelho([]);
                                setTrocasRealizadas(null);
                                setCountTrocas(0);
                                setJogadorSelecionado(null);
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
