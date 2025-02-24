import { wss } from "./server";
import { CPU, Game, WebSocketPlayer } from "./entities/game";

async function main() {
  let games: Map<string[], Game> = new Map();
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
    const multiPlayer = url.searchParams.get("multiPlayer") === "true";

    let game = findGameByPlayerId(playerId);

    if (game && !game.isOver) {
      const [disconnectedPlayer, opponent] =
        (game.p1 as WebSocketPlayer).id === playerId
          ? [game.p1 as WebSocketPlayer, game.p2]
          : [game.p2 as WebSocketPlayer, game.p1];

      disconnectedPlayer.ws = ws;

      disconnectedPlayer.notify({
        type: "reconnect",
        hand: disconnectedPlayer.hand,
        deckLength: opponent.deck.length(),
        opponentHandLength: opponent.hand.length,
        board: {
          player: disconnectedPlayer.onBoard,
          opponent: opponent.onBoard,
        },
        isPlayerTurn:
          disconnectedPlayer.id === (game.p1 as WebSocketPlayer).id
            ? game.isP1Turn
            : !game.isP1Turn,
      });
    } else {
      const player = new WebSocketPlayer(playerId, ws);

      if (!multiPlayer) {
        game = new Game(player, new CPU());
        games.set([player.id], game);
        await game.init();
      } else if (lobby.length > 0) {
        const opponent = lobby.splice(0, 1)[0];

        game = new Game(player, opponent);
        games.set([player.id, opponent.id], game);
        await game.init();
      } else {
        lobby.push(player);
        return;
      }
    }

    while (game.p1.deck.length() && game.p2.deck.length()) {
      if (game.isP1Turn) await game.handlePlay(await game.p1.play());
      else await game.handlePlay(await game.p2.play());
    }

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
