import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from '../components/AuthContext';
import '../App.css';



const API_URL = import.meta.env.VITE_API_URL;
const COMPANY_ID = Number(import.meta.env.VITE_COMPANY_ID ?? 1);

interface LoginFormData {
    email: string;
    senha: string;
}

interface CadastroFormData {
    nome: string;
    email: string;
    senha: string;
    confirmarSenha: string;
}

export default function Login() {
    const navigate = useNavigate();
    const { login, entrarComoVisitante } = useContext(AuthContext);

    const [formData, setFormData] = useState<LoginFormData>({ email: '', senha: '' });
    const [loading, setLoading] = useState(false);
    const [showSenha, setShowSenha] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null)

    const [showCadastro, setShowCadastro] = useState(false);
    const [cadastroData, setCadastroData] = useState<CadastroFormData>({ nome: '', email: '', senha: '', confirmarSenha: '' });
    const [showCadastroSenha, setShowCadastroSenha] = useState(false);
    const [loadingCadastro, setLoadingCadastro] = useState(false);
    const [erroCadastro, setErroCadastro] = useState<string | null>(null);
    const [emailJaCadastrado, setEmailJaCadastrado] = useState(false);

    useEffect(() => {
        const token = Cookies.get('token_acesso');
        if (token) {
            navigate('/home', { replace: true });
        }
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setErro(null);
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCadastroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setErroCadastro(null);
        setCadastroData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErro(null);

        try {
            const res = await fetch(`${API_URL}/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const token = await res.text();
                login(token);
                navigate('/home', { replace: true });
            } else {
                const errorData = await res.text();
                if (res.status === 404) {
                    setErro('Email não encontrado. Deseja criar uma conta?');
                } else if (res.status === 401) {
                    setErro('Senha incorreta.');
                } else {
                    setErro(errorData || 'Erro ao fazer login.');
                }
            }
        } catch (err) {
            console.error(err);
            setErro('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCadastroSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErroCadastro(null);

        if (cadastroData.senha !== cadastroData.confirmarSenha) {
            setErroCadastro('As senhas não coincidem.');
            return;
        }
        if (cadastroData.senha.length < 6) {
            setErroCadastro('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setLoadingCadastro(true);
        try {
            const res = await fetch(`${API_URL}/usuarios/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: cadastroData.nome,
                    email: cadastroData.email,
                    senha: cadastroData.senha,
                    companyId: COMPANY_ID,
                }),
            });

            if (res.ok) {
                setFormData({ email: cadastroData.email, senha: cadastroData.senha });
                fecharCadastro();
                setSuccess('Usuário cadastrado com sucesso!');
                setTimeout(() => setSuccess(null), 4000);
            } else {
                const errorData = await res.text();
                setErroCadastro(errorData || 'Erro ao criar conta.');
            }
        } catch (err) {
            console.error(err);
            setErroCadastro('Erro de conexão. Tente novamente.');
        } finally {
            setLoadingCadastro(false);
        }
    };

    const verificarEmailCadastro = async () => {
        if (!cadastroData.email) return;
        const res = await fetch(`${API_URL}/usuarios/verificar-email?email=${encodeURIComponent(cadastroData.email)}`);
        setEmailJaCadastrado(res.status === 409);
    };

    const fecharCadastro = () => {
        setShowCadastro(false);
        setCadastroData({ nome: '', email: '', senha: '', confirmarSenha: '' });
        setErroCadastro(null);
        setShowCadastroSenha(false);
        setEmailJaCadastrado(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">FutQuinta</h1>
                    <p className="text-gray-400">Gerencie seus times e partidas</p>
                </div>

                {/* Login Card */}
                <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 ring-1 ring-white/5">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Login</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu.email@exemplo.com"
                                required
                                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showSenha ? 'text' : 'password'}
                                    id="password"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowSenha(!showSenha)}
                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300 transition-colors"
                                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {showSenha ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Inline error banner */}
                        {erro && (
                            <div className="flex items-center gap-2 bg-red-900/40 border border-red-500/50 rounded-lg px-4 py-3">
                                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <p className="text-red-400 text-sm">{erro}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl tracking-wide shadow-lg transition-colors cursor-pointer"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <span className="spinner"></span>
                                    Entrando...
                                </div>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-600"></div>
                        <span className="px-3 text-gray-500 text-sm">ou</span>
                        <div className="flex-1 border-t border-gray-600"></div>
                    </div>

                    {/* Criar conta */}
                    <button
                        type="button"
                        onClick={() => setShowCadastro(true)}
                        className="w-full bg-transparent border border-gray-600 hover:border-cyan-500/60 hover:text-cyan-400 text-gray-300 font-semibold py-3 px-4 rounded-xl tracking-wide transition-colors cursor-pointer"
                    >
                        Criar uma conta
                    </button>
                </div>

                {/* Success banner */}
                {success && (
                    <div className="flex items-center gap-2 bg-green-900/40 border border-green-500/50 rounded-lg px-4 py-3 mt-4">
                        <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-400 text-sm">{success}</p>
                    </div>
                )}

                {/* Continuar sem login */}
                <div className="text-center mt-4">
                    <button
                        type="button"
                        onClick={() => { entrarComoVisitante(); navigate('/home', { replace: true }); }}
                        className="text-gray-500 hover:text-gray-300 text-sm underline transition-colors"
                    >
                        Continuar sem login
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-8">
                    © {new Date().getFullYear()} FutQuinta. Todos os direitos reservados.
                </p>
            </div>
            {/* Modal Criar Conta */}
            {showCadastro && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 z-50">
                    <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700 ring-1 ring-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Criar conta</h2>
                            <button
                                type="button"
                                onClick={fecharCadastro}
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                                aria-label="Fechar"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCadastroSubmit} className="space-y-4" autoComplete="off">
                            {/* Nome */}
                            <div>
                                <label htmlFor="cadastro-nome" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                                    Nome completo
                                </label>
                                <input
                                    type="text"
                                    id="cadastro-nome"
                                    name="nome"
                                    value={cadastroData.nome}
                                    onChange={handleCadastroChange}
                                    placeholder="Seu nome"
                                    required
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="cadastro-email" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="cadastro-email"
                                    name="email"
                                    value={cadastroData.email}
                                    onChange={e => { setEmailJaCadastrado(false); handleCadastroChange(e); }}
                                    onBlur={verificarEmailCadastro}
                                    placeholder="seu.email@exemplo.com"
                                    required
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
                                />
                                {emailJaCadastrado && (
                                    <p className="text-red-400 text-sm mt-1">Este email já está cadastrado.</p>
                                )}
                            </div>

                            {/* Senha */}
                            <div>
                                <label htmlFor="cadastro-senha" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                                    Senha
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCadastroSenha ? 'text' : 'password'}
                                        id="cadastro-senha"
                                        name="senha"
                                        value={cadastroData.senha}
                                        onChange={handleCadastroChange}
                                        placeholder="Mínimo 6 caracteres"
                                        required
                                        autoComplete="new-password"
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCadastroSenha(!showCadastroSenha)}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-300 transition-colors"
                                        aria-label={showCadastroSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                    >
                                        {showCadastroSenha ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Confirmar Senha */}
                            <div>
                                <label htmlFor="cadastro-confirmar" className="block text-sm font-medium text-gray-300 mb-2 tracking-wide">
                                    Confirmar senha
                                </label>
                                <input
                                    type={showCadastroSenha ? 'text' : 'password'}
                                    id="cadastro-confirmar"
                                    name="confirmarSenha"
                                    value={cadastroData.confirmarSenha}
                                    onChange={handleCadastroChange}
                                    placeholder="Repita a senha"
                                    required
                                    autoComplete="new-password"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-colors"
                                />
                            </div>

                            {/* Erro cadastro */}
                            {erroCadastro && (
                                <div className="flex items-center gap-2 bg-red-900/40 border border-red-500/50 rounded-lg px-4 py-3">
                                    <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    <p className="text-red-400 text-sm">{erroCadastro}</p>
                                </div>
                            )}
                            

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={fecharCadastro}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 px-4 rounded-xl transition-colors cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loadingCadastro || emailJaCadastrado}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl tracking-wide shadow-lg transition-colors cursor-pointer"
                                >
                                    {loadingCadastro ? (
                                        <div className="flex items-center justify-center">
                                            <span className="spinner"></span>
                                            Criando...
                                        </div>
                                    ) : (
                                        'Criar conta'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
