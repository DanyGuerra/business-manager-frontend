import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";

type DeleteDialogConfirmationProps = {
  title?: string;
  description?: string;
  handleCancel?: () => void;
  handleContinue: () => void;
  trigger?: React.ReactNode;
  confirmText?: string;
};

export function DeleteDialogConfirmation({
  title = "¿Estás completamente seguro?",
  description,
  handleCancel = () => { },
  handleContinue,
  trigger,
  confirmText = "Continuar",
}: DeleteDialogConfirmationProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ? trigger : (
          <Button variant="outline" size="icon" className="size-7">
            <Trash2Icon className="text-red-400"></Trash2Icon>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} className="cursor-pointer">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleContinue}
            className="cursor-pointer"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
