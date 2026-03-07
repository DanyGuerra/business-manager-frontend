import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

type ButtonLoadingProps = {
  loadingState: boolean;
  buttonTitle: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  icon?: React.ReactNode;
};

export default function ButtonLoading({
  loadingState,
  buttonTitle,
  disabled = false,
  onClick,
  className,
  size = "default",
  variant = "default",
  icon,
}: ButtonLoadingProps) {
  return (
    <Button
      type="submit"
      className={className ? `w-full ${className}` : "w-full"}
      disabled={disabled || loadingState}
      onClick={onClick}
      size={size}
      variant={variant}
    >
      {loadingState ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <>
          {icon}
          {buttonTitle}
        </>
      )}
    </Button>
  );
}
