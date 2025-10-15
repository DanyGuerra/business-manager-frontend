"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";

type CustomDialogProps = {
  children: ReactNode;
  modalTitle: string;
  modalDescription: string;
  onOpenChange?: (open: boolean) => void;
  icon?: React.ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  textButtonTrigger?: string;
};

export default function CustomDialog({
  children,
  modalTitle,
  modalDescription,
  onOpenChange = () => {},
  open: controlledOpen,
  setOpen: controlledSetOpen,
  icon = <PlusIcon />,
  textButtonTrigger,
}: CustomDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled =
    controlledOpen !== undefined && controlledSetOpen !== undefined;

  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? controlledSetOpen : setUncontrolledOpen;

  function handleOpen(o: boolean) {
    setOpen(o);
    onOpenChange(o);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        {textButtonTrigger ? (
          <Button className="cursor-pointer">{textButtonTrigger}</Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="size-7 cursor-pointer"
          >
            {icon}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
