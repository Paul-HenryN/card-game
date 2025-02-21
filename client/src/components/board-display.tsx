import { useGameContext } from "../game-context";
import { Card } from "./card";

export function BoardDisplay() {
  const { board, playMode, sendMessage } = useGameContext();

  const handleClick = (index: number) => {
    if (playMode === "attack")
      sendMessage({ type: "attack", cardIndex: index });
    else if (playMode === "heal")
      sendMessage({ type: "heal", cardIndex: index });
    else if (playMode === "destroy")
      sendMessage({ type: "destroy", cardIndex: index });
  };

  return (
    <div className="flex flex-col items-center gap-(--board-gap) h-(--board-height) my-5">
      <div className="flex h-(--card-height) gap-(--board-gap)">
        {board.opponent.map((card, i) => (
          <button
            disabled={!["attack", "destroy"].includes(playMode)}
            onClick={() => handleClick(i)}
            className="animate-(--anim-opponent-card-appear)"
          >
            <Card key={i} card={card} index={i} />
          </button>
        ))}
      </div>

      <div className="flex gap-(--board-gap) h-(--card-height)">
        {board.player.map((card, i) => (
          <button
            disabled={playMode != "heal"}
            onClick={() => handleClick(i)}
            className="animate-(--anim-player-card-appear)"
          >
            <Card key={i} card={card} index={i} />
          </button>
        ))}
      </div>
    </div>
  );
}
