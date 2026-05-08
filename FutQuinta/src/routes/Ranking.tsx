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

const fallbackAvatar = 'https://res.cloudinary.com/dk9fhp8d8/image/upload/w_453,h_594,c_fill/iconJogador_g2wkq9.png';

function SkeletonRow() {
    return (
        <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}>
            <div className="h-14 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
        </div>
    );
}

const rowBorderColor = (index: number) => {
    if (index === 0) return 'var(--color-brand-gold)';
    if (index === 1) return 'var(--color-brand-silver)';
    if (index === 2) return 'var(--color-brand-bronze)';
    return 'transparent';
};

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

            {/* Podium — top 3 */}
            {!carregando && jogadores.length >= 3 && (
                <div className="flex items-end justify-center gap-3 mb-10 mt-4">
                    {/* 2nd place */}
                    <div className="flex flex-col items-center gap-2">
                        <img
                            src={jogadores[1].fotoUrl ?? fallbackAvatar}
                            alt={jogadores[1].nome}
                            className="w-14 h-14 rounded-full object-cover border-2"
                            style={{ borderColor: 'var(--color-brand-silver)' }}
                        />
                        <span className="text-xs text-gray-300 font-semibold truncate max-w-[80px] text-center">{jogadores[1].nome}</span>
                        <div className="w-20 h-16 rounded-t-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-surface-border)' }}>
                            <span className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brand-silver)' }}>2</span>
                        </div>
                    </div>
                    {/* 1st place — taller */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="relative">
                            <img
                                src={jogadores[0].fotoUrl ?? fallbackAvatar}
                                alt={jogadores[0].nome}
                                className="w-16 h-16 rounded-full object-cover border-2"
                                style={{ borderColor: 'var(--color-brand-gold)' }}
                            />
                            <span className="absolute -top-2 -right-2 text-base">🏆</span>
                        </div>
                        <span className="text-xs text-white font-bold truncate max-w-[90px] text-center">{jogadores[0].nome}</span>
                        <div className="w-24 h-24 rounded-t-lg flex items-center justify-center border" style={{ background: 'linear-gradient(to bottom, rgba(245,158,11,0.2), var(--color-surface-raised))', borderColor: 'rgba(245,158,11,0.3)' }}>
                            <span className="text-5xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brand-gold)' }}>1</span>
                        </div>
                    </div>
                    {/* 3rd place */}
                    <div className="flex flex-col items-center gap-2">
                        <img
                            src={jogadores[2].fotoUrl ?? fallbackAvatar}
                            alt={jogadores[2].nome}
                            className="w-12 h-12 rounded-full object-cover border-2"
                            style={{ borderColor: 'var(--color-brand-bronze)' }}
                        />
                        <span className="text-xs text-gray-400 font-medium truncate max-w-[72px] text-center">{jogadores[2].nome}</span>
                        <div className="w-20 h-10 rounded-t-lg flex items-center justify-center border" style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-surface-border)' }}>
                            <span className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brand-bronze)' }}>3</span>
                        </div>
                    </div>
                </div>
            )}

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
                        const winRate = parseFloat(mediaVitoriasJogo(jogador));

                        return (
                            <div
                                key={jogador.id}
                                className="rounded-xl overflow-hidden transition-all duration-200 border-l-4"
                                style={{
                                    backgroundColor: 'var(--color-surface-card)',
                                    borderLeftColor: rowBorderColor(index),
                                    border: `1px solid var(--color-surface-border)`,
                                    borderLeft: `4px solid ${rowBorderColor(index)}`
                                }}
                            >
                                <button
                                    onClick={() => toggleAccordion(jogador.id)}
                                    className="w-full flex items-center justify-between p-4 transition-colors cursor-pointer hover:bg-white/5"
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
                                        <span className="font-bold text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brand-score)' }}>{jogador.pontos}</span>
                                        <span className="text-gray-500 text-xs">pts</span>
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
                                        <div className="p-4 border-t border-[var(--color-surface-border)] grid grid-cols-2 gap-2 sm:gap-4 text-sm" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                                            <div className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                                                <p className="text-gray-400">Partidas</p>
                                                <p className="text-white font-bold text-lg">{jogador.partidas}</p>
                                            </div>
                                            <div className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                                                <p className="text-green-400">Vitórias</p>
                                                <p className="text-white font-bold text-lg">{jogador.vitorias}</p>
                                            </div>
                                            <div className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                                                <p className="text-gray-400">Empates</p>
                                                <p className="text-white font-bold text-lg">{jogador.empates}</p>
                                            </div>
                                            <div className="text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                                                <p className="text-red-400">Derrotas</p>
                                                <p className="text-white font-bold text-lg">{jogador.derrotas}</p>
                                            </div>
                                            {/* Win rate progress bar — full width */}
                                            <div className="col-span-2 rounded-lg p-3" style={{ backgroundColor: 'var(--color-surface-raised)' }}>
                                                <div className="flex justify-between mb-2">
                                                    <p className="text-gray-400 text-xs">Taxa de Vitórias</p>
                                                    <p className="text-white text-xs font-bold">{mediaVitoriasJogo(jogador)}%</p>
                                                </div>
                                                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${Math.min(winRate, 100)}%`,
                                                            background: 'linear-gradient(to right, var(--color-brand-pitch), var(--color-brand-grass))'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-span-2 text-center p-2 sm:p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-raised)' }}>
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
