import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 border-t bg-muted/10">
      <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          © {new Date().getFullYear()} Business Manager. Todos los derechos reservados.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-primary transition-colors">
            Términos
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Privacidad
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}
