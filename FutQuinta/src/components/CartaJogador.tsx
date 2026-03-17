//import iconJogador from "../assets/iconCauan.png"
import cardPlayer from "../assets/cardPlayer.png"

// Reutilizamos a tua interface existente
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

interface CartaProps {
    jogador: Jogador;

    notaGeral: number; // A nota que calculámos anteriormente
}

export default function CartaJogador({ jogador, notaGeral }: CartaProps) {
    return (
        <div className="w-[350px] h-[500px] relative text-white font-sans uppercase">
            
            {/* 1. Fundo da Carta (z-10) */}
            <div className="bg-cover z-10 w-full h-full absolute top-0 left-0" style={{ backgroundImage: `url(${cardPlayer})` }}></div>
            
            {/* 2. Barra de Status Lateral (z-30 para ficar acima do jogador) */}
            <div className="flex flex-col items-center absolute top-[60px] left-[80px] w-[70px] h-[200px] text-center z-30">
                <span className="text-[3rem] font-medium mt-[20px] text-shadow-[3px_3px_5px_rgb(0_0_0/_1)]">{notaGeral}</span>
                <span className="text-[1.5rem] -mt-[15px] text-shadow-[3px_3px_2px_rgb(0_0_0/_1)]">
                    {jogador.posicao === "Goleiro" ? "GK" : "ST"}
                </span>
                
                {/* Posição badge */}
                <span className="text-[0.65rem] font-bold mt-2 text-cyan-300 uppercase tracking-widest">
                    {jogador.posicao === "Goleiro" ? "Goleiro" : "Linha"}
                </span>
            </div>

            {/* 3. Foto do Jogador (z-20) */}
            <div className="w-[214px] h-[200px] absolute top-[80px] right-[20px] z-20 bg-contain bg-no-repeat bg-center" style={{ backgroundImage: `url(${jogador.fotoUrl? jogador.fotoUrl : 'https://res.cloudinary.com/dk9fhp8d8/image/upload/w_453,h_594,c_fill/iconJogador_g2wkq9.png'})` }}></div>

            {/* 4. Detalhes: Nome e Atributos (z-30) */}
            <div className="flex flex-col gap-4 flex-nowrap justify-center items-center w-[260px] h-[180px] absolute bottom-[60px] left-[50px] z-30">
                
                {/* Nome do Jogador */}
                <h2 className="text-[1.2rem] font-bold drop-shadow-[2px_2px_2px_rgba(0,0,0,1)]">
                    <span className="inline-block w-full border-b-2 border-[#24ccff] pb-1 px-4">
                        {jogador.nome}
                    </span>
                </h2>
                
                {/* Grid de Atributos */}
                <div className="flex justify-center w-full mt-[25px]">
                    
                    {/* Coluna 1 */}
                    <div className="w-[45%] h-[80px] -mt-[40px] border-r border-[#24ccff] flex flex-col items-center">
                        <p className="text-[1.2rem] m-0"><span className="font-bold">{jogador.atributos?.pace ?? 0}</span> PAC</p>
                        <p className="text-[1.2rem] m-0"><span className="font-bold">{jogador.atributos?.shot ?? 0}</span> SHO</p>
                        <p className="text-[1.2rem] m-0"><span className="font-bold">{jogador.atributos?.pass ?? 0}</span> PAS</p>
                    </div>

                    {/* Coluna 2 */}
                    <div className="w-[45%] h-[80px] -mt-[40px] flex flex-col items-center">
                        <p className="text-[1.2rem] m-0"><span className="font-bold">{jogador.atributos?.attack ?? 0}</span> DRI</p>
                        <p className="text-[1.2rem] m-0"><span className="font-bold">{jogador.atributos?.defense ?? 0}</span> DEF</p>
                        <p className="text-[1.2rem] m-0"><span className="font-bold">{jogador.atributos?.physical ?? 0}</span> PHY</p>
                    </div>
                </div>
            </div>
        </div>
    );
}