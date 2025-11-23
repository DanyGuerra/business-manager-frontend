import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Store } from "lucide-react";

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-between p-1 items-center">
        <div className="flex items-center gap-2">
          <Store className="h-6 w-6" />
          <Link
            href="/"
            className="flex justify-center items-center text-lg font-bold"
          >
            Business Manager
          </Link>
        </div>
        <div className="flex justify-center items-center gap-3">
          <ThemeToggle></ThemeToggle>
          <Link href="/login">
            <Button className="cursor-pointer">Iniciar sesión</Button>
          </Link>
        </div>
      </header>
    </>
  );
}
