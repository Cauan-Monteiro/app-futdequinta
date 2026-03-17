import { useState, useEffect, useContext, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from '../components/AuthContext';
import CartaJogador from '../components/CartaJogador';
import type { OutletToastCtx } from '../components/LayoutInterno';

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
  fotoUrl: string;
  atributos: { attack: number; defense: number; shot: number; pass: number; physical: number; pace: number } | null;
}

interface PartidaSalva {
  id: null | number;
  jogadores: Array<{ id: number; time: string }>;
  golsAzul: number;
  golsVermelho: number;
  vencedor: string;
  data: Date;
}

interface HomeProps {
  jogadores: Jogador[];
  carregarJogadores: () => Promise<void>;
}

export default function Home({ jogadores, carregarJogadores }: HomeProps) {
  const { addToast } = useOutletContext<OutletToastCtx>();

  const [carregando, setCarregando] = useState(false);
  const [modoSelecao, setModoSelecao] = useState<'escolha' | 'manual' | 'sorteado'>('escolha');
  const [jogadoresSelecionadosTime1, setJogadoresSelecionadosTime1] = useState<number[]>([]);
  const [jogadoresSelecionadosTime2, setJogadoresSelecionadosTime2] = useState<number[]>([]);
  const [golsTime1, setGolsTime1] = useState<number>(0);
  const [golsTime2, setGolsTime2] = useState<number>(0);
  const [partidasSalvas, setPartidasSalvas] = useState<PartidaSalva[]>([]);
  const [erroPartida, setErroPartida] = useState<string | null>(null);

  // Match history scroll
  const scrollRef = useRef<HTMLDivElement>(null);

  const { equipeAtiva, idJogador } = useContext(AuthContext);

  useEffect(() => {
    async function carregarPartidas() {
      try {
        const res = await fetch(`${API_URL}/partidas`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('token_acesso')}`
           }
        });
        if (!res.ok) throw new Error('Erro ao buscar partidas');
        const data = await res.json();
        setPartidasSalvas(data);
      } catch (err) {
        console.error(err);
      }
    }
    carregarJogadores();
    carregarPartidas();
  }, []);

  const partidasOrdenadas = [...partidasSalvas].sort((a, b) => {
    const dataA = new Date(a.data).getTime();
    const dataB = new Date(b.data).getTime();
    return dataB - dataA;
  });

  const toggleTime = (jogadorId: number, time: 'Azul' | 'Vermelho') => {
    const isAzul = time === 'Azul';
    const timeAtual = isAzul ? jogadoresSelecionadosTime1 : jogadoresSelecionadosTime2;
    const setTimeAtual = isAzul ? setJogadoresSelecionadosTime1 : setJogadoresSelecionadosTime2;
    const setTimeAdversario = isAzul ? setJogadoresSelecionadosTime2 : setJogadoresSelecionadosTime1;

    if (timeAtual.includes(jogadorId)) {
      setTimeAtual(timeAtual.filter(jId => jId !== jogadorId));
    } else {
      setTimeAdversario(prev => prev.filter(jId => jId !== jogadorId));
      setTimeAtual(prev => [...prev, jogadorId]);
    }
  };

  async function atualizarEstatisticasJogador(id: number, resultado: 'vitoria' | 'empate' | 'derrota') {
    const jogadorAtual = jogadores.find(j => j.id === id);
    if (!jogadorAtual) return;

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
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('token_acesso')}`
       },
      body: JSON.stringify(dadosAtualizados),
    });
  }

  const carregarTimeSorteado = async () => {
    if (!equipeAtiva) return;
    try {
      const res = await fetch(`${API_URL}/times-sorteados/${equipeAtiva.id}`, {
        headers: { 'Authorization': `Bearer ${Cookies.get('token_acesso')}` }
      });
      if (res.status === 404) {
        addToast('Nenhum time sorteado salvo para esta equipe.', 'warning');
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJogadoresSelecionadosTime1(data.jogadoresAzul);
      setJogadoresSelecionadosTime2(data.jogadoresVermelho);
      setModoSelecao('sorteado');
      addToast('Time sorteado carregado!', 'success');

      // Deletar do banco após carregar
      await fetch(`${API_URL}/times-sorteados/${equipeAtiva.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${Cookies.get('token_acesso')}` }
      });
    } catch {
      addToast('Erro ao carregar o time sorteado.', 'error');
    }
  };

  const salvarPartida = async () => {
    setErroPartida(null);
    if (jogadoresSelecionadosTime1.length > 8 || jogadoresSelecionadosTime2.length > 8) {
      setErroPartida('Cada time pode ter no máximo 8 jogadores!');
      return;
    }
    await executarSalvarPartida();
  };

  const executarSalvarPartida = async () => {
    setCarregando(true);
    try {
      let vencedor: string;
      if (golsTime1 > golsTime2) {
        vencedor = 'Azul';
      } else if (golsTime1 < golsTime2) {
        vencedor = 'Vermelho';
      } else {
        vencedor = 'Empate';
      }

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

      const res = await fetch(`${API_URL}/partidas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token_acesso')}`
         },
        body: JSON.stringify(dadosPartida),
      });

      if (!res.ok) throw new Error('Erro ao salvar partida');

      const partidaSalva = await res.json();
      setPartidasSalvas([...partidasSalvas, partidaSalva]);

      const promessasAzul = jogadoresSelecionadosTime1.map(id => {
        const resultado = vencedor === 'Azul' ? 'vitoria' : (vencedor === 'Empate' ? 'empate' : 'derrota');
        return atualizarEstatisticasJogador(id, resultado);
      });

      const promessasVermelho = jogadoresSelecionadosTime2.map(id => {
        const resultado = vencedor === 'Vermelho' ? 'vitoria' : (vencedor === 'Empate' ? 'empate' : 'derrota');
        return atualizarEstatisticasJogador(id, resultado);
      });

      await Promise.all([...promessasAzul, ...promessasVermelho]);
      await carregarJogadores();

      setJogadoresSelecionadosTime1([]);
      setJogadoresSelecionadosTime2([]);
      setGolsTime1(0);
      setGolsTime2(0);

      addToast('Partida e estatísticas salvas com sucesso!', 'success');

    } catch (err) {
      console.error(err);
      addToast('Erro ao processar partida!', 'error');
    } finally {
      setCarregando(false);
    }
  };

  // Cards
  const [jogadorDestaque, setJogadorDestaque] = useState<number>(0);
  const jogadorEncontrado = jogadores.find(jogador => jogador.id === jogadorDestaque);
  const jogadorUsuario = jogadores.find(j => j.id === idJogador) ?? null;

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
    <>
      {equipeAtiva?.role === 'ADMIN' && (
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-6">Registrar Partida</h2>

        {/* ZONA 1: Scoreboard com steppers */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 flex flex-col sm:flex-row items-center justify-around gap-4 sm:gap-0">
          <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
            <span className="text-blue-400 font-bold text-lg tracking-wide">Time Azul</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGolsTime1(g => Math.max(0, g - 1))}
                className="w-11 h-11 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl rounded-full transition-colors cursor-pointer"
              >−</button>
              <span className="text-6xl font-black text-white w-16 text-center">{golsTime1}</span>
              <button
                onClick={() => setGolsTime1(g => g + 1)}
                className="w-11 h-11 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl rounded-full transition-colors cursor-pointer"
              >+</button>
            </div>
          </div>

          <div className="flex flex-row sm:flex-col items-center gap-3">
            <span className="text-gray-500 text-4xl font-black">×</span>
            {golsTime1 !== golsTime2 && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${golsTime1 > golsTime2 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                {golsTime1 > golsTime2 ? 'Azul vence' : 'Vermelho vence'}
              </span>
            )}
            {golsTime1 === golsTime2 && (golsTime1 > 0 || golsTime2 > 0) && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-500/20 text-gray-400 border border-gray-500/40">Empate</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 w-full sm:w-auto">
            <span className="text-red-400 font-bold text-lg tracking-wide">Time Vermelho</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setGolsTime2(g => Math.max(0, g - 1))}
                className="w-11 h-11 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl rounded-full transition-colors cursor-pointer"
              >−</button>
              <span className="text-6xl font-black text-white w-16 text-center">{golsTime2}</span>
              <button
                onClick={() => setGolsTime2(g => g + 1)}
                className="w-11 h-11 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl rounded-full transition-colors cursor-pointer"
              >+</button>
            </div>
          </div>
        </div>

        {/* ZONA 2: Seleção de jogadores */}
        {modoSelecao === 'escolha' ? (
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-5">Selecionar Jogadores</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Card — manual */}
              <button onClick={() => setModoSelecao('manual')}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-gray-700 border-2 border-transparent hover:border-blue-500 hover:bg-gray-700/70 transition-all cursor-pointer text-left">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/40 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Adicionar jogadores</p>
                  <p className="text-gray-400 text-xs mt-0.5">Selecione manualmente quem vai jogar</p>
                </div>
              </button>

              {/* Card — resgatar sorteado */}
              <button onClick={carregarTimeSorteado}
                className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-gray-700 border-2 border-transparent hover:border-cyan-500 hover:bg-gray-700/70 transition-all cursor-pointer text-left">
                <div className="w-12 h-12 rounded-full bg-cyan-600/20 flex items-center justify-center group-hover:bg-cyan-600/40 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Resgatar sorteado</p>
                  <p className="text-gray-400 text-xs mt-0.5">Usa o último time gerado no Sorteador</p>
                </div>
              </button>

            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Selecionar Jogadores</h3>
              <div className="flex items-center gap-4">
                <button onClick={() => { setModoSelecao('escolha'); setJogadoresSelecionadosTime1([]); setJogadoresSelecionadosTime2([]); }}
                  className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer underline underline-offset-2">
                  ← Trocar modo
                </button>
                <div className="flex gap-4 text-sm">
                  <span className="text-blue-400 font-semibold">Azul: {jogadoresSelecionadosTime1.length}/8</span>
                  <span className="text-red-400 font-semibold">Vermelho: {jogadoresSelecionadosTime2.length}/8</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {jogadores.map(jogador => {
                const noAzul = jogadoresSelecionadosTime1.includes(jogador.id);
                const noVermelho = jogadoresSelecionadosTime2.includes(jogador.id);
                return (
                  <div key={jogador.id} className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{jogador.nome}</span>
                      <span className="text-sm font-bold px-1.5 py-0.5 rounded bg-gray-600 text-gray-300">
                        {jogador.posicao === 'Goleiro' ? 'GK' : 'JG'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleTime(jogador.id, 'Azul')}
                        disabled={!noAzul && jogadoresSelecionadosTime1.length >= 8}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          noAzul
                            ? 'bg-blue-600 text-white'
                            : 'bg-transparent border border-blue-600 text-blue-400 hover:bg-blue-600/20 disabled:opacity-30 disabled:cursor-not-allowed'
                        }`}
                      >AZUL</button>
                      <button
                        onClick={() => toggleTime(jogador.id, 'Vermelho')}
                        disabled={!noVermelho && jogadoresSelecionadosTime2.length >= 8}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          noVermelho
                            ? 'bg-red-600 text-white'
                            : 'bg-transparent border border-red-600 text-red-400 hover:bg-red-600/20 disabled:opacity-30 disabled:cursor-not-allowed'
                        }`}
                      >VERM</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ZONA 3: Resumo + Salvar */}
        {(jogadoresSelecionadosTime1.length > 0 || jogadoresSelecionadosTime2.length > 0) && (
          <div className="bg-gray-800/60 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-4 text-sm">
            <div className="flex-1">
              <p className="text-blue-400 font-semibold mb-1">Time Azul:</p>
              <p className="text-gray-300">
                {jogadoresSelecionadosTime1.length === 0
                  ? <span className="text-gray-500 italic">Nenhum jogador</span>
                  : jogadoresSelecionadosTime1.map(id => jogadores.find(j => j.id === id)?.nome).filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-red-400 font-semibold mb-1">Time Vermelho:</p>
              <p className="text-gray-300">
                {jogadoresSelecionadosTime2.length === 0
                  ? <span className="text-gray-500 italic">Nenhum jogador</span>
                  : jogadoresSelecionadosTime2.map(id => jogadores.find(j => j.id === id)?.nome).filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        )}

        {erroPartida && (
          <p className="text-red-400 text-sm text-center mb-3">{erroPartida}</p>
        )}

        <div className="flex justify-center">
          <button
            onClick={salvarPartida}
            disabled={carregando}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg tracking-wide transition-colors cursor-pointer"
          >
            {carregando ? 'Salvando...' : 'Salvar Partida'}
          </button>
        </div>
      </div>
      )}

      {/* SEÇÃO DE PARTIDAS SALVAS */}
      {partidasOrdenadas.length > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Partidas Registradas</h2>
          <div className="relative">
            {/* Scroll left */}
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-700/80 hover:bg-gray-600 text-white rounded-full p-3 shadow-lg transition-colors"
              aria-label="Rolar para esquerda"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div ref={scrollRef} className="flex scroll-w-none overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide px-6 sm:px-8">
              {partidasOrdenadas.map((partida) => {
                const jogadoresAzul = partida.jogadores.filter(j => j.time === 'Azul')
                const jogadoresVermelho = partida.jogadores.filter(j => j.time === 'Vermelho')
                const dataFormatada = new Date(partida.data).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })

                return (
                  <div key={partida.id} className="bg-gray-800 rounded-xl shadow-xl p-6 min-w-full md:w-1/4 box-border scrollbar-hide snap-center">
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
                        <span className="text-gray-500 text-2xl lg:text-4xl font-black">×</span>
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

            {/* Scroll right */}
            <button
              onClick={() => scrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-700/80 hover:bg-gray-600 text-white rounded-full p-3 shadow-lg transition-colors"
              aria-label="Rolar para direita"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center tracking-wide">
          Comparar BIDs
        </h2>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_40px_1fr] lg:items-start">

          {/* ── ESQUERDA — usuário logado ── */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center justify-start gap-2 h-[88px] w-full mb-4">
              <span className="inline-flex items-center gap-1.5 bg-green-500/15 border border-green-500/30 text-green-400 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
                Você
              </span>
            </div>

            {jogadorUsuario ? (
              <div className="flex flex-col items-center gap-4">
                <div className="scale-[0.8] origin-top -mb-[100px] lg:scale-100 lg:mb-0">
                  <CartaJogador
                    jogador={jogadorUsuario}
                    notaGeral={parseInt(scoreJogador(jogadorUsuario))}
                  />
                </div>
                <div className="flex items-stretch bg-gray-700/50 border border-gray-600/60 rounded-xl overflow-hidden">
                  <div className="flex flex-col items-center justify-center px-5 py-3">
                    <p className="text-2xl font-black text-green-400">{jogadorUsuario.vitorias}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">Vitórias</p>
                  </div>
                  <div className="w-px bg-gray-600/60 self-stretch"></div>
                  <div className="flex flex-col items-center justify-center px-5 py-3">
                    <p className="text-2xl font-black text-yellow-400">{jogadorUsuario.empates}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">Empates</p>
                  </div>
                  <div className="w-px bg-gray-600/60 self-stretch"></div>
                  <div className="flex flex-col items-center justify-center px-5 py-3">
                    <p className="text-2xl font-black text-red-400">{jogadorUsuario.derrotas}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">Derrotas</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-gray-700/80 flex items-center justify-center mb-3 border border-gray-600">
                  <span className="text-xl text-gray-500 font-bold">?</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">Seu perfil não está<br />vinculado a um jogador.</p>
              </div>
            )}
          </div>

          {/* ── DIVISOR VS ── */}
          <div className="flex flex-row items-center gap-2 py-6 lg:flex-col lg:items-center lg:justify-start lg:pt-[140px] lg:gap-3 lg:py-0">
            <div className="flex-1 h-px bg-gray-600/60 lg:flex-none lg:w-px lg:h-16"></div>
            <span className="text-gray-500 font-black text-2xl lg:text-4xl tracking-[0.2em] shrink-0">VS</span>
            <div className="flex-1 h-px bg-gray-600/60 lg:flex-none lg:w-px lg:h-16"></div>
          </div>

          {/* ── DIREITA — adversário ── */}
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center justify-end gap-2 h-[88px] w-full mb-4 max-w-xs mx-auto lg:max-w-full">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"></span>
                Adversário
              </span>
              <div className="relative w-full max-w-xs">
                <select
                  value={jogadorDestaque}
                  onChange={(e) => setJogadorDestaque(parseInt(e.target.value))}
                  className="w-full appearance-none bg-gray-700 border border-gray-500 hover:border-blue-400 focus:border-blue-400 text-white rounded-lg px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors cursor-pointer"
                >
                  <option value={0}>Selecione um adversário...</option>
                  {jogadores.map((jogador) => (
                    <option key={jogador.id} value={jogador.id}>{jogador.nome}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {jogadorEncontrado ? (
              <div className="flex flex-col items-center gap-4">
                <div className="scale-[0.8] origin-top -mb-[100px] lg:scale-100 lg:mb-0">
                  <CartaJogador
                    jogador={jogadorEncontrado}
                    notaGeral={parseInt(scoreJogador(jogadorEncontrado))}
                  />
                </div>
                <div className="flex items-stretch bg-gray-700/50 border border-gray-600/60 rounded-xl overflow-hidden">
                  <div className="flex flex-col items-center justify-center px-5 py-3">
                    <p className="text-2xl font-black text-green-400">{jogadorEncontrado.vitorias}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">Vitórias</p>
                  </div>
                  <div className="w-px bg-gray-600/60 self-stretch"></div>
                  <div className="flex flex-col items-center justify-center px-5 py-3">
                    <p className="text-2xl font-black text-yellow-400">{jogadorEncontrado.empates}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">Empates</p>
                  </div>
                  <div className="w-px bg-gray-600/60 self-stretch"></div>
                  <div className="flex flex-col items-center justify-center px-5 py-3">
                    <p className="text-2xl font-black text-red-400">{jogadorEncontrado.derrotas}</p>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">Derrotas</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <div className="w-14 h-14 rounded-full bg-gray-700/80 flex items-center justify-center mb-3 border-2 border-dashed border-gray-600">
                  <span className="text-xl text-gray-500 font-bold">+</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">Selecione um adversário<br />para comparar</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </>
  );
}
