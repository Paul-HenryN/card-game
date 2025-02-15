import { Card } from "./game";

export type Message =
  | { type: "init"; deck: Card[] }
  | { type: "info"; message: string }
  | { type: "play" }
  | { type: "pick"; index: number }
  | { type: "deckUpdate"; deck: Card[] }
  | { type: "boardUpdate"; board: { player: Card[]; opponent: Card[] } };
