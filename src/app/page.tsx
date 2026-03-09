"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AnimatedKanbanHero } from "@/components/AnimatedKanbanHero";
import { FeaturedKanbanCard } from "@/components/FeaturedKanbanCard";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import {
  AnimatedUtensils,
  AnimatedUsers,
  AnimatedBarChart,
  AnimatedCalculator,
  AnimatedSparkles,
  AnimatedPrinter
} from "@/components/AnimatedFeatureIcons";
import { useUserStore } from "@/store/useUserStore";

export default function Home() {
  const user = useUserStore((state) => state.user);

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
            <Link href={user ? "/profile" : "/login"}>
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

      <section className="py-20 bg-muted/30 pb-0">
        <div className="container px-4 md:px-6 mx-auto mb-20">
          <div className="flex flex-col gap-12">
            <FeaturedKanbanCard />
          </div>
        </div>

        <div className="flex flex-col w-full divide-y divide-border/20">
          <FeatureShowcase
            index={0}
            isReversed={false}
            colorName="orange"
            icon={<AnimatedUtensils />}
            title="Administración de Menús"
            description="Diseñe catálogos de productos claros y estructurados. Gestione precios, ingredientes y categorías de forma centralizada para que su oferta se adapte rápidamente a la demanda."
          />

          <FeatureShowcase
            index={1}
            isReversed={true}
            colorName="blue"
            icon={<AnimatedUsers />}
            title="Control de Accesos y Roles"
            description="Proteja la información de su negocio de manera eficiente. Asigne permisos específicos asegurando que cada quien vea solo lo que necesita."
          />

          <FeatureShowcase
            index={2}
            isReversed={false}
            colorName="green"
            icon={<AnimatedSparkles />}
            title="Optimización de Ventas Asistida"
            description="Acelere los tiempos de venta. El sistema identifica sus productos de mayor ventas y los posiciona inteligentemente al frente, garantizando un flujo de trabajo rápido durante horas pico."
          />

          <FeatureShowcase
            index={3}
            isReversed={true}
            colorName="primary"
            icon={<AnimatedCalculator />}
            title="Gestión de Caja"
            description="Supervise las finanzas diarias con total precisión. Benefíciese de cálculos de cambio automáticos, registros históricos detallados y cortes de caja que garantizan la exactitud de sus ingresos."
          />

          <FeatureShowcase
            index={4}
            isReversed={false}
            colorName="purple"
            icon={<AnimatedBarChart />}
            title="Reportes y Estadísticas"
            description="Visualice el rendimiento de su negocio de un vistazo. Obtenga gráficas con datos sobre sus ventas diarias, productos mas vendidos y proyecciones de rendimiento."
          />

          <FeatureShowcase
            index={5}
            isReversed={true}
            colorName="red"
            icon={<AnimatedPrinter />}
            title="Impresión de tickets"
            description="Imprima tickets de venta con un diseño limpio y profesional, totalmente compatibles con sus impresoras térmicas."
          />
        </div>
      </section>
    </div>
  );
}
