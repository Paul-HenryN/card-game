import { CardDisplay } from "./card-display";
import { useGameContext } from "../game-context";
import { useEffect, useRef } from "react";
import { Message } from "../../../shared/entities/websocket";

const CARD_ROTATION = -10; // degrees

export function OpponentDeckDisplay() {
  const { opponentDeck, setOpponentDeck, isPlayerTurn, ws } = useGameContext();
  const ref = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    ws?.addEventListener("message", (e) => {
      const payload = JSON.parse(e.data) as Message;

      if (payload.type === "opponentPlay") {
        const cardBtnEl = ref.current[payload.playedCardIdx];

        if (!cardBtnEl) return;

        cardBtnEl.style.animation = "var(--anim-card-pick)";
        cardBtnEl.onanimationend = () =>
          setOpponentDeck(
            opponentDeck.filter((_, i) => i != payload.playedCardIdx)
          );
      }
    });
  }, [opponentDeck, setOpponentDeck, ws]);

  return (
    <div className="flex justify-center  gap-(--deck-gap) w-(--deck-width) h-(--card-height)">
      {opponentDeck?.map((card, i) => {
        return (
          <button
            key={i}
            ref={(el) => {
              ref.current[i] = el;
            }}
            disabled={true}
            data-disabled={!isPlayerTurn}
            style={{
              rotate:
                opponentDeck.length > 1
                  ? (2 * CARD_ROTATION * i) / (opponentDeck.length - 1) -
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
