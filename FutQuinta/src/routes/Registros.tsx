import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Cookies from 'js-cookie'
import { useOutletContext } from 'react-router-dom'
import type { OutletToastCtx } from '../components/LayoutInterno'
import type { Jogador } from '../App'

const API_URL = import.meta.env.VITE_API_URL
const COMPANY_ID = Number(import.meta.env.VITE_COMPANY_ID)

// ── Types ────────────────────────────────────────────────────────────────────

interface UsuarioItem {
  id: number
  nome: string
  email: string
  idJogador: { id: number; nome: string } | null
  memberships: Array<{ id: number; role: string; time: { id: number } }>
}

interface PartidaSalva {
  id: number
  jogadores: Array<{ id: number; time: string }>
  golsAzul: number
  golsVermelho: number
  vencedor: string
  data: string
}

interface Props {
  jogadores: Jogador[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  JOGADOR: 'Jogador',
  VISITANTE: 'Visitante',
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN:     'bg-amber-500/20 text-amber-400 border-amber-500/40',
  JOGADOR:   'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  VISITANTE: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
}

const TABS = [
  { id: 'usuarios',      label: 'Usuários',      icon: UsersIcon },
  { id: 'partidas',      label: 'Partidas',       icon: BallIcon },
  { id: 'jogadores',     label: 'Jogadores',      icon: ShieldIcon },
  { id: 'configuracoes', label: 'Configurações',  icon: CogIcon },
] as const

type TabId = typeof TABS[number]['id']

// ── Icon Components ────────────────────────────────────────────────────────────

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function BallIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function CogIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

// ── Stat Badge ─────────────────────────────────────────────────────────────────

function StatBadge({ label, color }: { label: string; color: 'red' | 'gray' | 'orange' }) {
  const styles: Record<string, string> = {
    red:    'bg-red-500/20 text-red-400 border-red-500/30',
    gray:   'bg-gray-500/20 text-gray-400 border-gray-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${styles[color]}`}>{label}</span>
  )
}

// ── Impact Modal ───────────────────────────────────────────────────────────────

function ImpactModal({
  partida,
  jogadores,
  onConfirm,
  onCancel,
}: {
  partida: PartidaSalva
  jogadores: Jogador[]
  onConfirm: () => Promise<void>
  onCancel: () => void
}) {
  const [countdown, setCountdown] = useState(5)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (countdown === 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function calcImpacto(jt: { id: number; time: string }) {
    const base = { partidas: -1, pontos: 0, vitorias: 0, derrotas: 0, empates: 0 }
    if (partida.vencedor === 'Empate') return { ...base, pontos: -1, empates: -1 }
    if (jt.time === partida.vencedor)  return { ...base, pontos: -3, vitorias: -1 }
    return { ...base, derrotas: -1 }
  }

  const jogadoresAzul     = partida.jogadores.filter(j => j.time === 'Azul')
  const jogadoresVermelho = partida.jogadores.filter(j => j.time === 'Vermelho')
  const jogadoresMap      = new Map(jogadores.map(j => [j.id, j.nome]))
  const dataFormatada     = new Date(partida.data).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const handleConfirm = async () => {
    setConfirming(true)
    await onConfirm()
  }

  const renderJogadorCard = (jt: { id: number; time: string }) => {
    const impacto = calcImpacto(jt)
    const nome    = jogadoresMap.get(jt.id) ?? `Jogador ${jt.id}`
    return (
      <div key={jt.id} className="rounded-lg p-2.5 border" style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-surface-border)' }}>
        <p className="text-white text-xs font-semibold truncate mb-1.5">{nome}</p>
        <div className="flex flex-wrap gap-1">
          {impacto.pontos  !== 0 && <StatBadge label={`${impacto.pontos} pts`} color="red" />}
          <StatBadge label="-1 part." color="gray" />
          {impacto.vitorias !== 0 && <StatBadge label="-1 vit." color="orange" />}
          {impacto.derrotas !== 0 && <StatBadge label="-1 der." color="orange" />}
          {impacto.empates  !== 0 && <StatBadge label="-1 emp." color="orange" />}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border overflow-y-auto"
        style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--color-surface-border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <TrashIcon className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-none">Excluir Partida</h3>
              <p className="text-gray-500 text-xs mt-0.5">{dataFormatada}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--color-surface-raised)' }}>
            <div className="text-center">
              <span className="text-blue-400 text-4xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>{partida.golsAzul}</span>
              <p className="text-blue-400/60 text-[10px] uppercase tracking-widest mt-0.5">Azul</p>
            </div>
            <span className="text-gray-600 font-bold text-lg">×</span>
            <div className="text-center">
              <span className="text-red-400 text-4xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>{partida.golsVermelho}</span>
              <p className="text-red-400/60 text-[10px] uppercase tracking-widest mt-0.5">Vermelho</p>
            </div>
          </div>
        </div>

        {/* Impact preview */}
        <div className="p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Impacto nos jogadores</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Time Azul</p>
              <div className="space-y-2">{jogadoresAzul.map(renderJogadorCard)}</div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Time Vermelho</p>
              <div className="space-y-2">{jogadoresVermelho.map(renderJogadorCard)}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-400 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <p className="text-amber-300 text-xs">Esta ação é irreversível. Os stats acima serão revertidos permanentemente.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onCancel}
            disabled={confirming}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-300 transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-surface-raised)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={countdown > 0 || confirming}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: countdown > 0 || confirming ? 'var(--color-surface-raised)' : 'linear-gradient(135deg, #dc2626, #991b1b)' }}
          >
            {confirming ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" style={{ width: 14, height: 14 }} />
              </span>
            ) : countdown > 0 ? `Aguarde ${countdown}s` : 'Confirmar exclusão'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Confirm Delete Modal ───────────────────────────────────────────────────────

function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        className="rounded-2xl p-6 w-full max-w-sm shadow-2xl border"
        style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <TrashIcon className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-300 transition-colors"
            style={{ backgroundColor: 'var(--color-surface-raised)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors active:scale-[0.98]"
          >
            Excluir
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent, icon }: { label: string; value: number | string; accent: string; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 flex items-center gap-4 border"
      style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-widest">{label}</p>
        <p className="text-white font-bold text-2xl leading-none mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>{value}</p>
      </div>
    </motion.div>
  )
}

// ── Tab: Usuários ──────────────────────────────────────────────────────────────

function TabUsuarios({ jogadores, addToast }: { jogadores: Jogador[]; addToast: (m: string, t?: any) => void }) {
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([])
  const [selecionado, setSelecionado] = useState<Record<number, number | ''>>({})
  const [rolesSelecionada, setRolesSelecionada] = useState<Record<number, string>>({})
  const [salvando, setSalvando] = useState<Record<number, boolean>>({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token_acesso')
    setCarregando(true)
    fetch(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((data: UsuarioItem[]) => {
        setUsuarios(data)
        const inicial: Record<number, number | ''> = {}
        const rolesInicial: Record<number, string> = {}
        data.forEach(u => {
          inicial[u.id] = u.idJogador?.id ?? ''
          const m = u.memberships?.find(m => m.time.id === COMPANY_ID)
          rolesInicial[u.id] = m?.role ?? 'JOGADOR'
        })
        setSelecionado(inicial)
        setRolesSelecionada(rolesInicial)
      })
      .catch(() => addToast('Erro ao carregar usuários.', 'error'))
      .finally(() => setCarregando(false))
  }, [])

  async function salvar(usuarioId: number) {
    setSalvando(prev => ({ ...prev, [usuarioId]: true }))
    try {
      const responses = await Promise.all([
        fetch(`${API_URL}/usuarios/${usuarioId}/vincular-jogador`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Cookies.get('token_acesso')}` },
          body: JSON.stringify({ jogadorId: selecionado[usuarioId] === '' ? null : selecionado[usuarioId] }),
        }),
        fetch(`${API_URL}/usuarios/${usuarioId}/alterar-role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${Cookies.get('token_acesso')}` },
          body: JSON.stringify({ role: rolesSelecionada[usuarioId], companyId: COMPANY_ID }),
        }),
      ])
      if (responses.some(r => !r.ok)) throw new Error()
      addToast('Registro atualizado!', 'success')
    } catch {
      addToast('Erro ao salvar registro.', 'error')
    } finally {
      setSalvando(prev => ({ ...prev, [usuarioId]: false }))
    }
  }

  const selectClass = 'w-full border text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer transition-colors'
  const selectStyle = { backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-surface-border)' }

  if (carregando) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl border overflow-hidden relative" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
          </div>
        ))}
      </div>
    )
  }

  const adminCount = Object.values(rolesSelecionada).filter(r => r === 'ADMIN').length

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Total" value={usuarios.length} accent="bg-amber-500/20" icon={<UsersIcon className="w-5 h-5 text-amber-400" />} />
        <StatCard label="Admins" value={adminCount} accent="bg-red-500/20" icon={<ShieldIcon className="w-5 h-5 text-red-400" />} />
        <StatCard label="Vinculados" value={Object.values(selecionado).filter(v => v !== '').length} accent="bg-green-500/20" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        } />
      </div>

      {/* User cards */}
      <div className="space-y-2">
        {usuarios.length === 0 && (
          <p className="text-center text-gray-500 py-10">Nenhum usuário encontrado.</p>
        )}
        <AnimatePresence>
          {usuarios.map((u, i) => {
            const role = rolesSelecionada[u.id] ?? 'JOGADOR'
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
              >
                {/* Left accent by role */}
                <div className={`flex`}>
                  <div className={`w-1 shrink-0 ${role === 'ADMIN' ? 'bg-amber-500' : role === 'JOGADOR' ? 'bg-cyan-500' : 'bg-gray-600'}`} />

                  <div className="flex-1 p-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-semibold">{u.nome}</p>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${ROLE_BADGE[role]}`}>
                            {ROLE_LABEL[role]}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5 truncate">{u.email}</p>
                        {u.idJogador && (
                          <p className="text-xs mt-1" style={{ color: 'var(--color-brand-score)' }}>
                            ⚽ {u.idJogador.nome}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Controls grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Role</label>
                        <select
                          value={role}
                          onChange={e => setRolesSelecionada(prev => ({ ...prev, [u.id]: e.target.value }))}
                          className={selectClass}
                          style={selectStyle}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="JOGADOR">JOGADOR</option>
                          <option value="VISITANTE">VISITANTE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Jogador vinculado</label>
                        <select
                          value={selecionado[u.id] ?? ''}
                          onChange={e => setSelecionado(prev => ({ ...prev, [u.id]: e.target.value === '' ? '' : Number(e.target.value) }))}
                          className={selectClass}
                          style={selectStyle}
                        >
                          <option value="">— Sem vínculo —</option>
                          {jogadores.map(j => (
                            <option key={j.id} value={j.id}>{j.nome}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => salvar(u.id)}
                        disabled={salvando[u.id]}
                        className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.97] sm:min-w-[80px]"
                        style={{ background: 'linear-gradient(135deg, var(--color-brand-pitch), var(--color-brand-grass))' }}
                      >
                        {salvando[u.id] ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <span className="spinner" style={{ width: 12, height: 12 }} />
                          </span>
                        ) : 'Salvar'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Tab: Partidas ──────────────────────────────────────────────────────────────

function TabPartidas({ jogadores = [], addToast }: { jogadores?: Jogador[]; addToast: (m: string, t?: any) => void }) {
  const [partidas, setPartidas] = useState<PartidaSalva[]>([])
  const [carregando, setCarregando] = useState(true)
  const [impactPartida, setImpactPartida] = useState<PartidaSalva | null>(null)

  useEffect(() => {
    setCarregando(true)
    fetch(`${API_URL}/partidas`, {
      headers: { Authorization: `Bearer ${Cookies.get('token_acesso')}` },
    })
      .then(res => res.json())
      .then((data: PartidaSalva[]) => setPartidas([...data].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())))
      .catch(() => addToast('Erro ao carregar partidas.', 'error'))
      .finally(() => setCarregando(false))
  }, [])

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/partidas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${Cookies.get('token_acesso')}` },
      })
      if (!res.ok) throw new Error()
      setPartidas(prev => prev.filter(p => p.id !== id))
      setImpactPartida(null)
      addToast('Partida excluída com sucesso!', 'success')
    } catch {
      addToast('Erro ao excluir partida.', 'error')
      setImpactPartida(null)
    }
  }

  const totalGols = partidas.reduce((acc, p) => acc + p.golsAzul + p.golsVermelho, 0)
  const vitoriasAzul = partidas.filter(p => p.vencedor === 'Azul').length
  const vitoriasVermelho = partidas.filter(p => p.vencedor === 'Vermelho').length

  if (carregando) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl border overflow-hidden relative" style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/5 to-transparent" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Partidas" value={partidas.length} accent="bg-blue-500/20" icon={<BallIcon className="w-5 h-5 text-blue-400" />} />
        <StatCard label="Total Gols" value={totalGols} accent="bg-amber-500/20" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
        } />
        <StatCard label="Azul vence" value={vitoriasAzul} accent="bg-blue-500/20" icon={
          <span className="text-blue-400 font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>AZL</span>
        } />
        <StatCard label="Vermelho vence" value={vitoriasVermelho} accent="bg-red-500/20" icon={
          <span className="text-red-400 font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>VRM</span>
        } />
      </div>

      {/* List */}
      {partidas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BallIcon className="w-14 h-14 text-gray-600 mb-3" />
          <p className="text-gray-400">Nenhuma partida registrada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {partidas.map((partida, i) => {
              const dataFormatada = new Date(partida.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
              const jogadoresAzul = partida.jogadores.filter(j => j.time === 'Azul').length
              const jogadoresVermelho = partida.jogadores.filter(j => j.time === 'Vermelho').length

              return (
                <motion.div
                  key={partida.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.22 }}
                  className="rounded-xl border flex items-center gap-4 px-4 py-3 group"
                  style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
                >
                  {/* Score */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-blue-400 text-2xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>{partida.golsAzul}</span>
                    <span className="text-gray-600 text-sm font-bold">×</span>
                    <span className="text-red-400 text-2xl leading-none" style={{ fontFamily: 'var(--font-display)' }}>{partida.golsVermelho}</span>
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8 self-center" style={{ backgroundColor: 'var(--color-surface-border)' }} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        partida.vencedor === 'Azul' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                        partida.vencedor === 'Vermelho' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/40'
                      }`}>{partida.vencedor === 'Empate' ? 'Empate' : `${partida.vencedor} venceu`}</span>
                      <span className="text-gray-500 text-xs">{dataFormatada}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{jogadoresAzul + jogadoresVermelho} jogadores</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => setImpactPartida(partida)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 cursor-pointer shrink-0"
                    title="Excluir partida"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {impactPartida !== null && (
          <ImpactModal
            partida={impactPartida}
            jogadores={jogadores}
            onConfirm={() => handleDelete(impactPartida.id)}
            onCancel={() => setImpactPartida(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Tab: Jogadores ─────────────────────────────────────────────────────────────

function TabJogadores({ jogadores, addToast }: { jogadores: Jogador[]; addToast: (m: string, t?: any) => void }) {
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [editando, setEditando] = useState<Jogador | null>(null)

  const handleDelete = (_id: number) => {
    setConfirmDelete(null)
    addToast('Excluir jogador: backend em breve!', 'info')
  }

  const handleSaveAtributos = () => {
    setEditando(null)
    addToast('Salvar atributos: backend em breve!', 'info')
  }

  const goleiroCount = jogadores.filter(j => j.posicao === 'Goleiro').length
  const linhaCount = jogadores.filter(j => j.posicao === 'Linha').length

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={jogadores.length} accent="bg-amber-500/20" icon={<ShieldIcon className="w-5 h-5 text-amber-400" />} />
        <StatCard label="Goleiros" value={goleiroCount} accent="bg-yellow-500/20" icon={
          <span className="text-yellow-400 font-bold text-xs" style={{ fontFamily: 'var(--font-display)' }}>GK</span>
        } />
        <StatCard label="Linha" value={linhaCount} accent="bg-cyan-500/20" icon={
          <span className="text-cyan-400 font-bold text-xs" style={{ fontFamily: 'var(--font-display)' }}>LN</span>
        } />
      </div>

      {/* Player list */}
      <div className="space-y-2">
        <AnimatePresence>
          {jogadores.map((j, i) => (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.22 }}
              className="rounded-xl border flex items-center gap-4 px-4 py-3 group"
              style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full bg-cover bg-center shrink-0 border-2"
                style={{
                  backgroundImage: `url(${j.fotoUrl ?? 'https://res.cloudinary.com/dk9fhp8d8/image/upload/w_453,h_594,c_fill/iconJogador_g2wkq9.png'})`,
                  borderColor: j.posicao === 'Goleiro' ? 'var(--color-brand-gold)' : 'var(--color-surface-border)'
                }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold text-sm">{j.nome}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    j.posicao === 'Goleiro' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  }`}>
                    {j.posicao === 'Goleiro' ? 'GK' : 'LN'}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-0.5">{j.partidas} partidas · {j.pontos} pts · {j.vitorias}V {j.empates}E {j.derrotas}D</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                <button
                  onClick={() => setEditando(j)}
                  className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  title="Editar atributos"
                >
                  <CogIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDelete(j.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Excluir jogador"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Atributos Modal */}
      <AnimatePresence>
        {editando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            onClick={() => setEditando(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
              className="rounded-2xl p-6 w-full max-w-md shadow-2xl border"
              style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-bold text-lg">Editar Atributos</h3>
                  <p className="text-gray-400 text-sm">{editando.nome}</p>
                </div>
                <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
                  editando.posicao === 'Goleiro' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                }`}>
                  {editando.posicao === 'Goleiro' ? 'Goleiro' : 'Linha'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { key: 'pace', label: 'PAC' },
                  { key: 'shot', label: 'SHO' },
                  { key: 'pass', label: 'PAS' },
                  { key: 'attack', label: 'DRI' },
                  { key: 'defense', label: 'DEF' },
                  { key: 'physical', label: 'PHY' },
                ].map(attr => (
                  <div key={attr.key}>
                    <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">{attr.label}</label>
                    <input
                      type="number"
                      min={0}
                      max={99}
                      defaultValue={(editando.atributos as any)?.[attr.key] ?? 0}
                      className="w-full rounded-lg px-3 py-2 text-white text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-surface-border)' }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditando(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-300 transition-colors"
                  style={{ backgroundColor: 'var(--color-surface-raised)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAtributos}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, var(--color-brand-pitch), var(--color-brand-grass))' }}
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete !== null && (
          <ConfirmModal
            title="Excluir jogador?"
            message="Esta ação é irreversível. O jogador e todas suas estatísticas serão removidos permanentemente."
            onConfirm={() => handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Tab: Configurações ─────────────────────────────────────────────────────────

function TabConfiguracoes({ addToast }: { addToast: (m: string, t?: any) => void }) {
  const [confirmReset, setConfirmReset] = useState<string | null>(null)

  const acoes = [
    {
      id: 'reset-stats',
      titulo: 'Zerar estatísticas',
      descricao: 'Redefine pontos, vitórias, empates, derrotas e partidas de todos os jogadores para zero.',
      cor: 'border-yellow-500/30 bg-yellow-500/5',
      botaoCor: 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10',
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      ),
    },
    {
      id: 'delete-partidas',
      titulo: 'Excluir todas as partidas',
      descricao: 'Remove permanentemente o histórico completo de partidas registradas.',
      cor: 'border-orange-500/30 bg-orange-500/5',
      botaoCor: 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10',
      icone: <BallIcon className="w-5 h-5 text-orange-400" />,
    },
    {
      id: 'delete-all',
      titulo: 'Zona de perigo — Reset total',
      descricao: 'Exclui TODOS os dados: jogadores, partidas, estatísticas e usuários vinculados. Irreversível.',
      cor: 'border-red-500/30 bg-red-500/5',
      botaoCor: 'border-red-500/50 text-red-400 hover:bg-red-500/10',
      icone: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-4 max-w-xl">
      {/* Company info card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-5"
        style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
      >
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CogIcon className="w-4 h-4 text-amber-400" />
          Informações da Equipe
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Company ID</label>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 border text-sm" style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-surface-border)' }}>
              <span className="text-gray-300">{COMPANY_ID}</span>
              <span className="ml-auto text-[10px] text-gray-600 uppercase tracking-widest">Somente leitura</span>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Ambiente</label>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 border text-sm" style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-surface-border)' }}>
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />
              <span className="text-amber-300">HOMOLOG</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Danger actions */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Ações Administrativas</p>
        <div className="space-y-3">
          {acoes.map((acao, i) => (
            <motion.div
              key={acao.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={`rounded-xl border p-4 ${acao.cor}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{acao.icone}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{acao.titulo}</p>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{acao.descricao}</p>
                </div>
                <button
                  onClick={() => setConfirmReset(acao.id)}
                  className={`shrink-0 mt-0.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${acao.botaoCor}`}
                >
                  Executar
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {confirmReset !== null && (
          <ConfirmModal
            title={acoes.find(a => a.id === confirmReset)?.titulo ?? 'Confirmar ação'}
            message={`${acoes.find(a => a.id === confirmReset)?.descricao ?? ''} Esta funcionalidade requer implementação no backend.`}
            onConfirm={() => { setConfirmReset(null); addToast('Ação administrativa: backend em breve!', 'info') }}
            onCancel={() => setConfirmReset(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Registros({ jogadores }: Props) {
  const { addToast } = useOutletContext<OutletToastCtx>()
  const [activeTab, setActiveTab] = useState<TabId>('usuarios')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.1))', border: '1px solid rgba(245,158,11,0.3)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Painel Admin</h2>
          <p className="text-gray-500 text-sm">Gerencie usuários, partidas e configurações da equipe</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="relative flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--color-surface-card)', border: '1px solid var(--color-surface-border)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer z-10 min-w-0"
              style={{ color: isActive ? '#fff' : 'var(--color-brand-silver)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(245,158,11,0.1))', border: '1px solid rgba(245,158,11,0.3)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline truncate">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {activeTab === 'usuarios'      && <TabUsuarios    jogadores={jogadores} addToast={addToast} />}
          {activeTab === 'partidas'      && <TabPartidas    jogadores={jogadores} addToast={addToast} />}
          {activeTab === 'jogadores'     && <TabJogadores   jogadores={jogadores} addToast={addToast} />}
          {activeTab === 'configuracoes' && <TabConfiguracoes addToast={addToast} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
