import { useEffect, useState } from "react";
import { CardDisplay } from "./card-display";
import { useGameContext } from "../game-context";

const CARD_ROTATION = 10; // degrees

export function PlayerDeckDisplay() {
  const { playerDeck, isPlayerTurn, setPlayerTurn, sendMessage } =
    useGameContext();

  const [animStates, setAnimStates] = useState<boolean[]>(
    Array(playerDeck.length).fill(false)
  );

  useEffect(() => {
    setAnimStates(Array(playerDeck.length).fill(false));
  }, [playerDeck]);

  const handlePlay = (index: number) => {
    if (!isPlayerTurn) return;
    sendMessage({ type: "pick", index });
    setPlayerTurn(false);
  };

  const startAnimation = (i: number) => {
    setAnimStates((prev) => {
      const newArr = [...prev];
      newArr[i] = true;
      return newArr;
    });
  };

  return (
    <div className="flex justify-center  gap-(--deck-gap) w-(--deck-width) h-(--card-height)">
      {playerDeck?.map((card, i) => {
        return (
          <button
            key={i}
            disabled={!isPlayerTurn}
            data-disabled={!isPlayerTurn}
            onAnimationEnd={() => handlePlay(i)}
            className="data-[disabled=false]:hover:translate-y-[-10px] transition-transform"
            onClick={() => startAnimation(i)}
            style={{
              animation: animStates[i] ? "var(--anim-card-pick)" : "none",
              rotate:
                playerDeck.length > 1
                  ? (2 * CARD_ROTATION * i) / (playerDeck.length - 1) -
                    CARD_ROTATION +
                    "deg"
                  : "0deg",
            }}
          >
            <CardDisplay card={card} />
          </button>
        );
      })}
    </div>
  );
}
