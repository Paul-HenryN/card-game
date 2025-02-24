import { Card } from "./game";

export type Message =
  | { type: "init"; hand: Card[]; playsFirst: boolean; deckLength: number }
  | { type: "info"; message: string }
  | { type: "play" }
  | { type: "pick"; index: number }
  | { type: "handUpdate"; hand: Card[] }
  | { type: "boardUpdate"; board: { player: Card[]; opponent: Card[] } }
  | { type: "opponentPlay"; playedCardIdx: number; playedCard: Card }
  | {
      type: "chooseAttackTarget";
      opponentCards: Card[];
    }
  | {
      type: "chooseHealTarget";
    }
  | {
      type: "chooseDestroyTarget";
      opponentCards: Card[];
    }
  | { type: "attack"; cardIndex: number }
  | { type: "heal"; cardIndex: number }
  | { type: "destroy"; cardIndex: number }
  | { type: "skip" }
  | { type: "gameOver"; win: boolean }
  | {
      type: "reconnect";
      hand: Card[];
      deckLength: number;
      opponentHandLength: number;
      board: { player: Card[]; opponent: Card[] };
      isPlayerTurn: boolean;
    };
