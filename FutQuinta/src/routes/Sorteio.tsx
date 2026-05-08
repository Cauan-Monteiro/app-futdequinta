import { useState, useContext, useRef, useMemo } from 'react';
import { toPng } from 'html-to-image';
import { useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { AuthContext } from '../components/AuthContext';
import type { OutletToastCtx } from '../components/LayoutInterno';
import '../App.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Jogador {
    id: number;
    nome: string;
    posicao: 'Goleiro' | 'Linha';
    fisico: number;
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
        pace: number | null;
    };
}

interface SorteioProps {
    jogadores: Jogador[];
}

const MIN_LINHA = 8;
const FALLBACK_AVATAR = 'https://res.cloudinary.com/dk9fhp8d8/image/upload/w_453,h_594,c_fill/iconJogador_g2wkq9.png';

export default function Sorteio({ jogadores }: SorteioProps) {
    const { addToast } = useOutletContext<OutletToastCtx>();
    const { equipeAtiva } = useContext(AuthContext);
    const [salvando, setSalvando] = useState(false);
    const sorteadosRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const trocasListRef = useRef<HTMLDivElement>(null);

    // ── Presence state (IDs of absent players) ───────────────────────────────
    // Default: everyone is PRESENT. User marks who is ABSENT.
    const [ausentes, setAusentes] = useState<Set<number>>(new Set());
    const [busca, setBusca] = useState('');

    // ── Draw result state ──────────────────────────────────────────────────────
    const [timeAzul, setTimeAzul] = useState<Jogador[]>([]);
    const [timeVermelho, setTimeVermelho] = useState<Jogador[]>([]);
    const [erroSorteio, setErroSorteio] = useState<string | null>(null);
    const [jogadorSelecionado, setJogadorSelecionado] = useState<{ jogador: Jogador; time: 'Azul' | 'Vermelho' } | null>(null);
    const [trocasRealizadas, setTrocasRealizadas] = useState<string[] | null>(null);
    const [countTrocas, setCountTrocas] = useState(0);

    // ── Derived lists ─────────────────────────────────────────────────────────
    const goleiros = useMemo(() => jogadores.filter(j => j.posicao === 'Goleiro'), [jogadores]);
    const linhas   = useMemo(() => jogadores.filter(j => j.posicao === 'Linha'),   [jogadores]);

    // Present players (not absent)
    const sortGoleiros = useMemo(() => goleiros.filter(j => !ausentes.has(j.id)), [goleiros, ausentes]);
    const sortJogadores = useMemo(() => linhas.filter(j => !ausentes.has(j.id)),  [linhas, ausentes]);

    // Filtered by search
    const goleirosVisiveis = useMemo(() =>
        goleiros.filter(j => j.nome.toLowerCase().includes(busca.toLowerCase())),
        [goleiros, busca]
    );
    const linhasVisiveis = useMemo(() =>
        linhas.filter(j => j.nome.toLowerCase().includes(busca.toLowerCase())),
        [linhas, busca]
    );

    // Readiness
    const gkOk = sortGoleiros.length >= 1;
    const lnOk = sortJogadores.length >= MIN_LINHA;
    const pronto = gkOk && lnOk;

    const totalPresentes = sortGoleiros.length + sortJogadores.length;
    const totalJogadores  = jogadores.length;

    // ── Helpers ───────────────────────────────────────────────────────────────
    const scoreJogador = (j: Jogador) => {
        if (j.partidas === 0) return '0.00';
        if (j.partidas <= 2) return '50.00';
        return ((j.pontos / (j.partidas * 3)) * 100).toFixed(2);
    };

    const scoreJogadorNum = (j: Jogador): number => {
        if (j.partidas === 0) return 0;
        if (j.partidas <= 2) return 50;
        return (j.pontos / (j.partidas * 3)) * 100;
    };

    const notaGeral = (f: number, s: number) => (s * 0.8) + (f * 10 * 0.2);

    const toggleAusente = (id: number) => {
        setAusentes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const marcarTodos = () => setAusentes(new Set());
    const desmarcarTodos = () => setAusentes(new Set(jogadores.map(j => j.id)));

    // ── Draw algorithm ────────────────────────────────────────────────────────
    const realizarSorteio = () => {
        setErroSorteio(null);
        setTrocasRealizadas(null);
        setCountTrocas(0);

        if (sortJogadores.length < MIN_LINHA) {
            setErroSorteio(`Selecione pelo menos ${MIN_LINHA} jogadores de linha.`);
            return;
        }

        const jogadoresOrdenados = [...sortJogadores].sort((a, b) =>
            notaGeral(b.fisico, parseFloat(scoreJogador(b))) - notaGeral(a.fisico, parseFloat(scoreJogador(a)))
        );
        const goleirosOrdenados = [...sortGoleiros].sort((a, b) =>
            parseFloat(scoreJogador(b)) - parseFloat(scoreJogador(a))
        );

        let novoAzul: Jogador[];
        let novoVermelho: Jogador[];

        if (sortGoleiros.length === 1) {
            novoVermelho = [goleirosOrdenados[0]];
            novoAzul = [];
            const N = jogadoresOrdenados.length;
            const vermelhoTarget = Math.ceil(N / 2) - 1;
            let vermelhoCount = 0;
            jogadoresOrdenados.forEach((jogador, index) => {
                const posInGroup = index % 4;
                if ((posInGroup === 1 || posInGroup === 2) && vermelhoCount < vermelhoTarget) {
                    novoVermelho.push(jogador);
                    vermelhoCount++;
                } else {
                    novoAzul.push(jogador);
                }
            });
        } else {
            novoAzul    = goleirosOrdenados[1] ? [goleirosOrdenados[1]] : [];
            novoVermelho = goleirosOrdenados[0] ? [goleirosOrdenados[0]] : [];
            jogadoresOrdenados.forEach((jogador, index) => {
                if (index % 4 === 0 || index % 4 === 3) novoAzul.push(jogador);
                else novoVermelho.push(jogador);
            });
        }

        setTimeAzul(novoAzul);
        setTimeVermelho(novoVermelho);
    };

    // ── Swap ──────────────────────────────────────────────────────────────────
    const getSugestoesTroca = (jogador: Jogador, time: 'Azul' | 'Vermelho') => {
        const adversarios = time === 'Azul' ? timeVermelho : timeAzul;
        const meuScore = scoreJogadorNum(jogador);
        return adversarios
            .filter(j => j.posicao === jogador.posicao)
            .sort((a, b) => Math.abs(scoreJogadorNum(a) - meuScore) - Math.abs(scoreJogadorNum(b) - meuScore))
            .slice(0, 2);
    };

    const realizarTroca = (jogadorSel: Jogador, jogadorAlvo: Jogador) => {
        if (countTrocas >= 2) return addToast('Número máximo de trocas atingido!', 'error');
        setTimeAzul(prev => prev.map(j => j.id === jogadorSel.id ? jogadorAlvo : j.id === jogadorAlvo.id ? jogadorSel : j));
        setTimeVermelho(prev => prev.map(j => j.id === jogadorSel.id ? jogadorAlvo : j.id === jogadorAlvo.id ? jogadorSel : j));
        setTrocasRealizadas(prev => [...(prev ?? []), `${jogadorSel.nome}  ⇄  ${jogadorAlvo.nome}`]);
        setCountTrocas(prev => prev + 1);
        setJogadorSelecionado(null);
    };

    // ── Share ─────────────────────────────────────────────────────────────────
    const salvarTimeSorteado = async () => {
        if (!equipeAtiva) return;
        setSalvando(true);
        try {
            const res = await fetch(`${API_URL}/times-sorteados`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('token_acesso')}`,
                },
                body: JSON.stringify({
                    companyId: parseInt(equipeAtiva.id),
                    jogadoresAzul: timeAzul.map(j => j.id),
                    jogadoresVermelho: timeVermelho.map(j => j.id),
                }),
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
        const container = sorteadosRef.current;
        const grid = gridRef.current;
        const trocasList = trocasListRef.current;
        try {
            container.style.width = '1024px';
            if (grid) grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            if (trocasList) { trocasList.style.display = 'grid'; trocasList.style.gridTemplateColumns = 'repeat(2, 1fr)'; }
            container.getBoundingClientRect();
            const dataUrl = await toPng(container, { cacheBust: true });
            container.style.width = '';
            if (grid) grid.style.gridTemplateColumns = '';
            if (trocasList) { trocasList.style.display = ''; trocasList.style.gridTemplateColumns = ''; }
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
            container.style.width = '';
            if (grid) grid.style.gridTemplateColumns = '';
            if (trocasList) { trocasList.style.display = ''; trocasList.style.gridTemplateColumns = ''; }
            addToast('Erro ao gerar a imagem.', 'error');
        }
    };

    // ── Phases ────────────────────────────────────────────────────────────────
    const showResult = timeAzul.length > 0;

    // ── Player row ────────────────────────────────────────────────────────────
    const PlayerRow = ({ jogador }: { jogador: Jogador }) => {
        const ausente = ausentes.has(jogador.id);
        const isGK = jogador.posicao === 'Goleiro';
        return (
            <motion.button
                layout
                onClick={() => toggleAusente(jogador.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 cursor-pointer text-left"
                style={ausente
                    ? { backgroundColor: 'var(--color-surface-base)', borderColor: 'rgba(255,255,255,0.05)', opacity: 0.45 }
                    : { backgroundColor: isGK ? 'rgba(234,179,8,0.06)' : 'var(--color-surface-raised)', borderColor: isGK ? 'rgba(234,179,8,0.2)' : 'var(--color-surface-border)' }
                }
                whileTap={{ scale: 0.97 }}
            >
                {/* Avatar */}
                <div
                    className="w-9 h-9 rounded-full shrink-0 bg-cover bg-center border-2 transition-all"
                    style={{
                        backgroundImage: `url(${jogador.fotoUrl ?? FALLBACK_AVATAR})`,
                        borderColor: ausente ? 'rgba(255,255,255,0.08)' : isGK ? 'rgba(234,179,8,0.5)' : 'var(--color-surface-border)',
                        filter: ausente ? 'grayscale(1)' : 'none',
                    }}
                />

                {/* Name + score */}
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate transition-colors ${ausente ? 'text-gray-600 line-through' : 'text-white'}`}>
                        {jogador.nome}
                    </p>
                    <p className={`text-[10px] transition-colors ${ausente ? 'text-gray-700' : 'text-gray-500'}`}>
                        Score {scoreJogador(jogador)}
                    </p>
                </div>

                {/* Position badge */}
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 transition-all ${
                    ausente
                        ? 'bg-transparent border-gray-800 text-gray-700'
                        : isGK
                            ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                            : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                }`}>
                    {isGK ? 'GK' : 'LN'}
                </span>

                {/* Presence toggle */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    ausente
                        ? 'border-gray-700 bg-transparent'
                        : 'border-green-500 bg-green-500'
                }`}>
                    {!ausente && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            </motion.button>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-2xl mx-auto px-4 py-6 pb-32">

            {/* ── Phase 1: Chamada ─────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
            {!showResult && (
                <motion.div
                    key="chamada"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Chamada</h2>
                            <p className="text-gray-500 text-sm mt-0.5">
                                {totalPresentes} de {totalJogadores} presentes
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={marcarTodos}
                                className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:text-white"
                                style={{ borderColor: 'var(--color-surface-border)', color: 'var(--color-brand-score)', backgroundColor: 'rgba(34,211,238,0.08)' }}
                            >
                                Todos
                            </button>
                            <button
                                onClick={desmarcarTodos}
                                className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors text-gray-400 hover:text-white"
                                style={{ borderColor: 'var(--color-surface-border)', backgroundColor: 'var(--color-surface-raised)' }}
                            >
                                Nenhum
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative mb-5">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            placeholder="Buscar jogador..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 border focus:outline-none transition-colors"
                            style={{ backgroundColor: 'var(--color-surface-card)', borderColor: busca ? 'var(--color-brand-score)' : 'var(--color-surface-border)' }}
                        />
                        {busca && (
                            <button
                                onClick={() => setBusca('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* ── Goleiros section ──────────────────────────────────── */}
                    {goleirosVisiveis.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">Goleiros</span>
                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                                        {sortGoleiros.length}/{goleiros.length}
                                    </span>
                                </div>
                                {!gkOk && (
                                    <span className="text-[10px] text-yellow-600 font-medium">
                                        ⚠ mín. 1 goleiro
                                    </span>
                                )}
                                {gkOk && (
                                    <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        OK
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                {goleirosVisiveis.map(j => <PlayerRow key={j.id} jogador={j} />)}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    {goleirosVisiveis.length > 0 && linhasVisiveis.length > 0 && (
                        <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-surface-border)' }} />
                            <span className="text-[10px] text-gray-600 uppercase tracking-widest">Linha</span>
                            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-surface-border)' }} />
                        </div>
                    )}

                    {/* ── Linhas section ───────────────────────────────────── */}
                    {linhasVisiveis.length > 0 && (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-500">Jogadores de Linha</span>
                                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                                        {sortJogadores.length}/{linhas.length}
                                    </span>
                                </div>
                                {!lnOk && (
                                    <span className="text-[10px] text-yellow-600 font-medium">
                                        ⚠ faltam {Math.max(0, MIN_LINHA - sortJogadores.length)} de {MIN_LINHA} mín.
                                    </span>
                                )}
                                {lnOk && (
                                    <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                        OK
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                {linhasVisiveis.map(j => <PlayerRow key={j.id} jogador={j} />)}
                            </div>
                        </div>
                    )}

                    {jogadores.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <svg className="w-12 h-12 text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-500 text-sm">Nenhum jogador cadastrado.</p>
                            <p className="text-gray-600 text-xs mt-1">Visite a Home para carregar os dados.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* ── Phase 2: Times Sorteados ─────────────────────────────────── */}
            {showResult && (
                <motion.div
                    key="resultado"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Times Sorteados</h2>
                            <p className="text-gray-500 text-sm">{totalPresentes} jogadores · {countTrocas}/2 trocas</p>
                        </div>
                        <button
                            onClick={() => { setTimeAzul([]); setTimeVermelho([]); setTrocasRealizadas(null); setCountTrocas(0); setJogadorSelecionado(null); }}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border rounded-lg px-3 py-2 transition-colors"
                            style={{ borderColor: 'var(--color-surface-border)', backgroundColor: 'var(--color-surface-raised)' }}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Editar chamada
                        </button>
                    </div>

                    {/* Exportable region */}
                    <div ref={sorteadosRef} className="bg-gray-900 p-4 rounded-xl">
                        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                            {/* Time Azul */}
                            <div className="bg-gray-800 border-t-4 border-blue-500 rounded-xl p-5 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-blue-400" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>Time Azul</h4>
                                    <span className="text-xs text-blue-400 border border-blue-500/30 rounded-full px-2 py-0.5 bg-blue-500/10">{timeAzul.length} jog.</span>
                                </div>
                                <div className="space-y-1.5">
                                    {timeAzul.map((j, idx) => (
                                        <motion.div
                                            key={j.id}
                                            initial={{ opacity: 0, x: -12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            onClick={() => countTrocas < 2 && setJogadorSelecionado({ jogador: j, time: 'Azul' })}
                                            className={`flex items-center justify-between p-2.5 rounded-lg text-white transition-all
                                                ${countTrocas < 2 ? 'cursor-pointer hover:bg-blue-500/10' : 'cursor-not-allowed opacity-60'}
                                                ${jogadorSelecionado?.jogador.id === j.id ? 'ring-2 ring-blue-400 bg-blue-500/15' : 'bg-gray-700'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-7 h-7 rounded-full bg-cover bg-center shrink-0 border border-gray-600"
                                                    style={{ backgroundImage: `url(${j.fotoUrl ?? FALLBACK_AVATAR})` }}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium leading-none">{j.nome}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">Score {scoreJogador(j)}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${j.posicao === 'Goleiro' ? 'bg-yellow-700 text-yellow-200' : 'bg-blue-900 text-blue-200'}`}>
                                                {j.posicao === 'Goleiro' ? 'GL' : 'LN'}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Time Vermelho */}
                            <div className="bg-gray-800 border-t-4 border-red-500 rounded-xl p-5 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-red-400" style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>Time Vermelho</h4>
                                    <span className="text-xs text-red-400 border border-red-500/30 rounded-full px-2 py-0.5 bg-red-500/10">{timeVermelho.length} jog.</span>
                                </div>
                                <div className="space-y-1.5">
                                    {timeVermelho.map((j, idx) => (
                                        <motion.div
                                            key={j.id}
                                            initial={{ opacity: 0, x: 12 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            onClick={() => countTrocas < 2 && setJogadorSelecionado({ jogador: j, time: 'Vermelho' })}
                                            className={`flex items-center justify-between p-2.5 rounded-lg text-white transition-all
                                                ${countTrocas < 2 ? 'cursor-pointer hover:bg-red-500/10' : 'cursor-not-allowed opacity-60'}
                                                ${jogadorSelecionado?.jogador.id === j.id ? 'ring-2 ring-red-400 bg-red-500/15' : 'bg-gray-700'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-7 h-7 rounded-full bg-cover bg-center shrink-0 border border-gray-600"
                                                    style={{ backgroundImage: `url(${j.fotoUrl ?? FALLBACK_AVATAR})` }}
                                                />
                                                <div>
                                                    <p className="text-sm font-medium leading-none">{j.nome}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">Score {scoreJogador(j)}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${j.posicao === 'Goleiro' ? 'bg-yellow-700 text-yellow-200' : 'bg-red-900 text-red-200'}`}>
                                                {j.posicao === 'Goleiro' ? 'GL' : 'LN'}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Trocas */}
                        <div className="bg-gray-800 border-t-4 border-cyan-500 rounded-xl p-5 shadow-xl">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">Trocas Realizadas</h4>
                                <div className="flex items-center gap-1.5">
                                    {[0, 1].map(i => (
                                        <span key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                                            ${i < countTrocas ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-600'}`}>
                                            {i + 1}
                                        </span>
                                    ))}
                                    <span className={`ml-1 text-xs font-medium ${countTrocas >= 2 ? 'text-red-400' : 'text-gray-500'}`}>
                                        {countTrocas}/2
                                    </span>
                                </div>
                            </div>
                            {!trocasRealizadas || trocasRealizadas.length === 0 ? (
                                <p className="text-gray-600 text-xs text-center py-2">
                                    {countTrocas >= 2 ? 'Limite de trocas atingido.' : 'Toque em um jogador para sugerir uma troca.'}
                                </p>
                            ) : (
                                <div ref={trocasListRef} className="flex flex-col gap-1.5">
                                    {trocasRealizadas.map((t, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-gray-700 rounded-lg px-3 py-2">
                                            <span className="w-4 h-4 rounded-full bg-cyan-700 text-cyan-100 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                                            <span className="text-gray-300 text-xs">{t}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                            onClick={salvarTimeSorteado}
                            disabled={salvando}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-50 active:scale-[0.98]"
                            style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-border)' }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                            {salvando ? 'Salvando...' : 'Salvar Time'}
                        </button>
                        <button
                            onClick={compartilharFoto}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-all active:scale-[0.98]"
                            style={{ background: 'linear-gradient(135deg, var(--color-brand-pitch), var(--color-brand-grass))' }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Compartilhar Foto
                        </button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* ── Sticky bottom bar ─────────────────────────────────────────── */}
            <AnimatePresence>
            {!showResult && jogadores.length > 0 && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                    className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2"
                    style={{ background: 'linear-gradient(to top, var(--color-surface-base) 60%, transparent)' }}
                >
                    <div
                        className="max-w-2xl mx-auto rounded-2xl p-3 flex items-center gap-3 shadow-2xl shadow-black/50 border"
                        style={{ backgroundColor: 'rgba(35,41,56,0.97)', borderColor: 'var(--color-surface-border)', backdropFilter: 'blur(16px)' }}
                    >
                        {/* Status pills */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                gkOk
                                    ? 'bg-green-500/15 border-green-500/30 text-green-400'
                                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'
                            }`}>
                                <span className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>GK</span>
                                <span>{sortGoleiros.length}</span>
                                {gkOk
                                    ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    : <span className="text-yellow-700">/ mín 1</span>
                                }
                            </div>

                            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                lnOk
                                    ? 'bg-green-500/15 border-green-500/30 text-green-400'
                                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'
                            }`}>
                                <span className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>LN</span>
                                <span>{sortJogadores.length}</span>
                                {lnOk
                                    ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    : <span className="text-yellow-700">/ mín {MIN_LINHA}</span>
                                }
                            </div>

                            {!pronto && (
                                <p className="text-[10px] text-gray-600 truncate hidden sm:block">
                                    {!gkOk && !lnOk ? 'Selecione ao menos 1 GK e 8 LN' : !gkOk ? 'Selecione ao menos 1 goleiro' : `Faltam ${MIN_LINHA - sortJogadores.length} jogadores`}
                                </p>
                            )}
                        </div>

                        {/* Error */}
                        {erroSorteio && (
                            <p className="text-red-400 text-xs text-center shrink-0">{erroSorteio}</p>
                        )}

                        {/* CTA */}
                        <motion.button
                            onClick={realizarSorteio}
                            disabled={!pronto}
                            whileTap={pronto ? { scale: 0.95 } : {}}
                            className="shrink-0 flex items-center gap-2 py-3 px-6 rounded-xl text-white font-bold text-sm tracking-wide transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                                background: pronto
                                    ? 'linear-gradient(135deg, var(--color-brand-pitch), var(--color-brand-grass))'
                                    : 'var(--color-surface-raised)',
                                fontFamily: 'var(--font-display)',
                                fontSize: '1rem',
                                letterSpacing: '0.08em',
                            }}
                        >
                            {pronto ? (
                                <>
                                    Sortear
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                    </svg>
                                </>
                            ) : (
                                'Sortear'
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* ── Swap modal ────────────────────────────────────────────────── */}
            <AnimatePresence>
            {jogadorSelecionado && (() => {
                const sugestoes = getSugestoesTroca(jogadorSelecionado.jogador, jogadorSelecionado.time);
                const timeOposto = jogadorSelecionado.time === 'Azul' ? 'Vermelho' : 'Azul';
                const corTime = jogadorSelecionado.time === 'Azul' ? 'text-blue-400' : 'text-red-400';
                return (
                    <motion.div
                        key="swap-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
                        onClick={() => setJogadorSelecionado(null)}
                    >
                        <motion.div
                            initial={{ y: 40, opacity: 0, scale: 0.97 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 40, opacity: 0, scale: 0.97 }}
                            transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
                            className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border"
                            style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-10 h-10 rounded-full bg-cover bg-center border-2 shrink-0"
                                    style={{
                                        backgroundImage: `url(${jogadorSelecionado.jogador.fotoUrl ?? FALLBACK_AVATAR})`,
                                        borderColor: jogadorSelecionado.time === 'Azul' ? '#3b82f6' : '#ef4444',
                                    }}
                                />
                                <div>
                                    <p className={`font-bold text-sm ${corTime}`}>{jogadorSelecionado.jogador.nome}</p>
                                    <p className="text-gray-500 text-xs">Score {scoreJogador(jogadorSelecionado.jogador)} · Time {jogadorSelecionado.time}</p>
                                </div>
                                <div className="ml-auto flex items-center gap-1">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                                    <span className="text-gray-500 text-xs">Time {timeOposto}</span>
                                </div>
                            </div>

                            {sugestoes.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 text-sm">Nenhum jogador elegível no time adversário.</p>
                                    <p className="text-gray-600 text-xs mt-1">A troca é feita entre jogadores da mesma posição.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 mb-4">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">Sugestões compatíveis</p>
                                    {sugestoes.map(s => {
                                        const diff = (scoreJogadorNum(s) - scoreJogadorNum(jogadorSelecionado.jogador)).toFixed(1);
                                        const diffNum = parseFloat(diff);
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => realizarTroca(jogadorSelecionado.jogador, s)}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl border transition-all hover:bg-white/5 cursor-pointer"
                                                style={{ borderColor: 'var(--color-surface-border)', backgroundColor: 'var(--color-surface-raised)' }}
                                            >
                                                <div
                                                    className="w-9 h-9 rounded-full bg-cover bg-center shrink-0 border"
                                                    style={{ backgroundImage: `url(${s.fotoUrl ?? FALLBACK_AVATAR})`, borderColor: 'var(--color-surface-border)' }}
                                                />
                                                <div className="flex-1 text-left">
                                                    <p className="text-white text-sm font-medium">{s.nome}</p>
                                                    <p className="text-gray-500 text-xs">Score {scoreJogador(s)}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                        Math.abs(diffNum) < 5 ? 'bg-green-500/15 text-green-400' :
                                                        Math.abs(diffNum) < 15 ? 'bg-yellow-500/15 text-yellow-400' :
                                                        'bg-red-500/15 text-red-400'
                                                    }`}>
                                                        {diffNum > 0 ? '+' : ''}{diff}
                                                    </span>
                                                    <p className="text-[10px] text-gray-600 mt-0.5">dif.</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                onClick={() => setJogadorSelecionado(null)}
                                className="w-full py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors border"
                                style={{ borderColor: 'var(--color-surface-border)', backgroundColor: 'var(--color-surface-base)' }}
                            >
                                Cancelar
                            </button>
                        </motion.div>
                    </motion.div>
                );
            })()}
            </AnimatePresence>
        </div>
    );
}
