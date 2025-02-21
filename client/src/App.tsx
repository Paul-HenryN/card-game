import { Menu } from "./components/menu";
import { useGameContext } from "./game-context";
import { Game } from "./components/game";

function App() {
  const { ws } = useGameContext();

  return <>{ws ? <Game /> : <Menu />}</>;
}

export default App;
