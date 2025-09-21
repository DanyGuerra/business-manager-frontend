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

type CustomDialogPrps = {
  children: ReactNode;
  modalTitle: string;
  modalDescription: string;
  onOpenChange?: (open: boolean) => void;
  icon?: React.ReactNode;
};

export default function FormCustomDialog({
  children,
  modalTitle,
  modalDescription,
  onOpenChange = () => {},
  icon = <PlusIcon />,
}: CustomDialogPrps) {
  const [open, setOpen] = useState<boolean>(false);

  function handleOpen(o: boolean) {
    setOpen(o);
    onOpenChange(o);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => handleOpen(o)}>
      <DialogTrigger asChild>
        <Button size="icon" className="size-6 cursor-pointer">
          {icon}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
          <DialogDescription>{modalDescription}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
