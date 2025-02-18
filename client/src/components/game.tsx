import { BoardDisplay } from "./board-display";
import { OpponentDeckDisplay } from "./opponent-deck-display";
import { PlayerDeckDisplay } from "./player-deck-display";

export function Game() {
  return (
    <div>
      <div className="transform-[perspective(40cm)_rotateX(45deg)]">
        <OpponentDeckDisplay />
        <BoardDisplay />
      </div>

      <PlayerDeckDisplay />
    </div>
  );
}
