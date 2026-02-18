import { useEffect, useState } from 'react'
import {Routes, Route, Link } from 'react-router-dom'
import Ranking from './routes/Ranking'
import './App.css'
import logo from './assets/newLogo.png'

const API_URL = import.meta.env.VITE_API_URL
const PASS = import.meta.env.VITE_ADMIN_PASSWORD
const TITLE = import.meta.env.VITE_TITULO_MAIN

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

  async function carregarJogadores() {
    try {
      const res = await fetch(`${API_URL}/jogadores`);
      if (!res.ok) throw new Error('Erro ao buscar jogadores');
      const data: Jogador[] = await res.json();
      setJogadores(data);
    } catch (err) {
      console.error(err);
    }
  }

  // O useEffect apenas "dá o play" quando a página abre
  useEffect(() => {
    carregarJogadores();
  }, []);

  const [carregando, setCarregando] = useState(false);

  const [timeEditandoModal, setTimeEditandoModal] = useState<'Azul' | 'Vermelho' | null>(null);

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
  // const [jogadorSelecionadoTime1, setJogadorSelecionadoTime1] = useState<number>(0)
  // const [jogadorSelecionadoTime2, setJogadorSelecionadoTime2] = useState<number>(0)

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
  partidasSalvas.sort((a, b) => {
    const dataA = new Date(a.data).getTime();
    const dataB = new Date(b.data).getTime();
    return dataB - dataA;
  });
  //Ordena jogadores por pontos
  jogadores.sort((a, b) => b.pontos - a.pontos);

  // Função para iniciar edição de um jogador
  const iniciarEdicao = (jogador: Jogador) => {
    const userInput: string | null = window.prompt("Please enter password: ");

    if (userInput == PASS) {
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
      console.log("Impossivel alterar os dados de " + jogador.nome + ", ID: " + jogador.id);
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
  // const adicionarJogadorTime1 = () => {
  //   if (jogadorSelecionadoTime1 === 0) return
  //   if (jogadoresSelecionadosTime1.includes(jogadorSelecionadoTime1)) return // Evita duplicatas
  //   if (jogadoresSelecionadosTime2.includes(jogadorSelecionadoTime1)) return // Evita jogador em ambos os times
  //   if (jogadoresSelecionadosTime1.length >= 8) return // Limita a 8 jogadores

  //   setJogadoresSelecionadosTime1([...jogadoresSelecionadosTime1, jogadorSelecionadoTime1])
  //   setJogadorSelecionadoTime1(0) // Reset do select
  // }

  // Função para adicionar jogador ao Time 2
  // DADOS VARIÁVEIS: Adiciona um jogador da lista existente ao time selecionado
  // Garante que o jogador não está em ambos os times e limita a 8 jogadores
  // const adicionarJogadorTime2 = () => {
  //   if (jogadorSelecionadoTime2 === 0) return
  //   if (jogadoresSelecionadosTime2.includes(jogadorSelecionadoTime2)) return // Evita duplicatas
  //   if (jogadoresSelecionadosTime1.includes(jogadorSelecionadoTime2)) return // Evita jogador em ambos os times
  //   if (jogadoresSelecionadosTime2.length >= 8) return // Limita a 8 jogadores

  //   setJogadoresSelecionadosTime2([...jogadoresSelecionadosTime2, jogadorSelecionadoTime2])
  //   setJogadorSelecionadoTime2(0) // Reset do select
  // }

  // Função para remover jogador do Time 1
  const removerJogadorTime1 = (id: number) => {
    setJogadoresSelecionadosTime1(jogadoresSelecionadosTime1.filter(jId => jId !== id))
  }

  // Função para remover jogador do Time 2
  const removerJogadorTime2 = (id: number) => {
    setJogadoresSelecionadosTime2(jogadoresSelecionadosTime2.filter(jId => jId !== id))
  }

  const toggleJogador = (id: number) => {
    if (!timeEditandoModal) return;

    const isAzul = timeEditandoModal === 'Azul';
    const timeAtual = isAzul ? jogadoresSelecionadosTime1 : jogadoresSelecionadosTime2;
    const setTimeAtual = isAzul ? setJogadoresSelecionadosTime1 : setJogadoresSelecionadosTime2;
    const timeAdversario = isAzul ? jogadoresSelecionadosTime2 : jogadoresSelecionadosTime1;

    if (timeAtual.includes(id)) {
      // Se já está no time, remove usando filter
      setTimeAtual(timeAtual.filter(jId => jId !== id));
    } else {
      // Se não está, verifica o limite de 8 e se não está no adversário
      if (timeAtual.length < 8 && !timeAdversario.includes(id)) {
        setTimeAtual([...timeAtual, id]);
      }
    }
  };

  // Função para obter jogadores disponíveis (não selecionados) para cada time
  // DADOS VARIÁVEIS: Garante que um jogador não pode estar em ambos os times
  // const getJogadoresDisponiveisTime1 = () => {
  //   return jogadores.filter(j => 
  //     !jogadoresSelecionadosTime1.includes(j.id) && 
  //     !jogadoresSelecionadosTime2.includes(j.id)
  //   )
  // }

  // const getJogadoresDisponiveisTime2 = () => {
  //   return jogadores.filter(j =>
  //     !jogadoresSelecionadosTime2.includes(j.id) &&
  //     !jogadoresSelecionadosTime1.includes(j.id)
  //   )
  // }

  async function atualizarEstatisticasJogador(id: number, resultado: 'vitoria' | 'empate' | 'derrota') {
    const jogadorAtual = jogadores.find(j => j.id === id);
    if (!jogadorAtual) return;

    // Criamos o objeto com os novos valores
    const dadosAtualizados = {
      ...jogadorAtual,
      partidas: jogadorAtual.partidas + 1,
      pontos: jogadorAtual.pontos + (resultado === 'vitoria' ? 3 : (resultado === 'empate' ? 1 : 0)),
      vitorias: jogadorAtual.vitorias + (resultado === 'vitoria' ? 1 : 0),
      empates: jogadorAtual.empates + (resultado === 'empate' ? 1 : 0),
      derrotas: jogadorAtual.derrotas + (resultado === 'derrota' ? 1 : 0),
    };

    return fetch(`${API_URL}/jogadores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosAtualizados),
    });
  }

  // Função para salvar partida
  // DADOS VARIÁVEIS: Esta função enviará os dados para a API
  const salvarPartida = async () => {
    // Início: Bloqueio de segurança e feedback visual
    const userInput: string | null = window.prompt("Please enter password: ");
    if (userInput !== PASS) {
      alert("Esta ação requer permissões de administrador!");
      return;
    }

    setCarregando(true); // Ativa o loading

    try {
      // Validações iniciais
      if (golsTime1 < 0 || golsTime2 < 0) {
        alert('Os gols não podem ser negativos!');
        return;
      }

      if (jogadoresSelecionadosTime1.length > 8 || jogadoresSelecionadosTime2.length > 8) {
        alert('Cada time pode ter no máximo 8 jogadores!');
        return;
      }

      // Lógica do Vencedor
      let vencedor: string;
      if (golsTime1 > golsTime2) {
        vencedor = 'Azul';
      } else if (golsTime1 < golsTime2) {
        vencedor = 'Vermelho';
      } else {
        vencedor = 'Empate';
      }

      // Preparação dos dados para o Histórico 
      const jogadoresComTimes = [
        ...jogadoresSelecionadosTime1.map(id => ({ id, time: 'Azul' })),
        ...jogadoresSelecionadosTime2.map(id => ({ id, time: 'Vermelho' }))
      ];

      const dadosPartida: PartidaSalva = {
        id: null,
        jogadores: jogadoresComTimes,
        golsAzul: golsTime1,
        golsVermelho: golsTime2,
        vencedor,
        data: new Date()
      };

      // Salvar a Partida na API
      const res = await fetch(`${API_URL}/partidas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosPartida),
      });

      if (!res.ok) throw new Error('Erro ao salvar partida');

      const partidaSalva = await res.json();
      setPartidasSalvas([...partidasSalvas, partidaSalva]);

      // Atualizar Estatísticas dos Jogadores (Assíncrono)
      const promessasAzul = jogadoresSelecionadosTime1.map(id => {
        const resultado = vencedor === 'Azul' ? 'vitoria' : (vencedor === 'Empate' ? 'empate' : 'derrota');
        return atualizarEstatisticasJogador(id, resultado);
      });

      const promessasVermelho = jogadoresSelecionadosTime2.map(id => {
        const resultado = vencedor === 'Vermelho' ? 'vitoria' : (vencedor === 'Empate' ? 'empate' : 'derrota');
        return atualizarEstatisticasJogador(id, resultado);
      });

      // Espera todas as atualizações terminarem
      await Promise.all([...promessasAzul, ...promessasVermelho]);

      // Sincronizar dados e limpar a interface 
      await carregarJogadores(); // Recarrega a lista do servidor

      setJogadoresSelecionadosTime1([]);
      setJogadoresSelecionadosTime2([]);
      setGolsTime1(0);
      setGolsTime2(0);
      // setJogadorSelecionadoTime1(0);
      // setJogadorSelecionadoTime2(0);

      alert('Partida e estatísticas salvas com sucesso!');

    } catch (err) {
      console.error(err);
      alert('Erro ao processar partida!');
    } finally {
      setCarregando(false); // Desliga o loading independente do que aconteça
    }
  };

  
  const reloadPage = () => {
    window.location.reload();
  };
  const warningPage = () => {
    window.alert("Esta página ainda está em desenvolvimento! Por favor, volte mais tarde.")
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* NAVBAR: DADOS VARIÁVEIS - Espaço para ícone e nome centralizado */}
      <nav className="bg-gray-800 border-b border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 justify-center items-center">
            <div className="flex flex-col items-center space-y-2">
              {/* DADOS VARIÁVEIS: Logo acima do nome */}
              <img src={logo} alt="FutQuinta Logo" className="h-50 w-80 object-cover cursor-pointer" onClick={reloadPage} />
              <h1 className="text-4xl font-thin text-white">{TITLE}</h1>
            </div>
            <div className="flex flex-row gap-12 w-full h-full justify-center">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors" >
                Home
              </Link>
              <Link to="/ranking" className="text-gray-300 hover:text-white transition-colors" >
                Ranking
              </Link>
              <Link to="/listConfirm" onClick={warningPage} className="text-gray-300 hover:text-white transition-colors cursor-not-allowed disabled:opacity-50" >
                Lista de Presença
              </Link>
            </div>
            
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={
            <>
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
                        Escalação do Time
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTimeEditandoModal('Azul')}
                          disabled={jogadoresSelecionadosTime1.length >= 8}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-md transition-colors cursor-pointer"
                        >
                          Selecionar Jogadores
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
                        placeholder={golsTime1.toString()}
                        onChange={(e) => {
                          const valor = parseInt(e.target.value) || 0
                          setGolsTime1(valor < 0 ? 0 : valor)
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* TIME VERMELHO */}
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-bold text-red-400 mb-4">Time Vermelho</h3>

                    {/* DADOS VARIÁVEIS: Input para adicionar jogadores da lista existente */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Escalação do Time
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTimeEditandoModal('Vermelho')}
                          disabled={jogadoresSelecionadosTime2.length >= 8}
                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-md transition-colors cursor-pointer"
                        >
                          Selecionar Jogadores
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
                        placeholder={golsTime2.toString()}
                        onChange={(e) => {
                          const valor = parseInt(e.target.value) || 0
                          setGolsTime2(valor < 0 ? 0 : valor)
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                {/* DADOS VARIÁVEIS: Botão para salvar os dados da partida */}
                {/* Este botão enviará os dados dos dois times para o backend/API */}
                <div className="flex justify-center">
                  <button
                    onClick={salvarPartida}
                    disabled={carregando}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors cursor-pointer"
                  >
                    {carregando ? (
                      <>
                        <span className="spinner"></span>
                        Salvando...
                      </>
                    ) : (
                      'Salvar Partida'
                    )}
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
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${partida.vencedor === 'Azul' ? 'bg-blue-500 text-white' :
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
              </>
            } />

            <Route path="/ranking" element={
              <Ranking 
                jogadores={jogadores}
                jogadorEditando={jogadorEditando}
                formData={formData}
                setFormData={setFormData}
                iniciarEdicao={iniciarEdicao}
                cancelarEdicao={cancelarEdicao}
                atualizarJogador={atualizarJogador}
              />
              } />
        </Routes>
      </div>
      {timeEditandoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          //Só fecha se o clique for na div do fundo, não nos seus filhos
          if (e.target === e.currentTarget) {
            setTimeEditandoModal(null);
          }
        }}
        >
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col border border-gray-700">

            {/* 🏷️ Cabeçalho do Modal */}
            <h2 className="text-xl font-bold text-white">
              Selecionar Jogadores - Time {timeEditandoModal}
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Selecionados: {timeEditandoModal === 'Azul' ? jogadoresSelecionadosTime1.length : jogadoresSelecionadosTime2.length} / 8
            </p>

            {/*Lista com Scroll */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {jogadores.map((jogador) => {
                // Lógica para saber se o jogador está no time oposto (bloqueado)
                const estaNoOutroTime = timeEditandoModal === 'Azul'
                  ? jogadoresSelecionadosTime2.includes(jogador.id)
                  : jogadoresSelecionadosTime1.includes(jogador.id);

                // Lógica para saber se está marcado no time atual
                const estaNoTimeAtual = timeEditandoModal === 'Azul'
                  ? jogadoresSelecionadosTime1.includes(jogador.id)
                  : jogadoresSelecionadosTime2.includes(jogador.id);

                return (
                  <div
                    key={jogador.id}
                    className={`flex items-center justify-between p-3 rounded-md transition-colors ${estaNoOutroTime ? 'bg-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    <span className={`font-medium ${estaNoOutroTime ? 'text-gray-600' : 'text-white'}`}>
                      {jogador.nome}
                    </span>
                    <input
                      type="checkbox"
                      checked={estaNoTimeAtual}
                      disabled={estaNoOutroTime}
                      onChange={() => toggleJogador(jogador.id)}
                      className={`w-5 h-5 cursor-pointer ${timeEditandoModal === 'Azul' ? 'accent-blue-500' : 'accent-red-500'}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Botão Final */}
            <button
              onClick={() => setTimeEditandoModal(null)}
              className={`w-full mt-6 text-white font-bold py-2 rounded transition-colors ${timeEditandoModal === 'Azul'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              Recolher Seleção
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
