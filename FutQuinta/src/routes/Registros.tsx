import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { useOutletContext } from 'react-router-dom'
import type { OutletToastCtx } from '../components/LayoutInterno'
import type { Jogador } from '../App'

const API_URL = import.meta.env.VITE_API_URL
const COMPANY_ID = Number(import.meta.env.VITE_COMPANY_ID)

interface UsuarioItem {
  id: number
  nome: string
  email: string
  idJogador: { id: number; nome: string } | null
  memberships: Array<{ id: number; role: string; time: { id: number } }>
}

interface Props {
  jogadores: Jogador[]
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin',
  JOGADOR: 'Jogador',
  VISITANTE: 'Visitante',
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'text-amber-400',
  JOGADOR: 'text-cyan-400',
  VISITANTE: 'text-gray-400',
}

export default function Registros({ jogadores }: Props) {
  const { addToast } = useOutletContext<OutletToastCtx>()
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([])
  const [selecionado, setSelecionado] = useState<Record<number, number | ''>>({})
  const [rolesSelecionada, setRolesSelecionada] = useState<Record<number, string>>({})
  const [salvando, setSalvando] = useState<Record<number, boolean>>({})

  useEffect(() => {
    const token = Cookies.get('token_acesso')
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
  }, [])

  async function salvar(usuarioId: number) {
    setSalvando(prev => ({ ...prev, [usuarioId]: true }))
    try {
      const responses = await Promise.all([
        fetch(`${API_URL}/usuarios/${usuarioId}/vincular-jogador`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('token_acesso')}`,
          },
          body: JSON.stringify({ jogadorId: selecionado[usuarioId] === '' ? null : selecionado[usuarioId] }),
        }),
        fetch(`${API_URL}/usuarios/${usuarioId}/alterar-role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Cookies.get('token_acesso')}`,
          },
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

  const selectClass =
    'w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 touch-manipulation min-h-[44px] cursor-pointer'

  const saveButtonClass =
    'w-full min-h-[44px] px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors touch-manipulation cursor-pointer'

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Registros de Usuários</h2>

      {/* ── Mobile: card list (hidden on md+) ── */}
      <div className="md:hidden space-y-3">
        {usuarios.length === 0 && (
          <p className="text-center text-gray-500 py-10">Nenhum usuário encontrado.</p>
        )}
        {usuarios.map(u => (
          <div
            key={u.id}
            className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white font-semibold truncate">{u.nome}</p>
                <p className="text-gray-400 text-xs truncate mt-0.5">{u.email}</p>
              </div>
              <span className={`text-xs font-bold uppercase shrink-0 ${ROLE_COLOR[rolesSelecionada[u.id] ?? 'JOGADOR']}`}>
                {ROLE_LABEL[rolesSelecionada[u.id] ?? 'JOGADOR']}
              </span>
            </div>

            {/* Role select */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
                Role
              </label>
              <select
                value={rolesSelecionada[u.id] ?? 'JOGADOR'}
                onChange={e => setRolesSelecionada(prev => ({ ...prev, [u.id]: e.target.value }))}
                className={selectClass}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="JOGADOR">JOGADOR</option>
                <option value="VISITANTE">VISITANTE</option>
              </select>
            </div>

            {/* Jogador select */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
                Jogador vinculado
              </label>
              <select
                value={selecionado[u.id] ?? ''}
                onChange={e => setSelecionado(prev => ({
                  ...prev,
                  [u.id]: e.target.value === '' ? '' : Number(e.target.value),
                }))}
                className={selectClass}
              >
                <option value="">— Sem vínculo —</option>
                {jogadores.map(j => (
                  <option key={j.id} value={j.id}>{j.nome}</option>
                ))}
              </select>
            </div>

            {/* Save button */}
            <button
              onClick={() => salvar(u.id)}
              disabled={salvando[u.id]}
              className={saveButtonClass}
            >
              {salvando[u.id] ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        ))}
      </div>

      {/* ── Desktop: table (hidden on mobile) ── */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Jogador vinculado</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {usuarios.map(u => (
              <tr key={u.id} className="bg-gray-900 hover:bg-gray-800 transition-colors">
                <td className="px-4 py-3 text-gray-300">{u.email}</td>
                <td className="px-4 py-3 text-white font-medium">{u.nome}</td>
                <td className="px-4 py-3">
                  <select
                    value={rolesSelecionada[u.id] ?? 'JOGADOR'}
                    onChange={e => setRolesSelecionada(prev => ({ ...prev, [u.id]: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="JOGADOR">JOGADOR</option>
                    <option value="VISITANTE">VISITANTE</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={selecionado[u.id] ?? ''}
                    onChange={e => setSelecionado(prev => ({
                      ...prev,
                      [u.id]: e.target.value === '' ? '' : Number(e.target.value),
                    }))}
                    className="bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="">— Sem vínculo —</option>
                    {jogadores.map(j => (
                      <option key={j.id} value={j.id}>{j.nome}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => salvar(u.id)}
                    disabled={salvando[u.id]}
                    className="px-3 py-1.5 min-h-[36px] bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    {salvando[u.id] ? '...' : 'Salvar'}
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
