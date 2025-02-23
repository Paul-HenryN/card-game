import { useCallback, useEffect } from "react";
import { useGameContext } from "../game-context";
import { Card } from "./card";
import { Message } from "../../../shared/entities/websocket";
import { LayoutGroup } from "motion/react";

export function Board() {
  const {
    ws,
    board,
    setBoard,
    playMode,
    setPlayMode,
    sendMessage,
    isPlayerTurn,
    setPlayerTurn,
  } = useGameContext();

  const handleClick = (index: number) => {
    if (playMode === "attack")
      sendMessage({ type: "attack", cardIndex: index });
    else if (playMode === "heal")
      sendMessage({ type: "heal", cardIndex: index });
    else if (playMode === "destroy")
      sendMessage({ type: "destroy", cardIndex: index });

    setPlayMode("normal");
    setPlayerTurn(false);
  };

  const handleBoardUpdateMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data) as Message;

      if (message.type === "boardUpdate") {
        if (JSON.stringify(board) !== JSON.stringify(message.board)) {
          setBoard(message.board);
        }
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
        <LayoutGroup>
          {board.opponent.map((card, i) => (
            <Card
              key={i}
              initial="fadeDown"
              animate="initial"
              card={card}
              disabled={
                !isPlayerTurn || !["attack", "destroy"].includes(playMode)
              }
              onClick={() => handleClick(i)}
              isHidden={false}
            />
          ))}
        </LayoutGroup>
      </div>

      <div className="flex gap-(--board-gap) h-(--card-height)">
        <LayoutGroup>
          {board.player.map((card, i) => (
            <Card
              key={i}
              initial="fadeUp"
              animate="initial"
              card={card}
              disabled={!isPlayerTurn || playMode != "heal"}
              onClick={() => handleClick(i)}
              isHidden={false}
            />
          ))}
        </LayoutGroup>
      </div>
    </div>
  );
}
