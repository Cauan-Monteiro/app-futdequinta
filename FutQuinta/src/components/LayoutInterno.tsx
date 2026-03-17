import { NavLink, Outlet } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
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

export function LayoutInterno() {
  const { equipeAtiva, setEquipeAtiva, permissoesGlobais, isGuest } = useContext(AuthContext);
  const [times, setTimes] = useState<any[]>([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [confirmandoLogout, setConfirmandoLogout] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  const reloadPage = () => {
    window.location.reload();
  };

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
            headers: {
              'Authorization': `Bearer ${Cookies.get('token_acesso')}`
            }
          }).then(res => res.json())
        );

        const dadosDosTimes = await Promise.all(promessas);
        setTimes(dadosDosTimes.filter(Boolean));
      } catch (error) {
        console.error("Erro ao buscar detalhes dos times:", error);
      }
    };

    buscarTimes();
  }, [permissoesGlobais]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'text-white border-b-2 border-cyan-500 pb-1 font-semibold transition-colors'
      : 'text-gray-300 hover:text-white transition-colors';

  return (
    <div className="min-h-screen bg-gray-900">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <nav className="bg-gray-800 border-b border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="absolute left-4">
            {isGuest ? (
              <span className="text-gray-400 text-sm px-4 py-2">Visitante</span>
            ) : (
              <>
                <button
                  onClick={() => setMenuAberto(!menuAberto)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg hover:bg-blue-600 focus:outline-none transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  <span>
                    {equipeAtiva ? times.find(t => t?.id?.toString() === equipeAtiva.id)?.nome || "Carregando..." : ""}
                  </span>
                </button>

                {menuAberto && (
                  <div className="absolute left-0 mt-2 w-48 sm:w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 overflow-hidden">
                    {times.map((time) => (
                      <button
                        key={time.id}
                        onClick={() => mudarEquipe(time.id.toString())}
                        className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"
                      >
                        {time.nome}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="absolute right-4 flex items-center gap-2">
            {confirmandoLogout ? (
              <>
                <span className="text-gray-300 text-sm">Tem certeza?</span>
                <button
                  onClick={confirmarLogout}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setConfirmandoLogout(false)}
                  className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirmandoLogout(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 cursor-pointer shadow-md active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 shrink-0"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
                <span>Sair</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-8 justify-center items-center">
            <div className="flex flex-col items-center space-y-2">
              <img src={logo} alt="FutQuinta Logo" className="h-full w-48 sm:w-80 object-cover cursor-pointer" onClick={reloadPage} />
              <h1 className="text-4xl font-thin text-white">{TITLE}</h1>
            </div>
            <div className="flex flex-row gap-6 sm:gap-12 w-full h-full justify-center">
              <NavLink to="/home" className={navLinkClass}>Home</NavLink>
              <NavLink to="/ranking" className={navLinkClass}>Ranking</NavLink>
              {!isGuest && (
                <NavLink to="/sorteio" className={navLinkClass}>
                  <span className="sm:hidden">Sorteio</span>
                  <span className="hidden sm:inline">Sorteador Times</span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ addToast } satisfies OutletToastCtx} />
      </div>
    </div>
  );
}
