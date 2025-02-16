import { Card } from "../../../shared/entities/game";
import { CardDisplay } from "./card-display";

const CARD_ROTATION = 10; // degrees

export function DeckDisplay({
  deck,
  active,
  handlePlay,
}: {
  deck: Card[];
  active: boolean;
  handlePlay: (index: number) => void;
}) {
  return (
    <div className="flex justify-center  gap-(--deck-gap) w-(--deck-width) h-(--card-height)">
      {deck?.map((card, i) => (
        <button
          key={i}
          disabled={!active}
          data-disabled={!active}
          onClick={() => handlePlay(i)}
          className="data-[disabled=false]:hover:translate-y-[-10px] transition-transform"
          style={{
            rotate:
              deck.length > 1
                ? (2 * CARD_ROTATION * i) / (deck.length - 1) -
                  CARD_ROTATION +
                  "deg"
                : "0deg",
          }}
        >
          <CardDisplay card={card} />
        </button>
      ))}
    </div>
  );
}
