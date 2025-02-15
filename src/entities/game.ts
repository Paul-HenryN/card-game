import { WebSocketServer, WebSocket } from "ws";
import { Deck, Card, Effect } from "../../shared/entities/game";
import { Message } from "../../shared/entities/websocket";

const CARDS: Record<string, Card> = {
  WARRIOR: new Card("Warrior", 3),
  MAGE: new Card("Mage", 4, new Effect("heal", 3)),
  ROGUE: new Card("Rogue", 5),
  HUNTER: new Card("Hunter", 6, new Effect("attack", 1)),
  DRUID: new Card("Druid", 7),
  SHAMAN: new Card("Shaman", 3, new Effect("heal", 2)),
  PALADIN: new Card("Paladin", 9),
  PRIEST: new Card("Priest", 10),
  ARCHER: new Card("Archer", 2, new Effect("attack", 2)),
  ASSASSIN: new Card("Assassin", 5, new Effect("destroy", Infinity)),
} as const;

interface Player {
  deck: Deck;
  onBoard: Card[];
  play(): Promise<number>;
  init(): void;
  notify(message: Message): Promise<void>;
  chooseAttackTarget(opponentCards: Card[]): Promise<number>;
  chooseHealTarget(): Promise<number>;
  chooseDestroyTarget(opponentCards: Card[]): Promise<number>;
}

export class WebSocketPlayer implements Player {
  public deck: Deck;
  public onBoard: Card[] = [];
  public ws: WebSocket;

  async connect(wss: WebSocketServer) {
    console.log("Waiting for connection...");

    return new Promise<void>((resolve, reject) => {
      wss.on("connection", (ws) => {
        console.log("New player connected !");
        this.ws = ws;
        resolve();
      });

      wss.on("error", (err) => {
        reject(err);
      });
    });
  }

  init() {
    this.notify({
      type: "init",
      deck: this.deck.cards,
    });
  }

  async notify(message: Message) {
    return new Promise<void>((resolve, reject) => {
      this.ws.send(JSON.stringify(message), (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

  async play(): Promise<number> {
    this.notify({ type: "play" });

    return new Promise<number>((resolve, reject) => {
      this.ws.on("message", (msg) => {
        const input = JSON.parse(msg.toString()) as Message;

        if (input.type == "pick") {
          resolve(input.index);
        } else {
          reject();
        }
      });

      this.ws.on("error", (err) => {
        reject(err);
      });
    });
  }

  async chooseAttackTarget(opponentCards: Card[]): Promise<number> {
    this.notify({ type: "chooseAttackTarget", opponentCards });

    return new Promise<number>((resolve, reject) => {
      this.ws.on("message", (msg) => {
        const input = JSON.parse(msg.toString()) as Message;

        if (input.type == "attack") {
          resolve(input.cardIndex);
        } else {
          reject("Invalid message");
        }
      });

      this.ws.on("error", (err) => {
        reject(err);
      });
    });
  }

  chooseHealTarget(): Promise<number> {
    this.notify({ type: "chooseHealTarget" });

    return new Promise<number>((resolve, reject) => {
      this.ws.on("message", (msg) => {
        const input = JSON.parse(msg.toString()) as Message;

        if (input.type === "heal") {
          resolve(input.cardIndex);
        } else {
          reject("Invalid message");
        }
      });

      this.ws.on("error", (err) => {
        reject(err);
      });
    });
  }

  chooseDestroyTarget(opponentCards: Card[]): Promise<number> {
    this.notify({ type: "chooseDestroyTarget", opponentCards });

    return new Promise<number>((resolve, reject) => {
      this.ws.on("message", (msg) => {
        const input = JSON.parse(msg.toString()) as Message;

        if (input.type === "destroy") {
          resolve(input.cardIndex);
        } else {
          reject("Invalid message");
        }
      });

      this.ws.on("error", (err) => {
        reject(err);
      });
    });
  }
}

export class CPU implements Player {
  public deck: Deck;
  public onBoard: Card[] = [];

  init() {}

  public play() {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * this.deck.length()));
      }, Math.random() * 1000);
    });
  }

  async notify(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resolve();
    });
  }

  chooseAttackTarget(opponentCards: Card[]): Promise<number> {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * opponentCards.length));
      }, Math.random() * 3000);
    });
  }

  chooseHealTarget(): Promise<number> {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * this.onBoard.length));
      }, Math.random() * 3000);
    });
  }

  chooseDestroyTarget(opponentCards: Card[]): Promise<number> {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * opponentCards.length));
      }, Math.random() * 3000);
    });
  }
}

export class Game {
  private isP1Turn = true;

  constructor(public p1: Player, public p2: Player) {}

  init() {
    this.p1.deck = this.generateDeck();
    this.p2.deck = this.generateDeck();
    this.p1.init();
    this.p2.init();
  }

  generateDeck(): Deck {
    const shuffledCards = Object.values(CARDS).sort(() => 0.5 - Math.random());
    return new Deck(shuffledCards.slice(0, 5));
  }

  async handlePlay(index: number) {
    const [currentPlayer, opponent] = this.isP1Turn
      ? [this.p1, this.p2]
      : [this.p2, this.p1];

    const card = currentPlayer.deck.pick(index);
    currentPlayer.onBoard.push(card);

    console.log("Played: " + card.toString());

    currentPlayer.notify({
      type: "deckUpdate",
      deck: currentPlayer.deck.cards,
    });

    opponent.notify({
      type: "opponentPlay",
      playedCardIdx: index,
      playedCard: card,
    });

    currentPlayer.notify({
      type: "boardUpdate",
      board: { player: currentPlayer.onBoard, opponent: opponent.onBoard },
    });

    opponent.notify({
      type: "boardUpdate",
      board: { player: opponent.onBoard, opponent: currentPlayer.onBoard },
    });

    if (card.effect) {
      switch (card.effect.type) {
        case "attack":
          if (opponent.onBoard.length == 0) {
            break;
          }

          const attackedCardIdx = await currentPlayer.chooseAttackTarget(
            opponent.onBoard
          );

          const attackedCard = opponent.onBoard[attackedCardIdx];

          if (attackedCard.power <= card.effect.power) {
            opponent.onBoard.splice(attackedCardIdx, 1);
          } else {
            attackedCard.power -= card.effect.power;
          }

          break;
        case "heal":
          if (currentPlayer.onBoard.length <= 1) {
            break;
          }

          console.log("Which card to heal ?");

          const healedCardIdx = await currentPlayer.chooseHealTarget();

          console.log("Healed card: " + currentPlayer.onBoard[healedCardIdx]);

          currentPlayer.onBoard[healedCardIdx].power += card.effect.power;
          break;
        case "destroy":
          if (opponent.onBoard.length === 0) {
            break;
          }

          console.log("Which card to destroy ?");

          const destroyedCardIdx = await currentPlayer.chooseDestroyTarget(
            opponent.onBoard
          );

          console.log("Destroyed card: " + opponent.onBoard[destroyedCardIdx]);

          opponent.onBoard.splice(destroyedCardIdx, 1);
          break;
        default:
          break;
      }

      currentPlayer.notify({
        type: "boardUpdate",
        board: { player: currentPlayer.onBoard, opponent: opponent.onBoard },
      });

      opponent.notify({
        type: "boardUpdate",
        board: { player: opponent.onBoard, opponent: currentPlayer.onBoard },
      });
    }

    this.isP1Turn = !this.isP1Turn;
  }
}
