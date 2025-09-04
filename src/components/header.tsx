import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export default function Header(){
    return (
        <>
        <header className="w-full flex justify-between p-1">
             <Link href="/" className="flex justify-center items-center text-lg font-bold">
                Business Manager   
            </Link>
            <div className="flex justify-center items-center gap-3">
                <ThemeToggle></ThemeToggle>
                 <Link href="/login">
                    <Button className="cursor-pointer">
                        Iniciar sesión
                    </Button>
                </Link>
            </div>
        </header>
        </>
    )
}