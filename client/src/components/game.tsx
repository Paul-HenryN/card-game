import { Board } from "./board";
import { PlayerDeck } from "./player-deck";
import { OpponentDeck } from "./opponent-deck";

export function Game() {
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
