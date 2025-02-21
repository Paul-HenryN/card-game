import { Card as CardEntity } from "../../../shared/entities/game";
import { motion, MotionProps, TargetAndTransition } from "motion/react";
import { cn } from "../utils";

export type CardAnimation =
  | "initial"
  | "fadeUp"
  | "fadeDown"
  | "play"
  | "opponentMove";

export function Card({
  card,
  onClick,
  onAnimationComplete,
  disabled = false,
  className,
  initial = "initial",
  animate = "initial",
}: {
  card: CardEntity;
  onClick?: () => void;
  onAnimationComplete?: MotionProps["onAnimationComplete"];
  disabled?: boolean;
  className?: string;
  initial?: CardAnimation;
  animate?: CardAnimation;
}) {
  const cardVariants: Record<CardAnimation, TargetAndTransition> = {
    initial: {
      y: 0,
      opacity: 1,
    },
    fadeUp: {
      y: "30%",
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
    fadeDown: {
      y: "-30%",
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
    play: {
      y: "-60%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    opponentMove: {
      y: "60%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <motion.button
      layout
      disabled={disabled}
      data-disabled={disabled}
      variants={cardVariants}
      initial={initial}
      animate={animate}
      className={cn("relative", className)}
      onClick={onClick}
      onAnimationComplete={onAnimationComplete}
      transition={{
        layout: {
          type: "spring",
          stiffness: 300,
          damping: 30,
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
  );
}
