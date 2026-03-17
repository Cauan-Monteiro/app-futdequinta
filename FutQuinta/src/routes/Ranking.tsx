import '../App.css'
import { useState } from 'react';

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

interface RankingProps {
    jogadores: Jogador[];
    carregando: boolean;
}

function SkeletonRow() {
    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50 animate-pulse">
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                    <div className="w-6 h-5 bg-gray-700 rounded" />
                    <div className="w-36 h-5 bg-gray-700 rounded" />
                    <div className="w-8 h-5 bg-gray-700 rounded" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-5 bg-gray-700 rounded" />
                    <div className="w-4 h-4 bg-gray-700 rounded" />
                </div>
            </div>
        </div>
    );
}

export default function Ranking({ jogadores, carregando }: RankingProps) {

    const [idExpandido, setIdExpandido] = useState<number | null>(null);

    const toggleAccordion = (id: number) => {
        setIdExpandido(idExpandido === id ? null : id);
    };

    const mediaVitoriasJogo = (jogador: Jogador) => {
        if (jogador.partidas === 0) return '0.00';
        return ((jogador.vitorias / jogador.partidas) * 100).toFixed(2);
    }

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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold text-white mb-6">Estatísticas dos Jogadores</h2>

            <h3 className="text-xl font-bold text-white mb-4 mt-8 tracking-wide border-b border-gray-700/50 pb-2">Classificação Geral</h3>

            {carregando ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
                </div>
            ) : jogadores.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-400 text-lg font-medium">Nenhum jogador encontrado</p>
                    <p className="text-gray-600 text-sm mt-1">Visite a Home para carregar os dados</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {jogadores.map((jogador, index) => {
                        const isExpanded = idExpandido === jogador.id;

                        return (
                            <div key={jogador.id} className={`bg-gray-800 rounded-xl overflow-hidden transition-all duration-200 border border-gray-700/50${index < 3 ? ' ring-1 ring-yellow-400/20' : ''}`}>

                                <button
                                    onClick={() => toggleAccordion(jogador.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                                    title="Clique para ver estatísticas detalhadas"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className={`font-mono font-bold w-6 ${index < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>{index + 1}°</span>
                                        <span className="text-white font-medium text-sm truncate max-w-[140px] sm:max-w-none">{jogador.nome}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${jogador.posicao === 'Goleiro' ? 'bg-cyan-900/60 text-cyan-400' : 'bg-gray-700 text-gray-400'}`}>
                                            {jogador.posicao === 'Goleiro' ? 'GK' : 'JG'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-300 font-bold">{jogador.pontos} pts</span>
                                        <svg
                                            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                <div
                                    className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="bg-gray-700/50 p-4 border-t border-gray-700 grid grid-cols-2 gap-2 sm:gap-4 text-sm">
                                            <div className="text-center p-2 sm:p-3 bg-gray-800 rounded-lg">
                                                <p className="text-gray-400">Partidas</p>
                                                <p className="text-white font-bold text-lg">{jogador.partidas}</p>
                                            </div>
                                            <div className="text-center p-2 sm:p-3 bg-gray-800 rounded-lg">
                                                <p className="text-green-400">Vitórias</p>
                                                <p className="text-white font-bold text-lg">{jogador.vitorias}</p>
                                            </div>
                                            <div className="text-center p-2 sm:p-3 bg-gray-800 rounded-lg">
                                                <p className="text-gray-400">Empates</p>
                                                <p className="text-white font-bold text-lg">{jogador.empates}</p>
                                            </div>
                                            <div className="text-center p-2 sm:p-3 bg-gray-800 rounded-lg">
                                                <p className="text-red-400">Derrotas</p>
                                                <p className="text-white font-bold text-lg">{jogador.derrotas}</p>
                                            </div>
                                            <div className="text-center p-2 sm:p-3 bg-gray-800 rounded-lg">
                                                <p className="text-gray-400">Média Vitórias/Jogo</p>
                                                <p className="text-white font-bold text-lg">{mediaVitoriasJogo(jogador)}%</p>
                                            </div>
                                            <div className="text-center p-2 sm:p-3 bg-gray-800 rounded-lg">
                                                <p className="text-gray-400">Score do Jogador</p>
                                                <p className="text-white font-bold text-lg">{scoreJogador(jogador)}🔥</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
