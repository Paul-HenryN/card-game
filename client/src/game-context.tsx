import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Message } from "../../shared/entities/websocket";
import { Card } from "../../shared/entities/game";

export type Board = {
  player: Card[];
  opponent: Card[];
};

export type PlayMode = "normal" | "attack" | "heal" | "destroy";

type GameContextType = {
  ws: WebSocket | null;
  startGame: (multi?: boolean) => void;
  playerHand: Card[];
  setPlayerHand: Dispatch<SetStateAction<Card[] | null>>;
  playerDeckLength: number;
  setPlayerDeckLength: Dispatch<SetStateAction<number>>;
  opponentHandLength: number;
  setOpponentHandLength: Dispatch<SetStateAction<number>>;
  opponentDeckLength: number;
  setOpponentDeckLength: Dispatch<SetStateAction<number>>;
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
  isPlayerTurn: boolean;
  setPlayerTurn: (isPlayerTurn: boolean) => void;
  playMode: PlayMode;
  setPlayMode: (playMode: PlayMode) => void;
  sendMessage: (msg: Message) => void;
  addMessageListener: (type: string, callback: (msg: Message) => void) => void;
};

const GameContext = createContext<GameContextType>({
  ws: null,
  startGame: () => {},
  playerHand: [],
  setPlayerHand: () => {},
  playerDeckLength: 0,
  setPlayerDeckLength: () => {},
  opponentHandLength: 0,
  setOpponentHandLength: () => {},
  opponentDeckLength: 0,
  setOpponentDeckLength: () => {},
  board: { player: [], opponent: [] },
  setBoard: () => {},
  isPlayerTurn: false,
  setPlayerTurn: () => {},
  playMode: "normal",
  setPlayMode: () => {},
  sendMessage: () => {},
  addMessageListener: () => {},
});

export function GameContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[] | null>(null);
  const [opponentHandLength, setOpponentHandLength] = useState<number>(5);
  const [playerDeckLength, setPlayerDeckLength] = useState<number>(10);
  const [opponentDeckLength, setOpponentDeckLength] = useState<number>(10);
  const [board, setBoard] = useState<Board>({ player: [], opponent: [] });
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>("normal");

  const startGame = useCallback(
    (multi: boolean = false) => {
      const ws = new WebSocket(
        `ws://localhost:8080?playerId=${playerId}&multiPlayer=${multi}`
      );

      setWs(ws);
    },
    [playerId]
  );

  const sendMessage = useCallback(
    (msg: Message) => {
      if (!ws || ws.readyState != WebSocket.OPEN) return;
      ws.send(JSON.stringify(msg));
    },
    [ws]
  );

  const addMessageListener = (
    type: string,
    callback: (msg: Message) => void
  ) => {
    if (!ws) return;

    ws.addEventListener("message", (e) => {
      const payload = JSON.parse(e.data) as Message;

      if (payload.type === type) {
        callback(payload);
      }
    });
  };

  useEffect(() => {
    const storedPlayerId = localStorage.getItem("playerId");

    if (!storedPlayerId) {
      const newPlayerId = window.crypto.randomUUID();
      localStorage.setItem("playerId", newPlayerId);
      setPlayerId(newPlayerId);
    } else {
      setPlayerId(storedPlayerId);
    }
  }, [setPlayerId]);

  return (
    <GameContext.Provider
      value={{
        ws,
        startGame,
        playerHand: playerHand || [],
        setPlayerHand,
        playerDeckLength,
        setPlayerDeckLength,
        opponentDeckLength,
        setOpponentDeckLength,
        opponentHandLength,
        setOpponentHandLength,
        board,
        setBoard,
        isPlayerTurn,
        setPlayerTurn,
        playMode,
        setPlayMode,
        sendMessage,
        addMessageListener,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}
