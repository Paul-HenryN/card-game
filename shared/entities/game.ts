type EffectType =
  | "damage"
  | "boost"
  | "heal"
  | "shield"
  | "freeze"
  | "summon"
  | "revive"
  | "lifesteal"
  | "taut"
  | "draw";

type EffectCondition = {
  type:
    | "on_attack"
    | "on_play"
    | "on_turn_start"
    | "on_turn_end"
    | "all_enemy_units"
    | "all_friendly_units_on_play"
    | "when_damaged";
};

export type CardType = "Unit" | "Building" | "Spell";

export class Effect {
  constructor(
    public type: EffectType,
    public power: number,
    public conditions: EffectCondition[] = []
  ) {}
}

export class Card {
  constructor(
    public name: string,
    public type: CardType,

    public power: number,
    public effect: Effect | null = null
  ) {}

  toString() {
    return `<${this.name}>: ${this.power} power points`;
  }
}

export class Deck {
  constructor(public cards: Card[]) {}

  toString() {
    return this.cards.map((card, i) => `[${i}] ` + card.toString()).join("\n");
  }

  length() {
    return this.cards.length;
  }

  pick(index: number) {
    return this.cards.splice(index, 1)[0];
  }
}
