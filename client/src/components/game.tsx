import { BoardDisplay } from "./board-display";
import { PlayerDeck } from "./player-deck";
import { OpponentDeck } from "./opponent-deck";

export function Game() {
  return (
    <div className="relative">
      <div className="transform-[perspective(40cm)_rotateX(45deg)]">
        <OpponentDeck />
        <BoardDisplay />
      </div>

      <PlayerDeck />
    </div>
  );
}
