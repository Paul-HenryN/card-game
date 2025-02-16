import { cn } from "../utils";

interface GameContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function GameContainer({
  children,
  className,
  ...rest
}: GameContainerProps) {
  return (
    <div
      className={cn("min-h-screen grid place-items-center", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
