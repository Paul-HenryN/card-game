import { Card } from "./card";
import { useGameContext } from "../game-context";
import { LayoutGroup } from "motion/react";
import { useEffect } from "react";
import { Message } from "../../../shared/entities/websocket";

export function OpponentDeck() {
  const { ws, opponentDeck, setOpponentDeck, setBoard } = useGameContext();

  const handleOpponentPlayMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as Message;

    if (message.type === "opponentPlay") {
      setOpponentDeck((prev) =>
        prev ? prev.filter((_, j) => j !== message.playedCardIdx) : null
      );
      setBoard((prev) => ({
        ...prev,
        opponent: [...prev.opponent, message.playedCard],
      }));
    }
  };

  useEffect(() => {
    ws?.addEventListener("message", handleOpponentPlayMessage);
    return () => ws?.removeEventListener("message", handleOpponentPlayMessage);
  }, [ws, handleOpponentPlayMessage]);

  return (
    <LayoutGroup>
      <div className="flex justify-center gap-(--deck-gap)">
        {opponentDeck.map((card, i) => (
          <Card key={i} card={card} disabled />
        ))}
      </div>
    </LayoutGroup>
  );
}
