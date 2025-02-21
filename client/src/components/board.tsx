import { useCallback, useEffect } from "react";
import { useGameContext } from "../game-context";
import { Card } from "./card";
import { Message } from "../../../shared/entities/websocket";

export function Board() {
  const { ws, board, setBoard, playMode, sendMessage } = useGameContext();

  const handleClick = (index: number) => {
    if (playMode === "attack")
      sendMessage({ type: "attack", cardIndex: index });
    else if (playMode === "heal")
      sendMessage({ type: "heal", cardIndex: index });
    else if (playMode === "destroy")
      sendMessage({ type: "destroy", cardIndex: index });
  };

  const handleBoardUpdateMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data) as Message;

      if (message.type === "boardUpdate") {
        setBoard(message.board);
      }
    },
    [board, setBoard]
  );

  useEffect(() => {
    ws?.addEventListener("message", handleBoardUpdateMessage);

    return () => ws?.removeEventListener("message", handleBoardUpdateMessage);
  }, [ws, handleBoardUpdateMessage]);

  return (
    <div className="flex flex-col items-center gap-(--board-gap) h-(--board-height) my-5">
      <div className="flex h-(--card-height) gap-(--board-gap)">
        {board.opponent.map((card, i) => (
          <button
            disabled={!["attack", "destroy"].includes(playMode)}
            onClick={() => handleClick(i)}
            className="animate-(--anim-opponent-card-appear)"
          >
            <Card id={`opponent-board-card-${i}`} key={i} card={card} />
          </button>
        ))}
      </div>

      <div className="flex gap-(--board-gap) h-(--card-height)">
        {board.player.map((card, i) => (
          <button
            disabled={playMode != "heal"}
            onClick={() => handleClick(i)}
            className="animate-(--anim-player-card-appear)"
          >
            <Card id={`player-board-card-${i}`} key={i} card={card} />
          </button>
        ))}
      </div>
    </div>
  );
}
