import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Business App",
  description: "App for business management",
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
          <Providers>
            <Header></Header>
            <main className="flex-1 p-2">
              {children}
              <Toaster position="top-center" />
            </main>
            <Footer></Footer>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
