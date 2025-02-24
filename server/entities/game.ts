import { WebSocketServer, WebSocket } from "ws";
import { Deck, Card, CardType, Effect, Message } from "@card-game/types";

export interface Player {
  deck: Deck;
  hand: Card[];
  onBoard: Card[];
  play(): Promise<number>;
  init({ playsFirst }: { playsFirst: boolean }): Promise<void>;
  notify(message: Message): Promise<void>;
  chooseAttackTarget(opponentCards: Card[]): Promise<number>;
  chooseHealTarget(): Promise<number>;
  chooseDestroyTarget(opponentCards: Card[]): Promise<number>;
  close(): void;
}

export class WebSocketPlayer implements Player {
  public deck: Deck;
  public onBoard: Card[] = [];
  public hand: Card[] = [];

  constructor(public id: string, public ws: WebSocket) {}

  async connect(wss: WebSocketServer) {
    console.log("Waiting for connection...");

    return new Promise<void>((resolve, reject) => {
      wss.on("connection", (ws) => {
        console.log("New player connected !");
        this.ws = ws;

        this.ws.onclose = () => {
          console.log("Player disconnected !");
        };

        resolve();
      });

      wss.on("error", (err) => {
        reject(err);
      });
    });
  }

  async init({ playsFirst }: { playsFirst: boolean }) {
    await this.notify({
      type: "init",
      hand: this.hand,
      deckLength: this.deck.length(),
      playsFirst,
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
        } else if (input.type == "skip") {
          resolve(-1);
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

  close() {
    if (this.ws && this.ws.readyState == WebSocket.OPEN) {
      this.ws.close();
    }
  }
}

export class CPU implements Player {
  public deck: Deck;
  public onBoard: Card[] = [];
  public hand: Card[] = [];

  init() {
    return Promise.resolve();
  }

  public play() {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * this.hand.length));
      }, Math.random() * 1000 + 2000);
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
      }, Math.random() * 3000 + 2000);
    });
  }

  chooseHealTarget(): Promise<number> {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * this.onBoard.length));
      }, Math.random() * 3000 + 2000);
    });
  }

  chooseDestroyTarget(opponentCards: Card[]): Promise<number> {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(Math.floor(Math.random() * opponentCards.length));
      }, Math.random() * 3000 + 2000);
    });
  }

  close() {}
}

export class Game {
  public cards: Card[] = [];
  public isP1Turn = true;
  public isOver = false;

  constructor(public p1: Player, public p2: Player) {}

  async init() {
    this.cards = this.loadCards();
    this.p1.deck = this.generateDeck();
    this.p1.hand = this.generateHand(this.p1.deck);
    this.p2.deck = this.generateDeck();
    this.p2.hand = this.generateHand(this.p2.deck);

    await Promise.all([
      this.p1.init({ playsFirst: this.isP1Turn }),
      this.p2.init({ playsFirst: !this.isP1Turn }),
    ]);
  }

  generateDeck(): Deck {
    const shuffledCards = this.cards.sort(() => 0.5 - Math.random());
    return new Deck(shuffledCards.slice(0, 15));
  }

  generateHand(deck: Deck): Card[] {
    const shuffledCards = deck.cards.sort(() => 0.5 - Math.random());
    return shuffledCards.slice(0, 5);
  }

  async handlePlay(index: number) {
    // Player skipped turn
    if (index === -1) {
      this.isP1Turn = !this.isP1Turn;
      return;
    }

    const [currentPlayer, opponent] = this.isP1Turn
      ? [this.p1, this.p2]
      : [this.p2, this.p1];

    const card = currentPlayer.hand.splice(index, 1)[0];
    currentPlayer.onBoard.push(card);

    console.log("Played: " + card.toString());

    currentPlayer.notify({
      type: "handUpdate",
      hand: currentPlayer.hand,
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

    // if (card.effect) {
    //   switch (card.effect.type) {
    //     case "attack":
    //       if (opponent.onBoard.length == 0) {
    //         break;
    //       }

    //       const attackedCardIdx = await currentPlayer.chooseAttackTarget(
    //         opponent.onBoard
    //       );

    //       const attackedCard = opponent.onBoard[attackedCardIdx];

    //       if (attackedCard.power <= card.effect.power) {
    //         opponent.onBoard.splice(attackedCardIdx, 1);
    //       } else {
    //         attackedCard.power -= card.effect.power;
    //       }

    //       break;
    //     case "heal":
    //       if (currentPlayer.onBoard.length <= 1) {
    //         break;
    //       }

    //       console.log("Which card to heal ?");

    //       const healedCardIdx = await currentPlayer.chooseHealTarget();

    //       console.log("Healed card: " + currentPlayer.onBoard[healedCardIdx]);

    //       currentPlayer.onBoard[healedCardIdx].power += card.effect.power;
    //       break;
    //     case "destroy":
    //       if (opponent.onBoard.length === 0) {
    //         break;
    //       }

    //       console.log("Which card to destroy ?");

    //       const destroyedCardIdx = await currentPlayer.chooseDestroyTarget(
    //         opponent.onBoard
    //       );

    //       console.log("Destroyed card: " + opponent.onBoard[destroyedCardIdx]);

    //       opponent.onBoard.splice(destroyedCardIdx, 1);
    //       break;
    //     default:
    //       break;
    //   }

    //   currentPlayer.notify({
    //     type: "boardUpdate",
    //     board: { player: currentPlayer.onBoard, opponent: opponent.onBoard },
    //   });

    //   opponent.notify({
    //     type: "boardUpdate",
    //     board: { player: opponent.onBoard, opponent: currentPlayer.onBoard },
    //   });
    // }

    this.isP1Turn = !this.isP1Turn;
  }

  loadCards() {
    const cards = require("../assets/cards.json");

    return cards.map(
      (c: Record<string, unknown>) =>
        new Card(
          c.name as string,
          c.type as CardType,
          c.power as number,
          c.effect as Effect
        )
    );
  }

  close() {
    this.p1.close();
    this.p2.close();

    this.isOver = true;
  }
}
