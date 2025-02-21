import { Card as CardEntity } from "../../../shared/entities/game";
import { AnimatePresence, motion, TargetAndTransition } from "motion/react";

export type CardAnimation = "initial" | "playerMove" | "opponentMove";

export function Card({
  card,
  id,
  onClick,
  onPlay,
  visible = true,
}: {
  card: CardEntity;
  id: string;
  onClick?: () => void;
  onPlay?: () => void;
  visible?: boolean;
}) {
  const cardVariants: Record<CardAnimation, TargetAndTransition> = {
    initial: {
      y: 0,
      scale: 1,
      opacity: 1,
    },
    playerMove: {
      y: "-100%",
      opacity: 0,
    },
    opponentMove: {
      y: 200,
      scale: 1.2,
      opacity: 0,
    },
  };

  return (
    <AnimatePresence>
      {!visible ? null : (
        <motion.button
          layout
          layoutId={id}
          variants={cardVariants}
          initial="initial"
          className="relative"
          exit="playerMove"
          onClick={onClick}
          onAnimationComplete={(def) => {
            if (def === "playerMove") onPlay?.();
          }}
          transition={{
            layout: {
              type: "spring",
              stiffness: 300,
              damping: 30,
            },
            exit: {
              duration: 3,
            },
          }}
        >
          <div className="border border-neutral-500 p-3 w-(--card-width) h-(--card-height) grid place-items-center rounded-sm">
            {card.name}
          </div>

          <div className="absolute text-start">
            {card.power != -1 && <div>power: {card.power} pts</div>}
            {card.effect && (
              <div>
                <div>
                  effect: {card.effect.type}, {card.effect.power} pts
                </div>
              </div>
            )}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
