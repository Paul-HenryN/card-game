import { Card } from "./card";
import { useGameContext } from "../game-context";
import { LayoutGroup } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Message } from "../../../shared/entities/websocket";

export function PlayerHand() {
  const {
    ws,
    playerHand,
    setPlayerHand,
    board,
    setBoard,
    sendMessage,
    isPlayerTurn,
    setPlayerTurn,
    playMode,
  } = useGameContext();
  const [playedCardIdx, setPlayedCardIdx] = useState<number | null>(null);

  const handleInitMessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data) as Message;

    if (message.type === "init") {
      setPlayerHand(message.hand);
      setPlayerTurn(message.playsFirst);
    }
  };

  // Handles server deck update events
  // Syncs the client player deck if the server deck is different
  const handleDeckUpdateMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data) as Message;

      if (message.type === "handUpdate") {
        console.log("Hand update: " + JSON.stringify(message.hand));
        if (JSON.stringify(playerHand) !== JSON.stringify(message.hand)) {
          setPlayerHand(message.hand);
        }
      }
    },
    [playerHand, setPlayerHand]
  );

  useEffect(() => {
    ws?.addEventListener("message", handleInitMessage);
    ws?.addEventListener("message", handleDeckUpdateMessage);

    return () => {
      ws?.removeEventListener("message", handleInitMessage);
      ws?.removeEventListener("message", handleDeckUpdateMessage);
    };
  }, [ws, handleDeckUpdateMessage]);

  return (
    <>
      <LayoutGroup>
        <div className="flex justify-center gap-(--deck-gap)">
          {playerHand.map((card, i) => (
            <Card
              key={i}
              isHidden={false}
              initial="initial"
              animate={playedCardIdx === i ? "play" : "initial"}
              card={card}
              disabled={!isPlayerTurn || playMode != "normal"}
              onClick={() => {
                setPlayedCardIdx(i);
                setPlayerTurn(false);
              }}
              onAnimationComplete={(def) => {
                if (def === "play") {
                  setPlayerHand(playerHand.filter((_, j) => j !== i));
                  setBoard({ ...board, player: [...board.player, card] });
                  sendMessage({ type: "pick", index: i });
                  setPlayedCardIdx(null);
                }
              }}
              className="data-[disabled]:cursor-not-allowed"
            />
          ))}
        </div>
      </LayoutGroup>

      {isPlayerTurn && playMode == "normal" && (
        <button
          className="fixed right-10 bottom-10 bg-blue-500 text-white px-5 py-2 rounded-lg"
          onClick={() => {
            sendMessage({ type: "skip" });
            setPlayerTurn(false);
          }}
        >
          Skip turn
        </button>
      )}
    </>
  );
}
