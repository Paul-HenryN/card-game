import { GameContainer } from "./components/game-container";
import { Menu } from "./components/menu";
import { useGameContext } from "./game-context";
import { Game } from "./components/game";

function App() {
  const { ws } = useGameContext();

  return <GameContainer>{!ws ? <Menu /> : <Game />}</GameContainer>;
}

export default App;
