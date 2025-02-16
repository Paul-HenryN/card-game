import { useCallback, useEffect, useState } from "react";
import { Message } from "../../shared/entities/websocket";
import { Card } from "../../shared/entities/game";
import { GameContainer } from "./components/game-container";
import { DeckDisplay } from "./components/deck-display";
import { BoardDisplay } from "./components/board-display";

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

function App() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [deck, setDeck] = useState<Card[] | null>(null);
  const [opponentDeck, setOpponentDeck] = useState<Card[] | null>();
  const [board, setBoard] = useState<Board>({ player: [], opponent: [] });
  const [isPlayerTurn, setPlayerTurn] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>("normal");

  useEffect(() => {
    const playerId = localStorage.getItem("playerId");

    if (!playerId) {
      const newPlayerId = window.crypto.randomUUID();
      localStorage.setItem("playerId", newPlayerId);
      setPlayerId(newPlayerId);
    } else {
      setPlayerId(playerId);
    }
  }, []);

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      if (!ws?.OPEN) return;

      const msg = JSON.parse(e.data) as Message;

      switch (msg.type) {
        case "init":
          setOpponentDeck(Array(5).fill(new OpponentCard()));
          setDeck(msg.deck);
          break;
        case "deckUpdate":
          setDeck(msg.deck);
          break;
        case "play":
          setPlayerTurn(true);
          break;
        case "boardUpdate":
          setBoard(msg.board);
          break;
        case "opponentPlay":
          if (opponentDeck) {
            setOpponentDeck(
              opponentDeck?.filter((_, i) => i != msg.playedCardIdx)
            );
          }
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
          setDeck(msg.deck);
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
    [ws, deck, opponentDeck, setDeck, setOpponentDeck, setBoard, setPlayerTurn]
  );

  const sendMessage = (msg: Message) => {
    if (!ws || ws.readyState != WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  };

  const handleAttack = (index: number) => {
    sendMessage({ type: "attack", cardIndex: index });
    setPlayMode("normal");
  };

  const handlePlay = (index: number) => {
    if (!isPlayerTurn) return;
    sendMessage({ type: "pick", index });
    setPlayerTurn(false);
  };

  const handleHeal = (index: number) => {
    sendMessage({ type: "heal", cardIndex: index });
    setPlayMode("normal");
  };

  const handleDestroy = (index: number) => {
    sendMessage({ type: "destroy", cardIndex: index });
    setPlayMode("normal");
  };

  useEffect(() => {
    console.log(opponentDeck);
  }, [opponentDeck]);

  const connect = (multiPlayer: boolean = false) => {
    if (ws) {
      ws.close();
    }

    const newSocket = new WebSocket(
      `ws://localhost:8080?playerId=${playerId}&multiPlayer=${multiPlayer}`
    );
    setWs(newSocket);
  };

  useEffect(() => {
    if (ws) {
      ws.onmessage = handleMessage;
    }
  }, [handleMessage]);

  return (
    <GameContainer>
      {!ws ? (
        <>
          <button
            onClick={() => connect()}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg"
          >
            Solo
          </button>

          <button
            onClick={() => connect(true)}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg"
          >
            Multiplayer
          </button>
        </>
      ) : (
        <div>
          <div className="transform-[perspective(50cm)_rotateX(45deg)]">
            <DeckDisplay
              deck={opponentDeck || []}
              active={false}
              handlePlay={() => {}}
            />

            <BoardDisplay
              board={board}
              onAttack={handleAttack}
              onHeal={handleHeal}
              onDestroy={handleDestroy}
              playMode={playMode}
            />
          </div>

          <DeckDisplay
            deck={deck || []}
            active={isPlayerTurn}
            handlePlay={handlePlay}
          />
        </div>
      )}
    </GameContainer>
  );
}

export default App;
