import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";

export const metadata: Metadata = {
  title: "RestHub - Gestión restaurantes",
  description: "Plataforma integral para administrar restaurantes: gestione pedidos en tiempo real, menús dinámicos, control de inventario y roles de equipo eficientemente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <SocketProvider>
            <Providers>
              <Header></Header>
              <main className="flex-1 p-2">
                {children}
                <Toaster position="top-center" />
              </main>
              <Footer></Footer>
            </Providers>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
