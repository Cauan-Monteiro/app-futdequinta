import { useEffect, useState } from 'react'
import './App.css'
import logo from './assets/futebol de quinta_nova_bg.png'

const API_URL = import.meta.env.VITE_API_URL
const PASS = import.meta.env.ADMIN_PASSWORD

// Interface para definir a estrutura dos dados de um jogador
interface Jogador {
  id: number
  nome: string
  pontos: number
  partidas: number
  vitorias: number
  empates: number
  derrotas: number
}

function App() {
  // DADOS VARIÁVEIS: Array de jogadores que será populado dinamicamente
  // Este array será atualizado através de API, banco de dados ou inputs do usuário
  const [jogadores, setJogadores] = useState<Jogador[]>([])

  useEffect(() => {
    async function carregarJogadores() {
      try {
        const res = await fetch(`${API_URL}/jogadores`)
        if (!res.ok) throw new Error('Erro ao buscar jogadores')
        const data: Jogador[] = await res.json()
        setJogadores(data)
      } catch (err) {
        console.error(err)
      }
    }
  
    carregarJogadores()
  }, [])

  useEffect(() => {
    async function carregarPartidas() {
      try {
        const res = await fetch(`${API_URL}/partidas`)
        if (!res.ok) throw new Error('Erro ao buscar partidas')
        const data = await res.json()
        setPartidasSalvas(data)
      } catch (err) {
        console.error(err)
      }
    }
  
    carregarPartidas()
  }, [])

  // DADOS VARIÁVEIS: Estado para o formulário de atualização
  // Estes valores serão preenchidos quando o usuário selecionar um jogador para editar
  const [jogadorEditando, setJogadorEditando] = useState<Jogador | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    pontos: 0,
    partidas: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
  })

  // DADOS VARIÁVEIS: Estados para os dois times
  // Estes dados serão usados para registrar uma partida com jogadores selecionados
  // Arrays de IDs dos jogadores selecionados para cada time (armazenados temporariamente)
  const [jogadoresSelecionadosTime1, setJogadoresSelecionadosTime1] = useState<number[]>([])
  const [jogadoresSelecionadosTime2, setJogadoresSelecionadosTime2] = useState<number[]>([])
  
  // DADOS VARIÁVEIS: Número de gols de cada time na partida
  const [golsTime1, setGolsTime1] = useState<number>(0)
  const [golsTime2, setGolsTime2] = useState<number>(0)
  
  // DADOS VARIÁVEIS: Estado para o jogador selecionado no select (para adicionar)
  const [jogadorSelecionadoTime1, setJogadorSelecionadoTime1] = useState<number>(0)
  const [jogadorSelecionadoTime2, setJogadorSelecionadoTime2] = useState<number>(0)

  // DADOS VARIÁVEIS: Estado para armazenar partidas salvas
  interface PartidaSalva {
    id: null
    jogadores: Array<{ id: number; time: string }>
    golsAzul: number
    golsVermelho: number
    vencedor: string
    data: Date
  }
  const [partidasSalvas, setPartidasSalvas] = useState<PartidaSalva[]>([])

  //Ordena as partidas por data
  partidasSalvas.sort((a, b) => {const dataA = new Date(a.data).getTime();
    const dataB = new Date(b.data).getTime();
    return dataB - dataA;
    });
  //Ordena jogadores por pontos
  jogadores.sort((a, b) => b.pontos - a.pontos);

  // Função para iniciar edição de um jogador
  const iniciarEdicao = (jogador: Jogador) => {
    const userInput: string | null = window.prompt("Please enter password: ");

    if(userInput == PASS){
      setJogadorEditando(jogador)
      setFormData({
        nome: jogador.nome,
        pontos: jogador.pontos,
        partidas: jogador.partidas,
        vitorias: jogador.vitorias,
        empates: jogador.empates,
        derrotas: jogador.derrotas,
      })
    } else {
      alert("Esta ação requer permissões de administrador!")
      console.log("Impossivel alterar os dados de "+jogador.nome+", ID: "+jogador.id);
    }
  }

  // Função para atualizar dados do jogador
  const atualizarJogador = async () => {
    if (!jogadorEditando) return
  
    const payload = { ...jogadorEditando, ...formData }
  
    try {
      const res = await fetch(`${API_URL}/jogadores/${jogadorEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
  
      if (!res.ok) throw new Error('Erro ao atualizar jogador')
  
      const atualizado: Jogador = await res.json()
  
      setJogadores(jogadores.map(j =>
        j.id === atualizado.id ? atualizado : j
      ))
  
      setJogadorEditando(null)
      setFormData({ nome: '', pontos: 0, partidas: 0, vitorias: 0, empates: 0, derrotas: 0 })
    } catch (err) {
      console.error(err)
      alert('Falha ao atualizar jogador no servidor')
    }
  }

  // Função para cancelar edição
  const cancelarEdicao = () => {
    setJogadorEditando(null)
    setFormData({ nome: '', pontos: 0, partidas: 0, vitorias: 0, empates: 0, derrotas: 0 })
  }

  // Função para adicionar jogador ao Time 1
  // DADOS VARIÁVEIS: Adiciona um jogador da lista existente ao time selecionado
  // Garante que o jogador não está em ambos os times e limita a 8 jogadores
  const adicionarJogadorTime1 = () => {
    if (jogadorSelecionadoTime1 === 0) return
    if (jogadoresSelecionadosTime1.includes(jogadorSelecionadoTime1)) return // Evita duplicatas
    if (jogadoresSelecionadosTime2.includes(jogadorSelecionadoTime1)) return // Evita jogador em ambos os times
    if (jogadoresSelecionadosTime1.length >= 8) return // Limita a 8 jogadores
    
    setJogadoresSelecionadosTime1([...jogadoresSelecionadosTime1, jogadorSelecionadoTime1])
    setJogadorSelecionadoTime1(0) // Reset do select
  }

  // Função para adicionar jogador ao Time 2
  // DADOS VARIÁVEIS: Adiciona um jogador da lista existente ao time selecionado
  // Garante que o jogador não está em ambos os times e limita a 8 jogadores
  const adicionarJogadorTime2 = () => {
    if (jogadorSelecionadoTime2 === 0) return
    if (jogadoresSelecionadosTime2.includes(jogadorSelecionadoTime2)) return // Evita duplicatas
    if (jogadoresSelecionadosTime1.includes(jogadorSelecionadoTime2)) return // Evita jogador em ambos os times
    if (jogadoresSelecionadosTime2.length >= 8) return // Limita a 8 jogadores
    
    setJogadoresSelecionadosTime2([...jogadoresSelecionadosTime2, jogadorSelecionadoTime2])
    setJogadorSelecionadoTime2(0) // Reset do select
  }

  // Função para remover jogador do Time 1
  const removerJogadorTime1 = (id: number) => {
    setJogadoresSelecionadosTime1(jogadoresSelecionadosTime1.filter(jId => jId !== id))
  }

  // Função para remover jogador do Time 2
  const removerJogadorTime2 = (id: number) => {
    setJogadoresSelecionadosTime2(jogadoresSelecionadosTime2.filter(jId => jId !== id))
  }

  // Função para obter jogadores disponíveis (não selecionados) para cada time
  // DADOS VARIÁVEIS: Garante que um jogador não pode estar em ambos os times
  const getJogadoresDisponiveisTime1 = () => {
    return jogadores.filter(j => 
      !jogadoresSelecionadosTime1.includes(j.id) && 
      !jogadoresSelecionadosTime2.includes(j.id)
    )
  }

  const getJogadoresDisponiveisTime2 = () => {
    return jogadores.filter(j => 
      !jogadoresSelecionadosTime2.includes(j.id) && 
      !jogadoresSelecionadosTime1.includes(j.id)
    )
  }

  // Função para salvar partida
  // DADOS VARIÁVEIS: Esta função enviará os dados para a API
  const salvarPartida = async () => {
    
    //Verifica admin
    const userInput: string | null = window.prompt("Please enter password: ");
    if(userInput !== PASS){
      alert("Esta ação requer permissões de administrador!")
      console.log("Impossivel salvar partida!");
    } else {

    // Validações
      if (golsTime1 < 0 || golsTime2 < 0) {
        alert('Os gols não podem ser negativos!')
        return
      }
      
      if (jogadoresSelecionadosTime1.length > 8 || jogadoresSelecionadosTime2.length > 8) {
        alert('Cada time pode ter no máximo 8 jogadores!')
        return
      }

      // DADOS VARIÁVEIS: Determina o vencedor baseado nos gols
      let vencedor: string
      if (golsTime1 > golsTime2) {
        vencedor = 'Azul'
      } else if (golsTime1 < golsTime2) {
        vencedor = 'Vermelho'
      } else {
        vencedor = 'Empate'
      }

      // DADOS VARIÁVEIS: Cria lista de jogadores com seus IDs e times
      const jogadoresComTimes = [
        ...jogadoresSelecionadosTime1.map(id => ({
          id: id,
          time: 'Azul'
        })),
        ...jogadoresSelecionadosTime2.map(id => ({
          id: id,
          time: 'Vermelho'
        }))
      ]

      const dadosPartida: PartidaSalva = {
        id: null,     //Possivel problema ao Salvar partida
        jogadores: jogadoresComTimes,
        golsAzul: golsTime1,
        golsVermelho: golsTime2,
        vencedor,
        data: new Date()
      }
    
      try {
        const res = await fetch(`${API_URL}/partidas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dadosPartida),
        })
    
        if (!res.ok) {
          throw new Error('Erro ao salvar partida')
        }
    
        const partidaSalva = await res.json()
        setPartidasSalvas([...partidasSalvas, partidaSalva])
    
        // limpar inputs (como você já faz)
        setJogadoresSelecionadosTime1([])
        setJogadoresSelecionadosTime2([])
        setGolsTime1(0)
        setGolsTime2(0)
        setJogadorSelecionadoTime1(0)
        setJogadorSelecionadoTime2(0)
    
      } catch (err) {
        console.error(err)
        alert('Falha ao salvar partida no servidor')
      }
      // DADOS VARIÁVEIS: Aqui os dados serão enviados para o backend/API
      console.log('Dados da partida para enviar:', dadosPartida)
      // TODO: Implementar chamada à API
      // Exemplo: await fetch('/api/partidas', { method: 'POST', body: JSON.stringify(dadosPartida) })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* NAVBAR: DADOS VARIÁVEIS - Espaço para ícone e nome centralizado */}
      <nav className="bg-gray-800 border-b border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            <div className="flex flex-col items-center space-y-2">
              {/* DADOS VARIÁVEIS: Logo acima do nome */}
              <img src={logo} alt="FutQuinta Logo" className="h-60 w-full object-cover" />
              <h1 className="text-xl font-bold text-white">⚽BID FutDeQuinta🍻</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SEÇÃO DE INPUTS PARA DOIS TIMES */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Registrar Partida</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* TIME AZUL */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-4">Time Azul</h3>
              
              {/* DADOS VARIÁVEIS: Input para adicionar jogadores da lista existente */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adicionar Jogador
                </label>
                <div className="flex gap-2">
                  <select
                    value={jogadorSelecionadoTime1}
                    onChange={(e) => setJogadorSelecionadoTime1(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={0}>Selecione um jogador</option>
                    {/* DADOS VARIÁVEIS: Lista de jogadores disponíveis (não selecionados) */}
                    {getJogadoresDisponiveisTime1().map((jogador) => (
                      <option key={jogador.id} value={jogador.id}>
                        {jogador.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={adicionarJogadorTime1}
                    disabled={jogadorSelecionadoTime1 === 0 || jogadoresSelecionadosTime1.length >= 8}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors"
                    title={jogadoresSelecionadosTime1.length >= 8 ? 'Máximo de 8 jogadores atingido' : ''}
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* DADOS VARIÁVEIS: Cards dos jogadores selecionados (armazenados temporariamente) */}
              {jogadoresSelecionadosTime1.length >= 8 && (
                <p className="text-yellow-400 text-xs mb-2">Máximo de 8 jogadores atingido</p>
              )}
              <div className="mb-4 space-y-2">
                {jogadoresSelecionadosTime1.map((jogadorId) => {
                  const jogador = jogadores.find(j => j.id === jogadorId)
                  if (!jogador) return null
                  return (
                    <div key={jogadorId} className="bg-gray-700 rounded-md p-3 flex items-center justify-between">
                      <span className="text-white font-medium">{jogador.nome}</span>
                      <button
                        onClick={() => removerJogadorTime1(jogadorId)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Remover jogador"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* DADOS VARIÁVEIS: Input de número de gols do Time 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número de Gols
                </label>
                <input
                  type="number"
                  min="0"
                  value={golsTime1}
                  onChange={(e) => {
                    const valor = parseInt(e.target.value) || 0
                    setGolsTime1(valor < 0 ? 0 : valor)
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* TIME VERMELHO */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-red-400 mb-4">Time Vermelho</h3>
              
              {/* DADOS VARIÁVEIS: Input para adicionar jogadores da lista existente */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adicionar Jogador
                </label>
                <div className="flex gap-2">
                  <select
                    value={jogadorSelecionadoTime2}
                    onChange={(e) => setJogadorSelecionadoTime2(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={0}>Selecione um jogador</option>
                    {/* DADOS VARIÁVEIS: Lista de jogadores disponíveis (não selecionados) */}
                    {getJogadoresDisponiveisTime2().map((jogador) => (
                      <option key={jogador.id} value={jogador.id}>
                        {jogador.nome}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={adicionarJogadorTime2}
                    disabled={jogadorSelecionadoTime2 === 0 || jogadoresSelecionadosTime2.length >= 8}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-md transition-colors"
                    title={jogadoresSelecionadosTime2.length >= 8 ? 'Máximo de 8 jogadores atingido' : ''}
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* DADOS VARIÁVEIS: Cards dos jogadores selecionados (armazenados temporariamente) */}
              {jogadoresSelecionadosTime2.length >= 8 && (
                <p className="text-yellow-400 text-xs mb-2">Máximo de 8 jogadores atingido</p>
              )}
              <div className="mb-4 space-y-2">
                {jogadoresSelecionadosTime2.map((jogadorId) => {
                  const jogador = jogadores.find(j => j.id === jogadorId)
                  if (!jogador) return null
                  return (
                    <div key={jogadorId} className="bg-gray-700 rounded-md p-3 flex items-center justify-between">
                      <span className="text-white font-medium">{jogador.nome}</span>
                      <button
                        onClick={() => removerJogadorTime2(jogadorId)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Remover jogador"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* DADOS VARIÁVEIS: Input de número de gols do Time 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número de Gols
                </label>
                <input
                  type="number"
                  min="0"
                  value={golsTime2}
                  onChange={(e) => {
                    const valor = parseInt(e.target.value) || 0
                    setGolsTime2(valor < 0 ? 0 : valor)
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* DADOS VARIÁVEIS: Botão para salvar os dados da partida */}
          {/* Este botão enviará os dados dos dois times para o backend/API */}
          <div className="flex justify-center">
            <button
              onClick={salvarPartida}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Salvar Partida
            </button>
          </div>
        </div>

        {/* SEÇÃO DE PARTIDAS SALVAS */}
        {partidasSalvas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">Partidas Registradas</h2>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide">
              {
              partidasSalvas.map((partida) => {
                const jogadoresAzul = partida.jogadores.filter(j => j.time === 'Azul')
                const jogadoresVermelho = partida.jogadores.filter(j => j.time === 'Vermelho')
                const dataFormatada = new Date(partida.data).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                  // hour: '2-digit',
                  // minute: '2-digit'
                })

                return (
                  <div key={partida.id} className="bg-gray-800 rounded-lg shadow-lg p-6 min-w-full md:w-1/4 box-border scrollbar-hide snap-center">
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-400">{dataFormatada}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          partida.vencedor === 'Azul' ? 'bg-blue-500 text-white' :
                          partida.vencedor === 'Vermelho' ? 'bg-red-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {partida.vencedor}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                          <p className="text-blue-400 font-bold text-lg">{partida.golsAzul}</p>
                          <p className="text-xs text-gray-400">Time Azul</p>
                        </div>
                        <span className="text-gray-500 text-xl">×</span>
                        <div className="text-center">
                          <p className="text-red-400 font-bold text-lg">{partida.golsVermelho}</p>
                          <p className="text-xs text-gray-400">Time Vermelho</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-blue-400 mb-2">Time Azul ({jogadoresAzul.length} jogadores):</p>
                        <div className="flex flex-wrap gap-1">
                          {jogadoresAzul.map((j) => {
                            const jogador = jogadores.find(jog => jog.id === j.id)
                            return (
                              <span key={j.id} className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                                {jogador?.nome || `ID: ${j.id}`}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-red-400 mb-2">Time Vermelho ({jogadoresVermelho.length} jogadores):</p>
                        <div className="flex flex-wrap gap-1">
                          {jogadoresVermelho.map((j) => {
                            const jogador = jogadores.find(jog => jog.id === j.id)
                            return (
                              <span key={j.id} className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">
                                {jogador?.nome || `ID: ${j.id}`}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <h2 className="text-3xl font-bold text-white mb-6">Estatísticas dos Jogadores</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TABELA DE ESTATÍSTICAS */}
          <div className="lg:col-span-2">
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
                            Editar
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
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                {jogadorEditando ? 'Atualizar Dados' : 'Selecione um Jogador'}
              </h3>

              {/* DADOS VARIÁVEIS: Este formulário será usado para atualizar os dados do jogador selecionado */}
              {/* Os valores serão enviados para o backend/API quando o usuário clicar em "Atualizar" */}
              {jogadorEditando ? (
                <div className="space-y-4">
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
    </div>
  )
}

export default App
