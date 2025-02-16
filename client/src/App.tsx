import { useCallback, useEffect, useState } from "react";
import { Message } from "../../shared/entities/websocket";
import { Card } from "../../shared/entities/game";

type Board = {
  player: Card[];
  opponent: Card[];
};

type PlayMode = "normal" | "attack" | "heal" | "destroy";

class OpponentCard extends Card {
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
    <div className="min-h-screen grid place-items-center bg-amber-100 py-10">
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

          <DeckDisplay
            deck={deck || []}
            active={isPlayerTurn}
            handlePlay={handlePlay}
          />
        </div>
      )}
    </div>
  );
}

function CardDisplay({ card }: { card: Card }) {
  return (
    <div className="border border-neutral-500 p-3 min-w-[200px] max-w-[220px] h-[250px] grid place-items-center rounded-sm">
      {card.name}

      {card.power != -1 && <div>power: {card.power} pts</div>}

      {card.effect && (
        <div>
          <div>
            effect: {card.effect.type}, {card.effect.power} pts
          </div>
        </div>
      )}
    </div>
  );
}

function BoardDisplay({
  board,
  playMode,
  onAttack,
  onHeal,
  onDestroy,
}: {
  board: Board;
  playMode: PlayMode;
  onAttack: (index: number) => void;
  onHeal: (index: number) => void;
  onDestroy: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-5 min-h-[500px] my-5">
      <div className="flex gap-3">
        {board.opponent.map((card, i) => (
          <button
            disabled={!["attack", "destroy"].includes(playMode)}
            onClick={() => {
              if (playMode === "attack") onAttack(i);
              else if (playMode === "destroy") onDestroy(i);
            }}
          >
            <CardDisplay key={i} card={card} />
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        {board.player.map((card, i) => (
          <button disabled={playMode != "heal"} onClick={() => onHeal(i)}>
            <CardDisplay key={i} card={card} />
          </button>
        ))}
      </div>
    </div>
  );
}

function DeckDisplay({
  deck,
  active,
  handlePlay,
}: {
  deck: Card[];
  active: boolean;
  handlePlay: (index: number) => void;
}) {
  return (
    <div className="flex gap-3 min-h-[250px]">
      {deck?.map((card, i) => (
        <button
          key={i}
          disabled={!active}
          data-disabled={!active}
          onClick={() => handlePlay(i)}
          className="data-[disabled=false]:hover:translate-y-[-10px] transition-transform"
        >
          <CardDisplay card={card} />
        </button>
      ))}
    </div>
  );
}

export default App;
