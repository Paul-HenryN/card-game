import { Board } from "./board";
import { PlayerHand } from "./player-hand";
import { OpponentHand } from "./opponent-hand";
import { useGameContext } from "../game-context";
import { Message } from "@card-game/types";
import { useEffect } from "react";
import { Deck } from "./deck";

export function Game() {
  const {
    ws,
    setPlayerTurn,
    setPlayerHand,
    setPlayerDeckLength,
    setOpponentDeckLength,
    opponentDeckLength,
    setBoard,
    playerDeckLength,
  } = useGameContext();

  const handleReconnectMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as Message;

    if (message.type === "reconnect") {
      console.log(message);
      setPlayerHand(message.hand);
      setPlayerDeckLength(message.deckLength);
      setOpponentDeckLength(message.opponentHandLength);
      setBoard(message.board);
      setPlayerTurn(message.isPlayerTurn);
    }
  };

  useEffect(() => {
    ws?.addEventListener("message", handleReconnectMessage);

    return () => {
      ws?.removeEventListener("message", handleReconnectMessage);
    };
  }, [ws, handleReconnectMessage]);

  return (
    <div className="relative h-[calc(4_*_var(--card-height))]">
      <div className="transform-[perspective(40cm)_rotateX(45deg)]">
        <div className="flex justify-between w-[calc(8_*_var(--card-width))]">
          <Deck length={opponentDeckLength} />
          <div className="mx-auto">
            <OpponentHand />
          </div>
        </div>

        <Board />
      </div>

      <div className="flex justify-between w-[calc(8_*_var(--card-width))]">
        <div className="mx-auto">
          <PlayerHand />
        </div>

        <Deck length={playerDeckLength} />
      </div>
    </div>
  );
}
