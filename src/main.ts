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

  const p1Score = game.p1.onBoard.reduce((acc, card) => acc + card.power, 0);
  const p2Score = game.p2.onBoard.reduce((acc, card) => acc + card.power, 0);

  console.log(
    `P1 score: ${p1Score}, P2 score: ${p2Score}, ${
      p1Score > p2Score ? "P1 wins" : "P2 wins"
    }`
  );

  game.p1.notify({ type: "gameOver", win: p1Score > p2Score });
  game.p2.notify({ type: "gameOver", win: p2Score > p1Score });
}

main();
