import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

type ButtonLoadingProps = {
  loadingState: boolean;
  buttonTitle: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
};

export default function ButtonLoading({
  loadingState,
  buttonTitle,
  disabled = false,
  onClick,
  className,
  size = "default",
}: ButtonLoadingProps) {
  return (
    <Button
      type="submit"
      className={`w-full ${className}`}
      disabled={disabled || loadingState}
      onClick={onClick}
      size={size}
    >
      {loadingState ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        buttonTitle
      )}
    </Button>
  );
}
