import { useState } from "react";
import "./App.css";
import { Message } from "../../shared/entities/websocket";
import { Card } from "../../shared/entities/game";

type Board = {
  player: Card[];
  opponent: Card[];
};

function App() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [deck, setDeck] = useState<Card[] | null>(null);
  const [board, setBoard] = useState<Board>({ player: [], opponent: [] });
  const [isPlayerTurn, setPlayerTurn] = useState(false);

  const connect = () => {
    const newSocket = new WebSocket("ws://localhost:8080");

    newSocket.onopen = () => {
      setWs(newSocket);
    };

    newSocket.onerror = (err) => {
      console.error(err);
    };

    newSocket.onmessage = handleMessage;
  };

  const handleMessage = (e: MessageEvent) => {
    const msg = JSON.parse(e.data) as Message;

    switch (msg.type) {
      case "init":
      case "deckUpdate":
        setDeck(msg.deck);
        break;
      case "play":
        setPlayerTurn(true);
        break;
      case "boardUpdate":
        setBoard(msg.board);
        break;
      default:
        break;
    }
  };

  const sendMessage = (msg: Message) => {
    if (!ws || ws.readyState != WebSocket.OPEN) return;
    ws.send(JSON.stringify(msg));
  };

  const handlePlay = (index: number) => {
    if (!isPlayerTurn) return;
    sendMessage({ type: "pick", index });
    setPlayerTurn(false);
  };

  return (
    <div>
      {!ws ? (
        <button onClick={connect}>Start game</button>
      ) : (
        <div>
          <div>
            {board.opponent.map((card, i) => (
              <CardDisplay key={i} card={card} />
            ))}
          </div>

          <div>
            {board.player.map((card, i) => (
              <CardDisplay key={i} card={card} />
            ))}
          </div>

          <div>
            {deck?.map((card, i) => (
              <button
                key={i}
                disabled={!isPlayerTurn}
                onClick={() => handlePlay(i)}
              >
                <CardDisplay card={card} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CardDisplay({ card }: { card: Card }) {
  return <div>{card.name}</div>;
}

export default App;
