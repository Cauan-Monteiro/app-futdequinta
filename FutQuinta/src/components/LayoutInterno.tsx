import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import logo from '../assets/futebol de quinta_nova_bg.png';
import Cookies from 'js-cookie';
import { AuthContext } from './AuthContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from './ToastContainer';
import type { ToastType } from '../hooks/useToast';

const TITLE = import.meta.env.VITE_TITULO_MAIN;
const API_URL = import.meta.env.VITE_API_URL;

export type OutletToastCtx = {
  addToast: (message: string, type?: ToastType) => void;
};

// ── Nav links config ──────────────────────────────────────────────────────────

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.26 9.71 2 12 2c2.291 0 4.545.26 6.75.721v1.515m0 0c.982.143 1.954.317 2.916.52a6.003 6.003 0 01-5.395 4.972M18.75 4.236V4.5a6.75 6.75 0 01-2.48 5.228" />
    </svg>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function AdminIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

// ── Main Layout ───────────────────────────────────────────────────────────────

export function LayoutInterno() {
  const { equipeAtiva, setEquipeAtiva, permissoesGlobais, isGuest } = useContext(AuthContext);
  const [times, setTimes] = useState<any[]>([]);
  const [menuAberto, setMenuAberto] = useState(false);       // team switcher dropdown
  const [drawerAberto, setDrawerAberto] = useState(false);   // mobile drawer
  const [confirmandoLogout, setConfirmandoLogout] = useState(false);
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);

  const { toasts, addToast, removeToast } = useToast();

  // Close drawer on route change
  useEffect(() => { setDrawerAberto(false); }, [location.pathname]);

  // Close team dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const mudarEquipe = (idTime: string) => {
    setEquipeAtiva({ id: idTime, role: permissoesGlobais[idTime] });
    setMenuAberto(false);
  };

  const confirmarLogout = () => {
    Cookies.remove('token_acesso');
    setEquipeAtiva(null);
    window.location.href = '/';
  };

  useEffect(() => {
    const buscarTimes = async () => {
      const ids = Object.keys(permissoesGlobais);
      if (ids.length === 0) return;
      try {
        const promessas = ids.map(id =>
          fetch(`${API_URL}/company/${id}`, {
            headers: { 'Authorization': `Bearer ${Cookies.get('token_acesso')}` }
          }).then(res => res.json())
        );
        const dados = await Promise.all(promessas);
        setTimes(dados.filter(Boolean));
      } catch (e) { console.error(e); }
    };
    buscarTimes();
  }, [permissoesGlobais]);

  const nomeEquipe = equipeAtiva
    ? times.find(t => t?.id?.toString() === equipeAtiva.id)?.nome ?? '...'
    : '';

  const isAdmin = equipeAtiva?.role === 'ADMIN';

  // Nav links definition
  const navLinks = [
    { to: '/home',      label: 'Home',      icon: HomeIcon,    show: true },
    { to: '/ranking',   label: 'Ranking',   icon: TrophyIcon,  show: true },
    { to: '/sorteio',   label: 'Sorteio',   icon: ShuffleIcon, show: !isGuest },
    { to: '/registros', label: 'Admin',     icon: AdminIcon,   show: isAdmin },
  ];

  // Active link style (desktop underline)
  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-1.5 py-1 text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-white' : 'text-gray-400 hover:text-white'
    }`;

  // Active link style (mobile drawer)
  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'text-white'
        : 'text-gray-400 hover:text-white'
    }`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface-base)' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── Sticky Nav ──────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ backgroundColor: 'rgba(35,41,56,0.96)', borderBottomColor: 'var(--color-surface-border)' }}
      >
        {/* Rainbow strip */}
        <div className="h-0.5 w-full absolute top-0 left-0 bg-gradient-to-r from-[var(--color-brand-pitch)] via-[var(--color-brand-score)] to-[var(--color-brand-pitch)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Top row: controls + logo + logout ─────────────────────────── */}
          <div className="flex items-center justify-between h-14">

            {/* LEFT — team switcher (desktop) / hamburger (mobile) */}
            <div className="flex items-center gap-2">

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setDrawerAberto(v => !v)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border transition-colors"
                style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-surface-border)' }}
                aria-label="Menu"
              >
                <motion.div
                  animate={{ rotate: drawerAberto ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4 flex flex-col justify-center gap-[5px]"
                >
                  <motion.span
                    animate={drawerAberto ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block h-0.5 w-4 bg-white rounded-full origin-center"
                  />
                  <motion.span
                    animate={{ opacity: drawerAberto ? 0 : 1, scaleX: drawerAberto ? 0 : 1 }}
                    transition={{ duration: 0.15 }}
                    className="block h-0.5 w-4 bg-white rounded-full"
                  />
                  <motion.span
                    animate={drawerAberto ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block h-0.5 w-4 bg-white rounded-full origin-center"
                  />
                </motion.div>
              </button>

              {/* Team switcher — desktop only */}
              {!isGuest && (
                <div className="hidden lg:block relative" ref={drawerRef}>
                  <button
                    onClick={() => setMenuAberto(v => !v)}
                    className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-lg border text-sm text-white transition-all duration-150 hover:border-[var(--color-brand-score)]/50 hover:text-[var(--color-brand-score)]"
                    style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-surface-border)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span className="max-w-[120px] truncate">{nomeEquipe || 'Equipe'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${menuAberto ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {menuAberto && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-1.5 min-w-[160px] rounded-xl border shadow-xl overflow-hidden"
                        style={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
                      >
                        {times.map(time => (
                          <button
                            key={time.id}
                            onClick={() => mudarEquipe(time.id.toString())}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b last:border-0 flex items-center gap-2 ${
                              time.id.toString() === equipeAtiva?.id
                                ? 'text-[var(--color-brand-score)]'
                                : 'text-gray-200 hover:bg-[var(--color-surface-raised)]'
                            }`}
                            style={{ borderBottomColor: 'var(--color-surface-border)' }}
                          >
                            {time.id.toString() === equipeAtiva?.id && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-score)] shrink-0" />
                            )}
                            {time.nome}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {isGuest && (
                <span className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 border border-gray-700 rounded-lg px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  Visitante
                </span>
              )}
            </div>

            {/* CENTER — Logo + Title */}
            <button
              onClick={() => window.location.reload()}
              className="flex flex-col items-center gap-0.5 cursor-pointer group absolute left-1/2 -translate-x-1/2"
            >
              <img
                src={logo}
                alt="FutQuinta"
                className="h-8 w-auto object-contain group-hover:opacity-90 transition-opacity"
              />
              <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase leading-none hidden sm:block">
                {TITLE?.replace(/[⚽🍻]/g, '').trim()}
              </span>
            </button>

            {/* RIGHT — Logout */}
            <div className="flex items-center">
              <AnimatePresence mode="wait">
                {confirmandoLogout ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-gray-400 text-xs hidden sm:block">Tem certeza?</span>
                    <button
                      onClick={confirmarLogout}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Sair
                    </button>
                    <button
                      onClick={() => setConfirmandoLogout(false)}
                      className="px-3 py-1.5 text-gray-400 hover:text-white text-xs font-semibold rounded-lg border transition-colors"
                      style={{ borderColor: 'var(--color-surface-border)', backgroundColor: 'var(--color-surface-raised)' }}
                    >
                      Cancelar
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="logout"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setConfirmandoLogout(true)}
                    title="Sair"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-red-400 hover:bg-red-600/10 hover:border-red-500/50 transition-all duration-150 cursor-pointer active:scale-95"
                    style={{ borderColor: 'rgba(239,68,68,0.3)' }}
                  >
                    <LogoutIcon className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:block">Sair</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Bottom row: nav links (desktop only) ──────────────────────── */}
          <div className="hidden lg:flex items-center justify-center gap-1 pb-2">
            {navLinks.filter(l => l.show).map(link => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 -mx-3 rounded-lg"
                          style={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-border)' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                      )}
                      <span className="relative flex items-center gap-1.5 px-3">
                        <Icon className="w-3.5 h-3.5" />
                        {link.label}
                        {link.to === '/registros' && (
                          <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        )}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {drawerAberto && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setDrawerAberto(false)}
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-40 lg:hidden flex flex-col"
              style={{ backgroundColor: 'var(--color-surface-card)', borderRight: '1px solid var(--color-surface-border)' }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderBottomColor: 'var(--color-surface-border)' }}>
                <img src={logo} alt="FutQuinta" className="h-8 w-auto object-contain" />
                <button
                  onClick={() => setDrawerAberto(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Equipe info */}
              {!isGuest && nomeEquipe && (
                <div className="px-5 py-3 border-b" style={{ borderBottomColor: 'var(--color-surface-border)' }}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Equipe ativa</p>
                  <div className="flex items-center gap-2 rounded-lg px-3 py-2 border" style={{ backgroundColor: 'var(--color-surface-raised)', borderColor: 'var(--color-surface-border)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    <span className="text-white text-sm font-medium truncate">{nomeEquipe}</span>
                    {isAdmin && (
                      <span className="ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">Admin</span>
                    )}
                  </div>

                  {/* Team switching if multiple teams */}
                  {times.length > 1 && (
                    <div className="mt-2 space-y-1">
                      {times.filter(t => t.id.toString() !== equipeAtiva?.id).map(time => (
                        <button
                          key={time.id}
                          onClick={() => { mudarEquipe(time.id.toString()); setDrawerAberto(false); }}
                          className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        >
                          Trocar para {time.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isGuest && (
                <div className="px-5 py-3 border-b" style={{ borderBottomColor: 'var(--color-surface-border)' }}>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                    Modo visitante
                  </span>
                </div>
              )}

              {/* Nav links */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navLinks.filter(l => l.show).map(link => {
                  const Icon = link.icon;
                  return (
                    <NavLink key={link.to} to={link.to} className={mobileLinkClass}>
                      {({ isActive }) => (
                        <div className={`flex items-center gap-3 w-full rounded-xl px-3 py-3 transition-all ${
                          isActive
                            ? 'text-white'
                            : 'text-gray-400'
                        }`}
                          style={isActive ? { backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-border)' } : {}}
                        >
                          <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[var(--color-brand-score)]' : ''}`} />
                          <span className="font-medium">{link.label}</span>
                          {link.to === '/registros' && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-amber-400" />
                          )}
                          {isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-brand-score)]" />
                          )}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Drawer footer — logout */}
              <div className="px-5 py-4 border-t" style={{ borderTopColor: 'var(--color-surface-border)' }}>
                {confirmandoLogout ? (
                  <div className="space-y-2">
                    <p className="text-gray-400 text-xs text-center">Deseja mesmo sair?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmandoLogout(false)}
                        className="flex-1 py-2 rounded-lg text-sm text-gray-300 border transition-colors"
                        style={{ borderColor: 'var(--color-surface-border)', backgroundColor: 'var(--color-surface-raised)' }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmarLogout}
                        className="flex-1 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700 font-semibold transition-colors"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmandoLogout(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-all duration-150 text-sm font-medium"
                    style={{ borderColor: 'rgba(239,68,68,0.25)' }}
                  >
                    <LogoutIcon className="w-4 h-4" />
                    Sair da conta
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Page content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Outlet context={{ addToast } satisfies OutletToastCtx} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
