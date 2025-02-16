import { Board, PlayMode } from "../App";
import { CardDisplay } from "./card-display";

export function BoardDisplay({
  board,
  playMode,
  onAttack,
  onHeal,
  onDestroy,
}: {
  board: Board;
  playMode: PlayMode;
  onAttack: (index: number) => void;
  onHeal: (index: number) => void;
  onDestroy: (index: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-(--board-gap) h-(--board-height) my-5">
      <div className="flex h-(--card-height) gap-(--board-gap)">
        {board.opponent.map((card, i) => (
          <button
            disabled={!["attack", "destroy"].includes(playMode)}
            onClick={() => {
              if (playMode === "attack") onAttack(i);
              else if (playMode === "destroy") onDestroy(i);
            }}
          >
            <CardDisplay key={i} card={card} />
          </button>
        ))}
      </div>

      <div className="flex gap-(--board-gap) h-(--card-height)">
        {board.player.map((card, i) => (
          <button disabled={playMode != "heal"} onClick={() => onHeal(i)}>
            <CardDisplay key={i} card={card} />
          </button>
        ))}
      </div>
    </div>
  );
}
