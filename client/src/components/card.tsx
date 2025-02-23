import { Card as CardEntity } from "../../../shared/entities/game";
import { motion, MotionProps, TargetAndTransition } from "motion/react";
import { cn } from "../utils";

export type CardAnimation =
  | "initial"
  | "fadeUp"
  | "fadeDown"
  | "play"
  | "opponentMove";

type CardProps = (
  | { isHidden: false; card: CardEntity }
  | { isHidden: true }
) & {
  onClick?: () => void;
  onAnimationComplete?: MotionProps["onAnimationComplete"];
  disabled?: boolean;
  className?: string;
  initial?: CardAnimation;
  animate?: CardAnimation;
};

export function Card(props: CardProps) {
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
      disabled={props.disabled}
      data-disabled={props.disabled}
      variants={cardVariants}
      initial={props.initial}
      animate={props.animate}
      className={cn("relative", props.className)}
      onClick={props.onClick}
      onAnimationComplete={props.onAnimationComplete}
      transition={{
        layout: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      }}
    >
      <div className="border border-neutral-500 p-3 w-(--card-width) h-(--card-height) grid place-items-center rounded-sm">
        {props.isHidden ? (
          "?"
        ) : (
          <>
            <p>{props.card.name}</p>
            <p>{props.card.type}</p>
          </>
        )}
      </div>

      {!props.isHidden && (
        <div className="absolute text-start">
          {props.card.power != -1 && <div>power: {props.card.power} pts</div>}
          {props.card.effect && (
            <div>
              <div>
                effect: {props.card.effect.type}, {props.card.effect.power} pts
              </div>
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
}
