import { Card } from "./card";
import { useGameContext } from "../game-context";
import { LayoutGroup } from "motion/react";
import { useEffect, useState } from "react";
import { Message } from "../../../shared/entities/websocket";

const defaultCardVisibility = Array(5).fill(true);

export function PlayerDeck() {
  const { ws, playerDeck, setPlayerDeck, board, setBoard, sendMessage } =
    useGameContext();
  const [inDeck, setInDeck] = useState(defaultCardVisibility);

  const handleDeckUpdateMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as Message;

    if (message.type === "deckUpdate") {
      setTimeout(() => setPlayerDeck(message.deck), 500);
    }
  };

  useEffect(() => {
    setInDeck(Array(playerDeck.length).fill(true));
  }, [playerDeck]);

  useEffect(() => {
    ws?.addEventListener("message", handleDeckUpdateMessage);

    return () => {
      ws?.removeEventListener("message", handleDeckUpdateMessage);
    };
  }, [ws]);

  return (
    <LayoutGroup>
      <div className="flex justify-center">
        {playerDeck.map((card, i) => (
          <Card
            key={i}
            id={`player-card-${i}`}
            card={card}
            onClick={() => {
              setInDeck((prev) => prev.map((_, j) => j !== i));
            }}
            onPlay={() => {
              setBoard({
                ...board,
                player: [...board.player, card],
              });
              sendMessage({ type: "pick", index: i });
            }}
            visible={inDeck[i]}
          />
        ))}
      </div>
    </LayoutGroup>
  );
}
