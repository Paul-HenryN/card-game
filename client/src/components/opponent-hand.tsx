import { Card } from "./card";
import { useGameContext } from "../game-context";
import { LayoutGroup } from "motion/react";
import { useEffect } from "react";
import { Message } from "@card-game/types";

export function OpponentHand() {
  const {
    ws,
    opponentHandLength,
    setOpponentHandLength,
    setBoard,
    setPlayerTurn,
  } = useGameContext();

  const handleOpponentPlayMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as Message;

    if (message.type === "opponentPlay") {
      setOpponentHandLength(opponentHandLength - 1);
      setBoard((prev) => ({
        ...prev,
        opponent: [...prev.opponent, message.playedCard],
      }));
      setPlayerTurn(true);
    }
  };

  useEffect(() => {
    ws?.addEventListener("message", handleOpponentPlayMessage);
    return () => ws?.removeEventListener("message", handleOpponentPlayMessage);
  }, [ws, handleOpponentPlayMessage]);

  return (
    <LayoutGroup>
      <div className="flex justify-center gap-(--deck-gap)">
        {Array(opponentHandLength)
          .fill(null)
          .map((_, i) => (
            <Card key={i} disabled isHidden />
          ))}
      </div>
    </LayoutGroup>
  );
}
