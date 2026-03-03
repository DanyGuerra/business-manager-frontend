"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimatedKanbanHero } from "@/components/AnimatedKanbanHero";
import { FeaturedKanbanCard } from "@/components/FeaturedKanbanCard";
import { FeatureCard } from "@/components/FeatureCard";
import {
  AnimatedUtensils,
  AnimatedUsers,
  AnimatedBarChart,
  AnimatedCalculator,
  AnimatedSparkles,
  AnimatedPrinter
} from "@/components/AnimatedFeatureIcons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex-1 flex flex-col items-center justify-center pt-24 pb-8 md:pt-32 md:pb-12 px-4 md:px-6 bg-gradient-to-b from-background to-muted/20 overflow-hidden">
        <div className="container max-w-5xl text-center space-y-8 relative z-10">
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

          <AnimatedKanbanHero />

        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            <FeaturedKanbanCard />

            <FeatureCard
              delay={0.1}
              icon={<AnimatedUtensils />}
              title="Gestión de Menús"
              description="Organice sus productos en menús dinámicos y gestione sus precios de manera eficiente."
            />

            <FeatureCard
              delay={0.2}
              icon={<AnimatedUsers />}
              title="Usuarios y Roles"
              description="Control total sobre su equipo. Asigne roles y gestione permisos de acceso de forma segura."
            />

            <FeatureCard
              delay={0.3}
              icon={<AnimatedBarChart />}
              title="Reportes y estadísticas"
              description="Tome decisiones informadas con análisis detallados de ventas y rendimiento."
            />

            <FeatureCard
              delay={0.4}
              icon={<AnimatedCalculator />}
              title="Caja Registradora"
              description="Gestione todos sus cobros de manera profesional. Registro histórico de transacciones, cálculo de cambios automático y cortes de caja exactos."
            />

            <FeatureCard
              delay={0.5}
              icon={<AnimatedSparkles />}
              title="Ordenamiento Inteligente"
              description="Mayor accesibilidad y rapidez. Los productos y complementos más vendidos se ordenan automáticamente al inicio asegurando operaciones ágiles y precisas."
            />

            <FeatureCard
              delay={0.6}
              icon={<AnimatedPrinter />}
              title="Tickets de Pedido"
              description="Imprima comprobantes de manera automática y profesional. Formatos optimizados para impresoras térmicas con todo el detalle que su cocina y su cliente necesitan."
            />

          </div>
        </div>
      </section>
    </div>
  );
}
