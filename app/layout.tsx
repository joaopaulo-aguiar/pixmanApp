import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Tevora Link Site",
  description: "Site responsivo para acesso via QR Code.",
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
