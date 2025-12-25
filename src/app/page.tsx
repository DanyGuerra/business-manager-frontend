import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Kanban, Utensils, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 flex flex-col items-center justify-center py-24 md:py-32 px-4 md:px-6 bg-gradient-to-b from-background to-muted/20">
        <div className="container max-w-5xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 pb-2">
              Gestione su negocio con excelencia
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
              La plataforma integral para administrar productos, menús, usuarios y
              operaciones. Simplifique su flujo de trabajo y enfóquese en crecer.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/profile">
              <Button size="lg" className="h-12 px-8 text-base gap-2">
                Comenzar Ahora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="" target="_blank">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Saber más
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="md:col-span-3 flex flex-col md:flex-row items-center gap-6 p-8 rounded-3xl bg-background border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 -z-10 group-hover:bg-primary/10 transition-colors" />
              <div className="p-4 rounded-full bg-primary/20 text-primary shrink-0">
                <Kanban className="h-10 w-10" />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-bold">Tablero Kanban de Pedidos</h3>
                <p className="text-muted-foreground text-lg">
                  Revolucione su cocina y despacho. Visualice cada pedido en un tablero interactivo,
                  arrastre tarjetas entre estados y mantenga a todo su equipo sincronizado en tiempo real.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Utensils className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Gestión de Menús</h3>
              <p className="text-muted-foreground">
                Organice sus productos en menús dinámicos. Actualice precios y disponibilidad en tiempo real.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Usuarios y Roles</h3>
              <p className="text-muted-foreground">
                Control total sobre su equipo. Asigne roles granulares (Admin, Mesero, Cocina) y gestione permisos de acceso de forma segura.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 rounded-full bg-primary/10 text-primary">
                <BarChart3 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Reportes en Tiempo Real</h3>
              <p className="text-muted-foreground">
                Tome decisiones informadas con análisis detallados de ventas y rendimiento.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
