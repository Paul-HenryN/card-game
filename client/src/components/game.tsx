import { Board } from "./board";
import { PlayerDeck } from "./player-deck";
import { OpponentDeck } from "./opponent-deck";
import { useGameContext } from "../game-context";
import { Message } from "../../../shared/entities/websocket";
import { useEffect } from "react";

export function Game() {
  const { ws, setPlayerTurn, setPlayerDeck, setOpponentDeckLength, setBoard } =
    useGameContext();

  const handleReconnectMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as Message;

    if (message.type === "reconnect") {
      console.log(message);
      setPlayerDeck(message.deck);
      setOpponentDeckLength(message.opponentCardCount);
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
        <OpponentDeck />
        <Board />
      </div>

      <PlayerDeck />
    </div>
  );
}
