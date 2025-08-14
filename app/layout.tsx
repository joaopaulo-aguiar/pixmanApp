import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Pixman",
  description: "Site responsivo para acesso via QR Code.",
  // Removido favicon padrão para não ocorrer flash de fallback
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-50 text-slate-800 min-h-screen">
        {children}
      </body>
    </html>
  );
}
