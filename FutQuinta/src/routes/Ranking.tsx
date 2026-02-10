import '../App.css'

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
    jogadorEditando,
    formData,
    setFormData,
    iniciarEdicao,
    cancelarEdicao,
    atualizarJogador
}: RankingProps) {
    return (

        <div className = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" >
        <h2 className="text-3xl font-bold text-white mb-6">Estatísticas dos Jogadores</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {/* TABELA DE ESTATÍSTICAS */}
                <div className="lg:col-span-3">
                    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Jogador
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Pontos
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Partidas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Vitórias
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Empates
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Derrotas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {/* DADOS VARIÁVEIS: Cada linha desta tabela representa um jogador */}
                                    {/* Os dados (nome, gols, assistências, etc.) virão de uma fonte de dados dinâmica */}
                                    {jogadores.map((jogador) => (
                                        <tr key={jogador.id} className="hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                                {jogador.nome}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {jogador.pontos}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {jogador.partidas}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                                                {jogador.vitorias}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-300">
                                                {jogador.empates}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                                                {jogador.derrotas}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => iniciarEdicao(jogador)}
                                                    className="text-green-400 hover:text-green-300 font-medium"
                                                >
                                                    <a href="#divEdicao">Editar</a>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ÁREA DE INPUT PARA ATUALIZAR DADOS */}
                <div className="lg:col-span-3">
                    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {jogadorEditando ? 'Atualizar Dados' : 'Selecione um Jogador'}
                        </h3>

                        {/* DADOS VARIÁVEIS: Este formulário será usado para atualizar os dados do jogador selecionado */}
                        {/* Os valores serão enviados para o backend/API quando o usuário clicar em "Atualizar" */}
                        {jogadorEditando ? (
                            <div id="divEdicao" className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Nome do Jogador
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nome}
                                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Nome do jogador"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Pontos
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.pontos}
                                        onChange={(e) => setFormData({ ...formData, pontos: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Partidas
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.partidas}
                                        onChange={(e) => setFormData({ ...formData, partidas: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Vitórias
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.vitorias}
                                        onChange={(e) => setFormData({ ...formData, vitorias: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Empates
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.empates}
                                        onChange={(e) => setFormData({ ...formData, empates: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Derrotas
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.derrotas}
                                        onChange={(e) => setFormData({ ...formData, derrotas: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={atualizarJogador}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                                    >
                                        Atualizar
                                    </button>
                                    <button
                                        onClick={cancelarEdicao}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm">
                                Clique em "Editar" na tabela ao lado para atualizar os dados de um jogador.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}





