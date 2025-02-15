type EffectType = "attack" | "heal" | "destroy";

export class Effect {
  constructor(public type: EffectType, public power: number) {}
}

export class Card {
  constructor(
    public name: string,
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
