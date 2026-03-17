import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Cookies from 'js-cookie'

// Importando as Telas
import Login from './routes/Login'
import Home from './routes/Home'
import Ranking from './routes/Ranking'
import Sorteio from './routes/Sorteio'

// Importando a Estrutura
import { RotaProtegida } from './components/RotaProtegida'
import { LayoutInterno } from './components/LayoutInterno'

import './App.css'

const API_URL = import.meta.env.VITE_API_URL

export interface Jogador {
  id: number
  nome: string
  posicao: "Goleiro" | "Linha"
  pontos: number
  partidas: number
  vitorias: number
  empates: number
  derrotas: number
  fotoUrl: string
  atributos: {
    attack: number
    defense: number
    shot: number
    pass: number
    physical: number
    pace: number
  } | null
}

function App() {
  const [jogadores, setJogadores] = useState<Jogador[]>([])
  const [carregandoJogadores, setCarregandoJogadores] = useState(false)

  async function carregarJogadores() {
    setCarregandoJogadores(true)
    try {
      const res = await fetch(`${API_URL}/jogadores`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('token_acesso')}`
            }
           });
      if (!res.ok) throw new Error('Erro ao buscar jogadores');
      const data: Jogador[] = await res.json();
      setJogadores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregandoJogadores(false)
    }
  }

  useEffect(() => {
    carregarJogadores();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route element={
        <RotaProtegida allowGuest>
          <LayoutInterno />
        </RotaProtegida>
      }>
        <Route path="/home" element={<Home jogadores={jogadores} carregarJogadores={carregarJogadores} />} />
        <Route path="/ranking" element={<Ranking jogadores={jogadores} carregando={carregandoJogadores} />} />
        <Route path="/sorteio" element={
          <RotaProtegida>
            <Sorteio jogadores={jogadores} />
          </RotaProtegida>
        } />
      </Route>
    </Routes>
  )
}

export default App
