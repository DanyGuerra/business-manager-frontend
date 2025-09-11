import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

type ButtonLoadingProps = { loadingState: boolean; buttonTitle: string };

export default function ButtonLoading({
  loadingState,
  buttonTitle,
}: ButtonLoadingProps) {
  return (
    <Button
      type="submit"
      className="w-full cursor-pointer"
      disabled={loadingState}
    >
      {loadingState ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        buttonTitle
      )}
    </Button>
  );
}
