import { wss } from "./server";
import { CPU, Game, WebSocketPlayer } from "./entities/game.js";

async function main() {
  let games: Map<[string, string], Game> = new Map();
  let lobby: WebSocketPlayer[] = [];

  const findGameByPlayerId = (playerId: string) => {
    for (const [playerIds, game] of games.entries()) {
      if (playerIds.includes(playerId)) {
        return game;
      }
    }

    return null;
  };

  wss.on("connection", async (ws, req) => {
    console.log("New connection !");
    const url = new URL(`http://${process.env.HOST ?? "localhost"}${req.url}`);
    const playerId = url.searchParams.get("playerId");

    let game = findGameByPlayerId(playerId);

    if (game && !game.isOver) {
      (game.p1 as WebSocketPlayer).ws = ws;

      game.p1.notify({
        type: "reconnect",
        deck: game.p1.deck.cards,
        opponentCardCount: game.p2.deck.length(),
        board: { player: game.p1.onBoard, opponent: game.p2.onBoard },
        isPlayerTurn: game.isP1Turn,
      });
    } else {
      const player = new WebSocketPlayer(playerId, ws);

      if (lobby.length > 0) {
        const opponent = lobby.splice(0, 1)[0];

        game = new Game(player, opponent);
        games.set([player.id, opponent.id], game);
        game.init();
      } else {
        lobby.push(player);
        return;
      }
    }

    while (game.p1.deck.length() && game.p2.deck.length()) {
      await game.handlePlay(await game.p1.play());
      await game.handlePlay(await game.p2.play());
    }

    game.isOver = true;

    const p1Score = game.p1.onBoard.reduce((acc, card) => acc + card.power, 0);
    const p2Score = game.p2.onBoard.reduce((acc, card) => acc + card.power, 0);

    console.log(
      `P1 score: ${p1Score}, P2 score: ${p2Score}, ${
        p1Score > p2Score ? "P1 wins" : "P2 wins"
      }`
    );

    await Promise.all([
      game.p1.notify({ type: "gameOver", win: p1Score > p2Score }),
      game.p2.notify({ type: "gameOver", win: p2Score > p1Score }),
    ]);

    game.close();
  });
}

main();
