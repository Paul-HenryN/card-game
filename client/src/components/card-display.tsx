import { Card } from "../../../shared/entities/game";

export function CardDisplay({ card }: { card: Card }) {
  return (
    <div className="relative">
      <div className="border border-neutral-500 p-3 w-(--card-width) h-(--card-height) grid place-items-center rounded-sm">
        {card.name}
      </div>

      <div className="absolute text-start">
        {card.power != -1 && <div>power: {card.power} pts</div>}
        {card.effect && (
          <div>
            <div>
              effect: {card.effect.type}, {card.effect.power} pts
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
