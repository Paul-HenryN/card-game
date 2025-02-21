import { Card } from "./game";

export type Message =
  | { type: "init"; deck: Card[] }
  | { type: "info"; message: string }
  | { type: "play" }
  | { type: "pick"; index: number }
  | { type: "deckUpdate"; deck: Card[] }
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
      deck: Card[];
      opponentCardCount: number;
      board: { player: Card[]; opponent: Card[] };
      isPlayerTurn: boolean;
    };
