import { type ReactNode, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from './AuthContext';

export function RotaProtegida({ children, allowGuest = false }: { children: ReactNode, allowGuest?: boolean }) {
  useLocation();
  const { isGuest } = useContext(AuthContext);
  const token = Cookies.get('token_acesso');

  if (!token && !isGuest) {
    return <Navigate to="/" state={{ aviso: "Você precisa fazer login para acessar." }} replace />;
  }

  if (isGuest && !allowGuest) {
    return <Navigate to="/home" replace />;
  }

  return children;
}