import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// 1. Criamos o Molde
interface EquipeAtiva {
  id: string;
  role: string;
}

// 2. Criamos a "caixa" (o Contexto em si)
export const AuthContext = createContext<any>(null);

// 3. Criamos o Provedor que vai abraçar a aplicação
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [equipeAtiva, setEquipeAtiva] = useState<EquipeAtiva | null>(null);
  const [permissoesGlobais, setPermissoesGlobais] = useState<Record<string, string>>({});
  const [idJogador, setIdJogador] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  function aplicarToken(token: string) {
    const tokenData = jwtDecode<{ permissoes: Record<string, string>; idJogador?: number }>(token);
    const primeiroId = Object.keys(tokenData.permissoes)[0];
    if (primeiroId) {
      setEquipeAtiva({ id: primeiroId, role: tokenData.permissoes[primeiroId] });
      setPermissoesGlobais(tokenData.permissoes);
    }
    setIdJogador(tokenData.idJogador ?? null);
  }

  function login(token: string) {
    Cookies.set('token_acesso', token);
    aplicarToken(token);
  }

  function entrarComoVisitante() {
    setIsGuest(true);
    setEquipeAtiva({ id: 'visitante', role: 'VISITANTE' });
  }

  useEffect(() => {
    const token = Cookies.get('token_acesso');
    if (token) aplicarToken(token);
  }, []);

  return (
    <AuthContext.Provider value={{equipeAtiva, setEquipeAtiva, permissoesGlobais, idJogador, login, isGuest, entrarComoVisitante}}>
      {children}
    </AuthContext.Provider>
  );
}