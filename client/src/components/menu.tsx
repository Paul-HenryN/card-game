import { useGameContext } from "../game-context";

export function Menu() {
  const { startGame } = useGameContext();

  return (
    <div className="flex flex-col items-center gap-5 my-5">
      <button
        onClick={() => startGame()}
        className="bg-blue-500 text-white px-5 py-2 rounded-lg"
      >
        Solo
      </button>

      <button
        onClick={() => startGame(true)}
        className="bg-blue-500 text-white px-5 py-2 rounded-lg"
      >
        Multiplayer
      </button>
    </div>
  );
}
