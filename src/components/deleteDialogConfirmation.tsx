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
import { Input } from "@/components/ui/input";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

type DeleteDialogConfirmationProps = {
  title?: string;
  description?: string;
  handleCancel?: () => void;
  handleContinue: () => void;
  trigger?: React.ReactNode;
  confirmText?: string;
  confirmationKeyword?: string;
};

export function DeleteDialogConfirmation({
  title = "¿Estás completamente seguro?",
  description,
  handleCancel = () => { },
  handleContinue,
  trigger,
  confirmText = "Continuar",
  confirmationKeyword,
}: DeleteDialogConfirmationProps) {
  const [inputValue, setInputValue] = useState("");

  const isConfirmationValid = !confirmationKeyword || inputValue === confirmationKeyword;

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
          <AlertDialogDescription>
            {description}
            {confirmationKeyword && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Escribe <span className="font-bold text-red-500">{confirmationKeyword}</span> para confirmar:
                </p>
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Escribe "${confirmationKeyword}"`}
                  className="w-full"
                />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} className="cursor-pointer">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleContinue}
            disabled={!isConfirmationValid}
            className="cursor-pointer"
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
