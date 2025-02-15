import { wss } from "./server";
import { CPU, Game, WebSocketPlayer } from "./entities/game.js";

async function main() {
  const p1 = new WebSocketPlayer();
  await p1.connect(wss);

  const game = new Game(p1, new CPU());
  game.init();

  while (game.p1.deck.length() && game.p2.deck.length()) {
    await game.handlePlay(await game.p1.play());
    await game.handlePlay(await game.p2.play());
  }
}

main();
