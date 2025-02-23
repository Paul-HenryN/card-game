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
  playerDeck: Card[];
  setPlayerDeck: Dispatch<SetStateAction<Card[] | null>>;
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
  playerDeck: [],
  setPlayerDeck: () => {},
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
  const [playerDeck, setPlayerDeck] = useState<Card[] | null>(null);
  const [opponentDeckLength, setOpponentDeckLength] = useState<number>(5);
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
        playerDeck: playerDeck || [],
        setPlayerDeck,
        opponentDeckLength,
        setOpponentDeckLength,
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
