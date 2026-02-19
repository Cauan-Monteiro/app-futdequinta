import '../App.css'
import { useState } from 'react';

interface Jogador {
    id: number;
    nome: string;
    pontos: number;
    partidas: number;
    vitorias: number;
    empates: number;
    derrotas: number;
}

interface RankingProps {
    jogadores: Jogador[];
    jogadorEditando: Jogador | null;
    formData: any; // Os dados do formulário
    setFormData: (data: any) => void; // A função para atualizar o formulário
    iniciarEdicao: (jogador: Jogador) => void;
    cancelarEdicao: () => void;
    atualizarJogador: () => void;
}

export default function Ranking({
    jogadores,
    // jogadorEditando,
    // formData,
    // setFormData,
    // iniciarEdicao,
    // cancelarEdicao,
    // atualizarJogador
}: RankingProps) {

    const [idExpandido, setIdExpandido] = useState<number | null>(null);

    // Função para alternar o estado de expansão
    const toggleAccordion = (id: number) => {
        if (idExpandido === id) {
            setIdExpandido(null); // Fecha se já estiver aberto
        } else {
            setIdExpandido(id); // Abre o novo
        }
    };

    const mediaVitoriasJogo = (jogador: Jogador) => {
        return ((jogador.vitorias / jogador.partidas) * 100).toFixed(2);
    }
    const scoreJogador = (jogador: Jogador) => {
        if (jogador.partidas === 0) {
            return 0.00.toFixed(2);
        } else if (jogador.partidas <= 2) {
            return 50.00.toFixed(2);
        } else {
            return (((jogador.vitorias * 3) + (jogador.empates)) / (jogador.vitorias + jogador.empates + jogador.derrotas) * 100).toFixed(2);
        }
    }

    return (

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" >
            <h2 className="text-3xl font-bold text-white mb-6">Estatísticas dos Jogadores</h2>

            <h3 className="text-xl font-bold text-white mb-4 mt-8">Classificação Geral</h3>
            <div className="space-y-2">
                {jogadores.map((jogador, index) => {
                    const isExpanded = idExpandido === jogador.id;

                    return (
                        <div key={jogador.id} className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-200">


                            <button
                                onClick={() => toggleAccordion(jogador.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`font-mono font-bold w-6 ${index < 3 ? 'text-yellow-400' : 'text-gray-500'}`}>{index + 1}°</span>
                                    <span className="text-white font-medium text-lg">{jogador.nome}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-gray-300 font-bold">{jogador.pontos} pts</span>
                                    {/* Ícone da seta que gira */}
                                    <span className={`text-gray-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            </button>

                            <div
                                className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    }`}
                            >
                                <div className="overflow-hidden">
                                    <div className="bg-gray-700/50 p-4 border-t border-gray-700 grid grid-cols-2 gap-4 text-sm">
                                        <div className="text-center p-2 bg-gray-800 rounded">
                                            <p className="text-gray-400">Partidas</p>
                                            <p className="text-white font-bold text-lg">{jogador.partidas}</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-800 rounded">
                                            <p className="text-green-400">Vitórias</p>
                                            <p className="text-white font-bold text-lg">{jogador.vitorias}</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-800 rounded">
                                            <p className="text-gray-400">Empates</p>
                                            <p className="text-white font-bold text-lg">{jogador.empates}</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-800 rounded">
                                            <p className="text-red-400">Derrotas</p>
                                            <p className="text-white font-bold text-lg">{jogador.derrotas}</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-800 rounded">
                                            <p className="text-gray-400">Média Vitórias/Jogo</p>
                                            <p className="text-white font-bold text-lg">{mediaVitoriasJogo(jogador)}%</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-800 rounded">
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
        </div>
    );
}





