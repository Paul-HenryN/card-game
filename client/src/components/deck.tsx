import { Card } from "./card";

export function Deck({ length }: { length: number }) {
  return (
    <div className="relative w-(--card-width) h-(--card-height)">
      {Array(length)
        .fill(null)
        .map((_, i) => (
          <Card
            key={i}
            isHidden
            className="absolute bg-amber-400"
            disabled
            style={{ bottom: `${i * 4}px`, right: `${i}px` }}
          />
        ))}
    </div>
  );
}
