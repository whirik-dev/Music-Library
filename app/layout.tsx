import "./globals.css";
import HTML from "@/components/HTMLProvider";

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <HTML>
        <body className="antialiased">
          {children}
        </body>
      </HTML>
    );
  }