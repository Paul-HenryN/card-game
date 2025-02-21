import { Card } from "./card";
import { useGameContext } from "../game-context";
import { LayoutGroup } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Message } from "../../../shared/entities/websocket";

const defaultCardVisibility = Array(5).fill(true);

export function OpponentDeck() {
  const { ws, opponentDeck, setOpponentDeck, board, setBoard } =
    useGameContext();
  const [inDeck, setInDeck] = useState(defaultCardVisibility);

  useEffect(() => {
    setInDeck(Array(opponentDeck.length).fill(true));
    console.log("Opponent deck changed: ", opponentDeck);
  }, [opponentDeck]);

  const handleOpponentPlayMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data) as Message;

      if (message.type === "opponentPlay") {
        setInDeck((prev) => prev.map((_, j) => j !== message.playedCardIdx));

        // Optimistically update opponent deck and board
        // This is done with a short delay to allow the play animation to finish
        setTimeout(() => {
          setOpponentDeck(
            opponentDeck.filter((_, j) => j !== message.playedCardIdx)
          );

          setBoard({
            ...board,
            opponent: [...board.opponent, message.playedCard],
          });
        }, 500);
      }
    },
    [opponentDeck, setOpponentDeck, board, setBoard]
  );

  useEffect(() => {
    ws?.addEventListener("message", handleOpponentPlayMessage);

    return () => {
      ws?.removeEventListener("message", handleOpponentPlayMessage);
    };
  }, [ws, handleOpponentPlayMessage]);

  return (
    <LayoutGroup>
      <div className="flex justify-center">
        {opponentDeck.map((card, i) => (
          <Card
            key={i}
            id={`opponent-card-${i}`}
            card={card}
            visible={inDeck[i]}
            ownedBy="opponent"
          />
        ))}
      </div>
    </LayoutGroup>
  );
}
