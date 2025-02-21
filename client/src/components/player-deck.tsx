import { Card } from "./card";
import { useGameContext } from "../game-context";
import { LayoutGroup } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Message } from "../../../shared/entities/websocket";

export function PlayerDeck() {
  const {
    ws,
    playerDeck,
    setPlayerDeck,
    board,
    setBoard,
    sendMessage,
    isPlayerTurn,
    setPlayerTurn,
    playMode,
  } = useGameContext();
  const [playedCardIdx, setPlayedCardIdx] = useState<number | null>(null);

  // Handles server deck update events
  // Syncs the client player deck if the server deck is different
  const handleDeckUpdateMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data) as Message;

      if (message.type === "deckUpdate") {
        if (JSON.stringify(playerDeck) !== JSON.stringify(message.deck)) {
          setPlayerDeck(message.deck);
        }
      }
    },
    [playerDeck, setPlayerDeck]
  );

  useEffect(() => {
    setPlayedCardIdx(null);
  }, [playerDeck]);

  useEffect(() => {
    ws?.addEventListener("message", handleDeckUpdateMessage);

    return () => {
      ws?.removeEventListener("message", handleDeckUpdateMessage);
    };
  }, [ws, handleDeckUpdateMessage]);

  return (
    <LayoutGroup>
      <div className="flex justify-center gap-(--deck-gap)">
        {playerDeck.map((card, i) => (
          <Card
            key={i}
            animate={playedCardIdx === i ? "play" : undefined}
            card={card}
            onClick={() => {
              setPlayedCardIdx(i);

              if (!card.effect) {
                setPlayerTurn(false);
              }
            }}
            // Optimistically update player deck and board
            // Then send the "pick" message to the server to play the card
            onAnimationComplete={(def) => {
              if (def === "play") {
                sendMessage({ type: "pick", index: i });
                setPlayerDeck(playerDeck.filter((_, j) => j !== i));
                setBoard({
                  ...board,
                  player: [...board.player, card],
                });
              }
            }}
            disabled={!isPlayerTurn || playMode != "normal"}
          />
        ))}
      </div>
    </LayoutGroup>
  );
}
