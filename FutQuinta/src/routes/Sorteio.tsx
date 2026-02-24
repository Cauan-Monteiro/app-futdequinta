import { useState } from 'react';
import '../App.css'

// const API_URL = import.meta.env.VITE_API_URL

interface Jogador {
    id: number;
    nome: string;
    posicao: "Goleiro" | "Linha";
    pontos: number;
    partidas: number;
    vitorias: number;
    empates: number;
    derrotas: number;
}

interface SorteioProps {
    jogadores: Jogador[];
}

export default function Sorteio({ jogadores }: SorteioProps) {

    
    // const isAvaible = useState(
    //     () => {
    //         const dataAtual = new Date().toString().split(" ");
    //         if (dataAtual[0] === "Thu") {
    //             return true;
    //         } else {
    //             return false;
    //         }
    //     }
    // ); 

    const [sortJogadores, setSortJogadores] = useState<Jogador[]>([]);
    const [sortGoleiros, setSortGoleiros] = useState<Jogador[]>([]);

    const [timeAzul, setTimeAzul] = useState<Jogador[]>([]);
    const [timeVermelho, setTimeVermelho] = useState<Jogador[]>([]);

    const scoreJogador = (jogador: Jogador) => {
        if (jogador.partidas === 0) {
            return 0.00.toFixed(2);
        } else if (jogador.partidas <= 2) {
            return 50.00.toFixed(2);
        } else {
            const pontosPossiveis = jogador.partidas * 3;
            
            //Dividimos um pelo outro e multiplicamos por 100
            return ((jogador.pontos / pontosPossiveis) * 100).toFixed(2);
        }
    }

    const realizarSorteio = () => {
        if (sortGoleiros.length < 2) {
            alert("Selecione pelo menos 2 goleiros para realizar o sorteio.");
            return;
        }
        if (sortJogadores.length < 8) {
            alert("Selecione pelo menos 8 jogadores de linha para realizar o sorteio.");
            return;
        } 

        const jogadoresOrdenados = [...sortJogadores].sort((a, b) => {
            return parseFloat(scoreJogador(b)) - parseFloat(scoreJogador(a));
        });
        const goleirosOrdenados = [...sortGoleiros].sort((a, b) => {
            return parseFloat(scoreJogador(b)) - parseFloat(scoreJogador(a));
        });
        
        // Intercalando os goleiros entre os times
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

    // const salvarSorteio = async () => {
    //     const jogadoresAzul = timeAzul.map((jogador) => ({
    //         id: jogador.id,
    //         time: "Azul"
    //     }));

    //     const jogadoresVermelho = timeVermelho.map((jogador) => ({
    //         id: jogador.id,
    //         time: "Vermelho"
    //     }));

    //     const todosJogadores = [...jogadoresAzul, ...jogadoresVermelho];

    //     const res = await fetch(`${API_URL}/partidas`, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             jogadores: todosJogadores,
    //         }),
    //     });
    //     if (!res.ok) {throw new Error('Erro ao salvar partida')

    //     }else {alert("Sorteio salvo com sucesso! (Funcionalidade em desenvolvimento)");}
        
    // }

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

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-white mb-6">Sorteador de Times</h2>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-blue-400 mb-4">
                    Goleiros Presentes ({sortGoleiros.length})
                </h3>
                
                {/* Lista de seleção */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                    {(jogadores.filter(j => j.posicao === "Goleiro")).map(jogador => {
                        // Verifica se o jogador já está no array sortGoleiros
                        const estaPresente = sortGoleiros.some(j => j.id === jogador.id);
                        
                        return (
                            <div 
                                key={jogador.id} 
                                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                                    estaPresente ? 'bg-green-900 border border-green-500' : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
                                }`}
                                onClick={() => toggleGoleiroSorteio(jogador)}
                            >
                                <span className="text-white font-medium">{jogador.nome}</span>
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
            </div>

            
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-blue-400 mb-4">
                    Jogadores Presentes ({sortJogadores.length})
                </h3>
                
                {/* Lista de seleção */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
                    {(jogadores.filter(j => j.posicao === "Linha")).map(jogador => {
                        // Verifica se o jogador já está no array sortJogadores
                        const estaPresente = sortJogadores.some(j => j.id === jogador.id);
                        
                        return (
                            <div 
                                key={jogador.id} 
                                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                                    estaPresente ? 'bg-green-900 border border-green-500' : 'bg-gray-700 hover:bg-gray-600 border border-transparent'
                                }`}
                                onClick={() => toggleJogadorSorteio(jogador)}
                            >
                                <span className="text-white font-medium">{jogador.nome}</span>
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
            </div>

            {timeAzul.length === 0 && (
                <div className="flex justify-center mt-6">
                    <button 
                        onClick={realizarSorteio}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors cursor-pointer"
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
                        <div className="bg-gray-800 border-t-4 border-blue-500 rounded-lg p-6 shadow-lg">
                            <h4 className="text-xl font-bold text-blue-400 mb-4 text-center">Time Azul</h4>
                            {timeAzul.map((j) => (
                                // O "key" é obrigatório no React sempre que fazemos uma lista
                                <div key={j.id} className="bg-gray-700 p-3 rounded mb-2 text-white">
                                    {j.nome}
                                </div>
                            ))}
                        </div>

                        {/* CARD DO TIME VERMELHO */}
                        <div className="bg-gray-800 border-t-4 border-red-500 rounded-lg p-6 shadow-lg">
                            <h4 className="text-xl font-bold text-red-400 mb-4 text-center">Time Vermelho</h4>
                            {timeVermelho.map((j) => (
                                // O "key" é obrigatório no React sempre que fazemos uma lista
                                <div key={j.id} className="bg-gray-700 p-3 rounded mb-2 text-white">
                                    {j.nome}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BOTÕES DE AÇÃO PÓS-SORTEIO */}
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={() => {
                                setTimeAzul([]);
                                setTimeVermelho([]);
                            }}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded transition-colors cursor-pointer"
                        >
                            Voltar / Editar Lista
                        </button>
                        
                        <button 
                            // onClick={!isAvaible ? () => alert("Salvar sorteio estará disponível apenas às quintas-feiras!") : salvarSorteio}
                            disabled
                            className="bg-green-600 text-white font-bold py-2 px-6 rounded opacity-50 cursor-not-allowed"
                        >
                            Salvar Sorteio (Em breve)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}