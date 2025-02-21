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

export class OpponentCard extends Card {
  constructor() {
    super("?", -1);
  }
}

type GameContextType = {
  ws: WebSocket | null;
  startGame: (multi?: boolean) => void;
  playerDeck: Card[];
  setPlayerDeck: Dispatch<SetStateAction<Card[] | null>>;
  opponentDeck: Card[];
  setOpponentDeck: Dispatch<SetStateAction<Card[] | null>>;
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
  opponentDeck: [],
  setOpponentDeck: () => {},
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
  const [opponentDeck, setOpponentDeck] = useState<Card[] | null>(null);
  const [board, setBoard] = useState<Board>({ player: [], opponent: [] });
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>("normal");

  const startGame = useCallback(
    (multi: boolean = false) => {
      const ws = new WebSocket(
        `ws://localhost:8080?playerId=${playerId}&multiPlayer=${multi}`
      );

      setWs(ws);
      setOpponentDeck(Array(5).fill(new OpponentCard()));
    },
    [playerId]
  );

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      const msg = JSON.parse(e.data) as Message;

      switch (msg.type) {
        case "init":
          setOpponentDeck(Array(5).fill(new OpponentCard()));
          setPlayerDeck(msg.deck);
          break;
        case "play":
          setPlayerTurn(true);
          break;
        case "chooseAttackTarget":
          setPlayMode("attack");
          break;
        case "chooseHealTarget":
          setPlayMode("heal");
          break;
        case "chooseDestroyTarget":
          setPlayMode("destroy");
          break;
        case "gameOver":
          if (msg.win) {
            alert("You won >:D !");
          } else {
            alert("You lost :( !");
          }
          break;
        case "reconnect":
          console.log(msg);
          setPlayerDeck(msg.deck);
          setOpponentDeck(
            Array(msg.opponentCardCount).fill(new OpponentCard())
          );
          setBoard(msg.board);
          setPlayerTurn(msg.isPlayerTurn);
          break;
        default:
          break;
      }
    },
    [opponentDeck, setPlayerDeck, setOpponentDeck, setBoard, setPlayerTurn]
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

  useEffect(() => {
    if (ws) {
      ws.onmessage = handleMessage;
    }
  }, [handleMessage]);

  return (
    <GameContext.Provider
      value={{
        ws,
        startGame,
        playerDeck: playerDeck || [],
        setPlayerDeck,
        opponentDeck: opponentDeck || [],
        setOpponentDeck,
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
